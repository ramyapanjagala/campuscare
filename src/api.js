// Central API helper — all backend calls go through here

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Token key used in localStorage
const TOKEN_KEY = 'campuscare_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Cannot connect to the server. Please make sure the backend is running.')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // If the token is expired or invalid, clear it so the user is logged out
    if (res.status === 401) {
      clearToken()
    }
    throw new Error(data.message || 'Request failed')
  }
  return data
}

// ===== Auth =====
export function registerAPI(formData) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData),
  })
}

export function loginAPI(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMeAPI() {
  return request('/auth/me')
}

// ===== Complaints =====
// Public stats for the home page (no auth needed)
export function fetchPublicStats() {
  return request('/complaints/public-stats')
}

// Role-based stats (students get their own, admins get all)
export function fetchStats() {
  return request('/complaints/stats')
}

// Role-based list (students get their own, admins get all)
export function fetchComplaints() {
  return request('/complaints')
}

// Submit a new complaint (students only)
export function submitComplaint(formData) {
  return request('/complaints', {
    method: 'POST',
    body: JSON.stringify(formData),
  })
}

// Update complaint status (admins only)
export function updateComplaintStatus(id, status) {
  return request(`/complaints/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// Manage a complaint (admins only) — status, priority, department,
// assignedTo, remarks, resolution. Only sent fields are updated.
export function manageComplaint(id, data) {
  return request(`/complaints/${id}/manage`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ===== Notifications =====
export function fetchUnreadCount() {
  return request('/notifications/unread-count')
}

export function fetchNotifications() {
  return request('/notifications')
}

export function markAllNotificationsRead() {
  return request('/notifications/read-all', { method: 'PATCH' })
}
