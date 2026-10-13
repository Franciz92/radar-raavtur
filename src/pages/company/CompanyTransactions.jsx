// src/pages/company/CompanyTransactions.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Download,
  Printer,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Banknote
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function CompanyTransactions() {
  const { company } = useCompany()
  const { user } = useAuth()
  const { isEn } = useLanguage()
  
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalFees: 0,
    totalEarnings: 0,
    count: 0
  })

  useEffect(() => {
    if (company?.id) {
      loadTransactions()
    }
  }, [company])

  const loadTransactions = async () => {
    if (!company?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Buscar transações
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          booking:booking_id (
            id,
            booking_date_service,
            customer_name,
            customer_email,
            service:service_id (
              name,
              category
            )
          ),
          user:user_id (
            id,
            name,
            email
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setTransactions(data || [])
      
      // Calcular estatísticas
      const completed = data?.filter(t => t.status === 'completed') || []
      const totalRevenue = completed.reduce((acc, t) => acc + t.amount, 0)
      const totalFees = completed.reduce((acc, t) => acc + t.platform_fee, 0)
      const totalEarnings = completed.reduce((acc, t) => acc + t.company_amount, 0)
      
      setStats({
        totalRevenue,
        totalFees,
        totalEarnings,
        count: completed.length
      })
      
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
      toast.error(isEn ? 'Error loading transactions' : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTransactions()
    setRefreshing(false)
    toast.success(isEn ? 'Transactions updated!' : 'Transações atualizadas!')
  }

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.booking?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.booking?.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.transaction_type === filterType
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
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
      completed: { label: isEn ? 'Completed' : 'Concluída', variant: 'success', icon: CheckCircle },
      failed: { label: isEn ? 'Failed' : 'Falhou', variant: 'danger', icon: XCircle },
      refunded: { label: isEn ? 'Refunded' : 'Reembolsada', variant: 'default', icon: TrendingDown },
    }
    
    const info = statusMap[status] || statusMap.pending
    const Icon = info.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
        ${info.variant === 'default' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
      `}>
        <Icon size={12} />
        {info.label}
      </span>
    )
  }

  // Tipo de transação badge
  const TypeBadge = ({ type }) => {
    const typeMap = {
      payment: { label: isEn ? 'Payment' : 'Pagamento', icon: CreditCard },
      refund: { label: isEn ? 'Refund' : 'Reembolso', icon: TrendingDown },
      withdrawal: { label: isEn ? 'Withdrawal' : 'Saque', icon: Wallet },
    }
    
    const info = typeMap[type] || typeMap.payment
    const Icon = info.icon
    
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400`}>
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
          {isEn ? 'Loading transactions...' : 'Carregando transações...'}
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
            <DollarSign size={28} className="text-primary-500" />
            {isEn ? 'Transactions' : 'Transações'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage all your financial transactions (${transactions.length})`
              : `Gerencie todas as suas transações financeiras (${transactions.length})`
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
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <Printer size={16} />
            {isEn ? 'Print' : 'Imprimir'}
          </button>
          <button
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <Download size={16} />
            {isEn ? 'Export' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total Revenue' : 'Receita Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-400">{stats.count} {isEn ? 'transactions' : 'transações'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-primary-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Your Earnings' : 'Seus Ganhos'}</p>
          <p className="text-2xl font-bold text-primary-500">
            {formatCurrency(stats.totalEarnings)}
          </p>
          <p className="text-xs text-gray-400">90% {isEn ? 'of revenue' : 'da receita'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Platform Fees' : 'Taxas da Plataforma'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {formatCurrency(stats.totalFees)}
          </p>
          <p className="text-xs text-gray-400">10% {isEn ? 'of revenue' : 'da receita'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Completed' : 'Concluídas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.count}</p>
          <p className="text-xs text-gray-400">{isEn ? 'Successful transactions' : 'Transações bem-sucedidas'}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search transactions...' : 'Pesquisar transações...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">{isEn ? 'All Types' : 'Todos os Tipos'}</option>
            <option value="payment">{isEn ? 'Payments' : 'Pagamentos'}</option>
            <option value="refund">{isEn ? 'Refunds' : 'Reembolsos'}</option>
            <option value="withdrawal">{isEn ? 'Withdrawals' : 'Saques'}</option>
          </select>
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
            <option value="completed">{isEn ? 'Completed' : 'Concluídas'}</option>
            <option value="pending">{isEn ? 'Pending' : 'Pendentes'}</option>
            <option value="failed">{isEn ? 'Failed' : 'Falharam'}</option>
            <option value="refunded">{isEn ? 'Refunded' : 'Reembolsadas'}</option>
          </select>
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Transações */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? (isEn ? 'No transactions match your filters' : 'Nenhuma transação corresponde aos filtros')
              : (isEn ? 'No transactions yet' : 'Nenhuma transação ainda')
            }
          </p>
          {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterType('all')
                setFilterStatus('all')
              }}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 transition"
            >
              {isEn ? 'Clear filters' : 'Limpar filtros'}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Informações da transação */}
                  <div className="flex items-start gap-4 flex-1 min-w-[200px]">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${transaction.transaction_type === 'payment' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                      ${transaction.transaction_type === 'refund' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                      ${transaction.transaction_type === 'withdrawal' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                    `}>
                      {transaction.transaction_type === 'payment' && <TrendingUp size={24} className="text-green-500" />}
                      {transaction.transaction_type === 'refund' && <TrendingDown size={24} className="text-red-500" />}
                      {transaction.transaction_type === 'withdrawal' && <Wallet size={24} className="text-blue-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {transaction.transaction_type === 'payment' && (isEn ? 'Payment' : 'Pagamento')}
                          {transaction.transaction_type === 'refund' && (isEn ? 'Refund' : 'Reembolso')}
                          {transaction.transaction_type === 'withdrawal' && (isEn ? 'Withdrawal' : 'Saque')}
                        </span>
                        <StatusBadge status={transaction.status} />
                        <TypeBadge type={transaction.transaction_type} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-mono text-xs">#{transaction.id.slice(0, 8)}</span>
                        {transaction.booking?.customer_name && (
                          <>
                            <span>•</span>
                            <span>{transaction.booking.customer_name}</span>
                          </>
                        )}
                        {transaction.booking?.service?.name && (
                          <>
                            <span>•</span>
                            <span>{transaction.booking.service.name}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                        {transaction.payment_method && (
                          <span className="flex items-center gap-1">
                            <CreditCard size={12} />
                            {transaction.payment_method}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.transaction_type === 'payment' ? 'text-green-600 dark:text-green-400' :
                        transaction.transaction_type === 'refund' ? 'text-red-600 dark:text-red-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {transaction.transaction_type === 'payment' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isEn ? 'Platform fee' : 'Taxa da plataforma'}: {formatCurrency(transaction.platform_fee)}
                      </p>
                      <p className="text-xs text-green-500">
                        {isEn ? 'Your earnings' : 'Seus ganhos'}: {formatCurrency(transaction.company_amount)}
                      </p>
                    </div>
                    
                    <Link
                      to={`/empresa/transacoes/${transaction.id}`}
                      className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                      title={isEn ? 'View details' : 'Ver detalhes'}
                    >
                      <Eye size={18} />
                    </Link>
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