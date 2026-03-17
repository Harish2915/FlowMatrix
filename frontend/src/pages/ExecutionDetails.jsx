import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import ExecutionLogs from '../components/ExecutionLogs'
import api from '../services/api'

export default function ExecutionDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [execution, setExecution] = useState(null)
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(false)
    const [actionError, setActionError] = useState('')
    const [actionSuccess, setActionSuccess] = useState('')

    useEffect(() => {
        fetchExecution()
    }, [id])

    const fetchExecution = async () => {
        setLoading(true)
        try {
            const r = await api.get(`/executions/${id}`)
            setExecution(r.data)
        } catch {
            setActionError('Execution not found')
        }
        setLoading(false)
    }

    const handleCancel = async () => {
        if (!confirm('Cancel this execution?')) return
        setActing(true)
        setActionError('')
        setActionSuccess('')
        try {
            const r = await api.post(`/executions/${id}/cancel`)
            setExecution(r.data)
            setActionSuccess('Execution cancelled successfully')
        } catch (e) {
            setActionError(e.response?.data?.detail || 'Error cancelling execution')
        }
        setActing(false)
    }

    const handleRetry = async () => {
        if (!confirm('Retry this execution?')) return
        setActing(true)
        setActionError('')
        setActionSuccess('')
        try {
            const r = await api.post(`/executions/${id}/retry`)
            setExecution(r.data)
            setActionSuccess('Execution retried successfully')
        } catch (e) {
            setActionError(e.response?.data?.detail || 'Error retrying execution')
        }
        setActing(false)
    }

    // Calculate duration
    const getDuration = () => {
        if (!execution?.started_at) return '—'
        const end = execution.ended_at ? new Date(execution.ended_at) : new Date()
        const start = new Date(execution.started_at)
        const diff = Math.floor((end - start) / 1000)
        if (diff < 60) return `${diff}s`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`
        return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
    }

    return (
        <AppLayout title="Execution Details">

            {/* Page header */}
            <div className="row align-items-center mb-4 g-2">
                <div className="col-12 col-sm">
                    <h1 className="page-title mb-1">Execution Details</h1>
                    <p className="page-subtitle mb-0 mono" style={{ fontSize: '.78rem' }}>
                        ID: {id}
                    </p>
                </div>
                <div className="col-12 col-sm-auto d-flex gap-2 flex-wrap">
                    {/* RETRY BUTTON — shows when status is failed */}
                    {execution?.status === 'failed' && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleRetry}
                            disabled={acting}
                        >
                            {acting
                                ? <><span className="spinner-border spinner-border-sm me-1" />Retrying…</>
                                : <><i className="bi bi-arrow-clockwise me-1" />Retry Execution</>
                            }
                        </button>
                    )}

                    {/* CANCEL BUTTON — shows when pending or in_progress */}
                    {['in_progress', 'pending'].includes(execution?.status) && (
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleCancel}
                            disabled={acting}
                        >
                            {acting
                                ? <><span className="spinner-border spinner-border-sm me-1" />Cancelling…</>
                                : <><i className="bi bi-x-circle me-1" />Cancel</>
                            }
                        </button>
                    )}

                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left me-1" />Back
                    </button>
                </div>
            </div>

            {/* Action messages */}
            {actionError && (
                <div className="alert-err mb-3">
                    <i className="bi bi-exclamation-circle" />{actionError}
                </div>
            )}
            {actionSuccess && (
                <div className="alert-ok mb-3">
                    <i className="bi bi-check-circle" />{actionSuccess}
                </div>
            )}

            {loading && (
                <div className="py-5 text-center">
                    <div className="wf-spinner" />
                </div>
            )}

            {!loading && execution && (
                <>
                    {/* Status banner */}
                    <div
                        className="card mb-4 no-hover"
                        style={{
                            background: execution.status === 'completed'
                                ? 'rgba(34,197,94,.06)'
                                : execution.status === 'failed'
                                    ? 'rgba(239,68,68,.06)'
                                    : execution.status === 'canceled'
                                        ? 'rgba(156,163,175,.08)'
                                        : 'rgba(59,130,246,.06)',
                            border: execution.status === 'completed'
                                ? '1.5px solid rgba(34,197,94,.2)'
                                : execution.status === 'failed'
                                    ? '1.5px solid rgba(239,68,68,.2)'
                                    : execution.status === 'canceled'
                                        ? '1.5px solid rgba(156,163,175,.2)'
                                        : '1.5px solid rgba(59,130,246,.2)',
                        }}
                    >
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="d-flex align-items-center gap-3">
                                    {/* Status icon */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: execution.status === 'completed'
                                            ? 'rgba(34,197,94,.12)'
                                            : execution.status === 'failed'
                                                ? 'rgba(239,68,68,.12)'
                                                : 'rgba(59,130,246,.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: execution.status === 'completed' ? '#16a34a'
                                            : execution.status === 'failed' ? '#b91c1c' : '#2563eb',
                                        flexShrink: 0,
                                    }}>
                                        <i className={`bi bi-${execution.status === 'completed' ? 'check-circle-fill'
                                                : execution.status === 'failed' ? 'x-circle-fill'
                                                    : execution.status === 'canceled' ? 'slash-circle-fill'
                                                        : 'hourglass-split'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="fw-bold" style={{ color: 'var(--accent-dark)', fontSize: '1rem' }}>
                                            Execution {execution.status.charAt(0).toUpperCase() + execution.status.slice(1).replace('_', ' ')}
                                        </div>
                                        <div className="small text-muted">
                                            Duration: {getDuration()}
                                        </div>
                                    </div>
                                </div>
                                <span className={`badge-status ${execution.status}`} style={{ fontSize: '.82rem', padding: '5px 14px' }}>
                                    {execution.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Info + Input Data row */}
                    <div className="row g-3 mb-4">

                        {/* Execution Info */}
                        <div className="col-12 col-lg-7">
                            <div className="card h-100 no-hover">
                                <div className="card-header">
                                    <h6 className="card-title">
                                        <i className="bi bi-info-circle text-accent" />
                                        Execution Info
                                    </h6>
                                </div>
                                <div className="card-body p-3">
                                    <div className="row g-3">
                                        {[
                                            { label: 'Execution ID', value: id.slice(0, 18) + '…', mono: true },
                                            { label: 'Workflow ID', value: execution.workflow_id.slice(0, 14) + '…', mono: true },
                                            { label: 'Version', value: `v${execution.workflow_version}` },
                                            { label: 'Triggered By', value: execution.triggered_by || '—' },
                                            // Only show retries if > 0
                                            ...(execution.retries > 0
                                                ? [{ label: 'Retries', value: execution.retries }]
                                                : []
                                            ),
                                            { label: 'Started At', value: new Date(execution.started_at).toLocaleString() },
                                            { label: 'Ended At', value: execution.ended_at ? new Date(execution.ended_at).toLocaleString() : '—' },
                                            { label: 'Duration', value: getDuration() },
                                        ].map(({ label, value, mono }) => (
                                            <div key={label} className="col-6 col-sm-4 col-lg-6 col-xl-4">
                                                <div className="info-label">{label}</div>
                                                <div className={`info-value${mono ? ' mono' : ''}`} style={{ fontSize: mono ? '.78rem' : '.875rem' }}>
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Data */}
                        <div className="col-12 col-lg-5">
                            <div className="card h-100 no-hover">
                                <div className="card-header">
                                    <h6 className="card-title">
                                        <i className="bi bi-database text-accent" />
                                        Input Data
                                    </h6>
                                </div>
                                <div className="card-body p-3">
                                    {execution.data && Object.keys(execution.data).length > 0 ? (
                                        <>
                                            {/* Pretty display */}
                                            <div className="d-flex flex-column gap-2 mb-3">
                                                {Object.entries(execution.data).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="d-flex justify-content-between align-items-center"
                                                        style={{
                                                            background: 'rgba(252,245,238,.6)',
                                                            border: '1px solid rgba(238,105,131,.1)',
                                                            borderRadius: 8, padding: '7px 12px',
                                                        }}
                                                    >
                                                        <span style={{
                                                            fontSize: '.78rem', fontWeight: 700,
                                                            color: 'var(--accent-dark)', textTransform: 'uppercase',
                                                            letterSpacing: '.5px'
                                                        }}>
                                                            {key}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '.875rem', fontWeight: 600,
                                                            color: 'var(--text-dark)',
                                                            background: 'rgba(238,105,131,.1)',
                                                            padding: '2px 10px', borderRadius: 20,
                                                        }}>
                                                            {String(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Raw JSON */}
                                            <pre className="data-pre mb-0">
                                                {JSON.stringify(execution.data, null, 2)}
                                            </pre>
                                        </>
                                    ) : (
                                        <div className="text-muted small text-center py-3">
                                            No input data
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Retry info banner — only when failed */}
                    {execution.status === 'failed' && (
                        <div className="alert-err mb-4">
                            <i className="bi bi-exclamation-triangle-fill" />
                            <div>
                                <div className="fw-bold">Execution Failed</div>
                                <div style={{ fontSize: '.82rem', marginTop: 2 }}>
                                    You can retry this execution using the <strong>Retry Execution</strong> button above.
                                    The engine will restart from the beginning with the same input data.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Execution Logs */}
                    <div className="card no-hover">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h6 className="card-title">
                                <i className="bi bi-journal-text text-accent" />
                                Step Execution Logs
                            </h6>
                            <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={fetchExecution}
                                title="Refresh"
                            >
                                <i className="bi bi-arrow-clockwise me-1" />Refresh
                            </button>
                        </div>
                        <div className="card-body p-0 p-md-3">
                            <ExecutionLogs executionId={id} />
                        </div>
                    </div>
                </>
            )}

        </AppLayout>
    )
}