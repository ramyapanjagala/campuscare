import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('student') // 'student' | 'admin'
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setError('')
    setForm({ email: '', password: '' })
    setShowForgot(false)
  }

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

      // Role mismatch check — warn if they used the wrong tab
      if (activeTab === 'admin' && data.role !== 'admin') {
        setError('This account does not have admin access. Please use the Student login tab.')
        setLoading(false)
        return
      }
      if (activeTab === 'student' && data.role === 'admin') {
        setError('Admin accounts must use the Admin login tab.')
        setLoading(false)
        return
      }

      navigate(data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', {
        replace: true,
      })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = activeTab === 'admin'

  return (
    <div className="page-container">
      <div className="auth-page">
        <div className="auth-card login-card">

          {/* Brand */}
          <div className="auth-brand">
            <div className={`brand-icon${isAdmin ? ' brand-icon-admin' : ''}`}>C</div>
            <h1>CampusCare</h1>
            <p className="auth-subtitle">
              {isAdmin ? 'Admin portal — restricted access.' : 'Welcome back! Sign in to continue.'}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="login-tabs" role="tablist" aria-label="Login type">
            <button
              role="tab"
              aria-selected={!isAdmin}
              className={`login-tab${!isAdmin ? ' login-tab-active' : ''}`}
              onClick={() => handleTabChange('student')}
              type="button"
            >
              <span className="login-tab-icon">🎓</span>
              Student Login
            </button>
            <button
              role="tab"
              aria-selected={isAdmin}
              className={`login-tab${isAdmin ? ' login-tab-active login-tab-admin' : ''}`}
              onClick={() => handleTabChange('admin')}
              type="button"
            >
              <span className="login-tab-icon">🛡️</span>
              Admin Login
            </button>
          </div>

          {/* Role description */}
          <div className={`role-hint${isAdmin ? ' role-hint-admin' : ' role-hint-student'}`}>
            {isAdmin ? (
              <>
                <strong>Admin Access:</strong> Sign in with your admin email and password.
              </>
            ) : (
              <>
                <strong>Student Access:</strong> Sign in with the email you registered with.
              </>
            )}
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
                placeholder={isAdmin ? 'admin@college.edu' : 'you@college.edu'}
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

            <button
              type="submit"
              className={`btn btn-block${isAdmin ? ' btn-admin' : ' btn-primary'}`}
              disabled={loading}
            >
              {loading
                ? 'Signing in...'
                : isAdmin
                ? '🛡️ Sign In as Admin'
                : '🎓 Sign In as Student'}
            </button>
          </form>

          {!isAdmin && (
            <p className="auth-switch">
              New student?{' '}
              <Link to="/register" className="auth-link">
                Create an account
              </Link>
            </p>
          )}

          {isAdmin && (
            <p className="auth-switch">
              Don't have an admin account?{' '}
              <Link to="/register-admin" className="auth-link">
                Create Admin Account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
