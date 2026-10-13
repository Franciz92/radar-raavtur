// src/components/layout/Sidebar.jsx
// ============================================
// SIDEBAR — Cinza escuro compacto (240px)
// ✅ Fundo cinza escuro (slate-800)
// ✅ Textos e ícones no tamanho original
// ✅ 3 menus: admin, company, user
// ✅ Badge de aprovacoes pendentes
// ============================================

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home, MapPin, Hotel, Utensils, Camera,
  Calendar, Briefcase, Newspaper, Building2,
  Heart, MessageCircle, Bell, User, X,
  Compass, LifeBuoy,
  LayoutDashboard, CheckCircle, Users, Star,
  DollarSign, Settings, Grid,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'

export default function Sidebar({ mobile = false, onClose }) {
  const { user, isAuthenticated, unreadNotifications } = useAuth()
  const { language } = useLanguage()
  const location = useLocation()
  const isEn = language === 'en'

  const [logoError, setLogoError] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return

    const fetchPending = async () => {
      try {
        const { count } = await supabase
          .from('businesses')
          .select('id', { count: 'exact', head: true })
          .eq('is_approved', false)
        setPendingCount(count || 0)
      } catch (e) {
        // silencioso
      }
    }
    fetchPending()

    const interval = setInterval(fetchPending, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.role])

  // ============ MENU ADMIN ============
  const adminMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    {
      label: 'Aprovacoes',
      icon: CheckCircle,
      path: '/admin/aprovar',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { label: 'Empresas', icon: Building2, path: '/admin/empresas' },
    { label: 'Destinos', icon: MapPin, path: '/admin/destinos' },
    { label: 'Blog', icon: Newspaper, path: '/admin/blog' },
    { label: 'Utilizadores', icon: Users, path: '/admin/utilizadores' },
  ]

  // ============ MENU EMPRESA ============
  const companyMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/empresa/dashboard' },
    { label: isEn ? 'Profile' : 'Perfil', icon: Building2, path: '/empresa/perfil' },
    { label: isEn ? 'Services' : 'Servicos', icon: Grid, path: '/empresa/servicos' },
    { label: isEn ? 'Bookings' : 'Reservas', icon: Calendar, path: '/empresa/reservas' },
    { label: isEn ? 'Reviews' : 'Avaliacoes', icon: Star, path: '/empresa/avaliacoes' },
    { label: isEn ? 'Transactions' : 'Transacoes', icon: DollarSign, path: '/empresa/transacoes' },
    { label: isEn ? 'Settings' : 'Configuracoes', icon: Settings, path: '/empresa/configuracoes' },
  ]

  // ============ MENU PUBLICO ============
  const publicMenu = [
    { path: '/', label: isEn ? 'Home' : 'Inicio', icon: Home },
    { path: '/destinos', label: isEn ? 'Destinations' : 'Destinos', icon: MapPin },
    { path: '/hoteis', label: isEn ? 'Hotels' : 'Hospedagens', icon: Hotel },
    { path: '/restaurantes', label: isEn ? 'Restaurants' : 'Restaurantes', icon: Utensils },
    { path: '/experiencias', label: isEn ? 'Experiences' : 'Experiencias', icon: Camera },
    { path: '/eventos', label: isEn ? 'Events' : 'Eventos', icon: Calendar },
    { path: '/empresas', label: isEn ? 'Companies' : 'Empresas', icon: Building2 },
    { path: '/servicos', label: isEn ? 'Other Services' : 'Outros Servicos', icon: Briefcase },
    { path: '/blog', label: 'Blog', icon: Newspaper },
  ]

  // ============ MENU CONTA ============
  const accountMenu = isAuthenticated
    ? [
        { path: '/favoritos', label: isEn ? 'Favorites' : 'Favoritos', icon: Heart },
        { path: '/chat', label: isEn ? 'Messages' : 'Mensagens', icon: MessageCircle },
        {
          path: '/usuario/notificacoes',
          label: isEn ? 'Notifications' : 'Notificacoes',
          icon: Bell,
          badge: unreadNotifications,
        },
        { path: '/perfil', label: isEn ? 'Profile' : 'Perfil', icon: User },
        { path: '/apoio', label: isEn ? 'Support' : 'Apoio', icon: LifeBuoy },
      ]
    : []

  const getMainMenu = () => {
    if (!isAuthenticated) return publicMenu
    if (user?.role === 'admin') return adminMenu
    if (user?.role === 'company') return companyMenu
    return publicMenu
  }

  const mainMenu = getMainMenu()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // ═══════════════════════════════════════════
  // FUNDO COMPACTO — 240px (w-60)
  // Textos e ícones no tamanho original
  // ═══════════════════════════════════════════
  const containerClasses = mobile
    ? 'flex flex-col w-full h-full bg-[#1E293B] text-[#CBD5E1]'
    : 'hidden lg:flex flex-col w-60 h-screen sticky top-0 bg-[#1E293B] text-[#CBD5E1]'

  return (
    <aside className={containerClasses}>
      {/* LOGO — mantém tamanho, reduz padding lateral */}
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-[#334155] flex-shrink-0">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 group min-w-0"
          aria-label="Radar RAAVTUR"
        >
          {!logoError ? (
            <img
              src="/images/Logotipo.png"
              alt="Radar RAAVTUR"
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8] flex items-center justify-center shadow-lg flex-shrink-0">
                <Compass size={22} className="text-[#0F172A]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base tracking-tight text-[#F8FAFC]">
                  RAAVTUR
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#38BDF8] mt-0.5">
                  {isEn ? 'Tourism - Angola' : 'Turismo - Angola'}
                </span>
              </div>
            </div>
          )}
        </Link>

        {mobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#334155] transition-colors flex-shrink-0"
            aria-label="Fechar menu"
          >
            <X size={20} className="text-[#CBD5E1]" />
          </button>
        )}
      </div>

      {/* NAVEGACAO — textos e ícones MANTIDOS no tamanho original */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {mainMenu.map((link) => {
          const active = isActive(link.path)
          const Icon = link.icon
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#334155] text-[#38BDF8]'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#334155]'
              }`}
            >
              <Icon
                size={18}
                className={
                  active
                    ? 'text-[#38BDF8]'
                    : 'opacity-70 group-hover:opacity-100 group-hover:text-white'
                }
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="flex-1 truncate">{link.label}</span>
              {link.badge > 0 && (
                <span
                  className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                    active ? 'bg-[#38BDF8] text-[#0F172A]' : 'bg-[#EF4444] text-white'
                  }`}
                >
                  {link.badge > 99 ? '99+' : link.badge}
                </span>
              )}
              {active && !link.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] flex-shrink-0" />
              )}
            </Link>
          )
        })}

        {/* CONTA */}
        {accountMenu.length > 0 && (
          <div className="border-t border-[#334155] my-2 pt-2">
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
              {isEn ? 'My account' : 'Minha conta'}
            </p>
            {accountMenu.map((link) => {
              const active = isActive(link.path)
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#334155] text-[#38BDF8]'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#334155]'
                  }`}
                >
                  <Icon
                    size={17}
                    className={
                      active
                        ? 'text-[#38BDF8]'
                        : 'opacity-70 group-hover:opacity-100 group-hover:text-white'
                    }
                  />
                  <span className="flex-1 truncate">{link.label}</span>
                  {link.badge > 0 && (
                    <span
                      className={`min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                        active ? 'bg-[#38BDF8] text-[#0F172A]' : 'bg-[#EF4444] text-white'
                      }`}
                    >
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* LOGIN/REGISTO */}
        {!isAuthenticated && (
          <div className="border-t border-[#334155] my-2 pt-2 space-y-1.5">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-[#CBD5E1] border border-[#334155] hover:bg-[#334155] hover:text-white transition-all"
            >
              {isEn ? 'Login' : 'Entrar'}
            </Link>
            <Link
              to="/registar"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold text-[#0F172A] bg-[#38BDF8] hover:bg-[#0EA5E9] transition-all shadow-md"
            >
              {isEn ? 'Sign up' : 'Registar'}
            </Link>
          </div>
        )}
      </nav>

      {/* SLOGAN — mantém tamanho */}
      <div className="px-4 py-5 border-t border-[#334155] flex-shrink-0">
        <p className="text-sm font-semibold text-[#F8FAFC] leading-snug">
          {isEn ? 'Angola is more beautiful' : 'Angola e mais bonita'}
          <br />
          <span className="text-[#94A3B8]">
            {isEn ? 'when it is lived.' : 'quando e vivida.'}
          </span>
        </p>
      </div>
    </aside>
  )
}