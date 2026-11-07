import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'
import { fetchComplaints, fetchStats } from '../api'

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

function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchStats(), fetchComplaints()])
      .then(([statsData, complaintsData]) => {
        setStats(statsData)
        setComplaints(complaintsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Student Dashboard</h1>
            <p className="page-subtitle">
              Welcome back, <strong>{user?.name}</strong>! Here is your complaint overview.
            </p>
          </div>
          <Link to="/submit" className="btn btn-primary">
            + Submit New Complaint
          </Link>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats">
          <h2>My Complaint Statistics</h2>
          <div className="stats-grid">
            <StatCard label="Total Complaints" value={stats.total} type="total" />
            <StatCard label="Pending" value={stats.pending} type="pending" />
            <StatCard label="In Progress" value={stats.inProgress} type="inprogress" />
            <StatCard label="Resolved" value={stats.resolved} type="resolved" />
          </div>
        </div>

        {/* My Complaints */}
        <div className="recent-section">
          <h2>My Complaints</h2>

          {loading && <div className="loading-msg">Loading your complaints...</div>}

          {!loading && !error && complaints.length === 0 && (
            <div className="no-complaints">
              <p>You have not submitted any complaints yet.</p>
              <Link to="/submit" className="btn btn-primary btn-sm">
                Submit Your First Complaint
              </Link>
            </div>
          )}

          {!loading && !error && complaints.length > 0 && (
            <div className="recent-table-wrap">
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span className="complaint-id">{c.id}</span>
                      </td>
                      <td className="cell-title">{c.title || '—'}</td>
                      <td>{c.category}</td>
                      <td>{c.location}</td>
                      <td>{c.date}</td>
                      <td>
                        <span className={`badge ${priorityBadge[c.priority || 'Medium']}`}>
                          {c.priority || 'Medium'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass[c.status] || 'badge-pending'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {complaints.length > 0 && (
            <p className="table-hint">
              Showing all {complaints.length} of your complaints.{' '}
              <Link to="/complaints" className="inline-link">
                View detailed list →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
