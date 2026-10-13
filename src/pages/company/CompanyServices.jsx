// src/pages/company/CompanyServices.jsx
// ============================================
// LISTA DE SERVIÇOS - CORRIGIDO
// - Botão Editar sempre visível
// - Logotipo do serviço em vez de ícone
// - Badge "Dono" 
// ============================================

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search, 
  Package, 
  ArrowLeft,
  Loader2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  Star
} from 'lucide-react'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES REUTILIZÁVEIS
// ============================================

const Button = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  className = '', 
  onClick,
  disabled = false,
  loading = false,
  size = 'sm',
  title
}) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300',
    amber: 'bg-amber-500 text-white hover:bg-amber-600 disabled:bg-amber-300',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
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
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    featured: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

const StatusBadge = ({ status }) => {
  const statusMap = {
    approved: { label: 'Aprovado', variant: 'success', icon: CheckCircle },
    pending: { label: 'Pendente', variant: 'warning', icon: Clock },
    rejected: { label: 'Rejeitado', variant: 'danger', icon: XCircle },
    active: { label: 'Ativo', variant: 'success', icon: CheckCircle },
    inactive: { label: 'Inativo', variant: 'default', icon: AlertCircle },
  }
  
  const info = statusMap[status] || statusMap.pending
  const Icon = info.icon
  
  return (
    <Badge variant={info.variant}>
      <Icon size={12} />
      {info.label}
    </Badge>
  )
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CompanyServices() {
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  const { user } = useAuth()
  const { 
    company, 
    services = [], 
    loading: companyLoading,
    refreshData,
    deleteService
  } = useCompany()
  
  const [localServices, setLocalServices] = useState([])
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Atualizar serviços locais quando os serviços do contexto mudarem
  useEffect(() => {
    console.log('📊 [CompanyServices] Serviços do contexto:', services)
    setLocalServices(services || [])
    setLoading(false)
  }, [services])

  // ============================================
  // VERIFICAR SE É PROPRIETÁRIO
  // ============================================
  const isOwner = company?.user_id === user?.id

  // ============================================
  // FUNÇO: Atualizar dados
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
      toast.success(isEn ? 'Services updated!' : 'Serviços atualizados!')
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error)
      toast.error(isEn ? 'Error updating services' : 'Erro ao atualizar serviços')
    } finally {
      setRefreshing(false)
    }
  }

  // ============================================
  // FUNÇO: Editar serviço
  // ============================================
  const handleEdit = (serviceId) => {
    if (!isOwner) {
      toast.error(isEn ? 'Only the owner can edit' : 'Apenas o proprietário pode editar')
      return
    }
    console.log('✏️ [CompanyServices] Editando serviço:', serviceId)
    navigate(`/empresa/servicos/editar/${serviceId}`)
  }

  // ============================================
  // FUNÇO: Excluir serviço
  // ============================================
  const handleDelete = async (id) => {
    console.log('🗑️ [CompanyServices] Tentando excluir serviço:', id)
    
    if (!isOwner) {
      toast.error(isEn ? 'Only the owner can delete' : 'Apenas o proprietário pode excluir')
      return
    }
    
    if (deletingId) {
      console.log('⏳ [CompanyServices] Já está excluindo outro serviço')
      return
    }
    
    if (!confirm(isEn ? 'Are you sure you want to delete this service?' : 'Tem certeza que deseja excluir este serviço?')) {
      return
    }
    
    setDeletingId(id)
    
    try {
      const result = await deleteService(id)
      console.log('📊 [CompanyServices] Resultado da exclusão:', result)
      
      if (result) {
        toast.success(isEn ? 'Service deleted successfully!' : 'Serviço excluído com sucesso!')
        setLocalServices(prev => prev.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('❌ [CompanyServices] Erro ao excluir:', error)
      toast.error(error.message || (isEn ? 'Error deleting service' : 'Erro ao excluir serviço'))
    } finally {
      setDeletingId(null)
    }
  }

  // ============================================
  // FILTROS
  // ============================================
  const filtered = (localServices || []).filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                         s.category?.toLowerCase().includes(search.toLowerCase()) ||
                         s.description?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: localServices.length,
    approved: localServices.filter(s => s.status === 'approved' || s.status === 'active').length,
    pending: localServices.filter(s => s.status === 'pending').length,
    rejected: localServices.filter(s => s.status === 'rejected').length,
  }

  if (loading || companyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading services...' : 'Carregando serviços...'}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/empresa/dashboard" 
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={28} className="text-primary-500" />
              {isEn ? 'My Services' : 'Meus Serviços'}
              {isOwner && (
                <span className="text-xs font-normal text-amber-600 dark:text-amber-400 flex items-center gap-1 ml-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                  <Lock size={12} />
                  {isEn ? 'Owner' : 'Dono'}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company?.name || 'Sua empresa'} • {isEn ? `Total: ${stats.total} services` : `Total: ${stats.total} serviços`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={handleRefresh}
            disabled={refreshing}
            loading={refreshing}
          >
            {isEn ? 'Refresh' : 'Atualizar'}
          </Button>
          {isOwner && (
            <Link to="/empresa/servicos/novo">
              <Button icon={PlusCircle} size="md">
                {isEn ? 'New Service' : 'Novo Serviço'}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Active' : 'Ativos'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Rejected' : 'Rejeitados'}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder={isEn ? 'Search services...' : 'Pesquisar serviços...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
            <option value="approved">{isEn ? 'Active' : 'Ativos'}</option>
            <option value="pending">{isEn ? 'Pending' : 'Pendentes'}</option>
            <option value="rejected">{isEn ? 'Rejected' : 'Rejeitados'}</option>
          </select>
        </div>
      </div>

      {/* Lista de Serviços */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {search || filterStatus !== 'all' 
              ? (isEn ? 'No services match your filters' : 'Nenhum serviço corresponde aos filtros')
              : (isEn ? 'No services created yet' : 'Nenhum serviço criado ainda')
            }
          </p>
          {search || filterStatus !== 'all' ? (
            <button
              onClick={() => {
                setSearch('')
                setFilterStatus('all')
              }}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 transition"
            >
              {isEn ? 'Clear filters' : 'Limpar filtros'}
            </button>
          ) : (
            isOwner && (
              <Link 
                to="/empresa/servicos/novo"
                className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition"
              >
                <PlusCircle size={18} />
                {isEn ? 'Create your first service' : 'Crie seu primeiro serviço'}
              </Link>
            )
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((service) => (
            <div 
              key={service.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex flex-wrap items-center justify-between gap-4 group"
            >
              {/* Informações do serviço */}
              <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                {/* ✅ LOGOTIPO DO SERVIÇO */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {service.logo_url ? (
                    <img 
                      src={service.logo_url} 
                      alt={service.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={28} className="text-primary-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {service.name}
                    </h3>
                    <StatusBadge status={service.status} />
                    
                    {/* ✅ Badge "Dono" */}
                    {isOwner && (
                      <Badge variant="owner">
                        <Lock size={10} />
                        {isEn ? 'Owner' : 'Dono'}
                      </Badge>
                    )}
                    
                    {/* ✅ Badge "Destaque" */}
                    {service.featured && (
                      <Badge variant="featured">
                        <Star size={10} />
                        {isEn ? 'Featured' : 'Destaque'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{service.category || '-'}</span>
                    {service.price && (
                      <span className="font-semibold text-primary-500">
                        {formatCurrency(service.price)}
                      </span>
                    )}
                    {service.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {service.duration} min
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>

              {/* ✅ Ações - Editar SEMPRE visível para o dono */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/empresa/servicos/${service.id}`}>
                  <Button variant="secondary" icon={Eye} size="sm">
                    {isEn ? 'View' : 'Ver'}
                  </Button>
                </Link>
                
                {/* ✅ Botão Editar - SEMPRE visível para o dono */}
                {isOwner && (
                  <Button 
                    variant="amber"
                    icon={Edit}
                    size="sm"
                    onClick={() => handleEdit(service.id)}
                    title={isEn ? 'Edit service' : 'Editar serviço'}
                  >
                    {isEn ? 'Edit' : 'Editar'}
                  </Button>
                )}
                
                {/* ✅ Botão Excluir - SEMPRE visível para o dono */}
                {isOwner && (
                  <Button 
                    variant="ghost" 
                    icon={deletingId === service.id ? Loader2 : Trash2}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleDelete(service.id)}
                    disabled={deletingId === service.id}
                    loading={deletingId === service.id}
                    size="sm"
                    title={isEn ? 'Delete service' : 'Eliminar serviço'}
                  >
                    {deletingId === service.id 
                      ? (isEn ? 'Deleting...' : 'Excluindo...') 
                      : (isEn ? 'Delete' : 'Excluir')
                    }
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        {isEn 
          ? `Showing ${filtered.length} of ${localServices.length} services`
          : `Mostrando ${filtered.length} de ${localServices.length} serviços`
        }
        {stats.pending > 0 && (
          <span className="ml-2 text-yellow-600 dark:text-yellow-400">
            • {stats.pending} {isEn ? 'pending' : 'pendentes'}
          </span>
        )}
      </div>
    </div>
  )
}