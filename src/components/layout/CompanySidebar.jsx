// src/components/layout/CompanySidebar.jsx

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Star,
  DollarSign,
  FileText,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'

export default function CompanySidebar() {
  const location = useLocation()
  const { logout } = useAuth()
  const { company, services } = useCompany()
  const { isEn } = useLanguage()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Buscar serviços pendentes
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (profile?.company_id) {
          const { count, error } = await supabase
            .from('company_services')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id)
            .eq('status', 'pending')

          if (!error) {
            setPendingCount(count || 0)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar pendentes:', error)
      }
    }

    loadPendingCount()
  }, [services])

  const menuItems = [
    {
      label: isEn ? 'Dashboard' : 'Dashboard',
      icon: LayoutDashboard,
      path: '/empresa/dashboard'
    },
    {
      label: isEn ? 'Services' : 'Serviços',
      icon: Package,
      path: '/empresa/servicos',
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      label: isEn ? 'Bookings' : 'Reservas',
      icon: Calendar,
      path: '/empresa/reservas'
    },
    {
      label: isEn ? 'Destinations' : 'Destinos',
      icon: MapPin,
      path: '/empresa/destinos'
    },
    {
      label: isEn ? 'Reviews' : 'Avaliações',
      icon: Star,
      path: '/empresa/avaliacoes'
    },
    {
      label: isEn ? 'Finances' : 'Financeiro',
      icon: DollarSign,
      path: '/empresa/financeiro'
    },
    {
      label: isEn ? 'Profile' : 'Perfil',
      icon: Building2,
      path: '/empresa/perfil'
    },
    {
      label: isEn ? 'Settings' : 'Configurações',
      icon: Settings,
      path: '/empresa/configuracoes'
    },
    {
      label: isEn ? 'Help' : 'Ajuda',
      icon: HelpCircle,
      path: '/empresa/ajuda'
    }
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Fechar menu mobile ao clicar em um item
  const handleItemClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false)
    }
  }

  // Toggle mobile menu
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-all duration-300 z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed ? (
            <Link to="/empresa/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
                R
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">RAVTUR</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {isEn ? 'Company Panel' : 'Painel da Empresa'}
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/empresa/dashboard" className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              R
            </Link>
          )}
        </div>

        {/* Company Info */}
        {!isCollapsed && company && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 font-semibold">
                {company.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {company.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {company.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleItemClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} className={active ? 'text-primary-500' : ''} />
                {!isCollapsed && (
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
          {!isCollapsed && (
            <Link
              to="/empresa/configuracoes"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Settings size={20} />
              <span className="text-sm font-medium">{isEn ? 'Settings' : 'Configurações'}</span>
            </Link>
          )}
          <button
            onClick={logout}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? (isEn ? 'Logout' : 'Sair') : ''}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-sm font-medium">{isEn ? 'Logout' : 'Sair'}</span>}
          </button>

          {/* Toggle Collapse (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-full p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  )
}