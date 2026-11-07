import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { fetchPublicStats } from '../api'
import { useAuth } from '../context/useAuth'

function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })

  useEffect(() => {
    fetchPublicStats().then(setStats).catch(() => {})
  }, [])

  // Hero buttons adapt to the user's auth state
  let heroButtons
  if (!user) {
    heroButtons = (
      <div className="hero-buttons">
        <Link to="/register" className="btn btn-primary">
          Get Started
        </Link>
        <Link to="/login" className="btn btn-outline">
          Sign In
        </Link>
      </div>
    )
  } else if (user.role === 'student') {
    heroButtons = (
      <div className="hero-buttons">
        <Link to="/submit" className="btn btn-primary">
          Report a Complaint
        </Link>
        <Link to="/student/dashboard" className="btn btn-outline">
          My Dashboard
        </Link>
      </div>
    )
  } else {
    heroButtons = (
      <div className="hero-buttons">
        <Link to="/admin/dashboard" className="btn btn-primary">
          Admin Dashboard
        </Link>
        <Link to="/complaints" className="btn btn-outline">
          All Complaints
        </Link>
      </div>
    )
  }

  const features = [
    {
      icon: '📋',
      title: 'Easy Complaint Submission',
      desc: 'Fill a simple form to report any campus issue in under a minute.',
    },
    {
      icon: '🔍',
      title: 'Complaint Tracking',
      desc: 'View all submitted complaints with their current status anytime.',
    },
    {
      icon: '🔔',
      title: 'Quick Status Updates',
      desc: 'Each complaint clearly shows whether it is Pending, In Progress, or Resolved.',
    },
    {
      icon: '🏫',
      title: 'Better Campus Management',
      desc: 'Helps authorities identify recurring issues and address them faster.',
    },
  ]

  return (
    <div className="page-container">
      {/* Hero */}
      <section className="home-hero">
        <h1>CampusCare</h1>
        <p className="subtitle">Smart Campus Complaint System</p>
        <p className="description">
          CampusCare helps students report campus-related problems and track their complaint status
          easily. Log in to submit complaints and monitor their progress in real time.
        </p>
        {heroButtons}
      </section>

      {/* Feature Cards */}
      <section className="features-section">
        <h2>What CampusCare Offers</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <h2>Complaint Overview</h2>
        <div className="stats-grid">
          <StatCard label="Total Complaints" value={stats.total} type="total" />
          <StatCard label="Pending" value={stats.pending} type="pending" />
          <StatCard label="In Progress" value={stats.inProgress} type="inprogress" />
          <StatCard label="Resolved" value={stats.resolved} type="resolved" />
        </div>
      </section>
    </div>
  )
}

export default Home
