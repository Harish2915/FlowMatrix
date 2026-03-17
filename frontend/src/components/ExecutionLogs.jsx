import { useState, useEffect } from 'react'
import api from '../services/api'

export default function ExecutionLogs({ executionId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!executionId) return
    api.get(`/executions/${executionId}/logs`)
      .then(r => setLogs(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [executionId])

  if (loading) return <div className="py-4 text-center"><div className="wf-spinner" /></div>
  if (!logs.length) return (
    <div className="empty-state">
      <i className="bi bi-journal empty-icon" />
      <p className="small">No logs yet</p>
    </div>
  )

  return (
    <>
      {/* Desktop table */}
      <div className="table-wrapper d-none d-md-block">
        <table className="table table-custom table-borderless mb-0">
          <thead>
            <tr>
              <th>#</th><th>Step</th><th>Type</th><th>Status</th>
              <th>Next Step</th><th>Duration</th><th>Rules Evaluated</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const dur = log.ended_at
                ? `${((new Date(log.ended_at) - new Date(log.started_at)) / 1000).toFixed(2)}s`
                : '—'
              return (
                <tr key={log.id}>
                  <td><span className="fw-bold text-accent-dark">{i + 1}</span></td>
                  <td className="fw-semibold">{log.step_name || '—'}</td>
                  <td>{log.step_type && <span className={`badge-status ${log.step_type}`}>{log.step_type}</span>}</td>
                  <td><span className={`badge-status ${log.status}`}>{log.status}</span></td>
                  <td className="mono small text-muted">{log.selected_next_step ? log.selected_next_step.slice(0, 8) + '…' : '—'}</td>
                  <td className="small text-muted">{dur}</td>
                  <td>
                    {Array.isArray(log.evaluated_rules) && log.evaluated_rules.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {log.evaluated_rules.map((r, ri) => (
                          <span key={ri} style={{
                            padding: '1px 7px', borderRadius: 20, fontSize: '.68rem', fontWeight: 500,
                            background: r.selected ? 'rgba(34,197,94,.12)' : 'rgba(156,163,175,.1)',
                            color: r.selected ? '#15803d' : 'var(--text-muted)',
                            fontFamily: 'monospace'
                          }}>
                            {r.condition.slice(0, 18)}{r.condition.length > 18 ? '…' : ''}
                          </span>
                        ))}
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none row g-3">
        {logs.map((log, i) => {
          const dur = log.ended_at
            ? `${((new Date(log.ended_at) - new Date(log.started_at)) / 1000).toFixed(2)}s`
            : '—'
          return (
            <div key={log.id} className="col-12">
              <div className="card p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-accent-dark small">#{i + 1}</span>
                    <span className="fw-semibold small">{log.step_name}</span>
                    {log.step_type && <span className={`badge-status ${log.step_type}`} style={{ fontSize: '.65rem' }}>{log.step_type}</span>}
                  </div>
                  <span className={`badge-status ${log.status}`}>{log.status}</span>
                </div>
                <div className="d-flex gap-3 small text-muted">
                  <span><i className="bi bi-clock me-1" />{dur}</span>
                  {log.selected_next_step && (
                    <span className="mono">→ {log.selected_next_step.slice(0, 8)}…</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}