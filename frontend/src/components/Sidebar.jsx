import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/',           icon: 'bi-grid-1x2-fill',        label: 'Dashboard'  },
  { to: '/workflows',  icon: 'bi-diagram-3-fill',        label: 'Workflows'  },
  { to: '/executions', icon: 'bi-lightning-charge-fill', label: 'Executions' },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <i className="bi bi-diagram-3-fill" />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">Flow Matrix</div>
        </div>
        <button className="sidebar-close-btn d-xl-none"
          onClick={e => { e.stopPropagation(); onClose() }}>
          <i className="bi bi-x-lg" />
        </button>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={() => window.innerWidth < 1200 && onClose()}
          >
            <i className={`bi ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-info-chip">
          <div className="user-avatar">{initials}</div>
          <div className="overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name text-truncate">{user?.name}</div>
            <div className="user-email text-truncate">{user?.email}</div>
          </div>
        </div>
        {/* <button className="btn-logout" onClick={logout}>
          <i className="bi bi-box-arrow-right" /> Sign Out
        </button> */}
      </div>
    </div>
  )
}