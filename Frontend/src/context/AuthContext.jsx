import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { loginRequest } from '../api/auth.js'
import { readStoredAuth, writeStoredAuth } from '../utils/tokenStorage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)

  // NOTE: localStorage is written synchronously wherever auth changes (below),
  // not from a useEffect keyed on `auth`. Reason: login() calls setAuth(data)
  // and then navigate() in the same tick, which React 18 batches into one
  // commit that also mounts the newly-authorized route (e.g. Dashboard).
  // Effects fire children-before-parents, so a child's mount effect (its
  // first API call, reading the token from localStorage) would run BEFORE
  // this provider's effect had a chance to persist the token - sending that
  // first request with no Authorization header, getting a 401, and bouncing
  // straight back to /login. Writing synchronously removes that race.

  // Any api/client.js call that gets a 401 fires this event so we log out everywhere at once.
  useEffect(() => {
    const handleUnauthorized = () => {
      writeStoredAuth(null)
      setAuth(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await loginRequest({ username, password })
    writeStoredAuth(data)
    setAuth(data)
    return data
  }, [])

  const logout = useCallback(() => {
    writeStoredAuth(null)
    setAuth(null)
  }, [])

  const value = {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isAuthenticated: !!auth?.token,
    isAdmin: auth?.user?.role === 'Admin',
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>')
  return ctx
}
