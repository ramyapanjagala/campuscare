import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

/**
 * ProtectedRoute — guards private pages.
 *
 * props:
 *   roles  — optional array of allowed roles (e.g. ['student']).
 *            If omitted, any authenticated user may pass.
 *   children — the page element to render when access is allowed.
 */
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-msg">Loading...</div>
  }

  // Not authenticated → send to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but wrong role → redirect to their own dashboard
  if (roles && !roles.includes(user.role)) {
    const dest = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
    return <Navigate to={dest} replace />
  }

  return children
}

export default ProtectedRoute
