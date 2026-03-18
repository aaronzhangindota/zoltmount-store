import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataLoader } from './components/DataLoader'
import { ScrollToTop } from './components/ScrollToTop'
import { StoreLayout } from './components/Layout/StoreLayout'
import { AdminLayout } from './components/Admin/AdminLayout'
import { AdminRoute } from './components/Admin/AdminRoute'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { AccountPage } from './pages/account/AccountPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminPaymentPage } from './pages/admin/AdminPaymentPage'
import { AdminAccountsPage } from './pages/admin/AdminAccountsPage'
import { AdminLogsPage } from './pages/admin/AdminLogsPage'
import { AdminChangePasswordPage } from './pages/admin/AdminChangePasswordPage'
import { AdminShippingPage } from './pages/admin/AdminShippingPage'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <DataLoader>
        <Routes>
          {/* Store routes */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountPage />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route path="/haijieaaronzhang/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/haijieaaronzhang" element={<AdminDashboardPage />} />
              <Route path="/haijieaaronzhang/products" element={<AdminProductsPage />} />
              <Route path="/haijieaaronzhang/products/new" element={<AdminProductFormPage />} />
              <Route path="/haijieaaronzhang/products/edit/:id" element={<AdminProductFormPage />} />
              <Route path="/haijieaaronzhang/categories" element={<AdminCategoriesPage />} />
              <Route path="/haijieaaronzhang/orders" element={<AdminOrdersPage />} />
              <Route path="/haijieaaronzhang/payment" element={<AdminPaymentPage />} />
              <Route path="/haijieaaronzhang/shipping" element={<AdminShippingPage />} />
              <Route path="/haijieaaronzhang/accounts" element={<AdminAccountsPage />} />
              <Route path="/haijieaaronzhang/logs" element={<AdminLogsPage />} />
              <Route path="/haijieaaronzhang/change-password" element={<AdminChangePasswordPage />} />
            </Route>
          </Route>
        </Routes>
      </DataLoader>
    </BrowserRouter>
  )
}

export default App
