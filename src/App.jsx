import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import SubmitComplaint from './pages/SubmitComplaint'
import Complaints from './pages/Complaints'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterAdmin from './pages/RegisterAdmin'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

// Redirect the old /dashboard route to the role-appropriate dashboard
function DashboardRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-msg">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
}

function AppRoutes() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-admin" element={<RegisterAdmin />} />
            <Route path="/about" element={<About />} />

            {/* Student-only routes */}
            <Route
              path="/submit"
              element={
                <ProtectedRoute roles={['student']}>
                  <SubmitComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute roles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared protected route (students see own, admins see all) */}
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <Complaints />
                </ProtectedRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Backward-compatible redirect for the old dashboard */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
