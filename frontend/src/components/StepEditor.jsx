import { useState, useEffect } from 'react'
import api from '../services/api'
import RuleEditor from './RuleEditor'

export default function StepEditor({ workflow, onSave }) {
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editStep, setEditStep] = useState(null)
  const [selectedStep, setSelectedStep] = useState(null)
  const [form, setForm] = useState({ name: '', step_type: 'task', step_order: 0 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchSteps() }, [workflow.id])

  const fetchSteps = async () => {
    setLoading(true)
    try { const r = await api.get(`/workflows/${workflow.id}/steps`); setSteps(r.data) } catch {}
    setLoading(false)
  }

  const openAdd = () => {
    setForm({ name: '', step_type: 'task', step_order: steps.length })
    setEditStep(null); setShowForm(true); setError('')
  }

  const openEdit = (s) => {
    setForm({ name: s.name, step_type: s.step_type, step_order: s.step_order })
    setEditStep(s); setShowForm(true); setError('')
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Step name required'); return }
    setSaving(true); setError('')
    try {
      editStep
        ? await api.put(`/steps/${editStep.id}`, form)
        : await api.post(`/workflows/${workflow.id}/steps`, form)
      setShowForm(false); fetchSteps(); onSave?.()
    } catch (e) { setError(e.response?.data?.detail || 'Error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete step?')) return
    await api.delete(`/steps/${id}`); fetchSteps()
  }

  if (loading) return <div className="py-4 text-center"><div className="wf-spinner" /></div>

  return (
    <div>
      {/* Header row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="small fw-bold" style={{ color: 'var(--accent-dark)' }}>
          {steps.length} Step{steps.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <i className="bi bi-plus me-1" />Add Step
        </button>
      </div>

      {/* Steps list */}
      {steps.length === 0 && (
        <div className="empty-state py-3">
          <i className="bi bi-list-task empty-icon" style={{ fontSize: '2rem' }} />
          <p className="small">No steps yet</p>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {steps.map(step => (
          <div key={step.id} className={`step-item${selectedStep?.id === step.id ? ' selected' : ''}`}>
            {/* Step row */}
            <div className="d-flex align-items-center gap-2">
              <div className="step-num flex-shrink-0">{step.step_order + 1}</div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="fw-semibold small text-truncate">{step.name}</div>
                <span className={`badge-status ${step.step_type}`} style={{ fontSize: '.68rem' }}>
                  {step.step_type}
                </span>
              </div>
              <div className="d-flex gap-1 flex-shrink-0">
                <button
                  className="icon-btn view"
                  style={{ width: 26, height: 26, fontSize: '.72rem' }}
                  title="Rules"
                  onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                >
                  <i className="bi bi-list-check" />
                </button>
                <button className="icon-btn edit" style={{ width: 26, height: 26, fontSize: '.72rem' }} onClick={() => openEdit(step)}>
                  <i className="bi bi-pencil" />
                </button>
                <button className="icon-btn del" style={{ width: 26, height: 26, fontSize: '.72rem' }} onClick={() => handleDelete(step.id)}>
                  <i className="bi bi-trash" />
                </button>
              </div>
            </div>

            {/* Inline rule editor */}
            {selectedStep?.id === step.id && (
              <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(238,105,131,.12)' }}>
                <RuleEditor step={step} steps={steps} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card mt-3 p-3">
          <div className="fw-bold small mb-2" style={{ color: 'var(--accent-dark)' }}>
            {editStep ? 'Edit Step' : 'New Step'}
          </div>
          {error && <div className="alert-err mb-2"><i className="bi bi-exclamation-circle" />{error}</div>}

          <div className="row g-2">
            <div className="col-12 col-sm-6">
              <label className="form-label-custom">Name</label>
              <input
                className="form-control-custom w-100"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Step name"
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label-custom">Type</label>
              <select
                className="form-select-custom w-100"
                value={form.step_type}
                onChange={e => setForm({ ...form, step_type: e.target.value })}
              >
                <option value="task">Task</option>
                <option value="approval">Approval</option>
                <option value="notification">Notification</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-outline-primary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm" /> : editStep ? 'Update' : 'Add Step'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}