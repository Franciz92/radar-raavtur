// src/pages/admin/AdminWithdrawals.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Building2,
  User
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminWithdrawals() {
  const { isEn } = useLanguage()
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0
  })

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadWithdrawals = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          company:company_id (
            id,
            name,
            logo,
            email,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const withdrawalsData = data || []
      setWithdrawals(withdrawalsData)

      const pending = withdrawalsData.filter(w => w.status === 'pending')
      const processing = withdrawalsData.filter(w => w.status === 'processing')
      const completed = withdrawalsData.filter(w => w.status === 'completed')
      const failed = withdrawalsData.filter(w => w.status === 'failed')
      
      setStats({
        total: withdrawalsData.length,
        pending: pending.length,
        processing: processing.length,
        completed: completed.length,
        failed: failed.length,
        totalAmount: completed.reduce((acc, w) => acc + (w.amount || 0), 0)
      })
    } catch (error) {
      console.error('Erro ao carregar saques:', error)
      toast.error(isEn ? 'Error loading withdrawals' : 'Erro ao carregar saques')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadWithdrawals()
    setRefreshing(false)
    toast.success(isEn ? 'Withdrawals updated!' : 'Saques atualizados!')
  }

  const updateStatus = async (withdrawalId, newStatus) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', withdrawalId)
      
      if (error) throw error
      
      setWithdrawals(prev => 
        prev.map(w => w.id === withdrawalId ? { ...w, status: newStatus } : w)
      )
      
      toast.success(
        isEn 
          ? `Withdrawal ${newStatus} successfully`
          : `Saque ${newStatus === 'completed' ? 'concluído' : 'atualizado'} com sucesso`
      )
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error updating status' : 'Erro ao atualizar status')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

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

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = 
      w.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.bank_holder?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet size={28} className="text-primary-500" />
            {isEn ? 'Withdrawals' : 'Saques'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage all withdrawal requests (${stats.total})`
              : `Gerencie todas as solicitações de saque (${stats.total})`
            }
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {isEn ? 'Refresh' : 'Atualizar'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Processing' : 'Processando'}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.processing}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Completed' : 'Concluídos'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-primary-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total Amount' : 'Valor Total'}</p>
          <p className="text-2xl font-bold text-primary-500">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search withdrawals...' : 'Pesquisar saques...'}
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
            <option value="processing">{isEn ? 'Processing' : 'Processando'}</option>
            <option value="completed">{isEn ? 'Completed' : 'Concluídos'}</option>
            <option value="failed">{isEn ? 'Failed' : 'Falharam'}</option>
          </select>
        </div>
      </div>

      {filteredWithdrawals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No withdrawals found' : 'Nenhum saque encontrado'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <DollarSign size={24} className="text-blue-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {withdrawal.company?.name || 'Saque'}
                      </p>
                      <StatusBadge status={withdrawal.status} />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        {withdrawal.bank_name || '-'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {withdrawal.bank_holder || '-'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(withdrawal.amount)}
                  </p>
                  <div className="flex items-center gap-2">
                    {(withdrawal.status === 'pending' || withdrawal.status === 'processing') && (
                      <>
                        <button
                          onClick={() => updateStatus(withdrawal.id, 'completed')}
                          className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                          title={isEn ? 'Complete' : 'Concluir'}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => updateStatus(withdrawal.id, 'failed')}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title={isEn ? 'Fail' : 'Falhar'}
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <Link
                      to={`/admin/saques/${withdrawal.id}`}
                      className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
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