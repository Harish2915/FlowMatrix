import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function AuditLog() {
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  useEffect(() => {
    api.get('/executions').then(r => setExecutions(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-4 text-center"><div className="wf-spinner" /></div>
  if (!executions.length) return (
    <div className="empty-state">
      <i className="bi bi-clock-history empty-icon" />
      <p className="small">No executions yet</p>
    </div>
  )

  const start = (page - 1) * rowsPerPage
  const paginatedExecutions = executions.slice(start, start + rowsPerPage)
  const totalPages = Math.ceil(executions.length / rowsPerPage)

  return (
    <>
      {/* Desktop & Tablet */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-custom table-borderless mb-0">
          <thead>
            <tr>
              <th>Execution ID</th>
              <th>Workflow</th>
              <th>Ver</th>
              <th>Status</th>
              <th>Triggered By</th>
              <th className="text-nowrap">Start</th>
              <th className="text-nowrap">End</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedExecutions.map(ex => (
              <tr key={ex.id}>
                <td className="mono small text-muted text-truncate" style={{ maxWidth: '120px' }} title={ex.id}>
                  {ex.id.slice(0, 12)}…
                </td>
                <td className="mono small text-muted text-truncate" style={{ maxWidth: '100px' }} title={ex.workflow_id}>
                  {ex.workflow_id.slice(0, 8)}…
                </td>
                <td><span className="fw-bold text-accent-dark">v{ex.workflow_version}</span></td>
                <td><span className={`badge-status ${ex.status}`}>{ex.status}</span></td>
                <td className="small text-nowrap">{ex.triggered_by || '—'}</td>
                <td className="small text-muted text-nowrap">{new Date(ex.started_at).toLocaleString()}</td>
                <td className="small text-muted text-nowrap">
                  {ex.ended_at ? new Date(ex.ended_at).toLocaleString() : '—'}
                </td>
                <td>
                  <Link to={`/executions/${ex.id}`} className="icon-btn view">
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
        {paginatedExecutions.map(ex => (
          <div key={ex.id} className="col-12">
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="mono small text-muted">{ex.id.slice(0, 16)}…</div>
                  <span className="fw-bold text-accent-dark small">v{ex.workflow_version}</span>
                </div>
                <span className={`badge-status ${ex.status}`}>{ex.status}</span>
              </div>
              <div className="small text-muted mb-1">{ex.triggered_by || '—'}</div>
              <div className="small text-muted">{new Date(ex.started_at).toLocaleString()}</div>
              <div className="d-flex justify-content-end mt-2">
                <Link to={`/executions/${ex.id}`} className="icon-btn view">
                  <i className="bi bi-eye" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page === 1}
            onClick={() => {
              setPage(p => p - 1)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <i className="bi bi-chevron-left me-1" />
            Previous
          </button>

          <span className="small text-muted fw-medium">
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page === totalPages}
            onClick={() => {
              setPage(p => p + 1)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Next
            <i className="bi bi-chevron-right ms-1" />
          </button>
        </div>
      )}
    </>
  )
}