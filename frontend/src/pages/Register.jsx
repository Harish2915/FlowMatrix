import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/register', { name, email, password })
      login(res.data.access_token, res.data.user)
      navigate('/')
    } catch (e) { setError(e.response?.data?.detail || 'Registration failed.') }
    setLoading(false)
  }

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="w-100" style={{ maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <div className="auth-card p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div class="init-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M2 17l10 5 10-5" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent-dark)', lineHeight: 1 }}>Flow Matrix</div>
              {/* <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Engine</div> */}
            </div>
          </div>

          <h1 className="auth-title mb-1">Create account</h1>
          <p className="mb-4" style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>Start automating your workflows today</p>

          {error && (
            <div className="alert-err mb-3">
              <i className="bi bi-exclamation-triangle-fill" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="field-wrap">
                <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="w-100" />
                <i className="bi bi-person field-icon" />
              </div>
            </div>
            <div className="mb-3">
              <div className="field-wrap">
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="w-100" />
                <i className="bi bi-envelope field-icon" />
              </div>
            </div>
            <div className="mb-4">
              <div className="field-wrap">
                <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className="w-100" />
                <i className="bi bi-lock field-icon" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Creating account…</>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{ fontSize: '.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="link-accent">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}