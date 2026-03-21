import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminStore } from '../../store/adminStore'

// Routes that require super_admin role
const superAdminPaths = [
  '/haijieaaronzhang/customers',
  '/haijieaaronzhang/payment',
  '/haijieaaronzhang/payment-gateways',
  '/haijieaaronzhang/shipping',
  '/haijieaaronzhang/accounts',
  '/haijieaaronzhang/logs',
]

export const AdminRoute: React.FC = () => {
  const isLoggedIn = useAdminStore((s) => s.isLoggedIn)
  const adminAccount = useAdminStore((s) => s.adminAccount)
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/haijieaaronzhang/login" replace />
  }

  const role = adminAccount?.role || 'staff'

  // Staff accessing super_admin-only pages → redirect to products
  if (role === 'staff') {
    // Dashboard is super_admin only
    if (location.pathname === '/haijieaaronzhang') {
      return <Navigate to="/haijieaaronzhang/products" replace />
    }
    // Check other super_admin paths
    if (superAdminPaths.some((p) => location.pathname.startsWith(p))) {
      return <Navigate to="/haijieaaronzhang/products" replace />
    }
  }

  return <Outlet />
}
