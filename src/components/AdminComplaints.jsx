import { useState, useEffect, useCallback } from 'react'
import ComplaintManageModal from './ComplaintManageModal'
import { fetchComplaints } from '../api'

const badgeClass = {
  Pending: 'badge-pending',
  'In Progress': 'badge-inprogress',
  Resolved: 'badge-resolved',
}

const priorityBadge = {
  Low: 'badge-priority-low',
  Medium: 'badge-priority-medium',
  High: 'badge-priority-high',
}

/**
 * AdminComplaints — a self-contained panel that lets a Faculty/Admin view
 * every complaint, search/filter them, and open a management modal to review
 * and update a complaint (status, priority, department, staff, remarks,
 * resolution). Used on both the Admin Dashboard and the All Complaints page.
 */
function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [managingId, setManagingId] = useState(null)

  const loadComplaints = useCallback(() => {
    setLoading(true)
    setError('')
    fetchComplaints()
      .then(setComplaints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadComplaints()
  }, [loadComplaints])

  const filtered = complaints.filter((c) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      query === '' ||
      c.id.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query) ||
      c.studentName.toLowerCase().includes(query) ||
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.department && c.department.toLowerCase().includes(query)) ||
      (c.assignedTo && c.assignedTo.toLowerCase().includes(query))

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter
    const matchesPriority = priorityFilter === 'All' || (c.priority || 'Medium') === priorityFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const managingComplaint = managingId
    ? complaints.find((c) => c.id === managingId)
    : null

  const handleSaved = (updated) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    )
    setManagingId(null)
  }

  return (
    <>
      {/* Controls */}
      <div className="complaints-controls">
        <input
          type="text"
          className="search-box"
          placeholder="Search by ID, title, category, location, name, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Hostel">Hostel</option>
          <option value="Classroom">Classroom</option>
          <option value="Electrical">Electrical</option>
          <option value="Water">Water</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Internet">Internet</option>
          <option value="Other">Other</option>
        </select>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadComplaints}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Loading */}
      {loading && <div className="loading-msg">Loading complaints...</div>}

      {/* Error */}
      {error && (
        <div className="error-message">
          <span>❌</span> <span>{error}</span>
        </div>
      )}

      {/* Empty states */}
      {!loading && !error && complaints.length === 0 && (
        <div className="no-complaints">
          <p>No complaints have been submitted yet.</p>
        </div>
      )}

      {!loading && !error && complaints.length > 0 && filtered.length === 0 && (
        <div className="no-complaints">
          <p>No complaints match your search or filter.</p>
        </div>
      )}

      {/* Management table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="recent-table-wrap">
          <table className="recent-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Student</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    <span className="complaint-id">{c.id}</span>
                  </td>
                  <td className="cell-title">{c.title || '—'}</td>
                  <td>
                    {c.studentName}
                    {c.studentId && (
                      <span className="sub-text">
                        <br />
                        {c.studentId}
                      </span>
                    )}
                  </td>
                  <td>{c.category}</td>
                  <td>
                    <span className={`badge ${priorityBadge[c.priority || 'Medium']}`}>
                      {c.priority || 'Medium'}
                    </span>
                  </td>
                  <td>{c.department || '—'}</td>
                  <td>
                    <span className={`badge ${badgeClass[c.status] || 'badge-pending'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setManagingId(c.id)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && complaints.length > 0 && (
        <p className="table-hint">
          Showing {filtered.length} of {complaints.length} complaints.
        </p>
      )}

      {/* Management modal */}
      {managingComplaint && (
        <ComplaintManageModal
          complaint={managingComplaint}
          onClose={() => setManagingId(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}

export default AdminComplaints
