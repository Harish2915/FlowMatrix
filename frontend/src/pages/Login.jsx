import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()

  const redirectMsg = location.state?.message || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div
      className="auth-page d-flex align-items-center justify-content-center min-vh-100 p-3"
    >
      <div className="w-100" style={{ maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div className="auth-card p-4 p-md-5">

          {/* Logo */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="auth-logo-icon">
              <i className="bi bi-diagram-3-fill" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                color: 'var(--accent-dark)',
                lineHeight: 1,
              }}>
                WorkFlow
              </div>
              <div style={{
                fontSize: '.62rem', color: 'var(--text-muted)',
                letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                Engine
              </div>
            </div>
          </div>

          {/* Redirect message */}
          {redirectMsg && (
            <div className="alert-ok mb-3">
              <i className="bi bi-check-circle-fill" />{redirectMsg}
            </div>
          )}

          <h1 className="auth-title mb-1">Welcome back</h1>
          <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
            Sign in to your workspace
          </p>

          {error && (
            <div className="alert-err mb-3">
              <i className="bi bi-exclamation-triangle-fill" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="field-wrap">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-100"
                />
                <i className="bi bi-envelope field-icon" />
              </div>
            </div>

            <div className="mb-4">
              <div className="field-wrap">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-100"
                />
                <i className="bi bi-lock field-icon" />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{
            fontSize: '.875rem', color: 'var(--text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" className="link-accent">Create one</Link>
          </p>

        </div>
      </div>
    </div>
  )
}