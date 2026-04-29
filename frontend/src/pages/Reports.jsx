import { useState } from 'react'
import api from '../api/axios'

export default function Reports() {
  const today = new Date().toISOString().split('T')[0]
  const firstDay = today.slice(0, 7) + '-01'
  const [fromDate, setFromDate] = useState(firstDay)
  const [toDate, setToDate] = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = () => {
    setLoading(true)
    setError(null)
    api.get(`/reports/range?from_date=${fromDate}&to_date=${toDate}`)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load report. Please try again.'))
      .finally(() => setLoading(false))
  }

  const exportCSV = () => {
    if (!data) return
    const rows = [
      ['Date', 'Batch', 'Shift', 'Total Sales', 'Total Expenses', 'Net Profit', 'Status'],
      ...data.daily.map(row => [
        row.date,
        row.batch || '',
        row.shift || '',
        row.total_sales,
        row.total_expenses,
        row.net,
        row.is_profit ? 'Profit' : 'Loss'
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `distillerp_report_${fromDate}_${toDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F5F5F4',
    marginBottom: '16px'
  }

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Reports</h1>
        <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>
          Date range P&L analysis
        </p>
      </div>

      {/* Controls */}
      <div style={{
        ...cardStyle,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{
            display: 'block', fontSize: '11px',
            fontWeight: '600', color: '#78716C',
            marginBottom: '4px', textTransform: 'uppercase'
          }}>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{
              border: '1px solid #E7E5E4', borderRadius: '8px',
              padding: '8px 12px', fontSize: '13px', outline: 'none'
            }}
          />
        </div>
        <div>
          <label style={{
            display: 'block', fontSize: '11px',
            fontWeight: '600', color: '#78716C',
            marginBottom: '4px', textTransform: 'uppercase'
          }}>To</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{
              border: '1px solid #E7E5E4', borderRadius: '8px',
              padding: '8px 12px', fontSize: '13px', outline: 'none'
            }}
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#D6D3D1' : '#C8760A',
            color: 'white', border: 'none',
            borderRadius: '8px', padding: '10px 24px',
            fontSize: '13px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {loading ? 'Loading...' : '📊 Generate Report'}
        </button>
        {data && (
          <button
            onClick={exportCSV}
            style={{
              backgroundColor: '#16A34A', color: 'white',
              border: 'none', borderRadius: '8px',
              padding: '10px 24px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            📥 Export CSV
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          backgroundColor: '#FEF2F2', color: '#DC2626',
          fontSize: '13px', marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary KPIs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {[
              { label: 'Total Sales', value: fmt(data.summary.total_sales), color: '#16A34A' },
              { label: 'Total Expenses', value: fmt(data.summary.total_expenses), color: '#DC2626' },
              { label: 'Net Profit', value: fmt(data.summary.net_profit), color: data.summary.is_profit ? '#16A34A' : '#DC2626' },
              { label: 'Production Days', value: data.period.production_days, color: '#2563EB' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                ...cardStyle,
                marginBottom: 0,
                borderTop: `3px solid ${color}`
              }}>
                <p style={{
                  fontSize: '11px', color: '#78716C',
                  fontWeight: '600', textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {label}
                </p>
                <p style={{
                  fontSize: '20px', fontWeight: '700',
                  color, fontFamily: 'monospace', marginTop: '8px'
                }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Expense Breakdown */}
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '13px', fontWeight: '600',
              color: '#44403C', marginBottom: '16px'
            }}>
              Expense Breakdown
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(data.expense_breakdown).map(([key, value]) => (
                <div key={key} style={{
                  textAlign: 'center', padding: '12px',
                  backgroundColor: '#FEF3C7', borderRadius: '8px'
                }}>
                  <p style={{
                    fontSize: '11px', color: '#78716C',
                    textTransform: 'capitalize', marginBottom: '4px'
                  }}>
                    {key}
                  </p>
                  <p style={{
                    fontSize: '14px', fontWeight: '700',
                    color: '#C8760A', fontFamily: 'monospace'
                  }}>
                    {fmt(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Production Summary */}
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '13px', fontWeight: '600',
              color: '#44403C', marginBottom: '16px'
            }}>
              Production Summary
            </h2>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{
                textAlign: 'center', padding: '16px',
                backgroundColor: '#EFF6FF', borderRadius: '8px', flex: 1
              }}>
                <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>
                  Total Open Produced
                </p>
                <p style={{
                  fontSize: '22px', fontWeight: '700',
                  color: '#2563EB', fontFamily: 'monospace'
                }}>
                  {data.production_summary.total_open_produced} L
                </p>
              </div>
              <div style={{
                textAlign: 'center', padding: '16px',
                backgroundColor: '#F0FDF4', borderRadius: '8px', flex: 1
              }}>
                <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>
                  Total Pkg Produced
                </p>
                <p style={{
                  fontSize: '22px', fontWeight: '700',
                  color: '#16A34A', fontFamily: 'monospace'
                }}>
                  {data.production_summary.total_pkg_produced} bottles
                </p>
              </div>
            </div>
          </div>

          {/* Day by Day Table */}
          <div style={cardStyle}>
            <h2 style={{
              fontSize: '13px', fontWeight: '600',
              color: '#44403C', marginBottom: '16px'
            }}>
              Day-by-Day Summary
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F5F5F4' }}>
                    {['Date', 'Batch', 'Shift', 'Sales', 'Expenses', 'Net', 'Status'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 8px',
                        color: '#78716C', fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.daily.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{
                        padding: '32px', textAlign: 'center',
                        color: '#78716C', fontSize: '14px'
                      }}>
                        No data found for this period
                      </td>
                    </tr>
                  ) : (
                    data.daily.map(row => (
                      <tr key={row.date} style={{
                        borderBottom: '1px solid #F5F5F4',
                        backgroundColor: 'transparent'
                      }}>
                        <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '500' }}>
                          {row.date}
                        </td>
                        <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px', color: '#78716C' }}>
                          {row.batch || '—'}
                        </td>
                        <td style={{ padding: '10px 8px' }}>{row.shift || '—'}</td>
                        <td style={{ padding: '10px 8px', color: '#16A34A', fontFamily: 'monospace', fontWeight: '600' }}>
                          {fmt(row.total_sales)}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#DC2626', fontFamily: 'monospace', fontWeight: '600' }}>
                          {fmt(row.total_expenses)}
                        </td>
                        <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700' }}>
                          {fmt(row.net)}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: '600',
                            backgroundColor: row.is_profit ? '#F0FDF4' : '#FEF2F2',
                            color: row.is_profit ? '#16A34A' : '#DC2626'
                          }}>
                            {row.is_profit ? '✅ Profit' : '❌ Loss'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data.daily.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #1C1917', backgroundColor: '#F8F7F4' }}>
                      <td colSpan={3} style={{ padding: '10px 8px', fontWeight: '700', fontSize: '13px' }}>
                        TOTAL
                      </td>
                      <td style={{ padding: '10px 8px', color: '#16A34A', fontFamily: 'monospace', fontWeight: '700' }}>
                        {fmt(data.summary.total_sales)}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#DC2626', fontFamily: 'monospace', fontWeight: '700' }}>
                        {fmt(data.summary.total_expenses)}
                      </td>
                      <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontWeight: '700' }}>
                        {fmt(data.summary.net_profit)}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: '600',
                          backgroundColor: data.summary.is_profit ? '#F0FDF4' : '#FEF2F2',
                          color: data.summary.is_profit ? '#16A34A' : '#DC2626'
                        }}>
                          {data.summary.is_profit ? '✅ Profit' : '❌ Loss'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}