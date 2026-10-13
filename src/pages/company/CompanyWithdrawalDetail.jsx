// src/pages/company/CompanyWithdrawalDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  Calendar,
  Banknote,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Printer
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function CompanyWithdrawalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { company } = useCompany()
  const { isEn } = useLanguage()
  
  const [withdrawal, setWithdrawal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadWithdrawal()
  }, [id])

  const loadWithdrawal = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setWithdrawal(data)
    } catch (error) {
      console.error('Erro ao carregar saque:', error)
      toast.error(isEn ? 'Error loading withdrawal' : 'Erro ao carregar saque')
      navigate('/empresa/saques')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
        ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${info.variant === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
      `}>
        <Icon size={14} />
        {info.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!withdrawal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isEn ? 'Withdrawal not found' : 'Saque não encontrado'}</p>
        <Link to="/empresa/saques" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to withdrawals' : 'Voltar para saques'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/empresa/saques" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Withdrawal Details' : 'Detalhes do Saque'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">#{withdrawal.id.slice(0, 8)}</span>
            <StatusBadge status={withdrawal.status} />
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => window.print()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo do saque */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Withdrawal Summary' : 'Resumo do Saque'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Amount' : 'Valor'}
                </p>
                <p className="text-2xl font-bold text-primary-500">
                  {formatCurrency(withdrawal.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Currency' : 'Moeda'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {withdrawal.currency || 'Kz'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Status' : 'Status'}
                </p>
                <StatusBadge status={withdrawal.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Date' : 'Data'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {withdrawal.completed_at && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Completed Date' : 'Data de Conclusão'}
                </p>
                <p className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle size={16} />
                  {new Date(withdrawal.completed_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Informações bancárias */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Bank Information' : 'Informações Bancárias'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Bank Name' : 'Nome do Banco'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Building2 size={16} className="text-gray-400" />
                  {withdrawal.bank_name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Account Number' : 'Número da Conta'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {withdrawal.bank_account || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Account Holder' : 'Titular da Conta'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <User size={16} className="text-gray-400" />
                  {withdrawal.bank_holder || '-'}
                </p>
              </div>
              {withdrawal.iban && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">IBAN</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">
                    {withdrawal.iban}
                  </p>
                </div>
              )}
              {withdrawal.swift && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SWIFT</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">
                    {withdrawal.swift}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ações */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Actions' : 'Ações'}
            </h3>
            
            <div className="space-y-2">
              {withdrawal.status === 'pending' && (
                <>
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    {isEn ? 'Approve' : 'Aprovar'}
                  </button>
                  <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    {isEn ? 'Reject' : 'Rejeitar'}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(withdrawal.id)
                  toast.success(isEn ? 'ID copied!' : 'ID copiado!')
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {isEn ? 'Copy ID' : 'Copiar ID'}
              </button>
              <Link
                to="/empresa/saques/novo"
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2"
              >
                <Wallet size={18} />
                {isEn ? 'New Withdrawal' : 'Novo Saque'}
              </Link>
            </div>
          </div>

          {/* Observações */}
          {withdrawal.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isEn ? 'Notes' : 'Observações'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {withdrawal.notes}
              </p>
            </div>
          )}

          {/* Referência */}
          {withdrawal.reference && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {isEn ? 'Reference' : 'Referência'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-mono">
                {withdrawal.reference}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}