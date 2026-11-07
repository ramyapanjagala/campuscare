import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import AdminComplaints from '../components/AdminComplaints'
import { useAuth } from '../context/useAuth'
import { fetchStats, fetchNotifications, markAllNotificationsRead } from '../api'

// Short relative-time label for notifications
function timeAgo(dateString) {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
  const [notifications, setNotifications] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [notifLoading, setNotifLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setStatsLoading(false))

    // Notifications load independently so they never block the dashboard
    fetchNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setNotifLoading(false))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = async () => {
    setMarking(true)
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* ignore */
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="page-container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="page-subtitle">
              Welcome, <strong>{user?.name}</strong>. Review and resolve student complaints below.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats">
          <h2>Overall Complaint Statistics</h2>
          <div className="stats-grid">
            <StatCard label="Total Complaints" value={statsLoading ? '…' : stats.total} type="total" />
            <StatCard label="Pending" value={statsLoading ? '…' : stats.pending} type="pending" />
            <StatCard label="In Progress" value={statsLoading ? '…' : stats.inProgress} type="inprogress" />
            <StatCard label="Resolved" value={statsLoading ? '…' : stats.resolved} type="resolved" />
          </div>
        </div>

        {/* All complaints — full inline management */}
        <div className="recent-section admin-complaints-section">
          <h2>All Complaints</h2>
          <p className="section-subtitle">
            View every complaint and update its status to resolve student issues.
          </p>
          <AdminComplaints />
        </div>

        {/* Recent notifications */}
        <div className="recent-section">
          <h2>Recent Notifications</h2>
          <div className="notif-widget">
            <div className="notif-widget-head">
              <span className="notif-panel-title">
                Notifications{unreadCount > 0 && (
                  <span className="notif-count-pill">{unreadCount} unread</span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={handleMarkAllRead}
                  disabled={marking}
                >
                  {marking ? 'Marking...' : 'Mark all read'}
                </button>
              )}
            </div>

            <div className="notif-widget-list">
              {notifLoading && <div className="notif-empty">Loading notifications...</div>}

              {!notifLoading && notifications.length === 0 && (
                <div className="notif-empty">
                  <span className="notif-empty-icon">🔕</span>
                  No notifications yet.
                </div>
              )}

              {!notifLoading && notifications.length > 0 && (
                notifications.slice(0, 8).map((n) => (
                  <div key={n._id} className={`notif-item${n.read ? '' : ' unread'}`}>
                    <div className="notif-item-top">
                      <span className="notif-item-title">{n.title}</span>
                      {!n.read && <span className="notif-dot" />}
                    </div>
                    <p className="notif-item-msg">{n.message}</p>
                    <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
