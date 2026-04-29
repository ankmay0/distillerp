import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Sales() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [isEdit, setIsEdit] = useState(false)

  const [form, setForm] = useState({
    qty_p1: 0, rate_p1: 50,
    qty_p2: 0, rate_p2: 45,
    qty_p3: 0, rate_p3: 20,
    qty_o1: 0, rate_o1: 170,
    qty_o2: 0, rate_o2: 120,
    qty_o3: 0, rate_o3: 100,
  })

  useEffect(() => {
    setLoading(true)
    setMessage(null)
    api.get(`/sales/${date}`)
      .then(res => { setForm(res.data); setIsEdit(true) })
      .catch(() => {
        setForm({
          qty_p1: 0, rate_p1: 50,
          qty_p2: 0, rate_p2: 45,
          qty_p3: 0, rate_p3: 20,
          qty_o1: 0, rate_o1: 170,
          qty_o2: 0, rate_o2: 120,
          qty_o3: 0, rate_o3: 100,
        })
        setIsEdit(false)
      })
      .finally(() => setLoading(false))
  }, [date])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: parseFloat(value) || 0 }))
  }

  const calcTotal = () => {
    const pkg = form.qty_p1 * form.rate_p1 + form.qty_p2 * form.rate_p2 + form.qty_p3 * form.rate_p3
    const open = form.qty_o1 * form.rate_o1 + form.qty_o2 * form.rate_o2 + form.qty_o3 * form.rate_o3
    return pkg + open
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      if (isEdit) {
        await api.put(`/sales/${date}`, form)
      } else {
        await api.post('/sales/', { ...form, date })
        setIsEdit(true)
      }
      setMessage({ type: 'success', text: '✅ Sales entry saved!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', border: '1px solid #E7E5E4',
    borderRadius: '8px', padding: '8px 12px',
    fontSize: '13px', outline: 'none', fontFamily: 'inherit'
  }

  const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F5F5F4', marginBottom: '16px'
  }

  const slabs = [
    { qty: 'qty_p1', rate: 'rate_p1', label: 'Slab A (Packaged)' },
    { qty: 'qty_p2', rate: 'rate_p2', label: 'Slab B (Packaged)' },
    { qty: 'qty_p3', rate: 'rate_p3', label: 'Slab C (Packaged)' },
    { qty: 'qty_o1', rate: 'rate_o1', label: 'Tier 1 (Open)' },
    { qty: 'qty_o2', rate: 'rate_o2', label: 'Tier 2 (Open)' },
    { qty: 'qty_o3', rate: 'rate_o3', label: 'Tier 3 (Open)' },
  ]

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Sales Entry</h1>
          <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>Record daily sales across all price tiers</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ ...inputStyle, width: 'auto' }} />
      </div>

      {loading ? <div style={{ color: '#C8760A' }}>Loading...</div> : (
        <form onSubmit={handleSubmit}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              Sales by Price Tier
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>Tier</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>Rate (₹)</th>
                  <th style={{ textAlign: 'left', padding: '8px', color: '#78716C', fontWeight: '600' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px', color: '#78716C', fontWeight: '600' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {slabs.map(({ qty, rate, label }) => (
                  <tr key={qty} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '8px', color: '#44403C', fontWeight: '500' }}>{label}</td>
                    <td style={{ padding: '8px' }}>
                      <input type="number" name={rate} value={form[rate]}
                        onChange={handleChange} min="0"
                        style={{ ...inputStyle, width: '80px' }} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input type="number" name={qty} value={form[qty]}
                        onChange={handleChange} min="0"
                        style={{ ...inputStyle, width: '80px' }} />
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '600' }}>
                      ₹{(form[qty] * form[rate]).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '16px', paddingTop: '16px',
              borderTop: '2px solid #1C1917'
            }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Total Sales</span>
              <span style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'monospace', color: '#16A34A' }}>
                ₹{calcTotal().toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {message && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '500', marginBottom: '16px',
              backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: message.type === 'success' ? '#15803D' : '#DC2626'
            }}>{message.text}</div>
          )}

          <button type="submit" disabled={saving} style={{
            width: '100%', backgroundColor: saving ? '#D6D3D1' : '#C8760A',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '14px', fontSize: '14px', fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
          }}>
            {saving ? 'Saving...' : isEdit ? '✏️ Update Sales' : '💾 Save Sales'}
          </button>
        </form>
      )}
    </div>
  )
}