// src/components/LayoutWrapper.jsx

import MainLayout from './layout/MainLayout'
import AdminLayout from './layout/AdminLayout' // Se você tiver
import { useAuth } from '../context/AuthContext'

export default function LayoutWrapper({ children }) {
  const { user } = useAuth()
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  
  // Usar layout admin para rotas admin
  if (isAdminRoute && user?.role === 'admin') {
    return <AdminLayout>{children}</AdminLayout>
  }
  
  // Usar MainLayout para todas as outras rotas
  return <MainLayout>{children}</MainLayout>
}