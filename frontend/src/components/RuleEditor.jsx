import { useState, useEffect } from 'react'
import api from '../services/api'

export default function RuleEditor({ step, steps }) {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editRule, setEditRule] = useState(null)
  const [form, setForm] = useState({ condition: '', next_step_id: '', priority: 0 })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchRules() }, [step.id])

  const fetchRules = async () => {
    setLoading(true)
    try { const r = await api.get(`/steps/${step.id}/rules`); setRules(r.data) } catch {}
    setLoading(false)
  }

  const openAdd = () => {
    setForm({ condition: '', next_step_id: '', priority: rules.length })
    setEditRule(null); setShowForm(true); setError('')
  }

  const openEdit = (r) => {
    setForm({ condition: r.condition, next_step_id: r.next_step_id || '', priority: r.priority })
    setEditRule(r); setShowForm(true); setError('')
  }

  const handleSave = async () => {
    if (!form.condition.trim()) { setError('Condition required'); return }
    setSaving(true)
    try {
      const payload = { ...form, next_step_id: form.next_step_id || null, priority: parseInt(form.priority) }
      editRule
        ? await api.put(`/rules/${editRule.id}`, payload)
        : await api.post(`/steps/${step.id}/rules`, payload)
      setShowForm(false); fetchRules()
    } catch (e) { setError(e.response?.data?.detail || 'Error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete rule?')) return
    await api.delete(`/rules/${id}`); fetchRules()
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          Routing Rules
        </span>
        <button className="btn btn-primary btn-sm py-0 px-2" style={{ fontSize: '.72rem' }} onClick={openAdd}>
          <i className="bi bi-plus" />Rule
        </button>
      </div>

      {loading && <div className="text-center py-2"><div className="wf-spinner" style={{ width: 20, height: 20 }} /></div>}

      {!loading && rules.length === 0 && (
        <div className="small text-center py-2" style={{ color: 'var(--text-muted)' }}>
          No rules — step ends here
        </div>
      )}

      <div className="d-flex flex-column gap-1">
        {rules.map(rule => (
          <div key={rule.id} className="rule-item d-flex align-items-center gap-2">
            <div className="rule-priority-badge">{rule.priority}</div>
            <div className="flex-grow-1 overflow-hidden">
              <div className="rule-condition text-truncate">{rule.condition}</div>
              <div className="rule-next">
                → {steps.find(s => s.id === rule.next_step_id)?.name || 'End'}
              </div>
            </div>
            <div className="d-flex gap-1 flex-shrink-0">
              <button className="icon-btn edit" style={{ width: 22, height: 22, fontSize: '.65rem' }} onClick={() => openEdit(rule)}>
                <i className="bi bi-pencil" />
              </button>
              <button className="icon-btn del" style={{ width: 22, height: 22, fontSize: '.65rem' }} onClick={() => handleDelete(rule.id)}>
                <i className="bi bi-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card mt-2 p-2">
          {error && <div className="alert-err mb-2" style={{ fontSize: '.78rem', padding: '6px 10px' }}><i className="bi bi-exclamation-circle" />{error}</div>}

          <div className="mb-2">
            <label className="form-label-custom">Condition</label>
            <input
              className="form-control-custom w-100"
              style={{ fontFamily: 'monospace', fontSize: '.8rem' }}
              value={form.condition}
              onChange={e => setForm({ ...form, condition: e.target.value })}
              placeholder="amount > 100 && priority == 'High'"
            />
          </div>

          <div className="row g-2 mb-2">
            <div className="col-8">
              <label className="form-label-custom">Next Step</label>
              <select
                className="form-select-custom w-100"
                style={{ fontSize: '.8rem' }}
                value={form.next_step_id}
                onChange={e => setForm({ ...form, next_step_id: e.target.value })}
              >
                <option value="">— End —</option>
                {steps.filter(s => s.id !== step.id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-4">
              <label className="form-label-custom">Priority</label>
              <input
                type="number"
                className="form-control-custom w-100"
                style={{ fontSize: '.8rem' }}
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-primary btn-sm py-0 px-2" style={{ fontSize: '.78rem' }} onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm py-0 px-2" style={{ fontSize: '.78rem' }} onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} /> : editRule ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}