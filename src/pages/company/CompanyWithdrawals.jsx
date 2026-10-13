// src/pages/company/CompanyWithdrawals.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  Banknote,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Printer
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function CompanyWithdrawals() {
  const { company } = useCompany()
  const { isEn } = useLanguage()
  
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({
    totalWithdrawn: 0,
    pending: 0,
    completed: 0,
    failed: 0
  })
  const [availableBalance, setAvailableBalance] = useState(0)

  useEffect(() => {
    if (company?.id) {
      loadWithdrawals()
      loadAvailableBalance()
    }
  }, [company])

  const loadWithdrawals = async () => {
    if (!company?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setWithdrawals(data || [])
      
      // Calcular estatísticas
      const completed = data?.filter(w => w.status === 'completed') || []
      const totalWithdrawn = completed.reduce((acc, w) => acc + w.amount, 0)
      const pending = data?.filter(w => w.status === 'pending').length || 0
      const completedCount = completed.length
      const failed = data?.filter(w => w.status === 'failed').length || 0
      
      setStats({
        totalWithdrawn,
        pending,
        completed: completedCount,
        failed
      })
      
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
      toast.error(isEn ? 'Error loading withdrawals' : 'Erro ao carregar saques')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableBalance = async () => {
    try {
      // Buscar transações concluídas
      const { data, error } = await supabase
        .from('transactions')
        .select('company_amount')
        .eq('company_id', company.id)
        .eq('status', 'completed')
      
      if (error) throw error
      
      // Buscar saques concluídos
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('company_id', company.id)
        .eq('status', 'completed')
      
      if (withdrawalsError) throw withdrawalsError
      
      const totalEarnings = data.reduce((acc, t) => acc + t.company_amount, 0)
      const totalWithdrawn = withdrawalsData.reduce((acc, w) => acc + w.amount, 0)
      
      setAvailableBalance(totalEarnings - totalWithdrawn)
    } catch (error) {
      console.error('Erro ao calcular saldo:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadWithdrawals()
    await loadAvailableBalance()
    setRefreshing(false)
    toast.success(isEn ? 'Withdrawals updated!' : 'Saques atualizados!')
  }

  // Filtrar saques
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = 
      withdrawal.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bank_holder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || withdrawal.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Formatar valor
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Status badge
  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { label: isEn ? 'Pending' : 'Pendente', variant: 'warning', icon: Clock },
      processing: { label: isEn ? 'Processing' : 'Processando', variant: 'info', icon: Loader2 },
      completed: { label: isEn ? 'Completed' : 'Concluído', variant: 'success', icon: CheckCircle },
      failed: { label: isEn ? 'Failed' : 'Falhou', variant: 'danger', icon: XCircle },
    }
    
    const info = statusMap[status] || statusMap.pending
    const Icon = info.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${info.variant === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
      `}>
        <Icon size={12} />
        {info.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading withdrawals...' : 'Carregando saques...'}
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
            <Wallet size={28} className="text-primary-500" />
            {isEn ? 'Withdrawals' : 'Saques'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage your withdrawal requests (${withdrawals.length})`
              : `Gerencie suas solicitações de saque (${withdrawals.length})`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
          <Link
            to="/empresa/saques/novo"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
          >
            <PlusCircle size={18} />
            {isEn ? 'New Withdrawal' : 'Novo Saque'}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Available Balance' : 'Saldo Disponível'}</p>
          <p className={`text-2xl font-bold ${availableBalance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {formatCurrency(availableBalance)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-primary-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total Withdrawn' : 'Total Sacado'}</p>
          <p className="text-2xl font-bold text-primary-500">
            {formatCurrency(stats.totalWithdrawn)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Completed' : 'Concluídos'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Failed' : 'Falharam'}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search withdrawals...' : 'Pesquisar saques...'}
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
            <option value="processing">{isEn ? 'Processing' : 'Processando'}</option>
            <option value="completed">{isEn ? 'Completed' : 'Concluídos'}</option>
            <option value="failed">{isEn ? 'Failed' : 'Falharam'}</option>
          </select>
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Saques */}
      {filteredWithdrawals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all'
              ? (isEn ? 'No withdrawals match your filters' : 'Nenhum saque corresponde aos filtros')
              : (isEn ? 'No withdrawal requests yet' : 'Nenhuma solicitação de saque ainda')
            }
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
            <Link
              to="/empresa/saques/novo"
              className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition"
            >
              <PlusCircle size={18} />
              {isEn ? 'Request your first withdrawal' : 'Solicite seu primeiro saque'}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Informações do saque */}
                  <div className="flex items-start gap-4 flex-1 min-w-[200px]">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Banknote size={24} className="text-blue-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {isEn ? 'Withdrawal' : 'Saque'}
                        </span>
                        <StatusBadge status={withdrawal.status} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-mono text-xs">#{withdrawal.id.slice(0, 8)}</span>
                        {withdrawal.bank_name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Building2 size={14} />
                              {withdrawal.bank_name}
                            </span>
                          </>
                        )}
                        {withdrawal.bank_holder && (
                          <>
                            <span>•</span>
                            <span>{withdrawal.bank_holder}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(withdrawal.created_at).toLocaleDateString()}
                        </span>
                        {withdrawal.reference && (
                          <span className="flex items-center gap-1">
                            <span>{isEn ? 'Ref:' : 'Ref:'} {withdrawal.reference}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Valores e Ações */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {withdrawal.currency || 'Kz'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/empresa/saques/${withdrawal.id}`}
                        className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                        title={isEn ? 'View details' : 'Ver detalhes'}
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}