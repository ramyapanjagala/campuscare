import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  fetchUnreadCount,
  fetchNotifications,
  markAllNotificationsRead,
} from '../api'

// Turn an ISO date into a short relative label like "5 min ago"
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

function NotificationBell() {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)
  const ref = useRef(null)

  const loadCount = useCallback(async () => {
    try {
      const data = await fetchUnreadCount()
      setUnread(data.count)
    } catch {
      /* ignore — badge is best-effort */
    }
  }, [])

  // Fetch unread count on mount + poll every 30 seconds while logged in
  useEffect(() => {
    if (!user) return
    loadCount()
    const id = setInterval(loadCount, 30000)
    return () => clearInterval(id)
  }, [user, loadCount])

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleOpen = async () => {
    const willOpen = !open
    setOpen(willOpen)
    if (willOpen) {
      setLoading(true)
      try {
        const data = await fetchNotifications()
        setNotifications(data)
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMarkAllRead = async () => {
    setMarking(true)
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnread(0)
    } catch {
      /* ignore */
    } finally {
      setMarking(false)
    }
  }

  if (!user) return null

  return (
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="notif-btn"
        onClick={toggleOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <span className="notif-icon" aria-hidden="true">
          🔔
        </span>
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            {unread > 0 && (
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

          <div className="notif-list">
            {loading ? (
              <div className="notif-empty">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon">🔕</span>
                You&apos;re all caught up — no notifications.
              </div>
            ) : (
              notifications.map((n) => (
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

          <div className="notif-panel-footer">
            <Link to="/complaints" onClick={() => setOpen(false)}>
              View {user.role === 'admin' ? 'all' : 'my'} complaints →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
