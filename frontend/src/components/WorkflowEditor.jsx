import { useState, useEffect } from 'react'
import api from '../services/api'
import StepEditor from './StepEditor'

export default function WorkflowEditor({ workflow, onSave, onClose }) {
  const [name, setName] = useState(workflow?.name || '')
  const [inputSchema, setInputSchema] = useState(
    workflow?.input_schema ? JSON.stringify(workflow.input_schema, null, 2) : ''
  )
  const [startStepId, setStartStepId] = useState(workflow?.start_step_id || '')
  const [steps, setSteps] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [savedWorkflow, setSavedWorkflow] = useState(workflow || null)

  // Load steps whenever savedWorkflow changes
  useEffect(() => {
    if (savedWorkflow?.id) {
      loadSteps(savedWorkflow.id)
    }
  }, [savedWorkflow?.id])

  const loadSteps = async (workflowId) => {
    try {
      const r = await api.get(`/workflows/${workflowId}/steps`)
      setSteps(r.data)
      // Auto select first step if start_step_id not set
      if (!startStepId && r.data.length > 0) {
        const sorted = [...r.data].sort((a, b) => a.step_order - b.step_order)
        setStartStepId(sorted[0].id)
      }
    } catch (e) {
      console.error('Failed to load steps', e)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return }
    let parsedSchema = null
    if (inputSchema.trim()) {
      try { parsedSchema = JSON.parse(inputSchema) }
      catch { setError('Invalid JSON in input schema'); return }
    }
    setSaving(true); setError('')
    try {
      let res
      if (savedWorkflow) {
        res = await api.put(`/workflows/${savedWorkflow.id}`, {
          name,
          input_schema: parsedSchema,
          start_step_id: startStepId || null
        })
      } else {
        res = await api.post('/workflows', {
          name,
          input_schema: parsedSchema,
          start_step_id: startStepId || null
        })
      }
      setSavedWorkflow(res.data)
      setActiveTab('steps')
      if (savedWorkflow) onSave()
    } catch (e) {
      setError(e.response?.data?.detail || 'Error saving')
    }
    setSaving(false)
  }

  const handleStepSave = async () => {
    if (savedWorkflow?.id) {
      await loadSteps(savedWorkflow.id)
    }
    onSave?.()
  }

  useEffect(() => {
  document.body.classList.add('modal-open-custom')
  return () => {
    document.body.classList.remove('modal-open-custom')
  }
}, [])

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(45,26,26,.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-diagram-3 text-accent" />
              {savedWorkflow ? 'Edit Workflow' : 'New Workflow'}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* Tab strip */}
          <div className="tab-strip">
            {['info', 'steps'].map(tab => (
              <button
                key={tab}
                className={`tab-strip-btn${activeTab === tab ? ' active' : ''}`}
                onClick={() => savedWorkflow && setActiveTab(tab)}
                disabled={!savedWorkflow && tab === 'steps'}
              >
                <i className={`bi bi-${tab === 'info' ? 'info-circle' : 'list-task'} me-2`} />
                {tab === 'info' ? 'Workflow Info' : 'Steps & Rules'}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="modal-body">

            {/* INFO TAB */}
            {activeTab === 'info' && (
              <>
                {error && (
                  <div className="alert-err mb-3">
                    <i className="bi bi-exclamation-circle" />{error}
                  </div>
                )}

                <div className="row g-3">

                  {/* Name */}
                  <div className="col-12">
                    <label className="form-label-custom">
                      Workflow Name <span className="text-accent">*</span>
                    </label>
                    <input
                      className="form-control-custom w-100"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Expense Approval"
                    />
                  </div>

                  {/* Start Step */}
                  <div className="col-12">
                    <label className="form-label-custom">
                      Start Step
                      <span className="ms-2 text-muted" style={{ textTransform: 'none', fontWeight: 400, fontSize: '.72rem' }}>
                        (first step the engine runs)
                      </span>
                    </label>

                    {steps.length === 0 && savedWorkflow ? (
                      <div className="alert-err">
                        <i className="bi bi-exclamation-triangle-fill" />
                        No steps found — go to Steps & Rules tab and add steps first
                      </div>
                    ) : steps.length === 0 ? (
                      <div className="alert-ok">
                        <i className="bi bi-info-circle" />
                        Save workflow first, then add steps to set start step
                      </div>
                    ) : (
                      <>
                        <select
                          className="form-select-custom w-100"
                          value={startStepId}
                          onChange={e => setStartStepId(e.target.value)}
                        >
                          <option value="">— Select start step —</option>
                          {[...steps]
                            .sort((a, b) => a.step_order - b.step_order)
                            .map(s => (
                              <option key={s.id} value={s.id}>
                                {s.step_order + 1}. {s.name} ({s.step_type})
                              </option>
                            ))
                          }
                        </select>

                        {/* Status indicator */}
                        {startStepId ? (
                          <div className="mt-1 d-flex align-items-center gap-1"
                            style={{ fontSize: '.75rem', color: '#15803d' }}>
                            <i className="bi bi-check-circle-fill" />
                            Start step is set to: <strong>
                              {steps.find(s => s.id === startStepId)?.name}
                            </strong>
                          </div>
                        ) : (
                          <div className="mt-1 d-flex align-items-center gap-1"
                            style={{ fontSize: '.75rem', color: '#b45309' }}>
                            <i className="bi bi-exclamation-triangle-fill" />
                            No start step selected — execution will fail
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Input Schema */}
                  <div className="col-12">
                    <label className="form-label-custom">Input Schema (JSON)</label>
                    <textarea
                      className="form-control-custom w-100"
                      rows={6}
                      value={inputSchema}
                      onChange={e => setInputSchema(e.target.value)}
                      placeholder={'{\n  "fields": [\n    {"name": "amount", "type": "number", "required": true},\n    {"name": "priority", "type": "string", "required": true, "allowed_values": ["High","Medium","Low"]}\n  ]\n}'}
                    />
                    <div className="small text-muted mt-1">
                      Define input fields required before execution
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* STEPS TAB */}
            {activeTab === 'steps' && savedWorkflow && (
              <>
                {!startStepId && steps.length > 0 && (
                  <div className="alert-err mb-3">
                    <i className="bi bi-exclamation-triangle-fill" />
                    No start step set — go to Workflow Info tab, select a start step and save.
                  </div>
                )}
                {startStepId && (
                  <div className="alert-ok mb-3">
                    <i className="bi bi-play-circle-fill" />
                    Execution starts at: <strong className="ms-1">
                      {steps.find(s => s.id === startStepId)?.name || '...'}
                    </strong>
                  </div>
                )}
                <StepEditor
                  workflow={savedWorkflow}
                  onSave={handleStepSave}
                />
              </>
            )}

          </div>

          {/* Footer — only on info tab */}
          {activeTab === 'info' && (
            <div className="modal-footer">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                  : <><i className="bi bi-check-lg me-1" />{savedWorkflow ? 'Save Changes' : 'Create & Continue'}</>
                }
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}