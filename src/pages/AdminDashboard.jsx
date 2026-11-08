import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import AdminComplaints from '../components/AdminComplaints'
import { useAuth } from '../context/useAuth'
import { fetchStats, fetchNotifications, markAllNotificationsRead } from '../api'

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

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
  const [notifications, setNotifications] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [notifLoading, setNotifLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState('')

  const loadStats = () => {
    fetchStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setStatsLoading(false))
  }

  useEffect(() => {
    loadStats()

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

  const resolvedPct = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0

  const pendingPct = stats.total > 0
    ? Math.round((stats.pending / stats.total) * 100)
    : 0

  return (
    <div className="page-container">
      <div className="dashboard-page">

        {/* Header */}
        <div className="db-hero db-hero-admin">
          <div className="db-hero-left">
            <div className="db-avatar db-avatar-admin">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="db-role-label db-role-label-admin">🛡️ Administrator</p>
              <h1 className="db-welcome">Welcome, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
              <p className="db-meta">{user?.email}</p>
              <p className="db-meta db-meta-admin">Full system access — manage all complaints</p>
            </div>
          </div>
          <div className="db-hero-badges">
            {unreadCount > 0 && (
              <div className="db-notif-badge">
                🔔 {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
              </div>
            )}
            <div className="db-status-badge">
              <span className="db-status-dot" /> System Online
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> <span>{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="dashboard-stats">
          <h2>System-Wide Statistics</h2>
          <div className="stats-grid">
            <StatCard label="Total Complaints" value={statsLoading ? '…' : stats.total} type="total" />
            <StatCard label="Pending" value={statsLoading ? '…' : stats.pending} type="pending" />
            <StatCard label="In Progress" value={statsLoading ? '…' : stats.inProgress} type="inprogress" />
            <StatCard label="Resolved" value={statsLoading ? '…' : stats.resolved} type="resolved" />
          </div>
        </div>

        {/* Summary bars */}
        {stats.total > 0 && (
          <div className="db-summary-bars">
            <div className="db-summary-row">
              <span className="db-summary-label">Resolution rate</span>
              <div className="db-mini-bar">
                <div className="db-mini-fill db-mini-fill-green" style={{ width: `${resolvedPct}%` }} />
              </div>
              <span className="db-summary-pct">{resolvedPct}%</span>
            </div>
            <div className="db-summary-row">
              <span className="db-summary-label">Pending rate</span>
              <div className="db-mini-bar">
                <div className="db-mini-fill db-mini-fill-yellow" style={{ width: `${pendingPct}%` }} />
              </div>
              <span className="db-summary-pct">{pendingPct}%</span>
            </div>
          </div>
        )}

        {/* All complaints table */}
        <div className="recent-section admin-complaints-section">
          <div className="db-section-head">
            <div>
              <h2>All Complaints</h2>
              <p className="section-subtitle">
                Review, prioritize, and resolve every student complaint from one place.
              </p>
            </div>
          </div>
          <AdminComplaints onComplaintSaved={loadStats} />
        </div>

        {/* Notifications */}
        <div className="recent-section">
          <div className="db-section-head">
            <h2>
              Recent Notifications
              {unreadCount > 0 && (
                <span className="notif-count-pill">{unreadCount} unread</span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleMarkAllRead}
                disabled={marking}
              >
                {marking ? 'Marking…' : '✓ Mark all read'}
              </button>
            )}
          </div>

          <div className="notif-widget">
            <div className="notif-widget-list">
              {notifLoading && (
                <div className="notif-empty">Loading notifications…</div>
              )}

              {!notifLoading && notifications.length === 0 && (
                <div className="notif-empty">
                  <span className="notif-empty-icon">🔕</span>
                  No notifications yet.
                </div>
              )}

              {!notifLoading && notifications.length > 0 &&
                notifications.slice(0, 10).map((n) => (
                  <div key={n._id} className={`notif-item${n.read ? '' : ' unread'}`}>
                    <div className="notif-item-top">
                      <span className="notif-item-title">{n.title}</span>
                      {!n.read && <span className="notif-dot" />}
                    </div>
                    <p className="notif-item-msg">{n.message}</p>
                    <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard
