import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Inventory() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/reports/inventory/${date}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [date])

  const cardStyle = {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #F5F5F4', marginBottom: '16px'
  }

  const statStyle = (color) => ({
    backgroundColor: color + '10',
    border: `1px solid ${color}30`,
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center'
  })

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1C1917' }}>Inventory</h1>
          <p style={{ color: '#78716C', fontSize: '13px', marginTop: '4px' }}>Live stock reconciliation</p>
        </div>
        <input type="date" value={date}
          onChange={e => setDate(e.target.value)}
          style={{ border: '1px solid #E7E5E4', borderRadius: '8px', padding: '8px 12px', fontSize: '13px' }} />
      </div>

      {loading ? <div style={{ color: '#C8760A' }}>Loading...</div> : !data || data.message ? (
        <div style={{ ...cardStyle, textAlign: 'center', color: '#78716C', padding: '40px' }}>
          ⚠️ No production entry found for this date. Enter production data first.
        </div>
      ) : (
        <>
          {/* Open Liquor */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              🍶 Open Liquor (Litres)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Produced', value: data.open_liquor.produced, color: '#2563EB' },
                { label: 'Opening Stock', value: data.open_liquor.opening_stock, color: '#7C3AED' },
                { label: 'Sold', value: data.open_liquor.sold, color: '#DC2626' },
                { label: 'Balance', value: data.open_liquor.balance, color: '#16A34A' },
              ].map(({ label, value, color }) => (
                <div key={label} style={statStyle(color)}>
                  <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color, fontFamily: 'monospace' }}>{value}L</p>
                </div>
              ))}
            </div>
          </div>

          {/* Packaged */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              📦 Packaged Bottles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Produced', value: data.packaged.produced, color: '#2563EB' },
                { label: 'Sold', value: data.packaged.sold, color: '#DC2626' },
                { label: 'Balance', value: data.packaged.balance, color: '#16A34A' },
              ].map(({ label, value, color }) => (
                <div key={label} style={statStyle(color)}>
                  <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color, fontFamily: 'monospace' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Materials */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', color: '#44403C', marginBottom: '16px' }}>
              🌾 Raw Materials Used
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Mahua', value: data.raw_materials.mahua },
                { label: 'Sugar', value: data.raw_materials.sugar },
                { label: 'Molasses', value: data.raw_materials.molasses },
              ].map(({ label, value }) => (
                <div key={label} style={statStyle('#C8760A')}>
                  <p style={{ fontSize: '11px', color: '#78716C', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '20px', fontWeight: '700', color: '#C8760A', fontFamily: 'monospace' }}>{value}kg</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}