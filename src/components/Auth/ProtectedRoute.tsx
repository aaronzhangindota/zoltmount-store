import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUserStore } from '../../store/userStore'

export const ProtectedRoute: React.FC = () => {
  const currentUser = useUserStore((s) => s.currentUser)
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
