// Displays a single complaint as a card (student read-only view)
function ComplaintCard({ complaint }) {
  const {
    id,
    title,
    studentName,
    studentId,
    category,
    location,
    description,
    date,
    status,
    priority,
    department,
    assignedTo,
    remarks,
    resolution,
  } = complaint

  // Map status string to badge CSS class
  const badgeClass = {
    Pending: 'badge-pending',
    'In Progress': 'badge-inprogress',
    Resolved: 'badge-resolved',
  }[status] || 'badge-pending'

  const priorityBadge = {
    Low: 'badge-priority-low',
    Medium: 'badge-priority-medium',
    High: 'badge-priority-high',
  }[priority || 'Medium']

  return (
    <div className="complaint-card">
      <div className="complaint-card-header">
        <span className="complaint-id">{id}</span>
        <div className="complaint-card-badges">
          {priority && (
            <span className={`badge ${priorityBadge}`}>{priority}</span>
          )}
          <span className={`badge ${badgeClass}`}>{status}</span>
        </div>
      </div>

      {title && <div className="complaint-title">{title}</div>}

      <div className="complaint-card-body">
        <div className="complaint-field">
          Student: <span>{studentName}</span>
        </div>
        {studentId && (
          <div className="complaint-field">
            ID: <span>{studentId}</span>
          </div>
        )}
        <div className="complaint-field">
          Category: <span>{category}</span>
        </div>
        <div className="complaint-field">
          Location: <span>{location}</span>
        </div>
        {department && (
          <div className="complaint-field">
            Department: <span>{department}</span>
          </div>
        )}
        {assignedTo && (
          <div className="complaint-field">
            Assigned to: <span>{assignedTo}</span>
          </div>
        )}
      </div>

      <div className="complaint-description">{description}</div>

      {/* Management progress shown to the student */}
      {resolution && (
        <div className="complaint-progress">
          <span className="complaint-progress-label">Resolution</span>
          <p>{resolution}</p>
        </div>
      )}
      {remarks && (
        <div className="complaint-progress">
          <span className="complaint-progress-label">Remarks</span>
          <p>{remarks}</p>
        </div>
      )}

      <div className="complaint-card-footer">
        <span className="complaint-date">Submitted: {date}</span>
      </div>
    </div>
  )
}

export default ComplaintCard
