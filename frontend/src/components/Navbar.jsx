import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SettingsModal from './SettingsModal'

export default function Navbar({ title, onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('profile')
  const dropdownRef = useRef(null)

  const initials = user?.name
    ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login')
  }

  const openSettings = (tab = 'profile') => {
    setSettingsTab(tab)
    setDropdownOpen(false)
    setShowSettings(true)
  }

  return (
    <>
      <nav className="topbar">
        {/* Left */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="topbar-toggle d-xl-none"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`} />
          </button>
          <div className="topbar-brand d-xl-none">
            <div className="topbar-brand-icon">
              <i className="bi bi-diagram-3-fill" />
            </div>
            <span className="topbar-brand-name d-none d-sm-block">WorkFlow</span>
          </div>
          <span className="topbar-title d-none d-xl-block">{title}</span>
        </div>


        {/* Right — avatar only */}
        <div className="d-flex align-items-center gap-2" ref={dropdownRef}>
          <button
            className="nav-avatar-btn"
            onClick={() => setDropdownOpen(o => !o)}
            title={user?.name}
          >
            {initials}
          </button>

          {/* Simple dropdown — Profile + Sign Out only */}
          {dropdownOpen && (
            <div className="nav-dropdown">
              {/* Header */}
              <div className="nav-dropdown-header">
                <div className="nav-dropdown-avatar">{initials}</div>
                <div className="overflow-hidden">
                  <div className="nav-dropdown-name text-truncate">{user?.name}</div>
                  <div className="nav-dropdown-email text-truncate">{user?.email}</div>
                </div>
              </div>

              {/* Profile */}
              <button
                className="nav-dropdown-item"
                onClick={() => openSettings('profile')}
              >
                <i className="bi bi-person-circle" />
                My Profile
              </button>

              <div className="nav-dropdown-divider" />

              {/* Sign Out */}
              <button className="nav-dropdown-item danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          defaultTab={settingsTab}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  )
}