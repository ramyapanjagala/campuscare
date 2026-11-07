import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import NotificationBell from './NotificationBell'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  // Build the nav links based on auth state + role
  let links = []

  if (!user) {
    // Before login
    links = [
      { to: '/', label: 'Home', end: true },
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' },
      { to: '/about', label: 'About' },
    ]
  } else if (user.role === 'student') {
    // Student
    links = [
      { to: '/student/dashboard', label: 'Student Dashboard' },
      { to: '/submit', label: 'Submit Complaint' },
      { to: '/complaints', label: 'My Complaints' },
      { to: '/about', label: 'About' },
    ]
  } else {
    // Admin
    links = [
      { to: '/admin/dashboard', label: 'Admin Dashboard' },
      { to: '/complaints', label: 'All Complaints' },
      { to: '/about', label: 'About' },
    ]
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">C</div>
          CampusCare
        </NavLink>

        {/* Hamburger button for mobile */}
        <div className="navbar-actions">
          {/* Notification bell — shown only when logged in */}
          {user && <NotificationBell />}

          <button
            className="navbar-toggle"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {user && (
            <li>
              <button className="navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
