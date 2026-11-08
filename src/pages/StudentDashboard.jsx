import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/useAuth'
import { fetchComplaints, fetchStats } from '../api'

const statusBadge = {
  Pending: 'badge-pending',
  'In Progress': 'badge-inprogress',
  Resolved: 'badge-resolved',
}

const priorityBadge = {
  Low: 'badge-priority-low',
  Medium: 'badge-priority-medium',
  High: 'badge-priority-high',
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    Promise.all([fetchStats(), fetchComplaints()])
      .then(([statsData, complaintsData]) => {
        setStats(statsData)
        setComplaints(complaintsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All'
    ? complaints
    : complaints.filter((c) => c.status === filter)

  const resolvedPct = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0

  return (
    <div className="page-container">
      <div className="dashboard-page">

        {/* Header */}
        <div className="db-hero db-hero-student">
          <div className="db-hero-left">
            <div className="db-avatar db-avatar-student">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="db-role-label">Student Portal</p>
              <h1 className="db-welcome">Welcome, {user?.name?.split(' ')[0] || 'Student'}!</h1>
              {user?.studentId && (
                <p className="db-meta">Student ID: <strong>{user.studentId}</strong></p>
              )}
              <p className="db-meta">{user?.email}</p>
            </div>
          </div>
          <Link to="/submit" className="btn btn-primary db-cta-btn">
            + Submit Complaint
          </Link>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats">
          <h2>My Complaint Overview</h2>
          <div className="stats-grid">
            <StatCard label="Total Submitted" value={loading ? '…' : stats.total} type="total" />
            <StatCard label="Pending" value={loading ? '…' : stats.pending} type="pending" />
            <StatCard label="In Progress" value={loading ? '…' : stats.inProgress} type="inprogress" />
            <StatCard label="Resolved" value={loading ? '…' : stats.resolved} type="resolved" />
          </div>
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="db-progress-section">
            <div className="db-progress-header">
              <span>Resolution Progress</span>
              <span className="db-progress-pct">{resolvedPct}% resolved</span>
            </div>
            <div className="db-progress-bar">
              <div
                className="db-progress-fill"
                style={{ width: `${resolvedPct}%` }}
                role="progressbar"
                aria-valuenow={resolvedPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Complaint list */}
        <div className="recent-section">
          <div className="db-section-head">
            <h2>My Complaints</h2>
            <div className="db-filter-tabs">
              {['All', 'Pending', 'In Progress', 'Resolved'].map((f) => (
                <button
                  key={f}
                  className={`db-filter-btn${filter === f ? ' db-filter-btn-active' : ''}`}
                  onClick={() => setFilter(f)}
                  type="button"
                >
                  {f}
                  {f === 'All' && !loading && (
                    <span className="db-filter-count">{complaints.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="db-loading">
              <div className="db-spinner" />
              <p>Loading your complaints…</p>
            </div>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">📋</div>
              <h3>No complaints yet</h3>
              <p>You haven't submitted any complaints. Got an issue on campus? Let us know.</p>
              <Link to="/submit" className="btn btn-primary btn-sm">
                Submit Your First Complaint
              </Link>
            </div>
          )}

          {!loading && !error && complaints.length > 0 && filtered.length === 0 && (
            <div className="db-empty">
              <div className="db-empty-icon">🔍</div>
              <h3>No {filter.toLowerCase()} complaints</h3>
              <p>You have no complaints with this status right now.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="db-complaint-cards">
              {filtered.map((c) => (
                <div key={c._id} className="db-complaint-item">
                  <div className="db-ci-left">
                    <div className="db-ci-meta">
                      <span className="complaint-id">#{c._id?.slice(-6).toUpperCase()}</span>
                      <span className={`badge ${statusBadge[c.status] || 'badge-pending'}`}>
                        {c.status}
                      </span>
                      {c.priority && (
                        <span className={`badge ${priorityBadge[c.priority] || 'badge-priority-medium'}`}>
                          {c.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="db-ci-title">{c.title}</h3>
                    <p className="db-ci-desc">{c.description?.slice(0, 120)}{c.description?.length > 120 ? '…' : ''}</p>
                    {(c.remarks || c.resolution) && (
                      <div className="db-ci-response">
                        <span className="db-ci-response-label">Admin Response</span>
                        <p>{c.resolution || c.remarks}</p>
                      </div>
                    )}
                  </div>
                  <div className="db-ci-right">
                    <span className="db-ci-category">{c.category}</span>
                    <span className="db-ci-time">{timeAgo(c.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="db-quick-links">
          <h2>Quick Actions</h2>
          <div className="db-quick-grid">
            <Link to="/submit" className="db-quick-card">
              <div className="db-quick-icon">📝</div>
              <div>
                <h3>Submit Complaint</h3>
                <p>Report a new campus issue</p>
              </div>
            </Link>
            <Link to="/complaints" className="db-quick-card">
              <div className="db-quick-icon">📂</div>
              <div>
                <h3>All My Complaints</h3>
                <p>Full list with filters and search</p>
              </div>
            </Link>
            <Link to="/about" className="db-quick-card">
              <div className="db-quick-icon">ℹ️</div>
              <div>
                <h3>About CampusCare</h3>
                <p>How the system works</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default StudentDashboard
