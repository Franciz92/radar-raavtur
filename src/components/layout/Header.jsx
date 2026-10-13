// src/components/layout/Header.jsx
// ============================================
// HEADER â€” Tipografia premium
// âœ… Logotipo: Logotipo.png (com fallback)
// âœ… cone do tema maior
// âœ… Dropdowns responsivos
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, X, User, LogOut, Heart,
  Calendar, Home, Globe,
  Sun, Moon, ChevronDown,
  Building2, Grid,
  Utensils, Camera, Sparkles, ChevronRight, ShieldCheck,
  Compass, MapPin, Hotel, Briefcase, Newspaper,
  LifeBuoy, Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { useBanners } from '../../context/BannerContext'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { language, toggleLanguage, t } = useLanguage()
  const { headerBanners } = useBanners()
  const navigate = useNavigate()
  const location = useLocation()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const userMenuRef = useRef(null)
  const languageMenuRef = useRef(null)

  useEffect(() => {
    if (!headerBanners || headerBanners.length <= 1) return undefined
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % headerBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [headerBanners.length])

  useEffect(() => {
    if (currentSlide >= headerBanners.length) setCurrentSlide(0)
  }, [headerBanners.length, currentSlide])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const handleLanguageChange = (lang) => {
    if (lang !== language) toggleLanguage()
    setIsLanguageMenuOpen(false)
  }

  const navLinks = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/destinos', label: t('destinations'), icon: MapPin },
    { path: '/hoteis', label: t('hotels'), icon: Hotel },
    { path: '/restaurantes', label: t('restaurants'), icon: Utensils },
    { path: '/experiencias', label: t('experiences'), icon: Camera },
    { path: '/eventos', label: t('events'), icon: Calendar },
    { path: '/servicos', label: t('services'), icon: Briefcase },
    { path: '/blog', label: t('blog'), icon: Newspaper },
  ]

  const userMenuItems = [
    { path: '/dashboard', label: t('dashboard') || 'Dashboard', icon: Home },
    { path: '/perfil', label: t('profile') || 'Perfil', icon: User },
    { path: '/favoritos', label: t('favorites') || 'Favoritos', icon: Heart },
    { path: '/reservas', label: t('bookings') || 'Reservas', icon: Calendar },
    { path: '/apoio', label: t('support') || 'Apoio', icon: LifeBuoy },
  ]

  const companyMenuItems = [
    { path: '/empresa/dashboard', label: t('companyDashboard') || 'Dashboard', icon: Home },
    { path: '/empresa/perfil', label: t('companyProfile') || 'Perfil', icon: Building2 },
    { path: '/empresa/servicos', label: t('companyServices') || 'Servicos', icon: Grid },
    { path: '/empresa/reservas', label: t('companyBookings') || 'Reservas', icon: Calendar },
    { path: '/apoio', label: t('support') || 'Apoio', icon: LifeBuoy },
  ]

  const adminMenuItems = [
    { path: '/admin/dashboard', label: t('adminDashboard') || 'Dashboard', icon: ShieldCheck },
    { path: '/admin/utilizadores', label: t('adminUsers') || 'Utilizadores', icon: User },
    { path: '/admin/empresas', label: t('adminCompanies') || 'Empresas', icon: Building2 },
    { path: '/admin/destinos', label: t('adminDestinations') || 'Destinos', icon: Globe },
    { path: '/admin/reservas', label: t('adminBookings') || 'Reservas', icon: Calendar },
    { path: '/admin/banners', label: t('adminBanners') || 'Banners', icon: ImageIcon },
    { path: '/admin/apoio', label: t('adminSupport') || 'Apoio', icon: LifeBuoy },
  ]

  const getMenuItems = () => {
    if (!user) return []
    if (user.role === 'admin') return adminMenuItems
    if (user.role === 'company') return companyMenuItems
    return userMenuItems
  }

  const pickText = (obj, ptKey, enKey) => {
    if (!obj) return ''
    const pt = obj[ptKey]
    const en = obj[enKey]
    return language === 'en' ? (en || pt) : (pt || en)
  }

  const FlagPortugal = () => (
    <svg viewBox="0 0 640 480" className="w-5 h-4 rounded-sm shadow-sm flex-shrink-0">
      <rect width="640" height="480" fill="#fff"/>
      <rect width="416" height="480" fill="#006600"/>
      <rect width="224" height="480" x="416" fill="#cc0000"/>
      <circle cx="260" cy="240" r="90" fill="#ffcc00"/>
      <circle cx="260" cy="240" r="80" fill="#006600"/>
      <path d="M200 240a60 60 0 0 0 120 0 60 60 0 0 0-120 0" fill="#ffcc00"/>
      <circle cx="260" cy="240" r="25" fill="#ffcc00"/>
      <path d="M240 220l10 15 20-5-5 20 15 10-15 10 5 20-20-5-10 15-10-15-20 5 5-20-15-10 15-10-5-20 20 5z" fill="#cc0000"/>
    </svg>
  )

  const FlagUSA = () => (
    <svg viewBox="0 0 640 480" className="w-5 h-4 rounded-sm shadow-sm flex-shrink-0">
      <rect width="640" height="480" fill="#b22234"/>
      <rect y="38.4" width="640" height="38.4" fill="#fff"/>
      <rect y="115.2" width="640" height="38.4" fill="#fff"/>
      <rect y="192" width="640" height="38.4" fill="#fff"/>
      <rect y="268.8" width="640" height="38.4" fill="#fff"/>
      <rect y="345.6" width="640" height="38.4" fill="#fff"/>
      <rect y="422.4" width="640" height="38.4" fill="#fff"/>
      <rect y="76.8" width="640" height="38.4" fill="#b22234"/>
      <rect y="153.6" width="640" height="38.4" fill="#b22234"/>
      <rect y="230.4" width="640" height="38.4" fill="#b22234"/>
      <rect y="307.2" width="640" height="38.4" fill="#b22234"/>
      <rect y="384" width="640" height="38.4" fill="#b22234"/>
      <rect y="460.8" width="640" height="38.4" fill="#b22234"/>
      <rect width="266.7" height="172.8" fill="#3c3b6e"/>
      <circle cx="40" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="64" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="88" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="112" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="136" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="160" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="184" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="208" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="232" cy="57.6" r="3.5" fill="#fff"/>
      <circle cx="256" cy="57.6" r="3.5" fill="#fff"/>
    </svg>
  )

  return (
    <>
      {/* BANNER SUPERIOR */}
      {headerBanners && headerBanners.length > 0 && (
        <div className="relative w-full h-11 sm:h-12 overflow-hidden bg-slate-950 select-none">
          {headerBanners.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
              }`}
            >
              <img
                src={slide.image_url}
                alt={pickText(slide, 'title_pt', 'title_en')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-slate-950/85" />

              <div className="relative max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-white overflow-hidden flex-1 min-w-0">
                  {pickText(slide, 'badge_pt', 'badge_en') && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex-shrink-0">
                      <Sparkles size={10} className="text-amber-300" />
                      {pickText(slide, 'badge_pt', 'badge_en')}
                    </span>
                  )}

                  <p className="text-xs sm:text-sm font-semibold text-amber-50/95 truncate whitespace-nowrap tracking-tight">
                    {pickText(slide, 'title_pt', 'title_en')}
                  </p>
                  <span className="hidden md:inline-block text-amber-500/30 flex-shrink-0">|</span>
                  <p className="text-xs text-slate-300/85 truncate hidden md:block">
                    {pickText(slide, 'subtitle_pt', 'subtitle_en')}
                  </p>
                </div>

                <Link
                  to={slide.link || '/destinos'}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-300 hover:text-amber-100 text-xs font-bold rounded-full border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 group"
                >
                  <Compass size={13} className="text-amber-400" />
                  <span>
                    {pickText(slide, 'cta_pt', 'cta_en') ||
                      (language === 'en' ? 'See more' : 'Ver mais')}
                  </span>
                  <ChevronRight size={12} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}

          {headerBanners.length > 1 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {headerBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === currentSlide
                      ? 'w-5 bg-amber-400 shadow-lg shadow-amber-500/50'
                      : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled ? 'shadow-lg backdrop-blur-2xl' : 'backdrop-blur-xl'
        }`}
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(8, 12, 24, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: theme === 'dark' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(217, 119, 6, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* âœ… MARCA â€” LOGOTIPO Logotipo.png */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 group"
              aria-label="Radar RAAVTUR â€” Pagina inicial"
            >
              {!logoError ? (
                <img
                  src="/images/Logotipo.png"
                  alt="Radar RAAVTUR"
                  className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={() => setLogoError(true)}
                />
              ) : (
                /* Fallback â€” so aparece se a imagem falhar */
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#7FC0FA] flex items-center justify-center flex-shrink-0">
                    <Compass size={20} className="text-[#174A3A]" />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                      RAAVTUR
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-500 dark:text-amber-400 mt-0.5">
                      Angola
                    </span>
                  </span>
                </div>
              )}
            </Link>

            {/* NAVEGA‡ƒO DESKTOP */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path))
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5'
                    }`}
                  >
                    <link.icon size={14} className={isActive ? 'text-amber-500' : 'opacity-60'} />
                    <span className="hidden xl:inline">{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* A‡•ES */}
            <div className="flex items-center gap-1 sm:gap-1.5">

              {/* IDIOMA */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-slate-700 dark:text-slate-200"
                  title={language === 'pt' ? 'Mudar para Ingles' : 'Switch to Portuguese'}
                >
                  {language === 'pt' ? <FlagPortugal /> : <FlagUSA />}
                  <span className="hidden sm:inline text-2xs font-bold tracking-wider uppercase">
                    {language === 'pt' ? 'PT' : 'EN'}
                  </span>
                  <ChevronDown size={12} className={`hidden sm:inline text-amber-500 transition-transform duration-300 ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLanguageMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border border-amber-500/20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl overflow-hidden z-50">
                    <div className="p-1.5">
                      <button
                        onClick={() => handleLanguageChange('pt')}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          language === 'pt'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-amber-500/5'
                        }`}
                      >
                        <FlagPortugal />
                        <span>Portugues</span>
                        {language === 'pt' && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          language === 'en'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-amber-500/5'
                        }`}
                      >
                        <FlagUSA />
                        <span>English</span>
                        {language === 'en' && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TEMA */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20 flex-shrink-0"
                aria-label="Toggle theme"
                title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              >
                {theme === 'dark' ? (
                  <Sun size={18} className="sm:hidden text-amber-400" />
                ) : (
                  <Moon size={18} className="sm:hidden text-amber-700" />
                )}
                {theme === 'dark' ? (
                  <Sun size={20} className="hidden sm:block text-amber-400" />
                ) : (
                  <Moon size={20} className="hidden sm:block text-amber-700" />
                )}
              </button>

              {/* NOTIFICA‡•ES */}
              {isAuthenticated && <NotificationBell />}

              {/* USER MENU */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-0.5 pl-1.5 pr-2 rounded-full border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden ring-1 ring-amber-500/30">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0)?.toUpperCase() || <User size={12} />
                      )}
                    </div>
                    <ChevronDown size={12} className={`text-amber-600 dark:text-amber-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
                        onClick={() => setIsUserMenuOpen(false)}
                      />

                      <div className="
                        fixed sm:absolute
                        top-16 sm:top-auto sm:mt-2
                        left-2 right-2 sm:left-auto sm:right-0
                        w-auto sm:w-60
                        max-w-[calc(100vw-1rem)]
                        rounded-xl shadow-2xl
                        border border-amber-500/20
                        bg-white/95 dark:bg-slate-950/95
                        backdrop-blur-2xl
                        overflow-hidden
                        z-50
                      ">
                        <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/15">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {user?.name || 'Utilizador'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-1">
                          {getMenuItems().map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            >
                              <item.icon size={15} className="text-amber-500" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-amber-500/15 p-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut size={15} />
                            {t('logout')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    to="/login"
                    className="hidden sm:block px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/registar"
                    className="px-3 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 rounded-lg shadow-lg shadow-amber-900/20 active:scale-95 transition-all duration-300"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-amber-500/10 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* MENU MOBILE */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-amber-500/15 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl">
            <nav className="p-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <link.icon size={18} className="text-amber-500" />
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="border-t border-amber-500/15 my-2 pt-2" />
                  {getMenuItems().map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <item.icon size={16} className="text-amber-500" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut size={16} />
                    {t('logout')}
                  </button>
                </>
              )}

              <div className="border-t border-amber-500/15 mt-2 pt-2 flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-amber-500/10 border border-amber-500/20"
                >
                  {theme === 'dark' ? (
                    <><Sun size={14} className="text-amber-400" /> Claro</>
                  ) : (
                    <><Moon size={14} className="text-amber-700" /> Escuro</>
                  )}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex-1 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-amber-500/20 bg-amber-500/10 text-slate-800 dark:text-slate-200 text-center flex items-center justify-center gap-1.5"
                >
                  {language === 'pt' ? <FlagPortugal /> : <FlagUSA />}
                  {language === 'pt' ? 'PT' : 'EN'}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}