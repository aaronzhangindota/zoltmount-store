import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminStore } from '../../store/adminStore'

export const AdminRoute: React.FC = () => {
  const isLoggedIn = useAdminStore((s) => s.isLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
