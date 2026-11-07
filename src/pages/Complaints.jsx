import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ComplaintCard from '../components/ComplaintCard'
import AdminComplaints from '../components/AdminComplaints'
import { useAuth } from '../context/useAuth'
import { fetchComplaints } from '../api'

function Complaints() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Student view state (admin view is handled by <AdminComplaints />)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    // Admins use the self-contained AdminComplaints panel which fetches its own data
    if (isAdmin) return
    setLoading(true)
    fetchComplaints()
      .then(setComplaints)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAdmin])

  // Admin view: full management panel
  if (isAdmin) {
    return (
      <div className="page-container">
        <div className="complaints-page">
          <h1>All Complaints</h1>
          <p className="page-subtitle">
            Browse, search, filter and update the status of every complaint.
          </p>
          <AdminComplaints />
        </div>
      </div>
    )
  }

  // Student view: read-only list of their own complaints
  const filtered = complaints.filter((c) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      query === '' ||
      c.id.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query) ||
      (c.title && c.title.toLowerCase().includes(query))

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="page-container">
      <div className="complaints-page">
        <h1>My Complaints</h1>
        <p className="page-subtitle">Browse, search and filter your submitted complaints.</p>

        {/* Controls */}
        <div className="complaints-controls">
          <input
            type="text"
            className="search-box"
            placeholder="Search by ID, title, category or location..."
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
            <p>You have not submitted any complaints yet.</p>
            <Link to="/submit" className="btn btn-primary btn-sm">
              Submit Your First Complaint
            </Link>
          </div>
        )}

        {!loading && !error && complaints.length > 0 && filtered.length === 0 && (
          <div className="no-complaints">
            <p>No complaints match your search or filter.</p>
          </div>
        )}

        {/* Read-only card view */}
        {!loading && !error && filtered.length > 0 && (
          <div className="complaints-list">
            {filtered.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Complaints
