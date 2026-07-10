import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Wrap a <Route element> with this to restrict it to a specific role.
// Assumes RequireAuth has already confirmed the user is logged in.
export default function RequireRole({ role, children }) {
  const { user } = useAuth()

  if (user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
