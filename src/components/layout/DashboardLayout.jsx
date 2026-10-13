// src/components/layout/DashboardLayout.jsx

import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardSidebar from '../dashboard/DashboardSidebar'
import DashboardHeader from '../dashboard/DashboardHeader'

export default function DashboardLayout() {
  const { user } = useAuth()
  const userRole = user?.role || user?.user_metadata?.role || 'user'

  // Determinar o tipo de dashboard
  let dashboardType = 'user'
  if (userRole === 'admin') dashboardType = 'admin'
  else if (userRole === 'company') dashboardType = 'company'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar type={dashboardType} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader type={dashboardType} />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}