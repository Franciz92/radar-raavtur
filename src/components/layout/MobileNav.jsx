// src/components/layout/MobileNav.jsx
// ============================================
// MOBILE NAV — Bottom bar com azul #7FC0FA
// ============================================

import { Link, useLocation } from 'react-router-dom'
import { Home, MapPin, Heart, User } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'

export default function MobileNav() {
  const { language } = useLanguage()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isEn = language === 'en'

  const links = [
    { path: '/', label: isEn ? 'Home' : 'Início', icon: Home },
    { path: '/destinos', label: isEn ? 'Explore' : 'Explorar', icon: MapPin },
    { path: '/favoritos', label: isEn ? 'Favorites' : 'Favoritos', icon: Heart },
    { path: isAuthenticated ? '/perfil' : '/login', label: isEn ? 'Profile' : 'Perfil', icon: User },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F7F5F0]/98 dark:bg-[#0D1410]/98 backdrop-blur-xl border-t border-[#DDD4C0]/60 dark:border-[#223029]/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const active = isActive(link.path)
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-[#7FC0FA]' : 'text-[#66736D]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{link.label}</span>
              {active && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#7FC0FA] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}