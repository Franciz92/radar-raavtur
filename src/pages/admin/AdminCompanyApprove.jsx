import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle,
  Building2, Mail, Phone, MapPin, Globe, FileText,
  Shield, Award, Clock, User, Calendar
} from 'lucide-react'
import Button from '../../components/Button'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

// Mock data
const mockCompany = {
  id: 'comp_2',
  name: 'EcoAngola Adventures',
  email: 'info@ecoangola.ao',
  phone: '+244 945 222 333',
  website: 'www.ecoangola.ao',
  description: 'Agência focada em ecoturismo e aventura. Descubra as maravilhas naturais de Angola de forma sustentável. Oferecemos trilhas, safaris e experiências únicas na natureza.',
  category: 'Operadora turística',
  nif: '5007654321',
  status: 'pending',
  logo: null,
  createdAt: '2025-02-10T09:00:00Z',
  address: {
    street: 'Rua da Natureza, 45',
    city: 'Lubango',
    province: 'Huíla',
    postalCode: '0000',
    country: 'Angola',
  },
  socialMedia: {
    facebook: 'https://facebook.com/ecoangola',
    instagram: 'https://instagram.com/ecoangola',
    twitter: null,
    linkedin: null,
    youtube: null,
    whatsapp: '+244 945 222 333',
  },
  workingHours: {
    monday: { open: '08:00', close: '17:00' },
    tuesday: { open: '08:00', close: '17:00' },
    wednesday: { open: '08:00', close: '17:00' },
    thursday: { open: '08:00', close: '17:00' },
    friday: { open: '08:00', close: '17:00' },
    saturday: { open: '09:00', close: '13:00' },
    sunday: { open: null, close: null },
  },
}

export default function AdminCompanyApprove() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [notes, setNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setCompany(mockCompany)
      setLoading(false)
    }, 500)
  }, [id])

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      // Mock - substituir por API real
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Empresa aprovada com sucesso!')
      navigate('/admin/empresas')
    } catch (error) {
      toast.error('Erro ao aprovar empresa')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Adicione um motivo para a rejeição')
      return
    }
    setActionLoading(true)
    try {
      // Mock - substituir por API real
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Empresa rejeitada')
      navigate('/admin/empresas')
    } catch (error) {
      toast.error('Erro ao rejeitar empresa')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container-custom py-12 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Empresa não encontrada</h2>
        <p className="text-gray-500">A empresa que você procura não existe.</p>
        <Button className="mt-4" onClick={() => navigate('/admin/empresas')}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/empresas')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Aprovar Empresa
          </h1>
          <p className="text-sm text-gray-500">
            Revise os dados da empresa antes de aprovar ou rejeitar
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info da Empresa */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={32} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
                <p className="text-sm text-gray-500">{company.category}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-gray-500">{company.email}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{company.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-gray-400 mb-3">Descrição</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Endereço */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-gray-400 mb-3">Endereço</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>{company.address?.street}</p>
              <p>{company.address?.city}, {company.address?.province}</p>
              <p>{company.address?.country}</p>
            </div>
          </div>

          {/* Horário */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-gray-400 mb-3">Horário de Funcionamento</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(company.workingHours).map(([day, hours]) => {
                const dayNames = {
                  monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
                  thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado',
                  sunday: 'Domingo'
                }
                return (
                  <div key={day} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">{dayNames[day]}</span>
                    <span className="font-medium">
                      {hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Fechado'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Redes Sociais */}
          {company.socialMedia && Object.values(company.socialMedia).some(v => v) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase text-gray-400 mb-3">Redes Sociais</h3>
              <div className="space-y-2 text-sm">
                {company.socialMedia.facebook && (
                  <p><span className="text-gray-500">Facebook:</span> {company.socialMedia.facebook}</p>
                )}
                {company.socialMedia.instagram && (
                  <p><span className="text-gray-500">Instagram:</span> {company.socialMedia.instagram}</p>
                )}
                {company.socialMedia.whatsapp && (
                  <p><span className="text-gray-500">WhatsApp:</span> {company.socialMedia.whatsapp}</p>
                )}
              </div>
            </div>
          )}

          {/* Data de Registo */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-gray-400 mb-3">Registo</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Calendar size={16} className="text-gray-400" />
              <span>Criado em {formatDate(company.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Ações */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-20">
            <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4">Ações</h3>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Clock size={18} />
                  <span className="font-medium">Pendente</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Esta empresa aguarda sua análise
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notas (para rejeição)
                </label>
                <textarea
                  className="input-field h-24"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Motivo da rejeição..."
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  icon={CheckCircle}
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processando...' : 'Aprovar Empresa'}
                </Button>
                <Button
                  variant="danger"
                  icon={XCircle}
                  className="w-full"
                  onClick={handleReject}
                  disabled={actionLoading || !notes.trim()}
                >
                  {actionLoading ? 'Processando...' : 'Rejeitar'}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/admin/empresas')}
                >
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}