import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Expenses() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [isEdit, setIsEdit] = useState(false)

  const [form, setForm] = useState({
    salary: 0, diesel: 0, petrol: 0,
    meals: 0, others: 0, others_desc: ''
  })

  useEffect(() => {
    setLoading(true)
    setMessage(null)
    api.get(`/expenses/${date}`)
      .then(res => { setForm(res.data); setIsEdit(true) })
      .catch(() => {
        setForm({ salary: 0, diesel: 0, petrol: 0, meals: 0, others: 0, others_desc: '' })
        setIsEdit(false)
      })
      .finally(() => setLoading(false))
  }, [date])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'others_desc' ? value : parseFloat(value) || 0 }))
  }

  const calcTotal = () => form.salary + form.diesel + form.petrol + form.meals + form.others

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      if (isEdit) {
        await api.put(`/expenses/${date}`, form)
      } else {
        await api.post('/expenses/', { ...form, date })
        setIsEdit(true)
      }
      setMessage({ type: 'success', text: '✅ Expenses saved!' })
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

  const categories = [
    { name: 'salary', label: '👤 Salary' },
    { name: 'diesel', label: '⛽ Diesel' },
    { name: 'petrol', label: '🛵 Petrol' },
    { name: 'meals', label: '🍱 Meals' },
    { name: 'others', label: '📦 Others' },
  ]

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Expenses</h1>
          <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>Record daily operational costs</p>
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ ...inputStyle, width: 'auto' }} />
      </div>

      {loading ? <div style={{ color: '#C8760A' }}>Loading...</div> : (
        <form onSubmit={handleSubmit}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              Expense Categories
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {categories.map(({ name, label }) => (
                <div key={name}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#78716C', marginBottom: '4px' }}>
                    {label}
                  </label>
                  <input type="number" name={name} value={form[name]}
                    onChange={handleChange} min="0" style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#78716C', marginBottom: '4px' }}>
                  Others Description
                </label>
                <input type="text" name="others_desc" value={form.others_desc}
                  onChange={handleChange} placeholder="e.g. Packaging material"
                  style={inputStyle} />
              </div>
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '20px', paddingTop: '16px',
              borderTop: '2px solid #1C1917'
            }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Total Expenses</span>
              <span style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'monospace', color: '#DC2626' }}>
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
            {saving ? 'Saving...' : isEdit ? '✏️ Update Expenses' : '💾 Save Expenses'}
          </button>
        </form>
      )}
    </div>
  )
}