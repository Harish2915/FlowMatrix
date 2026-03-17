import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/workflows': 'Workflows',
  '/audit': 'Audit Log',
  '/executions': 'Executions',
}

function getTitle(pathname) {
  if (pathname.startsWith('/execute/')) return 'Execute Workflow'
  if (pathname.startsWith('/executions/')) return 'Execution Details'
  return ROUTE_TITLES[pathname] ?? 'Flow Matrix'
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const title = getTitle(location.pathname)

  // Initialise without flicker
  const isDesktopInit = window.innerWidth >= 1200
  const [isDesktop,   setIsDesktop]   = useState(isDesktopInit)
  const [sidebarOpen, setSidebarOpen] = useState(isDesktopInit)

  // Resize: open on desktop, close on mobile
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1200
      setIsDesktop(desktop)
      setSidebarOpen(desktop) // open on desktop, closed on mobile
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close on route change (mobile only)
  const prevPath = useRef(location.pathname)
  useEffect(() => {
    if (!isDesktop && prevPath.current !== location.pathname) {
      setSidebarOpen(false)
    }
    prevPath.current = location.pathname
  }, [location.pathname, isDesktop])

  const toggleSidebar = () => setSidebarOpen(p => !p)

  return (
    <div className="app-wrapper">

      {/* Backdrop — mobile only, plain dark overlay, NO blur */}
      {sidebarOpen && !isDesktop && (
        <div
          className="sidebar-backdrop show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main */}
      <div className="main-content">
        <Navbar
          title={title}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <div className="p-3 p-md-4 flex-grow-1">
          {children}
        </div>
      </div>

    </div>
  )
}