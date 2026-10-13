// src/components/dashboard/DashboardHeader.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Globe,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

export default function DashboardHeader({ type = 'user' }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, isEn } = useLanguage()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState([])

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 h-16 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={isEn ? 'Search...' : 'Pesquisar...'}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notificações */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition relative">
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Tema */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Idioma */}
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-1"
        >
          <Globe size={20} />
          <span className="text-sm font-medium hidden sm:inline">
            {language.toUpperCase()}
          </span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-primary-500 font-semibold text-sm">
                {user?.name?.[0] || 'U'}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Link
                to={`/${type}/perfil`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={16} />
                {isEn ? 'Profile' : 'Perfil'}
              </Link>
              <Link
                to={`/${type}/configuracoes`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={16} />
                {isEn ? 'Settings' : 'Configurações'}
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  // Logout
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
              >
                <LogOut size={16} />
                {isEn ? 'Logout' : 'Sair'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}