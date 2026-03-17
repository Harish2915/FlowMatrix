import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  const location = useLocation()

  // While checking auth show nothing — instant since localStorage is sync
  if (loading) return null

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}