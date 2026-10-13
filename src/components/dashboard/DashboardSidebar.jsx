// src/components/dashboard/DashboardSidebar.jsx

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Calendar,
  Star,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  DollarSign,
  CreditCard,
  Wallet,
  BarChart3,
  UserCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function DashboardSidebar({ type = 'user' }) {
  const { user, signOut } = useAuth()
  const { isEn } = useLanguage()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})

  const toggleExpand = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Menu do Usuário
  const userMenu = [
    {
      name: isEn ? 'Dashboard' : 'Dashboard',
      icon: LayoutDashboard,
      href: '/usuario/perfil'
    },
    {
      name: isEn ? 'My Bookings' : 'Minhas Reservas',
      icon: Calendar,
      href: '/usuario/reservas'
    },
    {
      name: isEn ? 'Profile' : 'Perfil',
      icon: UserCircle,
      href: '/usuario/perfil'
    },
    {
      name: isEn ? 'Settings' : 'Configurações',
      icon: Settings,
      href: '/usuario/configuracoes'
    }
  ]

  // Menu da Empresa
  const companyMenu = [
    {
      name: isEn ? 'Dashboard' : 'Dashboard',
      icon: LayoutDashboard,
      href: '/empresa/dashboard'
    },
    {
      name: isEn ? 'Services' : 'Serviços',
      icon: Package,
      href: '/empresa/servicos'
    },
    {
      name: isEn ? 'Bookings' : 'Reservas',
      icon: Calendar,
      href: '/empresa/reservas'
    },
    {
      name: isEn ? 'Reviews' : 'Avaliações',
      icon: Star,
      href: '/empresa/avaliacoes'
    },
    {
      name: isEn ? 'Transactions' : 'Transações',
      icon: DollarSign,
      href: '/empresa/transacoes'
    },
    {
      name: isEn ? 'Withdrawals' : 'Saques',
      icon: Wallet,
      href: '/empresa/saques'
    },
    {
      name: isEn ? 'Settings' : 'Configurações',
      icon: Settings,
      href: '/empresa/configuracoes'
    }
  ]

  // Menu do Admin
  const adminMenu = [
    {
      name: isEn ? 'Dashboard' : 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard'
    },
    {
      name: isEn ? 'Companies' : 'Empresas',
      icon: Building2,
      href: '/admin/empresas'
    },
    {
      name: isEn ? 'Services' : 'Serviços',
      icon: Package,
      href: '/admin/servicos'
    },
    {
      name: isEn ? 'Bookings' : 'Reservas',
      icon: Calendar,
      href: '/admin/reservas'
    },
    {
      name: isEn ? 'Users' : 'Usuários',
      icon: Users,
      href: '/admin/usuarios'
    },
    {
      name: isEn ? 'Transactions' : 'Transações',
      icon: DollarSign,
      href: '/admin/transacoes'
    },
    {
      name: isEn ? 'Withdrawals' : 'Saques',
      icon: Wallet,
      href: '/admin/saques'
    }
  ]

  const getMenu = () => {
    switch(type) {
      case 'admin':
        return adminMenu
      case 'company':
        return companyMenu
      default:
        return userMenu
    }
  }

  const menuItems = getMenu()

  return (
    <aside 
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <Link to="/" className="text-xl font-bold text-primary-500">
            Radar RAVTUR
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-500 font-semibold">
                {user?.name?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            location.pathname.startsWith(item.href + '/')
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.name : ''}
                >
                  <item.icon size={20} className={isActive ? 'text-primary-500' : ''} />
                  {!collapsed && <span className="text-sm">{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => signOut()}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg 
            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition
            ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? (isEn ? 'Logout' : 'Sair') : ''}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">{isEn ? 'Logout' : 'Sair'}</span>}
        </button>
      </div>
    </aside>
  )
}