import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

const Input = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, required, className = '' }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${Icon ? 'pl-10' : ''} ${className}`}
        />
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Digite seu email')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSent(true)
      toast.success('Email de recuperação enviado!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error.message || 'Erro ao enviar email de recuperação')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="container-custom flex min-h-[80vh] items-center justify-center py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Enviado!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Enviamos um link de recuperação para <strong>{email}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>
          <Link to="/login">
            <Button icon={ArrowLeft}>Voltar para o Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recuperar Senha
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Enviar Link de Recuperação
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-500 hover:text-primary-600">
              ← Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}