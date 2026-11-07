import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitComplaint } from '../api'
import { useAuth } from '../context/useAuth'

const CATEGORIES = ['Hostel', 'Classroom', 'Electrical', 'Water', 'Cleaning', 'Internet', 'Other']

const EMPTY_FORM = {
  title: '',
  category: '',
  location: '',
  description: '',
}

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Complaint title is required.'
  if (!form.category) errors.category = 'Please select a category.'
  if (!form.location.trim()) errors.location = 'Campus location is required.'
  if (!form.description.trim()) errors.description = 'Please describe the complaint.'
  else if (form.description.trim().length < 10)
    errors.description = 'Description is too short (min 10 characters).'
  return errors
}

function SubmitComplaint() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [successId, setSuccessId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setServerError('')

    try {
      const saved = await submitComplaint(form)
      setSuccessId(saved.id)
      setForm(EMPTY_FORM)
      setErrors({})
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSuccessId(null)
    setServerError('')
  }

  return (
    <div className="page-container">
      <div className="submit-page">
        <h1>Submit a Complaint</h1>
        <p className="page-subtitle">
          Fill in the details below to report a campus issue. Your name and student ID are taken
          from your account automatically.
        </p>

        {/* Logged-in user info */}
        <div className="user-info-banner">
          <span className="user-info-icon">👤</span>
          <span>
            Submitting as <strong>{user?.name}</strong>
            {user?.studentId ? ` (${user.studentId})` : ''}
          </span>
        </div>

        {/* Success message */}
        {successId && (
          <div className="success-message">
            <span>✅</span>
            <span>
              Complaint <strong>{successId}</strong> submitted successfully! Status is set to{' '}
              <strong>Pending</strong>.{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate('/complaints')}
              >
                View my complaints →
              </button>
            </span>
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div className="error-message">
            <span>❌</span>
            <span>{serverError}</span>
          </div>
        )}

        <form className="complaint-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Complaint Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g. Broken fan in hostel room"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Complaint Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Campus Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Block B, Room 204"
              value={form.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
            />
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Complaint Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the problem in detail..."
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleReset}>
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitComplaint
