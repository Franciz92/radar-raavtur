// src/pages/admin/AdminServices.jsx

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  DollarSign,
  Building2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const StatusBadge = ({ status, isEn }) => {
  const statusMap = {
    pending: { label: isEn ? 'Pending' : 'Pendente', variant: 'warning' },
    approved: { label: isEn ? 'Approved' : 'Aprovado', variant: 'success' },
    rejected: { label: isEn ? 'Rejected' : 'Rejeitado', variant: 'danger' },
    active: { label: isEn ? 'Active' : 'Ativo', variant: 'success' },
    inactive: { label: isEn ? 'Inactive' : 'Inativo', variant: 'default' }
  }
  
  const info = statusMap[status] || statusMap.pending
  
  const variants = {
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[info.variant]}`}>
      {info.label}
    </span>
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
// MODAL DE CRIAÇO DE SERVIÇO
// ============================================

const ServiceFormModal = ({ isOpen, onClose, onSuccess, isEn }) => {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [form, setForm] = useState({
    company_id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'pending'
  })

  useEffect(() => {
    if (isOpen) {
      loadCompanies()
    }
  }, [isOpen])

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.company_id || !form.name) {
      toast.error(isEn ? 'Company and name are required' : 'Empresa e nome são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const serviceData = {
        company_id: form.company_id,
        name: form.name.trim(),
        description: form.description?.trim() || '',
        price: parseFloat(form.price) || 0,
        category: form.category?.trim() || '',
        status: form.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('company_services')
        .insert([serviceData])
        .select()
        .single()

      if (error) throw error

      toast.success(isEn ? 'Service created successfully!' : 'Serviço criado com sucesso!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
      toast.error(error.message || isEn ? 'Error creating service' : 'Erro ao criar serviço')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'New Service' : 'Novo Serviço'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Company' : 'Empresa'} *
            </label>
            <select
              value={form.company_id}
              onChange={(e) => setForm(prev => ({ ...prev, company_id: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            >
              <option value="">{isEn ? 'Select a company...' : 'Selecione uma empresa...'}</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Nome do Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Service Name' : 'Nome do Serviço'} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={isEn ? 'Ex: Tour Histórico' : 'Ex: Tour Histórico'}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Description' : 'Descrição'}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder={isEn ? 'Describe the service...' : 'Descreva o serviço...'}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Price' : 'Preço'} (AOA)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Category' : 'Categoria'}
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder={isEn ? 'Ex: Turismo' : 'Ex: Turismo'}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Status' : 'Status'}
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            >
              <option value="pending">{isEn ? 'Pending' : 'Pendente'}</option>
              <option value="approved">{isEn ? 'Approved' : 'Aprovado'}</option>
              <option value="active">{isEn ? 'Active' : 'Ativo'}</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? (isEn ? 'Saving...' : 'Salvando...') : (isEn ? 'Save Service' : 'Salvar Serviço')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminServices() {
  const { isEn } = useLanguage()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [approvingAll, setApprovingAll] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)

  useEffect(() => {
    loadServices()
  }, [])

  // ============================================
  // FUNÇO LOAD SERVICES
  // ============================================
  const loadServices = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando serviços para admin...')
      
      const { data: servicesData, error: servicesError } = await supabase
        .from('company_services')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (servicesError) {
        console.error('❌ Erro ao buscar serviços:', servicesError)
        throw servicesError
      }
      
      console.log('✅ Serviços encontrados:', servicesData?.length || 0)

      if (servicesData && servicesData.length > 0) {
        const companyIds = [...new Set(servicesData.map(s => s.company_id).filter(Boolean))]
        
        let companyMap = {}
        if (companyIds.length > 0) {
          const { data: companiesData, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, logo, user_id')
            .in('id', companyIds)
          
          if (!companiesError && companiesData) {
            companyMap = companiesData.reduce((acc, c) => {
              acc[c.id] = c
              return acc
            }, {})
            console.log('🏢 Empresas encontradas:', Object.keys(companyMap).length)
          }
        }
        
        const servicesWithCompanies = servicesData.map(service => ({
          ...service,
          companies: companyMap[service.company_id] || null
        }))
        
        setServices(servicesWithCompanies)
        console.log('✅ Serviços com empresas combinados:', servicesWithCompanies.length)
      } else {
        setServices([])
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error)
      toast.error(isEn ? 'Error loading services' : 'Erro ao carregar serviços')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadServices()
    setRefreshing(false)
    toast.success(isEn ? 'Services updated!' : 'Serviços atualizados!')
  }

  const updateStatus = async (serviceId, newStatus) => {
    try {
      const { error } = await supabase
        .from('company_services')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
      
      if (error) throw error
      
      setServices(prev => 
        prev.map(s => s.id === serviceId ? { ...s, status: newStatus } : s)
      )
      
      toast.success(
        isEn 
          ? `Service ${newStatus} successfully`
          : `Serviço ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`
      )
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error)
      toast.error(isEn ? 'Error updating status' : 'Erro ao atualizar status')
    }
  }

  const handleDelete = async (serviceId) => {
    if (!confirm(isEn ? 'Are you sure you want to delete this service?' : 'Tem certeza que deseja excluir este serviço?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('company_services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error

      setServices(prev => prev.filter(s => s.id !== serviceId))
      toast.success(isEn ? 'Service deleted successfully!' : 'Serviço excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir serviço:', error)
      toast.error(isEn ? 'Error deleting service' : 'Erro ao excluir serviço')
    }
  }

  // ============================================
  // APROVAR TODOS OS SERVIÇOS PENDENTES
  // ============================================
  const approveAllPending = async () => {
    const pendingServices = services.filter(s => s.status === 'pending')
    
    if (pendingServices.length === 0) {
      toast.info(isEn ? 'No pending services to approve' : 'Nenhum serviço pendente para aprovar')
      return
    }

    if (!confirm(
      isEn 
        ? `Are you sure you want to approve all ${pendingServices.length} pending services?`
        : `Tem certeza que deseja aprovar todos os ${pendingServices.length} serviços pendentes?`
    )) {
      return
    }

    setApprovingAll(true)
    try {
      const { error } = await supabase
        .from('company_services')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('status', 'pending')
      
      if (error) throw error
      
      setServices(prev => 
        prev.map(s => s.status === 'pending' ? { ...s, status: 'approved' } : s)
      )
      
      toast.success(
        isEn 
          ? `All ${pendingServices.length} services approved successfully!`
          : `Todos os ${pendingServices.length} serviços aprovados com sucesso!`
      )
    } catch (error) {
      console.error('❌ Erro ao aprovar todos:', error)
      toast.error(isEn ? 'Error approving services' : 'Erro ao aprovar serviços')
    } finally {
      setApprovingAll(false)
    }
  }

  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === 'pending').length,
    approved: services.filter(s => s.status === 'approved').length,
    rejected: services.filter(s => s.status === 'rejected').length,
    active: services.filter(s => s.status === 'active').length
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={28} className="text-primary-500" />
            {isEn ? 'Services' : 'Serviços'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage all services (${stats.total})`
              : `Gerencie todos os serviços (${stats.total})`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center gap-2"
          >
            <Plus size={18} />
            {isEn ? 'New Service' : 'Novo Serviço'}
          </button>
          {stats.pending > 0 && (
            <button
              onClick={approveAllPending}
              disabled={approvingAll}
              className="px-3 py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
            >
              {approvingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              {isEn 
                ? `Approve All (${stats.pending})`
                : `Aprovar Todos (${stats.pending})`
              }
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Active' : 'Ativos'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Approved' : 'Aprovados'}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.approved}</p>
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
            placeholder={isEn ? 'Search services...' : 'Pesquisar serviços...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
            <option value="pending">{isEn ? 'Pending' : 'Pendentes'}</option>
            <option value="approved">{isEn ? 'Approved' : 'Aprovados'}</option>
            <option value="active">{isEn ? 'Active' : 'Ativos'}</option>
            <option value="rejected">{isEn ? 'Rejected' : 'Rejeitados'}</option>
          </select>
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Serviços */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No services found' : 'Nenhum serviço encontrado'}
          </p>
          {searchTerm || filterStatus !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 transition"
            >
              {isEn ? 'Clear filters' : 'Limpar filtros'}
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition inline-flex items-center gap-2"
            >
              <Plus size={18} />
              {isEn ? 'Create first service' : 'Criar primeiro serviço'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Service' : 'Serviço'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Company' : 'Empresa'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Price' : 'Preço'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Status' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Actions' : 'Ações'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{service.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {service.companies?.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(service.price)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={service.status} isEn={isEn} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/servicos/${service.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title={isEn ? 'View details' : 'Ver detalhes'}
                        >
                          <Eye size={18} />
                        </Link>
                        {service.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(service.id, 'active')}
                              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                              title={isEn ? 'Approve' : 'Aprovar'}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => updateStatus(service.id, 'rejected')}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              title={isEn ? 'Reject' : 'Rejeitar'}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title={isEn ? 'Delete' : 'Excluir'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {isEn 
                ? `Showing ${filteredServices.length} of ${services.length} services`
                : `Mostrando ${filteredServices.length} de ${services.length} serviços`
              }
            </span>
            {stats.pending > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                {stats.pending} {isEn ? 'pending' : 'pendentes'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      <ServiceFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadServices}
        isEn={isEn}
      />
    </div>
  )
}