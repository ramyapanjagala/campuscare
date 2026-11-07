/**
 * AuthContext — exports ONLY AuthProvider (one React component per file so
 * Vite Fast Refresh never invalidates this module).
 * The useAuth hook lives in ./useAuth.js
 */
import { createContext, useState, useEffect } from 'react'
import { loginAPI, registerAPI, getMeAPI, setToken, clearToken, getToken } from '../api'

// Named export so useAuth.js can import it
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: if a token exists, validate it and restore the user session.
  // This keeps authenticated users logged in across browser refreshes.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    getMeAPI()
      .then((data) => {
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          studentId: data.studentId,
        })
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await loginAPI(email, password)
    setToken(data.token)
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      studentId: data.studentId,
    })
    return data
  }

  const register = async (formData) => {
    const data = await registerAPI(formData)
    setToken(data.token)
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      studentId: data.studentId,
    })
    return data
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
