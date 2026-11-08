import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  adminSecret: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!form.email.trim()) errors.email = 'Email is required.'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Please enter a valid email.'
  if (!form.password) errors.password = 'Password is required.'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'
  if (!form.adminSecret.trim()) errors.adminSecret = 'Admin secret key is required.'
  return errors
}

function RegisterAdmin() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/auth/register-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': form.adminSecret.trim(),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Admin registration failed.')
        return
      }

      setSuccess(`Admin account created for ${data.email}. You can now log in.`)
      setForm(EMPTY_FORM)
      setTimeout(() => navigate('/login'), 2500)
    } catch {
      setError('Cannot connect to the server. Please make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon brand-icon-admin">C</div>
            <h1>CampusCare</h1>
            <p className="auth-subtitle">Create a new administrator account.</p>
          </div>

          {error && (
            <div className="error-message">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <span>✅</span>
              <span>{success} Redirecting to login…</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Dr. Ramesh Kumar"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="admin@yourcollege.edu"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Admin Secret Key */}
            <div className="form-group">
              <label htmlFor="adminSecret">
                Admin Secret Key
              </label>
              <div className="password-wrap">
                <input
                  type={showSecret ? 'text' : 'password'}
                  id="adminSecret"
                  name="adminSecret"
                  placeholder="Enter the secret key provided by your institution"
                  value={form.adminSecret}
                  onChange={handleChange}
                  className={errors.adminSecret ? 'error' : ''}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowSecret((p) => !p)}
                  aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showSecret ? '🙈' : '👁'}
                </button>
              </div>
              {errors.adminSecret && <p className="field-error">{errors.adminSecret}</p>}
              <p className="field-hint">
                This key is set by your institution's system administrator in the server configuration.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-admin btn-block"
              disabled={loading}
            >
              {loading ? 'Creating account…' : '🛡️ Create Admin Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterAdmin
