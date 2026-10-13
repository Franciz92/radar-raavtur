// src/components/layout/Topbar.jsx
// ============================================
// TOPBAR â€” Header horizontal profissional
// âœ… Estilo Booking/Airbnb Â· Navegacao horizontal
// âœ… Mega dropdown Destinos Â· Search universal (âŒ˜K)
// âœ… Sticky com blur progressivo ao scroll
// âœ… Logotipo: Logotipo.png (com fallback)
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Heart, User, LogOut, Menu,
  ChevronDown, ChevronRight, Sun, Moon, Globe, Home, MapPin,
  Calendar, Building2, ShieldCheck, LifeBuoy,
  Image as ImageIcon, Grid, Hotel, Utensils, Camera,
  Briefcase, Newspaper, Compass, Sparkles,
  TrendingUp, Award, Flame,
} from 'lucide-react'
import NotificationBell from '../notifications/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'

// ============================================
// NAVEGA‡ƒO
// ============================================
const NAV_LINKS = [
  { path: '/destinos', pt: 'Destinos', en: 'Destinations', icon: MapPin, hasMega: true },
  { path: '/hoteis', pt: 'Hoteis', en: 'Hotels', icon: Hotel },
  { path: '/restaurantes', pt: 'Restaurantes', en: 'Restaurants', icon: Utensils },
  { path: '/experiencias', pt: 'Experiencias', en: 'Experiences', icon: Camera },
  { path: '/eventos', pt: 'Eventos', en: 'Events', icon: Calendar },
  { path: '/blog', pt: 'Blog', en: 'Blog', icon: Newspaper },
]

const POPULAR_PROVINCES = [
  { name: 'Luanda', count: 245 },
  { name: 'Benguela', count: 87 },
  { name: 'Huila', count: 62 },
  { name: 'Namibe', count: 45 },
  { name: 'Huambo', count: 38 },
  { name: 'Cabinda', count: 29 },
  { name: 'Malanje', count: 24 },
  { name: 'Moxico', count: 18 },
]

