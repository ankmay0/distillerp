import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Production() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [isEdit, setIsEdit] = useState(false)

  const [form, setForm] = useState({
    date: today,
    shift: 'Morning',
    operator: '',
    mahua: 0,
    sugar: 0,
    molasses: 0,
    open_produced: 0,
    pkg_produced: 0,
    opening_stock: 0,
    notes: ''
  })

  useEffect(() => {
    setLoading(true)
    setMessage(null)
    api.get(`/production/${date}`)
      .then(res => {
        setForm(res.data)
        setIsEdit(true)
      })
      .catch(() => {
        setForm({
          date,
          shift: 'Morning',
          operator: '',
          mahua: 0,
          sugar: 0,
          molasses: 0,
          open_produced: 0,
          pkg_produced: 0,
          opening_stock: 0,
          notes: ''
        })
        setIsEdit(false)
      })
      .finally(() => setLoading(false))
  }, [date])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      if (isEdit) {
        await api.put(`/production/${date}`, form)
      } else {
        await api.post('/production/', { ...form, date })
        setIsEdit(true)
      }
      setMessage({ type: 'success', text: '✅ Production entry saved successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid #E7E5E4',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '500',
    color: '#78716C',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F5F5F4',
    marginBottom: '16px'
  }

  return (
    <div style={{ maxWidth: '720px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Production Entry</h1>
          <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>Record daily manufacturing batch</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ ...inputStyle, width: 'auto' }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#C8760A', padding: '20px' }}>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit}>

          {/* Batch Info */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              Batch Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {isEdit && (
                <div>
                  <label style={labelStyle}>Batch Number</label>
                  <input
                    value={form.batch_number || 'Auto-generated'}
                    disabled
                    style={{ ...inputStyle, backgroundColor: '#F5F5F4', fontFamily: 'monospace' }}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Shift</label>
                <select name="shift" value={form.shift} onChange={handleChange} style={inputStyle}>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Night</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Operator Name</label>
                <input
                  name="operator"
                  value={form.operator}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>
            </div>
          </div>

          {/* Raw Materials */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              Raw Materials Used (kg)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {[
                { name: 'mahua', label: 'Mahua' },
                { name: 'sugar', label: 'Sugar' },
                { name: 'molasses', label: 'Molasses' }
              ].map(({ name, label }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type="number"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    min="0"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Output */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              Production Output
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Open Produced (L)</label>
                <input type="number" name="open_produced" value={form.open_produced}
                  onChange={handleChange} min="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pkg Produced (bottles)</label>
                <input type="number" name="pkg_produced" value={form.pkg_produced}
                  onChange={handleChange} min="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Opening Stock (L)</label>
                <input type="number" name="opening_stock" value={form.opening_stock}
                  onChange={handleChange} min="0" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={cardStyle}>
            <label style={labelStyle}>Batch Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Any remarks about this batch..."
            />
          </div>

          {/* Message */}
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '16px',
              backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEF2F2',
              color: message.type === 'success' ? '#15803D' : '#DC2626'
            }}>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              backgroundColor: saving ? '#D6D3D1' : '#C8760A',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {saving ? 'Saving...' : isEdit ? '✏️ Update Entry' : '💾 Save Entry'}
          </button>

        </form>
      )}
    </div>
  )
}