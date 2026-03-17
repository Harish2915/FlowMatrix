import { useState, useEffect } from 'react'
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
  return ROUTE_TITLES[pathname] ?? 'WorkFlow Engine'
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const title = getTitle(location.pathname)

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1200)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1200)
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1200
      setIsDesktop(desktop)
      if (desktop) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])


  // Close on route change on mobile
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false)
  }, [location.pathname, isDesktop])

  const toggleSidebar = () => setSidebarOpen(p => !p)

  return (
    <div className="app-wrapper">

      {/* ── Backdrop mobile ── */}
      {sidebarOpen && !isDesktop && (
        <div
          className="sidebar-backdrop show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onToggle={toggleSidebar}
        />
      </div>

      {/* ── Main content ── */}
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
