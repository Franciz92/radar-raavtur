// src/pages/auth/RegisterPage.jsx
// ============================================
// REGISTER â€” Split screen premium 2026
// âœ… Logotipo: Logotipo.png
// ============================================

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Phone, Eye, EyeOff,
  ArrowRight, Globe, Sun, Moon,
  CheckCircle, AlertCircle, MapPin, Info, Loader2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { provinces } from '../../constants/provinces'
import toast from 'react-hot-toast'

// ============================================
// CONSTANTES
// ============================================
const countries = [
  { code: 'AO', name: 'Angola', dialCode: '+244' },
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'BR', name: 'Brasil', dialCode: '+55' },
  { code: 'ZA', name: 'frica do Sul', dialCode: '+27' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1' },
  { code: 'FR', name: 'Franca', dialCode: '+33' },
  { code: 'DE', name: 'Alemanha', dialCode: '+49' },
  { code: 'ES', name: 'Espanha', dialCode: '+34' },
  { code: 'IT', name: 'Italia', dialCode: '+39' },
  { code: 'CN', name: 'China', dialCode: '+86' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
]

const tourismInterests = [
  { icon: 'ðŸ“·', label: 'Fotografia', labelEn: 'Photography' },
  { icon: 'ðŸ§­', label: 'Aventura', labelEn: 'Adventure' },
  { icon: 'â˜•', label: 'Gastronomia', labelEn: 'Gastronomy' },
  { icon: 'ðŸ‘¥', label: 'Cultura', labelEn: 'Culture' },
  { icon: 'â¤ï¸', label: 'Romance', labelEn: 'Romance' },
  { icon: 'â­', label: 'Luxo', labelEn: 'Luxury' },
]

// ============================================
// FLAG ICON
// ============================================
const FlagIcon = ({ countryCode, size = 20 }) => {
  const flags = {
    AO: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="1" fill="#CC092F" />
        <rect width="3" height="1" y="1" fill="#000000" />
        <path d="M0.8,1.15 A0.4,0.4 0 0,1 1.6,1.15" stroke="#FFD700" strokeWidth="0.07" fill="none" />
        <path d="M0.85,1.25 A0.35,0.35 0 0,1 1.55,1.25" stroke="#FFD700" strokeWidth="0.05" fill="none" />
        <path d="M1.2,0.55 L1.2,1.35" stroke="#FFD700" strokeWidth="0.08" />
        <polygon points="1.2,0.38 1.27,0.55 1.45,0.58 1.31,0.70 1.35,0.87 1.2,0.78 1.05,0.87 1.09,0.70 0.95,0.58 1.13,0.55" fill="#FFD700" />
      </svg>
    ),
    PT: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#0A0" />
        <rect width="1.2" height="2" fill="#D00" />
        <circle cx="1.2" cy="1" r="0.3" fill="#FFD700" />
      </svg>
    ),
    BR: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#009B3A" />
        <polygon points="1.5,0.3 2.7,1 1.5,1.7 0.3,1" fill="#FFDF00" />
        <circle cx="1.5" cy="1" r="0.3" fill="#002776" />
      </svg>
    ),
    ZA: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="1" fill="#D00" />
        <rect width="3" height="1" y="1" fill="#00F" />
        <rect width="3" height="0.3" y="0.85" fill="#0A0" />
        <polygon points="0,0 1.2,1 0,2" fill="#000" />
      </svg>
    ),
    GB: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#012169" />
        <path d="M0,0 L3,2 M3,0 L0,2" stroke="#fff" strokeWidth="0.5" />
        <path d="M1.5,0 L1.5,2 M0,1 L3,1" stroke="#fff" strokeWidth="0.5" />
      </svg>
    ),
    US: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#fff" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} width="3" height="0.14" y={i * 0.29} fill="#B22234" />
        ))}
        <rect width="1.1" height="0.7" fill="#3C3B6E" />
      </svg>
    ),
    FR: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="1" height="2" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    ),
    DE: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="0.67" fill="#000" />
        <rect width="3" height="0.67" y="0.67" fill="#DD0000" />
        <rect width="3" height="0.67" y="1.33" fill="#FFCE00" />
      </svg>
    ),
    ES: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="0.67" fill="#AA151B" />
        <rect width="3" height="0.67" y="0.67" fill="#F1BF00" />
        <rect width="3" height="0.67" y="1.33" fill="#AA151B" />
      </svg>
    ),
    IT: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="1" height="2" fill="#009246" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#CE2B37" />
      </svg>
    ),
    CN: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="3" height="2" fill="#DE2910" />
        <polygon points="0.5,0.5 0.55,0.75 0.8,0.78 0.6,0.95 0.65,1.2 0.5,1.05 0.35,1.2 0.4,0.95 0.2,0.78 0.45,0.75" fill="#FFDE00" />
      </svg>
    ),
    NG: (
      <svg width={size} height={Math.round(size * 0.67)} viewBox="0 0 3 2">
        <rect width="1" height="2" fill="#008751" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#008751" />
      </svg>
    ),
  }

  return (
    <div
      style={{
        width: size,
        height: Math.round(size * 0.67),
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        display: 'inline-block',
        flexShrink: 0,
      }}
    >
      {flags[countryCode] || flags['AO']}
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [registrationError, setRegistrationError] = useState(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+244')
  const [nationality, setNationality] = useState('AO')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [selectedInterests, setSelectedInterests] = useState([])

  const { register, refreshUser } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const isEn = language === 'en'
  const isDark = theme === 'dark'
  const navigate = useNavigate()

  useEffect(() => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(Math.min(strength, 5))
  }, [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setRegistrationError(null)

    if (!name || name.trim() === '') {
      toast.error(isEn ? 'Name is required' : 'Nome e obrigatorio')
      return
    }
    if (!email || email.trim() === '') {
      toast.error(isEn ? 'Email is required' : 'Email e obrigatorio')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error(isEn ? 'Invalid email format' : 'Formato de email invalido')
      return
    }
    if (!password || password.length < 6) {
      toast.error(isEn ? 'Password must be at least 6 characters' : 'Senha deve ter pelo menos 6 caracteres')
      return
    }
    if (!confirmPassword || confirmPassword !== password) {
      toast.error(isEn ? 'Passwords do not match' : 'As palavras-passe nao coincidem')
      return
    }
    if (!acceptedTerms) {
      toast.error(isEn ? 'You must accept the terms' : 'Voce deve aceitar os termos')
      return
    }

    setLoading(true)
    try {
      const userData = {
        name,
        email,
        password,
        phone: countryCode + ' ' + phone,
        location,
        nationality,
        bio,
        userType: 'user',
        interests: selectedInterests,
      }

      const result = await register(userData)

      if (result.success) {
        toast.success(isEn ? 'âœ… Account created successfully!' : 'âœ… Conta criada com sucesso!')
        await new Promise((resolve) => setTimeout(resolve, 1500))
        await refreshUser()
        navigate('/perfil')
      } else {
        const errorMsg = result.error || (isEn ? 'Registration failed' : 'Falha ao criar conta')
        setRegistrationError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      console.error('âŒ [Register] Erro:', err)
      const errorMsg = err.message || (isEn ? 'Registration failed' : 'Falha ao criar conta')
      setRegistrationError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthLabel = () => {
    const labels = isEn
      ? ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
      : ['Fraca', 'Fraca', 'Razoavel', 'Boa', 'Forte', 'Excelente']
    return labels[passwordStrength]
  }

  const getPasswordStrengthColor = () => {
    const colors = ['#ef4444', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#22c55e']
    return colors[passwordStrength]
  }

  return (
    <div className="min-h-screen flex bg-[#F7F5F0] dark:bg-[#0D1410]">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* LADO ESQUERDO â€” IMAGEM (so em desktop)     */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#174A3A]">
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80"
          alt="Quedas de Kalandula, Angola"
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
            {/* Fallback */}
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
              {isEn ? 'Join us' : 'Junte-se a nos'}
            </span>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.05] mb-5">
              {isEn
                ? 'Start your journey through Angola today.'
                : 'Comece hoje a sua jornada por Angola.'}
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              {isEn
                ? 'Create a free account to save favorites, book experiences and connect with local businesses.'
                : 'Crie uma conta gratuita para guardar favoritos, reservar experiencias e conectar-se com negocios locais.'}
            </p>
          </div>

          {/* Beneficios */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-6 h-6 rounded-full bg-[#7FC0FA]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-[#7FC0FA]" />
              </div>
              <span className="text-sm">
                {isEn ? 'Save favorite destinations' : 'Guarde destinos favoritos'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-6 h-6 rounded-full bg-[#7FC0FA]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-[#7FC0FA]" />
              </div>
              <span className="text-sm">
                {isEn ? 'Book experiences instantly' : 'Reserve experiencias instantaneamente'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-6 h-6 rounded-full bg-[#7FC0FA]/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-[#7FC0FA]" />
              </div>
              <span className="text-sm">
                {isEn ? 'Connect with local businesses' : 'Conecte-se com negocios locais'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* LADO DIREITO â€” FORMULRIO                   */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        {/* Barra de acoes */}
        <div className="flex items-center justify-between p-6 flex-shrink-0">
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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold uppercase tracking-wider text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/15 transition-colors"
            >
              <Globe size={14} />
              {isEn ? 'EN' : 'PT'}
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#18211D] dark:text-[#F7F5F0] hover:bg-[#7FC0FA]/15 transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="flex-1 flex items-start justify-center px-6 pb-10">
          <div className="w-full max-w-xl">

            {/* Cabecalho */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#18211D] dark:text-[#F7F5F0]">
                {isEn ? 'Create account' : 'Criar conta'}
              </h2>
              <p className="text-sm text-[#66736D] mt-1.5">
                {isEn
                  ? 'Fill in your details to start exploring Angola.'
                  : 'Preencha os seus dados para comecar a explorar Angola.'}
              </p>
            </div>

            {/* Erro */}
            {registrationError && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300 leading-snug">
                  {registrationError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Full name' : 'Nome completo'} *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isEn ? 'John Doe' : 'Joao Silva'}
                    required
                    autoComplete="name"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Email address' : 'Endereco de email'} *
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

              {/* Senhas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                    {isEn ? 'Password' : 'Palavra-passe'} *
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
                      autoComplete="new-password"
                      className="w-full h-12 pl-11 pr-11 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#66736D] hover:text-[#18211D] dark:hover:text-[#F7F5F0] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1 mb-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className="flex-1 rounded-full transition-all"
                            style={{
                              background:
                                level <= passwordStrength
                                  ? getPasswordStrengthColor()
                                  : isDark
                                  ? '#223029'
                                  : '#DDD4C0',
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[#66736D]">
                        <span>{getPasswordStrengthLabel()}</span>
                        <span>{password.length}/6+</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                    {isEn ? 'Confirm' : 'Confirmar'} *
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
                    <input
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      required
                      autoComplete="new-password"
                      className="w-full h-12 pl-11 pr-11 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
                    />
                    {confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {confirmPassword === password ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Nacionalidade */}
              <div>
                <label htmlFor="nationality" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Nationality' : 'Nacionalidade'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                    <FlagIcon countryCode={nationality} size={20} />
                  </div>
                  <select
                    id="nationality"
                    value={nationality}
                    onChange={(e) => {
                      setNationality(e.target.value)
                      const c = countries.find((item) => item.code === e.target.value)
                      if (c) setCountryCode(c.dialCode)
                    }}
                    className="w-full h-12 pl-12 pr-10 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all appearance-none cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.dialCode})
                      </option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#66736D" strokeWidth="2.5" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Phone number' : 'Telefone'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 flex-shrink-0 h-12 px-3 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all appearance-none cursor-pointer"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.dialCode}>{c.dialCode}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="923 000 000"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Provincia */}
              <div>
                <label htmlFor="province" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Province / Location' : 'Provincia / Localizacao'}
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
                  <select
                    id="province"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-12 pl-11 pr-10 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{isEn ? 'Select province...' : 'Selecione a provincia...'}</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#66736D" strokeWidth="2.5" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Bio / About you' : 'Bio / Sobre voce'}
                </label>
                <div className="relative">
                  <Info size={16} className="absolute left-4 top-4 text-[#66736D] pointer-events-none" />
                  <textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={isEn ? 'Tell us a bit about yourself...' : 'Fale um pouco sobre voce...'}
                    maxLength={200}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] text-sm text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none focus:border-[#7FC0FA] focus:ring-4 focus:ring-[#7FC0FA]/15 transition-all resize-none"
                  />
                </div>
                <div className="text-right text-[10px] font-semibold uppercase tracking-wider text-[#66736D] mt-1.5">
                  {bio.length}/200
                </div>
              </div>

              {/* Interesses */}
              <div>
                <label className="block text-sm font-semibold text-[#18211D] dark:text-[#F7F5F0] mb-2">
                  {isEn ? 'Tourism interests' : 'Interesses turisticos'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {tourismInterests.map(({ icon, label, labelEn }) => {
                    const isSelected = selectedInterests.includes(label)
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedInterests(selectedInterests.filter((i) => i !== label))
                          } else if (selectedInterests.length < 6) {
                            setSelectedInterests([...selectedInterests, label])
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#7FC0FA] text-[#174A3A] border-2 border-[#7FC0FA]'
                            : 'bg-white dark:bg-[#17201B] text-[#66736D] border-2 border-[#DDD4C0] dark:border-[#223029] hover:border-[#7FC0FA]'
                        }`}
                      >
                        <span className="mr-1.5">{icon}</span>
                        {isEn ? labelEn : label}
                      </button>
                    )
                  })}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#66736D] mt-2">
                  {isEn
                    ? `Select up to 6 (${selectedInterests.length}/6)`
                    : `Selecione ate 6 (${selectedInterests.length}/6)`}
                </div>
              </div>

              {/* Termos */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#17201B] border border-[#DDD4C0] dark:border-[#223029] cursor-pointer hover:border-[#7FC0FA] transition-colors">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#DDD4C0] dark:border-[#223029] text-[#7FC0FA] focus:ring-[#7FC0FA] focus:ring-offset-0 flex-shrink-0"
                />
                <span className="text-xs leading-relaxed text-[#66736D]">
                  {isEn ? (
                    <>
                      I agree to the{' '}
                      <Link to="/termos" className="font-bold text-[#A94728] hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacidade" className="font-bold text-[#A94728] hover:underline">
                        Privacy Policy
                      </Link>
                    </>
                  ) : (
                    <>
                      Concordo com os{' '}
                      <Link to="/termos" className="font-bold text-[#A94728] hover:underline">
                        Termos de Servico
                      </Link>{' '}
                      e{' '}
                      <Link to="/privacidade" className="font-bold text-[#A94728] hover:underline">
                        Politica de Privacidade
                      </Link>
                    </>
                  )}
                </span>
              </label>

              {/* Botao principal */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-[#A94728] hover:bg-[#8D3B1F] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#A94728]/20"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isEn ? 'Creating account...' : 'A criar conta...'}
                  </>
                ) : (
                  <>
                    {isEn ? 'Create account' : 'Criar conta'}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Link para Login */}
              <p className="text-center text-sm text-[#66736D] pt-2">
                {isEn ? 'Already have an account?' : 'Ja tem uma conta?'}{' '}
                <Link
                  to="/login"
                  className="font-bold text-[#A94728] hover:text-[#8D3B1F] transition-colors"
                >
                  {isEn ? 'Sign in' : 'Entrar'}
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Rodape */}
        <div className="p-6 text-center flex-shrink-0">
          <p className="text-xs text-[#66736D]">
            Â© 2026 Radar RAAVTUR Â· Angola
          </p>
        </div>
      </div>
    </div>
  )
}