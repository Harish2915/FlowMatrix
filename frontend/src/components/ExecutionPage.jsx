import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from './AppLayout'
import api from '../services/api'

export default function ExecutionPage() {
  const [executions, setExecutions] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')

  useEffect(() => {
    api.get('/executions')
      .then((r) => setExecutions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    filter === 'all'
      ? executions
      : executions.filter((e) => e.status === filter)

  const statusCounts = ['completed', 'in_progress', 'failed', 'pending', 'canceled'].reduce(
    (acc, s) => {
      acc[s] = executions.filter((e) => e.status === s).length
      return acc
    },
    {}
  )

  const filterBtns = [
    { key: 'all',         label: 'All',         count: executions.length },
    { key: 'completed',   label: 'Completed',   count: statusCounts.completed },
    { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
    { key: 'failed',      label: 'Failed',      count: statusCounts.failed },
    { key: 'pending',     label: 'Pending',     count: statusCounts.pending },
    { key: 'canceled',    label: 'Canceled',    count: statusCounts.canceled },
  ]

  return (
    <AppLayout>
      {/* Page header */}
      <div className="row align-items-center mb-4 g-2">
        <div className="col-12 col-sm">
          <h1 className="page-title mb-1">Executions</h1>
          <p className="page-subtitle mb-0">
            All workflow execution runs — {executions.length} total
          </p>
        </div>
      </div>

      {/* Summary stat row */}
      <div className="row g-3 mb-4">
        {[
          { key: 'c1', icon: 'bi-lightning-fill',   label: 'Total',       value: executions.length },
          { key: 'c3', icon: 'bi-check-circle-fill', label: 'Completed',  value: statusCounts.completed },
          { key: 'c2', icon: 'bi-hourglass-split',   label: 'In Progress',value: statusCounts.in_progress },
          { key: 'c4', icon: 'bi-x-circle-fill',     label: 'Failed',     value: statusCounts.failed },
        ].map((s) => (
          <div key={s.key} className="col-6 col-lg-3">
            <div className={`card stat-card ${s.key} h-100`}>
              <div className="card-body p-3">
                <div className={`stat-icon ${s.key} mb-2`}>
                  <i className={`bi ${s.icon}`} />
                </div>
                <div className="stat-value">{loading ? '—' : s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div
        className="d-flex flex-wrap gap-2 mb-3"
        style={{ overflowX: 'auto', paddingBottom: 4 }}
      >
        {filterBtns.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor:
                filter === btn.key ? 'var(--accent)' : 'rgba(238,105,131,.2)',
              background:
                filter === btn.key
                  ? 'linear-gradient(135deg,var(--accent),var(--accent-dark))'
                  : 'transparent',
              color: filter === btn.key ? '#fff' : 'var(--text-muted)',
              fontSize: '.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-main)',
              cursor: 'pointer',
              transition: 'all .2s',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {btn.label}
            <span
              style={{
                background: filter === btn.key ? 'rgba(255,255,255,.25)' : 'rgba(238,105,131,.12)',
                color: filter === btn.key ? '#fff' : 'var(--accent-dark)',
                borderRadius: 20,
                padding: '0 7px',
                fontSize: '.72rem',
                fontWeight: 700,
              }}
            >
              {btn.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h6 className="card-title">
            <i className="bi bi-lightning text-accent" />
            Execution Runs
          </h6>
          <span className="small text-muted">{filtered.length} results</span>
        </div>
        <div className="card-body p-0 p-md-3">
          {loading ? (
            <div className="py-5 text-center">
              <div className="wf-spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-lightning empty-icon" />
              <p className="fw-semibold" style={{ color: 'var(--accent-dark)' }}>
                No executions found
              </p>
              <p className="small">Try a different filter</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="table-wrapper d-none d-md-block">
                <table className="table table-custom table-borderless mb-0">
                  <thead>
                    <tr>
                      <th>Execution ID</th>
                      <th>Workflow ID</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th>Triggered By</th>
                      <th>Retries</th>
                      <th>Started</th>
                      <th>Ended</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ex) => (
                      <tr key={ex.id}>
                        <td className="mono small text-muted">
                          {ex.id.slice(0, 12)}…
                        </td>
                        <td className="mono small text-muted">
                          {ex.workflow_id.slice(0, 10)}…
                        </td>
                        <td>
                          <span className="fw-bold text-accent-dark">
                            v{ex.workflow_version}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${ex.status}`}>
                            {ex.status}
                          </span>
                        </td>
                        <td className="small">{ex.triggered_by || '—'}</td>
                        <td className="small text-center">{ex.retries}</td>
                        <td className="small text-muted">
                          {new Date(ex.started_at).toLocaleString()}
                        </td>
                        <td className="small text-muted">
                          {ex.ended_at
                            ? new Date(ex.ended_at).toLocaleString()
                            : '—'}
                        </td>
                        <td>
                          <Link
                            to={`/executions/${ex.id}`}
                            className="icon-btn view"
                          >
                            <i className="bi bi-eye" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="d-md-none row g-3">
                {filtered.map((ex) => (
                  <div key={ex.id} className="col-12">
                    <div className="card p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="mono small text-muted">
                            {ex.id.slice(0, 18)}…
                          </div>
                          <span className="fw-bold text-accent-dark small">
                            v{ex.workflow_version}
                          </span>
                        </div>
                        <span className={`badge-status ${ex.status}`}>
                          {ex.status}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                        <span>
                          <i className="bi bi-person me-1" />
                          {ex.triggered_by || '—'}
                        </span>
                        <span>
                          <i className="bi bi-arrow-clockwise me-1" />
                          {ex.retries} retr{ex.retries === 1 ? 'y' : 'ies'}
                        </span>
                      </div>

                      <div className="small text-muted mb-2">
                        <i className="bi bi-clock me-1" />
                        {new Date(ex.started_at).toLocaleString()}
                      </div>

                      <div className="d-flex justify-content-end">
                        <Link
                          to={`/executions/${ex.id}`}
                          className="icon-btn view"
                        >
                          <i className="bi bi-eye" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}