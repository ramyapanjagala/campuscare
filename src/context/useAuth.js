/**
 * useAuth — kept in its own file so Vite Fast Refresh never needs to
 * invalidate the AuthProvider when any consumer file changes.
 */
import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
