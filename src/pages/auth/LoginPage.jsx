// src/pages/auth/LoginPage.jsx
// ============================================
// LOGIN â€” Split screen premium 2026
// âœ… Logotipo: Logotipo.png
// ============================================

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Globe,
  Sun, Moon, AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [loginError, setLoginError] = useState(null)

  const { login, loginWithGoogle } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const isEn = language === 'en'
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/perfil'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError(null)

    if (!email || !password) {
      toast.error(isEn ? 'Please fill in all fields' : 'Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      const errorMsg = err.message || (isEn ? 'Login failed' : 'Falha ao entrar')
      setLoginError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setLoginError(null)
    try {
      await loginWithGoogle()
    } catch (err) {
      const errorMsg = err.message || (isEn ? 'Google login failed' : 'Falha ao entrar com Google')
      setLoginError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F7F5F0] dark:bg-[#0D1410]">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* LADO ESQUERDO â€” IMAGEM (so em desktop)     */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#174A3A]">
        <img
          src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1600&q=80"
          alt="Luanda, Angola"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#174A3A]/90 via-[#174A3A]/70 to-[#0F382C]/95" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          {/* âœ… LOGO */}
          <Link to="/" className="inline-flex items-center gap-3 self-start group">
            <img
              src="/images/Logotipo.png"
              alt="Radar RAAVTUR"
              className="h-14 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex'
                }
              }}
            />
            {/* Fallback se a imagem nao existir */}
            <div className="hidden items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#7FC0FA] flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#174A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <div>
                <p className="font-extrabold text-lg tracking-tight leading-none">RAAVTUR</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FC0FA] mt-1">
                  {isEn ? 'Tourism Â· Travel Â· Angola' : 'Turismo Â· Viagens Â· Angola'}
                </p>
              </div>
            </div>
          </Link>

          {/* Slogan */}
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA] text-[#174A3A] mb-5">
              {isEn ? 'Welcome back' : 'Bem-vindo de volta'}
            </span>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.05] mb-5">
              {isEn
                ? 'Discover Angola from a new perspective.'
                : 'Descubra Angola de uma nova perspetiva.'}
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              {isEn
                ? 'Sign in to continue exploring destinations, hotels, restaurants and unique experiences.'
                : 'Entre para continuar a explorar destinos, hoteis, restaurantes e experiencias unicas.'}
            </p>
          </div>

          {/* Estatisticas */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-black text-white">18</p>
              <p className="text-xs font-bold uppercase tracking-wider text-white/50 mt-0.5">
                {isEn ? 'Provinces' : 'Provincias'}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-3xl font-black text-white">500+</p>
              <p className="text-xs font-bold uppercase tracking-wider text-white/50 mt-0.5">
                {isEn ? 'Businesses' : 'Empresas'}
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-3xl font-black text-white">4.9</p>
              <p className="text-xs font-bold uppercase tracking-wider text-white/50 mt-0.5">
                {isEn ? 'Rating' : 'Avaliacao'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* LADO DIREITO â€” FORMULRIO                   */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="flex-1 flex flex-col">

        {/* Barra de acoes (topo) */}
        <div className="flex items-center justify-between p-6">
          {/* âœ… LOGO MOBILE */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 group">
            <img
              src="/images/Logotipo.png"
              alt="Radar RAAVTUR"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex'
                }
              }}
            />
            {/* Fallback */}
            <div className="hidden items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#7FC0FA] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#174A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#18211D] dark:text-white">
                RAAVTUR
              </span>
            </div>
          </Link>

          <div className="hidden lg:block" />

          {/* Acoes */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold uppercase tracking-wider text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/15 transition-colors"
              aria-label="Toggle language"
            >
              <Globe size={14} />
              {isEn ? 'EN' : 'PT'}
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/15 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Formulario centrado */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-md">

            {/* Cabecalho */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#18211D] dark:text-[#F7F5F0]">
                {isEn ? 'Sign in' : 'Entrar'}
              </h2>
              <p className="text-sm text-[#66736D] mt-1.5">
                {isEn
                  ? 'Welcome back! Enter your details to continue.'
                  : 'Bem-vindo de volta! Introduza os seus dados para continuar.'}
              </p>
            </div>

            {/* Erro */}
            {loginError && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300 leading-snug">
                  {loginError}
                </p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Email address' : 'Endereco de email'}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isEn ? 'your@email.com' : 'seu@email.com'}
                    required
                    autoComplete="email"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Password' : 'Palavra-passe'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    required
                    autoComplete="current-password"
                    className="w-full h-12 pl-11 pr-11 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#66736D] hover:text-[#18211D] dark:hover:text-[#F7F5F0] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Lembrar + Esqueceu */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DDD4C0] dark:border-[#223029] text-[#7FC0FA] focus:ring-[#7FC0FA] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#18211D] dark:text-[#F7F5F0]">
                    {isEn ? 'Remember me' : 'Lembrar-me'}
                  </span>
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-sm font-semibold text-[#A94728] hover:text-[#8D3B1F] transition-colors"
                >
                  {isEn ? 'Forgot password?' : 'Esqueceu a senha?'}
                </Link>
              </div>

              {/* Botao principal */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-[#A94728] hover:bg-[#8D3B1F] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#A94728]/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isEn ? 'Signing in...' : 'A entrar...'}
                  </>
                ) : (
                  <>
                    {isEn ? 'Sign in' : 'Entrar'}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DDD4C0] dark:border-[#223029]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs font-semibold uppercase tracking-wider bg-[#F7F5F0] dark:bg-[#0D1410] text-[#66736D]">
                  {isEn ? 'or' : 'ou'}
                </span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full h-12 rounded-xl border border-[#DDD4C0] dark:border-[#223029] bg-white dark:bg-[#17201B] hover:bg-[#F7F5F0] dark:hover:bg-[#1E2A24] text-[#18211D] dark:text-[#F7F5F0] font-semibold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#7FC0FA]/30 border-t-[#7FC0FA] rounded-full animate-spin" />
                  {isEn ? 'Loading...' : 'A carregar...'}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {isEn ? 'Continue with Google' : 'Continuar com Google'}
                </>
              )}
            </button>

            {/* Link registo */}
            <p className="text-center text-sm text-[#66736D] mt-8">
              {isEn ? "Don't have an account?" : 'Ainda nao tem conta?'}{' '}
              <Link
                to="/registar"
                className="font-bold text-[#A94728] hover:text-[#8D3B1F] transition-colors"
              >
                {isEn ? 'Sign up' : 'Criar conta'}
              </Link>
            </p>
          </div>
        </div>

        {/* Rodape */}
        <div className="p-6 text-center">
          <p className="text-xs text-[#66736D]">
            Â© 2026 Radar RAAVTUR Â· Angola
          </p>
        </div>
      </div>
    </div>
  )
}