import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const EMPTY_FORM = {
  name: '',
  email: '',
  studentId: '',
  password: '',
  confirmPassword: '',
}

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!form.email.trim()) errors.email = 'Email is required.'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Please enter a valid email.'
  if (!form.password) errors.password = 'Password is required.'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.'
  if (form.confirmPassword !== form.password)
    errors.confirmPassword = 'Passwords do not match.'
  return errors
}

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        studentId: form.studentId.trim(),
      })
      // Auto-login → go to student dashboard
      navigate(data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', {
        replace: true,
      })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
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
            <p className="auth-subtitle">Create your student account to get started.</p>
          </div>

          {error && (
            <div className="error-message">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Ravi Kumar"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@college.edu"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="studentId">
                Student ID <span className="label-optional">(optional)</span>
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                placeholder="e.g. CSE2021045"
                value={form.studentId}
                onChange={handleChange}
              />
            </div>

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
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

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

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
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

export default Register
