import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import api from '../services/api'

export default function ExecuteWorkflow() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workflow, setWorkflow] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    api.get(`/workflows/${id}`)
      .then(res => {
        setWorkflow(res.data)
        const fields = res.data.input_schema?.fields || []
        setFormData(Object.fromEntries(fields.map(f => [f.name, ''])))
      })
      .catch(() => setError('Workflow not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExecuting(true)
    setError('')

    // Validate required fields
    const fields = workflow?.input_schema?.fields || []
    for (const field of fields) {
      if (field.required && !formData[field.name] && formData[field.name] !== 0) {
        setError(`Field "${field.name}" is required`)
        setExecuting(false)
        return
      }
    }

    try {
      const data = { ...formData }
      // Convert number fields
      fields.forEach(f => {
        if (f.type === 'number' && data[f.name] !== '') {
          data[f.name] = parseFloat(data[f.name])
        }
      })
      const res = await api.post(`/workflows/${id}/execute`, { data })
      setSuccess(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Execution failed')
    }
    setExecuting(false)
  }

  const handleReset = () => {
    setSuccess(null)
    setError('')
    const fields = workflow?.input_schema?.fields || []
    setFormData(Object.fromEntries(fields.map(f => [f.name, ''])))
  }

  const fields = workflow?.input_schema?.fields || []

  return (
    <AppLayout title="Execute Workflow">

      {/* Page header */}
      <div className="row align-items-center mb-4 g-2">
        <div className="col-12 col-sm">
          <h1 className="page-title mb-1">
            {loading ? 'Execute Workflow' : workflow?.name}
          </h1>
          <p className="page-subtitle mb-0">
            Fill in the input data to start execution
          </p>
        </div>
        <div className="col-12 col-sm-auto">
          <button
            className="btn btn-outline-primary btn-sm w-100 w-sm-auto"
            onClick={() => navigate('/workflows')}
          >
            <i className="bi bi-arrow-left me-1" />Back
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-5 text-center">
          <div className="wf-spinner" />
        </div>
      )}

      {/* Success state */}
      {!loading && success && (
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card">
              <div className="card-body text-center py-5 px-4">
                <div className="success-circle mb-3">
                  <i className="bi bi-check-circle-fill" />
                </div>
                <h4 className="fw-bold mb-2" style={{ color: 'var(--accent-dark)' }}>
                  Execution Started!
                </h4>
                <p className="text-muted mb-1">Your workflow is running</p>
                <p className="mb-4">
                  Status:{' '}
                  <span className={`badge-status ${success.status}`}>
                    {success.status}
                  </span>
                </p>

                {/* Input data summary */}
                {Object.keys(success.data || {}).length > 0 && (
                  <div
                    className="mb-4 text-start"
                    style={{
                      background: 'rgba(252,245,238,.6)',
                      border: '1px solid rgba(238,105,131,.12)',
                      borderRadius: 10, padding: '12px 16px',
                    }}
                  >
                    <div className="small fw-bold mb-2" style={{ color: 'var(--accent-dark)' }}>
                      Input Summary
                    </div>
                    {Object.entries(success.data).map(([key, value]) => (
                      <div key={key} className="d-flex justify-content-between small py-1"
                        style={{ borderBottom: '1px solid rgba(238,105,131,.08)' }}>
                        <span className="text-muted">{key}</span>
                        <span className="fw-semibold">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/executions/${success.id}`)}
                  >
                    <i className="bi bi-eye me-1" />View Execution
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleReset}
                  >
                    <i className="bi bi-play me-1" />Run Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form state */}
      {!loading && !success && (
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-7 col-xl-6">

            {/* Workflow info card */}
            <div className="card mb-3 no-hover">
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '1rem', flexShrink: 0,
                    }}>
                      <i className="bi bi-diagram-3-fill" />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: 'var(--accent-dark)' }}>
                        {workflow?.name}
                      </div>
                      <div className="small text-muted">
                        Version {workflow?.version} •{' '}
                        {fields.length} input field{fields.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <span className="badge-status active">Active</span>
                </div>
              </div>
            </div>

            {/* Input form card */}
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">
                  <i className="bi bi-lightning-fill text-accent" />
                  Execution Input
                </h6>
              </div>
              <div className="card-body p-4">

                {error && (
                  <div className="alert-err mb-3">
                    <i className="bi bi-exclamation-circle" />{error}
                  </div>
                )}

                {fields.length === 0 && (
                  <div className="alert-ok mb-3">
                    <i className="bi bi-info-circle" />
                    No input fields required for this workflow
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-4">
                    {fields.map(field => (
                      <div
                        key={field.name}
                        className="col-12 col-sm-6"
                      >
                        <label className="form-label-custom">
                          {field.name}
                          {field.required && (
                            <span className="text-accent ms-1">*</span>
                          )}
                          <span className="ms-2" style={{
                            color: 'var(--text-muted)',
                            textTransform: 'none',
                            fontWeight: 400,
                            fontSize: '.7rem',
                          }}>
                            ({field.type})
                          </span>
                        </label>

                        {/* allowed_values → dropdown */}
                        {field.allowed_values ? (
                          <select
                            className="form-select-custom w-100"
                            value={formData[field.name] || ''}
                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                            required={field.required}
                          >
                            <option value="">— Select {field.name} —</option>
                            {field.allowed_values.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="form-control-custom w-100"
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={formData[field.name] ?? ''}
                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                            placeholder={`Enter ${field.name}`}
                            required={field.required}
                            step={field.type === 'number' ? 'any' : undefined}
                          />
                        )}

                        {/* Show allowed values hint */}
                        {field.allowed_values && (
                          <div className="mt-1" style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                            Options: {field.allowed_values.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Preview of what will be sent */}
                  {fields.length > 0 && Object.values(formData).some(v => v !== '') && (
                    <div
                      className="mb-4"
                      style={{
                        background: 'rgba(252,245,238,.6)',
                        border: '1px solid rgba(238,105,131,.1)',
                        borderRadius: 8, padding: '10px 14px',
                      }}
                    >
                      <div className="small fw-bold mb-1" style={{ color: 'var(--accent-dark)' }}>
                        <i className="bi bi-eye me-1" />Preview
                      </div>
                      <pre className="mb-0" style={{
                        fontSize: '.75rem', fontFamily: 'monospace',
                        color: 'var(--text-dark)', margin: 0,
                      }}>
                        {JSON.stringify(
                          Object.fromEntries(
                            fields.map(f => [
                              f.name,
                              f.type === 'number' && formData[f.name] !== ''
                                ? parseFloat(formData[f.name])
                                : formData[f.name]
                            ])
                          ),
                          null, 2
                        )}
                      </pre>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={executing}
                  >
                    {executing
                      ? <><span className="spinner-border spinner-border-sm me-2" />Executing…</>
                      : <><i className="bi bi-play-fill me-1" />Start Execution</>
                    }
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>
      )}

    </AppLayout>
  )
}