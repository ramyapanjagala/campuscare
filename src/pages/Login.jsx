import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const data = await login(form.email.trim(), form.password)
      // Redirect based on role
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', {
        replace: true,
      })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon">C</div>
            <h1>CampusCare</h1>
            <p className="auth-subtitle">Welcome back! Please sign in to continue.</p>
          </div>

          {error && (
            <div className="error-message">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@college.edu"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowForgot((prev) => !prev)}
              >
                Forgot password?
              </button>
            </div>

            {showForgot && (
              <div className="info-message">
                <span>ℹ️</span>
                <span>
                  Please contact the campus administrator to reset your password. Password resets
                  are handled securely by the admin team.
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            New student?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
