import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#F8F7F4'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px',
            padding: '40px', maxWidth: '480px', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1C1917', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#78716C', fontSize: '14px', marginBottom: '24px' }}>
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#C8760A', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '10px 24px', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer'
              }}
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}