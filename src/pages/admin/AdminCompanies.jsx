// src/pages/admin/AdminCompanies.jsx
// ============================================
// ADMIN COMPANIES - CORRIGIDO
// - Usa 'businesses' (nao 'companies')
// - Usa 'is_verified' e 'is_active' (nao 'status')
// - Aprovar: is_verified = true
// - Rejeitar: is_active = false
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Plus,
  User,
  Trash2,
  Edit,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminCompanies() {
  const { isEn } = useLanguage()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [approvingAll, setApprovingAll] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  // ============================================
  // CARREGAR EMPRESAS (BUSINESSES)
  // ============================================
  const loadCompanies = async () => {
    setLoading(true)
    try {
      console.log('🔄 [AdminCompanies] Carregando empresas (businesses)...')

      const { data, error } = await supabase
        .from('businesses')  // ✅ businesses, nao companies
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [AdminCompanies] Erro Supabase:', error)
        throw error
      }

      console.log('✅ [AdminCompanies] Empresas carregadas:', data?.length || 0)
      setCompanies(data || [])

    } catch (error) {
      console.error('❌ [AdminCompanies] Erro ao carregar empresas:', error)
      toast.error(isEn ? 'Error loading companies' : 'Erro ao carregar empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCompanies()
    setRefreshing(false)
    toast.success(isEn ? 'Companies updated!' : 'Empresas atualizadas!')
  }

  // ============================================
  // APROVAR EMPRESA INDIVIDUAL
  // ============================================
  const approveCompany = async (companyId) => {
    try {
      console.log('🔄 [AdminCompanies] Aprovando empresa:', companyId)

      const { error } = await supabase
        .from('businesses')  // ✅ businesses
        .update({
          is_verified: true,   // ✅ is_verified
          is_active: true,     // ✅ is_active
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

      if (error) throw error

      setCompanies(prev =>
        prev.map(c => c.id === companyId ? { ...c, is_verified: true, is_active: true } : c)
      )

      toast.success(isEn ? 'Company approved!' : 'Empresa aprovada!')
    } catch (error) {
      console.error('❌ Erro ao aprovar empresa:', error)
      toast.error(error.message || (isEn ? 'Error approving company' : 'Erro ao aprovar empresa'))
    }
  }

  // ============================================
  // REJEITAR EMPRESA INDIVIDUAL
  // ============================================
  const rejectCompany = async (companyId) => {
    const reason = prompt(isEn ? 'Reason for rejection:' : 'Motivo da rejeição:')
    if (reason === null) return

    try {
      console.log('🔄 [AdminCompanies] Rejeitando empresa:', companyId)

      const { error } = await supabase
        .from('businesses')  // ✅ businesses
        .update({
          is_verified: false,  // ✅ is_verified = false
          is_active: false,    // ✅ is_active = false
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

      if (error) throw error

      setCompanies(prev =>
        prev.map(c => c.id === companyId ? { ...c, is_verified: false, is_active: false } : c)
      )

      toast.success(isEn ? 'Company rejected!' : 'Empresa rejeitada!')
    } catch (error) {
      console.error('❌ Erro ao rejeitar empresa:', error)
      toast.error(error.message || (isEn ? 'Error rejecting company' : 'Erro ao rejeitar empresa'))
    }
  }

  // ============================================
  // EXCLUIR EMPRESA
  // ============================================
  const deleteCompany = async (companyId) => {
    if (!confirm(
      isEn
        ? '⚠️ WARNING: This will permanently delete this company and ALL related data. This cannot be undone!\n\nAre you sure?'
        : '⚠️ ATENÇO: Isto vai excluir PERMANENTEMENTE esta empresa e TODOS os dados relacionados. Isso não pode ser desfeito!\n\nTem certeza?'
    )) return

    setDeleting(companyId)
    try {
      console.log('🔄 [AdminCompanies] Eliminando empresa:', companyId)

      // Tentar eliminar serviços relacionados (company_services usa company_id ou business_id)
      try {
        await supabase.from('company_services').delete().eq('company_id', companyId)
      } catch (err) { console.warn('⚠️ Erro services:', err) }

      try {
        await supabase.from('company_services').delete().eq('business_id', companyId)
      } catch (err) { console.warn('⚠️ Erro services (business_id):', err) }

      try {
        await supabase.from('reviews').delete().eq('business_id', companyId)
      } catch (err) { console.warn('⚠️ Erro reviews:', err) }

      try {
        await supabase.from('bookings').delete().eq('business_id', companyId)
      } catch (err) { console.warn('⚠️ Erro bookings:', err) }

      try {
        await supabase.from('business_gallery').delete().eq('business_id', companyId)
      } catch (err) { console.warn('⚠️ Erro gallery:', err) }

      // Finalmente, eliminar a empresa
      const { error } = await supabase
        .from('businesses')  // ✅ businesses
        .delete()
        .eq('id', companyId)

      if (error) throw error

      toast.success(isEn ? '🗑️ Company permanently deleted!' : '🗑️ Empresa excluída permanentemente!')
      loadCompanies()
    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error)
      toast.error(error.message || (isEn ? 'Error deleting company' : 'Erro ao excluir empresa'))
    } finally {
      setDeleting(null)
    }
  }

  // ============================================
  // APROVAR TODAS AS EMPRESAS PENDENTES
  // ============================================
  const approveAllPending = async () => {
    const pendingCompanies = companies.filter(c => !c.is_verified)

    if (pendingCompanies.length === 0) {
      toast.info(isEn ? 'No pending companies' : 'Nenhuma empresa pendente')
      return
    }

    if (!confirm(
      isEn
        ? `Approve all ${pendingCompanies.length} pending companies?`
        : `Aprovar todas as ${pendingCompanies.length} empresas pendentes?`
    )) {
      return
    }

    setApprovingAll(true)
    try {
      const { error } = await supabase
        .from('businesses')  // ✅ businesses
        .update({
          is_verified: true,   // ✅ is_verified
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('is_verified', false)  // ✅ is_verified

      if (error) throw error

      setCompanies(prev =>
        prev.map(c => !c.is_verified ? { ...c, is_verified: true, is_active: true } : c)
      )

      toast.success(
        isEn
          ? `${pendingCompanies.length} companies approved!`
          : `${pendingCompanies.length} empresas aprovadas!`
      )
    } catch (error) {
      console.error('❌ Erro ao aprovar todas:', error)
      toast.error(isEn ? 'Error approving companies' : 'Erro ao aprovar empresas')
    } finally {
      setApprovingAll(false)
    }
  }

  // ============================================
  // STATUS BADGE (baseado em is_verified / is_active)
  // ============================================
  const StatusBadge = ({ company }) => {
    let label, variant

    if (company.is_verified === true && company.is_active === true) {
      label = isEn ? 'Approved' : 'Aprovada'
      variant = 'success'
    } else if (company.is_verified === false && company.is_active === false) {
      label = isEn ? 'Rejected' : 'Rejeitada'
      variant = 'danger'
    } else if (company.is_verified === false) {
      label = isEn ? 'Pending' : 'Pendente'
      variant = 'warning'
    } else {
      label = isEn ? 'Unknown' : 'Desconhecido'
      variant = 'default'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
        ${variant === 'default' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
      `}>
        {label}
      </span>
    )
  }

  // ============================================
  // FILTROS
  // ============================================
  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesStatus = true
    if (filterStatus === 'pending') matchesStatus = c.is_verified === false && c.is_active !== false
    else if (filterStatus === 'approved') matchesStatus = c.is_verified === true
    else if (filterStatus === 'rejected') matchesStatus = c.is_verified === false && c.is_active === false

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: companies.length,
    pending: companies.filter(c => !c.is_verified && c.is_active !== false).length,
    approved: companies.filter(c => c.is_verified === true).length,
    rejected: companies.filter(c => !c.is_verified && c.is_active === false).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 size={28} className="text-primary-500" />
            {isEn ? 'Companies' : 'Empresas'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn
              ? `Manage all registered companies (${stats.total})`
              : `Gerencie todas as empresas registadas (${stats.total})`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {stats.pending > 0 && (
            <button
              onClick={approveAllPending}
              disabled={approvingAll}
              className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
            >
              {approvingAll ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              {isEn
                ? `Approve All Pending (${stats.pending})`
                : `Aprovar Todas Pendentes (${stats.pending})`
              }
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Approved' : 'Aprovadas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Rejected' : 'Rejeitadas'}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search companies...' : 'Pesquisar empresas...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
            <option value="pending">{isEn ? 'Pending' : 'Pendentes'}</option>
            <option value="approved">{isEn ? 'Approved' : 'Aprovadas'}</option>
            <option value="rejected">{isEn ? 'Rejected' : 'Rejeitadas'}</option>
          </select>
        </div>
      </div>

      {/* Lista de Empresas */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No companies found' : 'Nenhuma empresa encontrada'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Company' : 'Empresa'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Contact' : 'Contato'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Location' : 'Localização'}
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
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentNode.innerHTML = '<svg class="text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v14M21 7v14M6 21V3h12v18"/></svg>'
                              }}
                            />
                          ) : (
                            <Building2 size={20} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {company.category || (isEn ? 'No category' : 'Sem categoria')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <Mail size={14} className="text-gray-400" />
                          {company.email || '-'}
                        </p>
                        {company.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" />
                            {company.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {company.province || company.address || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge company={company} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/empresas/${company.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title={isEn ? 'View details' : 'Ver detalhes'}
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/empresas/editar/${company.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title={isEn ? 'Edit' : 'Editar'}
                        >
                          <Edit size={18} />
                        </Link>
                        {!company.is_verified && (
                          <>
                            <button
                              onClick={() => approveCompany(company.id)}
                              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                              title={isEn ? 'Approve' : 'Aprovar'}
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => rejectCompany(company.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              title={isEn ? 'Reject' : 'Rejeitar'}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteCompany(company.id)}
                          disabled={deleting === company.id}
                          className={`p-2 rounded-lg transition ${
                            deleting === company.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={isEn ? 'Delete permanently' : 'Excluir permanentemente'}
                        >
                          {deleting === company.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {isEn
                ? `Showing ${filteredCompanies.length} of ${companies.length} companies`
                : `Mostrando ${filteredCompanies.length} de ${companies.length} empresas`
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
    </div>
  )
}