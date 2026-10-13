// src/components/auth/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar roles permitidas
  if (allowedRoles.length > 0) {
    const userRole = user?.role || user?.user_metadata?.role
    if (!allowedRoles.includes(userRole)) {
      // Redirecionar para dashboard apropriado
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />
      } else if (userRole === 'company') {
        return <Navigate to="/empresa" replace />
      } else {
        return <Navigate to="/" replace />
      }
    }
  }

  return children
}