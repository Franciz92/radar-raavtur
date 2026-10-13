// src/pages/admin/AdminCompanyDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Globe,
  Star, Calendar, CheckCircle, XCircle, Clock,
  Package, Users, DollarSign, Edit, Trash2,
  ThumbsUp, Camera, Share2, Video, MessageCircle,
  Shield, Award, FileText, AlertCircle, Loader2, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
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
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin text-primary-500 ${sizes[size]}`} />
    </div>
  )
}

// ============================================
// FUNÇO AUXILIAR PARA FORMATAR ENDEREÇO
// ============================================

const formatAddress = (address) => {
  if (!address) return 'Endereço não especificado'
  
  if (typeof address === 'string') return address
  
  const parts = [
    address.street,
    address.city,
    address.province,
    address.country,
    address.postalCode
  ].filter(Boolean)
  
  return parts.length > 0 ? parts.join(', ') : 'Endereço não especificado'
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminCompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({
    destinations: 0,
    services: 0,
    bookings: 0,
    totalRevenue: 0
  })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (id) {
      loadCompany(id)
    } else {
      setError('ID da empresa não fornecido')
      setLoading(false)
    }
  }, [id])

  const loadCompany = async (companyId) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Buscando empresa:', companyId)
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle()

      if (error) {
        console.error('❌ Erro ao buscar empresa:', error)
        setError('Erro ao carregar empresa: ' + error.message)
        setCompany(null)
        setLoading(false)
        return
      }

      if (!data) {
        console.warn('⚠️ Empresa não encontrada com ID:', companyId)
        setError('Empresa não encontrada')
        setCompany(null)
        setLoading(false)
        return
      }

      console.log('✅ Empresa encontrada:', data)
      setCompany(data)
      
      await loadStats(companyId)
      
    } catch (error) {
      console.error('❌ Erro inesperado:', error)
      setError('Erro inesperado ao carregar empresa')
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (companyId) => {
    try {
      console.log('🔍 [loadStats] Buscando serviços para empresa:', companyId)
      
      // 🔥 BUSCAR SERVIÇOS
      const { data: servicesData, error: servError, status } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      console.log('📊 [loadStats] Status da requisição:', status)
      
      if (servError) {
        console.error('❌ Erro ao buscar serviços:', servError)
        console.error('❌ Detalhes do erro:', servError.details)
        console.error('❌ Mensagem do erro:', servError.message)
      }

      console.log('📊 [loadStats] Dados brutos dos serviços:', JSON.stringify(servicesData, null, 2))
      console.log('📊 [loadStats] Quantidade de serviços:', servicesData?.length || 0)

      // 🔥 ATUALIZAR O ESTADO COM OS DADOS (mesmo que vazio)
      setServices(servicesData || [])
      
      // 🔥 ATUALIZAR ESTATÍSTICAS
      setStats(prev => ({
        ...prev,
        services: servicesData?.length || 0
      }))
      
      // Contar destinos
      try {
        const { count: destinationsCount, error: destError } = await supabase
          .from('destinations')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)

        if (destError) console.error('Erro ao contar destinos:', destError)
        
        setStats(prev => ({
          ...prev,
          destinations: destinationsCount || 0
        }))
      } catch (destError) {
        console.error('Erro ao contar destinos:', destError)
      }

      // Contar reservas
      try {
        const { count: bookingsCount, error: bookError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)

        if (bookError) console.error('Erro ao contar reservas:', bookError)
        
        setStats(prev => ({
          ...prev,
          bookings: bookingsCount || 0
        }))
      } catch (bookError) {
        console.error('Erro ao contar reservas:', bookError)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
    }
  }

  // 🔥 FUNÇO DE FORÇAR RECARGA
  const forceReload = async () => {
    if (!id) return
    setRefreshing(true)
    try {
      // Buscar serviços diretamente
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Erro ao forçar recarga:', error)
        toast.error('Erro ao recarregar serviços')
      } else {
        console.log('✅ Serviços recarregados:', data?.length || 0)
        setServices(data || [])
        setStats(prev => ({ ...prev, services: data?.length || 0 }))
        toast.success(`${data?.length || 0} serviços carregados!`)
      }
    } catch (error) {
      console.error('❌ Erro:', error)
      toast.error('Erro ao recarregar')
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejeitada</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  const getServiceStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejeitado</Badge>
      default:
        return <Badge variant="default">Desconhecido</Badge>
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (value) => {
    if (!value || value === 0) return '0 Kz'
    return `${Number(value).toLocaleString()} Kz`
  }

  // ============================================
  // AÇÕES
  // ============================================

  const handleApprove = async () => {
    if (!company) return
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)

      if (error) throw error

      toast.success('✅ Empresa aprovada com sucesso!')
      loadCompany(company.id)
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error)
      toast.error('Erro ao aprovar empresa')
    }
  }

  const handleReject = async () => {
    if (!company) return
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)

      if (error) throw error

      toast.success('Empresa rejeitada')
      loadCompany(company.id)
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error)
      toast.error('Erro ao rejeitar empresa')
    }
  }

  const handleDelete = async () => {
    if (!company) return
    if (!confirm(`Tem certeza que deseja excluir a empresa "${company.name}"? Esta ação não pode ser desfeita.`)) return

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id)

      if (error) throw error

      toast.success('Empresa excluída com sucesso!')
      navigate('/admin/empresas')
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast.error('Erro ao excluir empresa')
    }
  }

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Carregando empresa...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🏢</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Empresa não encontrada
        </h2>
        <p className="text-gray-500 mt-2">
          {error || 'A empresa que você está procurando não existe ou foi removida.'}
        </p>
        <Button
          className="mt-6"
          onClick={() => navigate('/admin/empresas')}
        >
          <ArrowLeft size={18} />
          Voltar para empresas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/empresas')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-sm text-gray-500">{company.category || 'Empresa'}</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              {getStatusBadge(company.status || 'pending')}
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-sm text-gray-500">
                Criado em {formatDate(company.created_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={forceReload} 
            disabled={refreshing}
          >
            {refreshing ? 'Recarregando...' : 'Forçar Recarga'}
          </Button>
          <Button variant="secondary" icon={Edit} onClick={() => toast.info('Edição de empresas em breve')}>
            Editar
          </Button>
          {company.status === 'pending' && (
            <>
              <Button variant="success" icon={CheckCircle} onClick={handleApprove}>
                Aprovar
              </Button>
              <Button variant="danger" icon={XCircle} onClick={handleReject}>
                Rejeitar
              </Button>
            </>
          )}
          <Button variant="danger" icon={Trash2} onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { key: 'overview', label: 'Visão Geral', icon: Building2 },
          { key: 'services', label: 'Serviços', icon: Package },
          { key: 'bookings', label: 'Reservas', icon: Calendar },
          { key: 'reviews', label: 'Avaliações', icon: Star },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Esquerda - Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 mx-auto flex items-center justify-center">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 size={40} className="text-gray-400" />
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                <p className="text-sm text-gray-500">{company.category || 'Empresa'}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                {company.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="break-all">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Globe size={16} className="text-gray-400 flex-shrink-0" />
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary-500 hover:underline break-all"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                
                {company.address && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                    <span>{formatAddress(company.address)}</span>
                  </div>
                )}
                
                {company.nif && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                    <span>NIF: {company.nif}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estatísticas */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-blue-600">{stats.destinations}</p>
                <p className="text-sm text-gray-500">Destinos</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-green-600">{stats.services}</p>
                <p className="text-sm text-gray-500">Serviços</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-yellow-600">{stats.bookings}</p>
                <p className="text-sm text-gray-500">Reservas</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500">Receita Total</p>
              </div>
            </div>

            {/* Descrição */}
            {company.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sobre a Empresa</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}

            {/* Status */}
            {company.status === 'approved' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Empresa Aprovada</p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Aprovada em {formatDate(company.approved_at)}
                  </p>
                </div>
              </div>
            )}

            {company.status === 'pending' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 flex items-center gap-3">
                <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Aguardando Aprovação</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Empresa aguarda análise do administrador
                  </p>
                </div>
              </div>
            )}

            {company.status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3">
                <XCircle size={20} className="text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Empresa Rejeitada</p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Esta empresa não foi aprovada
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 ABA DE SERVIÇOS - VERSO FINAL */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Serviços</h3>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{services?.length || 0} serviços</Badge>
              <button
                onClick={forceReload}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="Recarregar serviços"
              >
                <RefreshCw size={16} className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {!services || services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p>Esta empresa ainda não adicionou serviços.</p>
              <p className="text-xs mt-2 text-gray-400">
                Clique em "Forçar Recarga" para verificar novamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {service.icon && (
                        <span className="text-xl">{service.icon}</span>
                      )}
                      <p className="font-medium text-gray-900 dark:text-white">
                        {service.title || 'Serviço sem nome'}
                      </p>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    )}
                    {service.items && service.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.items.map((item, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {service.color && (
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: service.color }}
                      />
                    )}
                    {getServiceStatusBadge(service.status || 'pending')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reservas</h3>
            <Badge variant="primary">{stats.bookings} reservas</Badge>
          </div>
          {stats.bookings === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p>Esta empresa ainda não tem reservas registadas.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p>Carregando reservas...</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avaliações</h3>
            <Badge variant="primary">0 avaliações</Badge>
          </div>
          <div className="text-center py-8 text-gray-500">
            <Star size={32} className="mx-auto mb-2 opacity-30" />
            <p>Esta empresa ainda não tem avaliações.</p>
          </div>
        </div>
      )}
    </div>
  )
}