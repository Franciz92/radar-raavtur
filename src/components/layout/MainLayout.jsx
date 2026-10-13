// src/components/layout/MainLayout.jsx
// ============================================
// MAIN LAYOUT — Header horizontal + Conteúdo + Footer
// ✅ Layout profissional estilo Booking/Airbnb
// ✅ Topbar horizontal (sem sidebar no desktop)
// ✅ Sidebar apenas em mobile (drawer)
// ✅ Footer full-width
// ✅ MobileNav (bottom nav mobile)
// ============================================

import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Footer from './Footer'
import { useTheme } from '../../context/ThemeContext'

// ============================================
// ROTAS COM LAYOUT SIMPLES (sem topbar/footer)
// ============================================
const AUTH_ROUTES = [
  '/login',
  '/registar',
  '/recuperar-senha',
  '/reset-password',
]

export default function MainLayout({ children }) {
  const { theme } = useTheme()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAuthRoute = AUTH_ROUTES.includes(location.pathname)

  // ── Fechar menu mobile automaticamente ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // ── Bloquear scroll do body quando drawer mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // ── Fechar drawer com tecla ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobileMenuOpen])

  // ============================================
  // LAYOUT DE AUTENTICAÇO (sem topbar/sidebar/footer)
  // ============================================
  if (isAuthRoute) {
    return (
      <div
        className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden"
        style={{
          backgroundColor: 'var(--bg-page)',
          color: 'var(--text-primary)',
        }}
      >
        <main className="flex-1 w-full">{children || <Outlet />}</main>
      </div>
    )
  }

  // ============================================
  // LAYOUT PRINCIPAL (topbar horizontal + conteúdo)
  // ============================================
  return (
    <div
      className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden"
      style={{
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* ═══════════════════════════════════════ */}
      {/* TOPBAR — Header horizontal sticky        */}
      {/* ═══════════════════════════════════════ */}
      <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* ═══════════════════════════════════════ */}
      {/* CONTEÚDO PRINCIPAL                       */}
      {/* ═══════════════════════════════════════ */}
      <main
        className="flex-1 w-full max-w-full overflow-x-hidden pb-20 lg:pb-0"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        {children || <Outlet />}
      </main>

      {/* ═══════════════════════════════════════ */}
      {/* FOOTER                                   */}
      {/* ═══════════════════════════════════════ */}
      <Footer />

      {/* ═══════════════════════════════════════ */}
      {/* MOBILE NAV — Bottom nav (mobile only)    */}
      {/* ═══════════════════════════════════════ */}
      <MobileNav />

      {/* ═══════════════════════════════════════ */}
      {/* MOBILE MENU DRAWER                       */}
      {/* ═══════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop com fade-in */}
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer lateral esquerdo */}
          <aside
            className="fixed top-0 left-0 bottom-0 z-[70] w-80 max-w-[85vw] bg-white dark:bg-[#0D1410] shadow-2xl overflow-y-auto animate-[slideInLeft_250ms_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <Sidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
          </aside>
        </>
      )}
    </div>
  )
}