import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2, Mail, Phone, MapPin, Globe, 
  ArrowLeft, Edit, Save, Camera, X
} from 'lucide-react'
import { useCompany } from '../../context/CompanyContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ===== COMPONENTES INTERNOS =====
const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
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

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

export default function CompanyProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { company, updateCompany, loading } = useCompany()
  const [isEditing, setIsEditing] = useState(false)

  const mockCompany = {
    name: 'Angola Travel Experts',
    email: 'contact@angolatravelexperts.ao',
    phone: '+244 923 456 789',
    website: 'www.angolatravelexperts.ao',
    description: 'Agência de viagens premium especializada em roteiros personalizados por Angola.',
    category: 'Agência de viagens',
    nif: '5001234567',
    status: 'approved',
    rating: 4.6,
    totalReviews: 145,
  }

  const companyData = company || mockCompany

  const [form, setForm] = useState({
    name: companyData.name || '',
    email: companyData.email || user?.email || '',
    phone: companyData.phone || '',
    website: companyData.website || '',
    description: companyData.description || '',
    category: companyData.category || '',
    nif: companyData.nif || '',
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await updateCompany(form)
    if (result) {
      setIsEditing(false)
      toast.success('Perfil atualizado!')
    }
  }

  const isApproved = companyData.status === 'approved'

  return (
    <div className="container-custom py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/empresa/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil da Empresa</h1>
        </div>
        {!isEditing ? (
          <Button icon={Edit} onClick={() => setIsEditing(true)} variant="secondary">
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button icon={Save} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mb-6">
        <Badge variant={isApproved ? 'success' : 'warning'}>
          {isApproved ? '✅ Empresa Aprovada' : '⏳ Aguardando Aprovação'}
        </Badge>
      </div>

      {/* Conteúdo */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Building2 size={32} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{form.name}</h2>
                <p className="text-sm text-gray-500">{form.category}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                {isEditing ? (
                  <input className="input-field flex-1" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
                ) : (
                  <span>{form.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                {isEditing ? (
                  <input className="input-field flex-1" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                ) : (
                  <span>{form.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-gray-400" />
                {isEditing ? (
                  <input className="input-field flex-1" value={form.website} onChange={(e) => handleChange('website', e.target.value)} />
                ) : (
                  <span>{form.website}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400" />
                <span>NIF: {form.nif}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            {isEditing ? (
              <textarea
                className="input-field h-32"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            ) : (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {form.description || 'Nenhuma descrição disponível.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}