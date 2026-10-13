// src/pages/public/TransactionsPage.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Calendar, Loader2, Search, Filter, Eye, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          booking:booking_id (
            id,
            booking_date_service,
            service:service_id (name)
          ),
          company:company_id (id, name, logo)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value)
  }

  const StatusBadge = ({ status }) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status}
      </span>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isEn ? 'Please login to view transactions' : 'Faça login para ver transações'}</p>
        <Link to="/login" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Login' : 'Login'}
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft size={18} />
        {isEn ? 'Back to home' : 'Voltar para início'}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isEn ? 'Transactions' : 'Transações'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {isEn 
          ? `Your transaction history (${transactions.length})`
          : `Seu histórico de transações (${transactions.length})`
        }
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search transactions...' : 'Pesquisar transações...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
            <option value="completed">{isEn ? 'Completed' : 'Concluídas'}</option>
            <option value="pending">{isEn ? 'Pending' : 'Pendentes'}</option>
            <option value="failed">{isEn ? 'Failed' : 'Falharam'}</option>
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{isEn ? 'No transactions found' : 'Nenhuma transação encontrada'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.booking?.service?.name || 'Transação'}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{transaction.company?.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </span>
                  <StatusBadge status={transaction.status} />
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.status === 'completed' ? 'text-green-500' : 'text-gray-500'}`}>
                  {formatCurrency(transaction.amount)}
                </p>
                <Link to={`/transacoes/${transaction.id}`} className="text-sm text-primary-500 hover:text-primary-600 flex items-center justify-end gap-1">
                  <Eye size={14} />
                  {isEn ? 'View' : 'Ver'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}