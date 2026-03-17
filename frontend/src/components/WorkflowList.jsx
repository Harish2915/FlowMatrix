import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function WorkflowList({ onEdit, onRefresh, refresh }) {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchWorkflows() }, [refresh])

  const fetchWorkflows = async () => {
    setLoading(true)
    try { const r = await api.get('/workflows'); setWorkflows(r.data) } catch {}
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this workflow?')) return
    try { await api.delete(`/workflows/${id}`); onRefresh() }
    catch (e) { alert(e.response?.data?.detail || 'Error') }
  }

  if (loading) return <div className="py-5 text-center"><div className="wf-spinner" /></div>

  if (!workflows.length) return (
    <div className="empty-state">
      <i className="bi bi-diagram-3 empty-icon" />
      <p className="fw-semibold" style={{ color: 'var(--accent-dark)' }}>No workflows yet</p>
      <p className="small">Create your first workflow to get started</p>
    </div>
  )

  return (
    <>
      {/* Desktop & Tablet — hidden on xs/sm */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-custom table-borderless mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Status</th>
              <th className="text-nowrap">Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map(wf => (
              <tr key={wf.id}>
                <td>
                  <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }} title={wf.name}>{wf.name}</div>
                  <div className="mono small text-muted text-truncate" style={{ maxWidth: '100px' }} title={wf.id}>{wf.id.slice(0, 10)}…</div>
                </td>
                <td>
                  <span className="fw-bold" style={{ color: 'var(--accent-dark)' }}>v{wf.version}</span>
                </td>
                <td>
                  <span className={`badge-status ${wf.is_active ? 'active' : 'inactive'}`}>
                    <i className={`bi bi-${wf.is_active ? 'check-circle-fill' : 'x-circle'}`} />
                    {wf.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-muted small text-nowrap">{new Date(wf.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="icon-btn edit" onClick={() => onEdit(wf)} title="Edit">
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="icon-btn run" onClick={() => navigate(`/execute/${wf.id}`)} title="Execute">
                      <i className="bi bi-play-fill" />
                    </button>
                    <button className="icon-btn del" onClick={() => handleDelete(wf.id)} title="Delete">
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards — visible on xs/sm only */}
      <div className="d-md-none row g-3">
        {workflows.map(wf => (
          <div key={wf.id} className="col-12">
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="fw-bold" style={{ color: 'var(--accent-dark)' }}>{wf.name}</div>
                  <div className="mono" style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>
                    {wf.id.slice(0, 12)}…
                  </div>
                </div>
                <span className={`badge-status ${wf.is_active ? 'active' : 'inactive'}`}>
                  {wf.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex gap-2 align-items-center">
                  <span className="small fw-bold" style={{ color: 'var(--accent-dark)' }}>v{wf.version}</span>
                  <span className="small text-muted">{new Date(wf.created_at).toLocaleDateString()}</span>
                </div>
                <div className="d-flex gap-1">
                  <button className="icon-btn edit" onClick={() => onEdit(wf)}><i className="bi bi-pencil" /></button>
                  <button className="icon-btn run" onClick={() => navigate(`/execute/${wf.id}`)}><i className="bi bi-play-fill" /></button>
                  <button className="icon-btn del" onClick={() => handleDelete(wf.id)}><i className="bi bi-trash" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}