export default function Topbar({ onOpenMobileMenu }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const userMenuRef = useRef(null)
  const langMenuRef = useRef(null)
  const megaRef = useRef(null)

  const isEn = language === 'en'

  // â”€â”€ Scroll: blur progressivo
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // â”€â”€ Click outside dos dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false)
      }
      if (megaRef.current && !megaRef.current.contains(event.target)) {
        setIsMegaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // â”€â”€ Atalhos de teclado (âŒ˜K / Ctrl+K abre search, Esc fecha tudo)
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        document.getElementById('universal-search')?.focus()
      }
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false)
        setIsLangMenuOpen(false)
        setIsMegaOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    navigate(`/destinos?${params.toString()}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/perfil', label: isEn ? 'Profile' : 'Perfil', icon: User },
    { path: '/favoritos', label: isEn ? 'Favorites' : 'Favoritos', icon: Heart },
    { path: '/reservas', label: isEn ? 'Bookings' : 'Reservas', icon: Calendar },
    { path: '/apoio', label: isEn ? 'Support' : 'Apoio', icon: LifeBuoy },
  ]

  const companyMenuItems = [
    { path: '/empresa/dashboard', label: 'Dashboard', icon: Home },
    { path: '/empresa/perfil', label: isEn ? 'Profile' : 'Perfil', icon: Building2 },
    { path: '/empresa/servicos', label: isEn ? 'Services' : 'Servicos', icon: Grid },
    { path: '/empresa/reservas', label: isEn ? 'Bookings' : 'Reservas', icon: Calendar },
    { path: '/apoio', label: isEn ? 'Support' : 'Apoio', icon: LifeBuoy },
  ]

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: ShieldCheck },
    { path: '/admin/utilizadores', label: isEn ? 'Users' : 'Utilizadores', icon: User },
    { path: '/admin/empresas', label: isEn ? 'Companies' : 'Empresas', icon: Building2 },
    { path: '/admin/destinos', label: isEn ? 'Destinations' : 'Destinos', icon: MapPin },
    { path: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { path: '/apoio', label: isEn ? 'Support' : 'Apoio', icon: LifeBuoy },
  ]

  const getMenuItems = () => {
    if (!user) return []
    if (user.role === 'admin') return adminMenuItems
    if (user.role === 'company') return companyMenuItems
    return userMenuItems
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#0D1410]/85 backdrop-blur-xl border-[#DDD4C0]/60 dark:border-[#223029]/60 shadow-sm'
          : 'bg-white dark:bg-[#0D1410] border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-2 lg:gap-4 h-16 lg:h-[72px]">

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* MOBILE: HAMBURGER                       */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#7FC0FA]/15 text-[#18211D] dark:text-[#F7F5F0] transition-colors flex-shrink-0"
            aria-label={isEn ? 'Open menu' : 'Abrir menu'}
          >
            <Menu size={22} />
          </button>

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* LOGO                                    */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0 group"
            aria-label="Radar RAAVTUR â€” Inicio"
          >
            {!logoError ? (
              <img
                src="/images/Logotipo.png"
                alt="Radar RAAVTUR"
                className="h-9 lg:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#7FC0FA] flex items-center justify-center shadow-sm flex-shrink-0">
                  <Compass size={18} className="text-[#174A3A]" strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-base tracking-tight text-[#18211D] dark:text-white">
                  RAAVTUR
                </span>
              </div>
            )}
          </Link>

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* NAVEGA‡ƒO DESKTOP                       */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.path)
              const label = isEn ? link.en : link.pt

              if (link.hasMega) {
                return (
                  <div
                    key={link.path}
                    className="relative"
                    ref={megaRef}
                    onMouseEnter={() => setIsMegaOpen(true)}
                    onMouseLeave={() => setIsMegaOpen(false)}
                  >
                    <Link
                      to={link.path}
                      className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        active || isMegaOpen
                          ? 'text-[#7FC0FA] bg-[#7FC0FA]/10'
                          : 'text-[#18211D] dark:text-[#F7F5F0] hover:text-[#7FC0FA] hover:bg-[#7FC0FA]/5'
                      }`}
                    >
                      {label}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-300 ${
                          isMegaOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </Link>

                    {/* â”€â”€ MEGA DROPDOWN â”€â”€ */}
                    {isMegaOpen && (
                      <div className="absolute top-full left-0 pt-2 w-[640px] z-50">
                        <div className="rounded-2xl shadow-2xl border border-[#DDD4C0]/60 dark:border-[#223029]/60 bg-white dark:bg-[#17201B] overflow-hidden">
                          <div className="grid grid-cols-3 gap-4 p-5">

                            {/* Provincias populares */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={14} className="text-[#7FC0FA]" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
                                  {isEn ? 'Popular provinces' : 'Provincias populares'}
                                </h4>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                {POPULAR_PROVINCES.map((p) => (
                                  <Link
                                    key={p.name}
                                    to={`/destinos?province=${encodeURIComponent(p.name)}`}
                                    onClick={() => setIsMegaOpen(false)}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/10 hover:text-[#7FC0FA] transition-colors group"
                                  >
                                    <span className="flex items-center gap-2">
                                      <MapPin size={13} className="text-[#66736D] group-hover:text-[#7FC0FA]" />
                                      {p.name}
                                    </span>
                                    <span className="text-xs text-[#66736D] font-semibold">
                                      {p.count}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>

                            {/* Atalhos */}
                            <div className="col-span-1 border-l border-[#DDD4C0]/50 dark:border-[#223029]/50 pl-4 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles size={14} className="text-[#A94728]" />
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
                                    {isEn ? 'Explore' : 'Explorar'}
                                  </h4>
                                </div>
                                <Link
                                  to="/destinos"
                                  onClick={() => setIsMegaOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#A94728] hover:bg-[#A94728]/10 transition-colors"
                                >
                                  <Flame size={14} />
                                  {isEn ? 'All destinations' : 'Todos os destinos'}
                                </Link>
                                <Link
                                  to="/experiencias"
                                  onClick={() => setIsMegaOpen(false)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/10 transition-colors"
                                >
                                  <Award size={14} className="text-[#7FC0FA]" />
                                  {isEn ? 'Top experiences' : 'Top experiencias'}
                                </Link>
                              </div>

                              <Link
                                to="/destinos"
                                onClick={() => setIsMegaOpen(false)}
                                className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg bg-[#7FC0FA]/10 text-sm font-bold text-[#7FC0FA] hover:bg-[#7FC0FA]/20 transition-colors"
                              >
                                {isEn ? 'View all' : 'Ver todos'}
                                <ChevronRight size={14} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? 'text-[#7FC0FA] bg-[#7FC0FA]/10'
                      : 'text-[#18211D] dark:text-[#F7F5F0] hover:text-[#7FC0FA] hover:bg-[#7FC0FA]/5'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* SEARCH UNIVERSAL (desktop)              */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-sm ml-auto"
          >
            <div className="relative w-full">
              <Search
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                  isSearchFocused ? 'text-[#7FC0FA]' : 'text-[#66736D]'
                }`}
              />
              <input
                id="universal-search"
                type="text"
                placeholder={
                  isEn
                    ? 'Search destinations, hotels...'
                    : 'Pesquisar destinos, hoteis...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full h-10 pl-10 pr-14 rounded-xl bg-[#F7F5F0] dark:bg-[#17201B] border border-transparent focus:border-[#7FC0FA] focus:bg-white dark:focus:bg-[#1E2A24] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
              />
              <kbd className="hidden xl:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#DDD4C0] dark:border-[#223029] text-[10px] font-mono font-semibold text-[#66736D] bg-white dark:bg-[#0D1410]">
                <span className="text-[9px]">âŒ˜</span>K
              </kbd>
            </div>
          </form>

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {/* A‡•ES                                   */}
          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <div className="flex items-center gap-0.5 lg:gap-1 ml-auto lg:ml-0">

            {/* â”€â”€â”€ IDIOMA â”€â”€â”€ */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="hidden sm:flex items-center gap-1 px-2.5 h-10 rounded-xl hover:bg-[#7FC0FA]/15 text-[#18211D] dark:text-[#F7F5F0] transition-colors"
                title={isEn ? 'Change language' : 'Mudar idioma'}
              >
                <Globe size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {language === 'pt' ? 'PT' : 'EN'}
                </span>
                <ChevronDown
                  size={11}
                  className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-2xl border border-[#DDD4C0] dark:border-[#223029] bg-white dark:bg-[#17201B] overflow-hidden z-50">
                  <div className="p-1">
                    <button
                      onClick={() => {
                        if (language !== 'pt') toggleLanguage()
                        setIsLangMenuOpen(false)
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        language === 'pt'
                          ? 'bg-[#7FC0FA]/15 text-[#18211D] dark:text-[#7FC0FA]'
                          : 'text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/10'
                      }`}
                    >
                      <span>Portugues</span>
                      {language === 'pt' && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7FC0FA]" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (language !== 'en') toggleLanguage()
                        setIsLangMenuOpen(false)
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        language === 'en'
                          ? 'bg-[#7FC0FA]/15 text-[#18211D] dark:text-[#7FC0FA]'
                          : 'text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/10'
                      }`}
                    >
                      <span>English</span>
                      {language === 'en' && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7FC0FA]" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* â”€â”€â”€ TEMA â”€â”€â”€ */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#7FC0FA]/15 text-[#18211D] dark:text-[#F7F5F0] transition-colors"
              aria-label="Mudar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* â”€â”€â”€ FAVORITOS â”€â”€â”€ */}
            <Link
              to="/favoritos"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#7FC0FA]/15 text-[#18211D] dark:text-[#F7F5F0] transition-colors"
              aria-label={isEn ? 'Favorites' : 'Favoritos'}
            >
              <Heart size={18} />
            </Link>

            {/* â”€â”€â”€ NOTIFICA‡•ES â”€â”€â”€ */}
            {isAuthenticated && <NotificationBell />}

            {/* â•â•â• PERFIL / LOGIN â•â•â• */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-xl hover:bg-[#7FC0FA]/15 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7FC0FA] to-[#174A3A] text-white flex items-center justify-center text-xs font-bold overflow-hidden ring-2 ring-[#7FC0FA]/30">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || <User size={14} />
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-[#66736D] transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 sm:hidden"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-[#DDD4C0] dark:border-[#223029] bg-white dark:bg-[#17201B] overflow-hidden z-50">
                      <div className="px-4 py-3 bg-[#7FC0FA]/10 dark:bg-[#7FC0FA]/5 border-b border-[#DDD4C0]/50 dark:border-[#223029]/50">
                        <p className="font-bold text-sm text-[#18211D] dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-[#66736D] truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-1">
                        {getMenuItems().map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/15 transition-colors"
                          >
                            <item.icon size={16} className="text-[#66736D]" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-[#DDD4C0]/50 dark:border-[#223029]/50 p-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#B33A3A] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut size={16} />
                          {isEn ? 'Logout' : 'Sair'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:flex items-center px-4 h-10 text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] hover:text-[#7FC0FA] transition-colors"
                >
                  {isEn ? 'Login' : 'Entrar'}
                </Link>
                <Link
                  to="/registar"
                  className="flex items-center px-4 h-10 text-sm font-bold text-[#174A3A] bg-[#7FC0FA] hover:bg-[#6BB0EA] rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {isEn ? 'Sign up' : 'Registar'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}