// src/pages/admin/AdminServiceDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  DollarSign,
  Building2,
  User,
  Mail,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Star,
  RefreshCw,
  Phone,
  MapPin,
  Globe
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  
  const [service, setService] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadService()
  }, [id])

  // ============================================
  // FUNÇO LOAD SERVICE - CORRIGIDA (SEM JOINS)
  // ============================================
  const loadService = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando serviço para admin:', id)
      
      // 1. Buscar o serviço
      const { data: serviceData, error: serviceError } = await supabase
        .from('company_services')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (serviceError) {
        console.error('❌ Erro ao buscar serviço:', serviceError)
        throw serviceError
      }
      
      if (!serviceData) {
        console.warn('⚠️ Serviço não encontrado')
        toast.error(isEn ? 'Service not found' : 'Serviço não encontrado')
        navigate('/admin/servicos')
        return
      }
      
      console.log('✅ Serviço encontrado:', serviceData.name)
      setService(serviceData)

      // 2. Buscar a empresa separadamente
      if (serviceData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name, logo, email, phone, user_id, description, address, website')
          .eq('id', serviceData.company_id)
          .maybeSingle()
        
        if (!companyError && companyData) {
          console.log('🏢 Empresa encontrada:', companyData.name)
          setCompany(companyData)
        } else {
          console.warn('⚠️ Empresa não encontrada para ID:', serviceData.company_id)
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar serviço:', error)
      toast.error(error.message || (isEn ? 'Error loading service' : 'Erro ao carregar serviço'))
      navigate('/admin/servicos')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus) => {
    if (updating) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('company_services')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      setService(prev => ({ ...prev, status: newStatus }))
      
      toast.success(
        isEn 
          ? `Service ${newStatus} successfully`
          : `Serviço ${newStatus === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`
      )
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error)
      toast.error(error.message || (isEn ? 'Error updating status' : 'Erro ao atualizar status'))
    } finally {
      setUpdating(false)
    }
  }

  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { label: isEn ? 'Pending' : 'Pendente', variant: 'warning', icon: Clock },
      approved: { label: isEn ? 'Approved' : 'Aprovado', variant: 'success', icon: CheckCircle },
      rejected: { label: isEn ? 'Rejected' : 'Rejeitado', variant: 'danger', icon: XCircle },
      active: { label: isEn ? 'Active' : 'Ativo', variant: 'success', icon: CheckCircle },
      inactive: { label: isEn ? 'Inactive' : 'Inativo', variant: 'default', icon: Clock }
    }
    
    const info = statusMap[status] || statusMap.pending
    const Icon = info.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
        ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
        ${info.variant === 'default' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
      `}>
        <Icon size={14} />
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading service...' : 'Carregando serviço...'}
        </p>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Service not found' : 'Serviço não encontrado'}
        </p>
        <Link to="/admin/servicos" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to services' : 'Voltar para serviços'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/servicos" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {service.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">#{service.id.slice(0, 8)}</span>
            <StatusBadge status={service.status} />
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <span className="sr-only">Print</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Serviço */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              {isEn ? 'Service Information' : 'Informações do Serviço'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Name' : 'Nome'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Category' : 'Categoria'}</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{service.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Price' : 'Preço'}</p>
                <p className="font-bold text-primary-500">{formatCurrency(service.price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Currency' : 'Moeda'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{service.currency || 'Kz'}</p>
              </div>
              {service.duration && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Duration' : 'Duração'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{service.duration}</p>
                </div>
              )}
              {service.location && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Location' : 'Localização'}</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {service.location}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Created' : 'Criado'}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(service.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {service.description && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Description' : 'Descrição'}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{service.description}</p>
              </div>
            )}
          </div>

          {/* Características */}
          {service.features && service.features.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star size={20} className="text-primary-500" />
                {isEn ? 'Features' : 'Características'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Empresa */}
          {company && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-primary-500" />
                {isEn ? 'Company' : 'Empresa'}
              </h3>
              <div className="flex items-start gap-3">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-12 h-12 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Building2 size={24} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                  {company.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail size={14} />
                      {company.email}
                    </p>
                  )}
                  {company.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone size={14} />
                      {company.phone}
                    </p>
                  )}
                </div>
              </div>
              {company.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {company.description}
                </p>
              )}
              {company.address && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {typeof company.address === 'string' 
                    ? company.address 
                    : JSON.stringify(company.address)}
                </p>
              )}
              <Link
                to={`/admin/empresas/${company.id}`}
                className="mt-3 inline-block text-sm text-primary-500 hover:text-primary-600 transition"
              >
                {isEn ? 'View company details' : 'Ver detalhes da empresa'} →
              </Link>
            </div>
          )}

          {/* Ações */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Actions' : 'Ações'}
            </h3>
            
            <div className="space-y-2">
              {service.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus('approved')}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    {isEn ? 'Approve' : 'Aprovar'}
                  </button>
                  <button
                    onClick={() => updateStatus('rejected')}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    {isEn ? 'Reject' : 'Rejeitar'}
                  </button>
                </>
              )}
              <Link
                to={`/admin/servicos/${service.id}/editar`}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                {isEn ? 'Edit' : 'Editar'}
              </Link>
              <button
                onClick={() => {
                  if (confirm(isEn ? 'Delete this service?' : 'Excluir este serviço?')) {
                    // Implementar delete
                    toast.info(isEn ? 'Delete feature coming soon' : 'Funcionalidade de exclusão em breve')
                  }
                }}
                className="w-full px-4 py-2 text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                {isEn ? 'Delete' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}