import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import AuditLog from '../components/AuditLog'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ workflows: 0, executions: 0, completed: 0, failed: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/workflows').catch(() => ({ data: [] })),
      api.get('/executions').catch(() => ({ data: [] }))
    ]).then(([wfRes, exRes]) => {
      const ex = exRes.data
      setStats({
        workflows: wfRes.data.length,
        executions: ex.length,
        completed: ex.filter(e => e.status === 'completed').length,
        failed: ex.filter(e => e.status === 'failed').length
      })
    }).finally(() => setLoading(false))
  }, [])

  const statItems = [
    { key: 'c1', icon: 'bi-diagram-3-fill', label: 'Total Workflows', value: stats.workflows },
    { key: 'c2', icon: 'bi-lightning-fill',  label: 'Executions',      value: stats.executions },
    { key: 'c3', icon: 'bi-check-circle-fill',label: 'Completed',      value: stats.completed },
    { key: 'c4', icon: 'bi-x-circle-fill',   label: 'Failed',          value: stats.failed },
  ]

  return (
    <AppLayout title="Dashboard">
      {/* Page header */}
      <div className="row align-items-center mb-4 g-2">
        <div className="col-12 col-sm">
          <h1 className="page-title mb-1">Overview</h1>
          <p className="page-subtitle mb-0">Here's what's happening with your workflows</p>
        </div>
        <div className="col-12 col-sm-auto">
          <button className="btn btn-primary w-100 w-sm-auto" onClick={() => navigate('/workflows')}>
            <i className="bi bi-plus-lg me-1" />New Workflow
          </button>
        </div>
      </div>

      {/* Stat cards — 4 cols on lg, 2 on sm, 1 on xs */}
      <div className="row g-3 mb-4">
        {statItems.map(s => (
          <div key={s.key} className="col-6 col-lg-3">
            <div className={`card stat-card ${s.key} h-100`}>
              <div className="card-body p-3">
                <div className={`stat-icon ${s.key} mb-3`}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div className="stat-value">{loading ? '—' : s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent executions */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h6 className="card-title">
                <i className="bi bi-clock-history text-accent" />
                Recent Executions
              </h6>
            </div>
            <div className="card-body p-3">
              <AuditLog />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}