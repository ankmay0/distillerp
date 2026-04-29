import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Factory, Package, ShoppingCart,
  Receipt, BarChart3, BookOpen, Settings, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/production', icon: Factory, label: 'Production' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/ledger', icon: BookOpen, label: 'Daily Ledger' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after clicking a link
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const roleColor = (role) => {
    if (role === 'superadmin') return { bg: '#FEF3C7', color: '#92400E' }
    if (role === 'owner') return { bg: '#EDE9FE', color: '#5B21B6' }
    return { bg: '#E0F2FE', color: '#0369A1' }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* Overlay for mobile — clicking outside closes sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'block'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : '-224px',
        width: '224px',
        height: '100vh',
        backgroundColor: '#1C1917',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'left 0.3s ease',
        boxShadow: sidebarOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none'
      }}>

        {/* Brand + Close button */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #44403C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏭</span>
            <div>
              <p style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>DistillERP</p>
              <p style={{ color: '#A8A29E', fontSize: '11px' }}>Factory System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none', border: 'none',
              color: '#A8A29E', cursor: 'pointer',
              padding: '4px', borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '13px',
                fontWeight: '500',
                textDecoration: 'none',
                backgroundColor: isActive ? '#C8760A' : 'transparent',
                color: isActive ? 'white' : '#A8A29E',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div style={{ borderTop: '1px solid #44403C', padding: '12px' }}>
          <div style={{ padding: '8px', marginBottom: '4px' }}>
            <p style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>
              {user?.full_name}
            </p>
            <p style={{ color: '#A8A29E', fontSize: '11px' }}>{user?.email}</p>
            <span style={{
              display: 'inline-block', marginTop: '6px',
              padding: '2px 10px', borderRadius: '999px',
              fontSize: '10px', fontWeight: '600',
              backgroundColor: roleColor(user?.role).bg,
              color: roleColor(user?.role).color
            }}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '8px',
              color: '#A8A29E', background: 'none',
              border: 'none', cursor: 'pointer',
              fontSize: '13px', width: '100%',
              fontFamily: 'inherit', transition: 'all 0.15s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#7F1D1D'
              e.currentTarget.style.color = '#FCA5A5'
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#A8A29E'
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%'
      }}>

        {/* Topbar */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #E7E5E4',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Hamburger menu — always visible */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer', padding: '6px',
                borderRadius: '8px', color: '#44403C',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#F5F5F4'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Menu size={22} />
            </button>

            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#1C1917' }}>DistillERP</p>
              <p style={{ fontSize: '11px', color: '#A8A29E' }}>{today}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: roleColor(user?.role).bg,
              color: roleColor(user?.role).color,
              fontSize: '11px', fontWeight: '600',
              padding: '4px 12px', borderRadius: '999px'
            }}>
              {user?.role === 'superadmin' ? '👑' : '👤'} {user?.full_name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#F8F7F4'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}