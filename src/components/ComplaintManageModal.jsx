import { useState } from 'react'
import { manageComplaint } from '../api'

const STATUSES = ['Pending', 'In Progress', 'Resolved']
const PRIORITIES = ['Low', 'Medium', 'High']
const DEPARTMENTS = [
  '',
  'Maintenance',
  'Hostel Office',
  'Electrical',
  'Plumbing & Water',
  'Housekeeping',
  'IT Support',
  'Administration',
  'Security',
  'Other',
]

const priorityBadge = {
  Low: 'badge-priority-low',
  Medium: 'badge-priority-medium',
  High: 'badge-priority-high',
}

/**
 * ComplaintManageModal — lets a Faculty/Admin review a single complaint and
 * update its status, priority, assigned department/staff, remarks and
 * resolution details. Calls onSaved(updatedComplaint) on success.
 */
function ComplaintManageModal({ complaint, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: complaint.status || 'Pending',
    priority: complaint.priority || 'Medium',
    department: complaint.department || '',
    assignedTo: complaint.assignedTo || '',
    remarks: complaint.remarks || '',
    resolution: complaint.resolution || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await manageComplaint(complaint.id, form)
      onSaved(updated)
    } catch (err) {
      setError(err.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            Manage Complaint <span className="complaint-id">{complaint.id}</span>
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Read-only complaint details for review */}
          <div className="modal-info">
            <div className="modal-info-row">
              <span className="modal-info-label">Title</span>
              <span className="modal-info-value">{complaint.title || '—'}</span>
            </div>
            <div className="modal-info-row">
              <span className="modal-info-label">Student</span>
              <span className="modal-info-value">
                {complaint.studentName}
                {complaint.studentId ? ` (${complaint.studentId})` : ''}
              </span>
            </div>
            <div className="modal-info-row">
              <span className="modal-info-label">Category</span>
              <span className="modal-info-value">{complaint.category}</span>
            </div>
            <div className="modal-info-row">
              <span className="modal-info-label">Location</span>
              <span className="modal-info-value">{complaint.location}</span>
            </div>
            <div className="modal-info-row">
              <span className="modal-info-label">Submitted</span>
              <span className="modal-info-value">{complaint.date}</span>
            </div>
            <div className="modal-info-row modal-info-block">
              <span className="modal-info-label">Description</span>
              <span className="modal-info-value">{complaint.description}</span>
            </div>
          </div>

          {/* Editable management form */}
          <form className="modal-form" onSubmit={handleSave}>
            <h3 className="modal-form-title">Management</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="m-status">Status</label>
                <select id="m-status" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="m-priority">
                  Priority{' '}
                  <span className={`badge ${priorityBadge[form.priority]}`}>
                    {form.priority}
                  </span>
                </label>
                <select
                  id="m-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="m-department">Assign Department</label>
                <select
                  id="m-department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d === '' ? '— Not assigned —' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="m-assignedTo">Responsible Staff</label>
                <input
                  type="text"
                  id="m-assignedTo"
                  name="assignedTo"
                  placeholder="e.g. Mr. Sharma"
                  value={form.assignedTo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="m-remarks">Remarks</label>
              <textarea
                id="m-remarks"
                name="remarks"
                placeholder="Internal notes or instructions..."
                value={form.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="m-resolution">Resolution Details</label>
              <textarea
                id="m-resolution"
                name="resolution"
                placeholder="Describe how the issue was resolved..."
                value={form.resolution}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="error-message">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ComplaintManageModal
