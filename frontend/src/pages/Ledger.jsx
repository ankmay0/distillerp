import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Ledger() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [production, setProduction] = useState(null)
  const [sales, setSales] = useState(null)
  const [expenses, setExpenses] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.get(`/production/${date}`),
      api.get(`/sales/${date}`),
      api.get(`/expenses/${date}`)
    ]).then(([p, s, e]) => {
      setProduction(p.status === 'fulfilled' ? p.value.data : null)
      setSales(s.status === 'fulfilled' ? s.value.data : null)
      setExpenses(e.status === 'fulfilled' ? e.value.data : null)
    }).finally(() => setLoading(false))
  }, [date])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
  const totalSales = sales?.total_sales || 0
  const totalExpenses = expenses?.total || 0
  const netProfit = totalSales - totalExpenses

  const sectionStyle = {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #E7E5E4'
  }

  const thStyle = {
    textAlign: 'left', padding: '6px 8px',
    backgroundColor: '#F5F5F4', fontSize: '12px',
    fontWeight: '600', color: '#44403C'
  }

  const tdStyle = { padding: '6px 8px', fontSize: '13px', borderBottom: '1px solid #F5F5F4' }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Daily Ledger</h1>
          <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>Formal production & accounts register</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ border: '1px solid #E7E5E4', borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }} />
          <button onClick={() => window.print()}
            style={{
              backgroundColor: '#1C1917', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer'
            }}>
            🖨️ Print
          </button>
        </div>
      </div>

      {loading ? <div style={{ color: '#C8760A' }}>Loading...</div> : (
        <div style={{
          backgroundColor: 'white', borderRadius: '12px',
          padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid #E7E5E4'
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px', ...sectionStyle }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1C1917' }}>🏭 DistillERP</h2>
            <p style={{ fontSize: '13px', color: '#78716C', marginTop: '4px' }}>Daily Production & Accounts Register</p>
            <p style={{ fontSize: '14px', fontWeight: '600', marginTop: '8px' }}>
              Date: {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Section 1 - Production */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '12px' }}>
              1. Production Details
            </h3>
            {production ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Batch Number', production.batch_number],
                    ['Shift', production.shift],
                    ['Operator', production.operator],
                    ['Mahua Used', `${production.mahua} kg`],
                    ['Sugar Used', `${production.sugar} kg`],
                    ['Molasses Used', `${production.molasses} kg`],
                    ['Open Liquor Produced', `${production.open_produced} L`],
                    ['Packaged Produced', `${production.pkg_produced} bottles`],
                    ['Opening Stock', `${production.opening_stock} L`],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ ...tdStyle, color: '#78716C', width: '40%' }}>{label}</td>
                      <td style={{ ...tdStyle, fontWeight: '500' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: '#DC2626', fontSize: '13px' }}>⚠️ No production entry</p>}
          </div>

          {/* Section 2 - Sales */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '12px' }}>
              2. Sales Summary
            </h3>
            {sales ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Item</th>
                      <th style={thStyle}>Qty</th>
                      <th style={thStyle}>Rate</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Packaged Slab A', sales.qty_p1, sales.rate_p1],
                      ['Packaged Slab B', sales.qty_p2, sales.rate_p2],
                      ['Packaged Slab C', sales.qty_p3, sales.rate_p3],
                      ['Open Tier 1', sales.qty_o1, sales.rate_o1],
                      ['Open Tier 2', sales.qty_o2, sales.rate_o2],
                      ['Open Tier 3', sales.qty_o3, sales.rate_o3],
                    ].map(([label, qty, rate]) => (
                      <tr key={label}>
                        <td style={tdStyle}>{label}</td>
                        <td style={tdStyle}>{qty}</td>
                        <td style={tdStyle}>₹{rate}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(qty * rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: '700' }}>
                  Total Sales: {fmt(totalSales)}
                </div>
              </>
            ) : <p style={{ color: '#DC2626', fontSize: '13px' }}>⚠️ No sales entry</p>}
          </div>

          {/* Section 3 - Expenses */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '12px' }}>
              3. Expenses
            </h3>
            {expenses ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['Salary', expenses.salary],
                      ['Diesel', expenses.diesel],
                      ['Petrol', expenses.petrol],
                      ['Meals', expenses.meals],
                      [`Others (${expenses.others_desc || 'Misc'})`, expenses.others],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ ...tdStyle, color: '#78716C', width: '60%' }}>{label}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>{fmt(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: '700' }}>
                  Total Expenses: {fmt(totalExpenses)}
                </div>
              </>
            ) : <p style={{ color: '#DC2626', fontSize: '13px' }}>⚠️ No expense entry</p>}
          </div>

          {/* Section 4 - Summary */}
          <div style={{ backgroundColor: '#F8F7F4', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '12px' }}>
              4. Financial Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#78716C' }}>Total Sales</p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#16A34A', fontFamily: 'monospace' }}>{fmt(totalSales)}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#78716C' }}>Total Expenses</p>
                <p style={{ fontSize: '18px', fontWeight: '700', color: '#DC2626', fontFamily: 'monospace' }}>{fmt(totalExpenses)}</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#78716C' }}>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                <p style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'monospace', color: netProfit >= 0 ? '#16A34A' : '#DC2626' }}>
                  {fmt(Math.abs(netProfit))}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {production?.notes && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#44403C', marginBottom: '8px' }}>
                5. Batch Notes
              </h3>
              <p style={{ fontSize: '13px', color: '#44403C', fontStyle: 'italic' }}>{production.notes}</p>
            </div>
          )}

          {/* Signature */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #1C1917', width: '200px', marginBottom: '4px' }}></div>
              <p style={{ fontSize: '12px', color: '#78716C' }}>Authorised Signature</p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}