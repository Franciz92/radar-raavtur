// src/pages/admin/AdminWithdrawalDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  Calendar,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Printer,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminWithdrawalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
        .select(`
          *,
          company:company_id (
            id,
            name,
            logo,
            email,
            phone,
            user_id,
            description,
            address
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setWithdrawal(data)
    } catch (error) {
      console.error('Erro ao carregar saque:', error)
      toast.error(isEn ? 'Error loading withdrawal' : 'Erro ao carregar saque')
      navigate('/admin/saques')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus) => {
    if (updating) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)
      
      if (error) throw error
      
      setWithdrawal(prev => ({ ...prev, status: newStatus }))
      
      toast.success(
        isEn 
          ? `Withdrawal ${newStatus} successfully`
          : `Saque ${newStatus === 'completed' ? 'concluído' : 'atualizado'} com sucesso`
      )
      
      loadWithdrawal()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error(isEn ? 'Error updating status' : 'Erro ao atualizar status')
    } finally {
      setUpdating(false)
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
        <Link to="/admin/saques" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to withdrawals' : 'Voltar para saques'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/saques" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet size={28} className="text-primary-500" />
            {isEn ? 'Withdrawal Details' : 'Detalhes do Saque'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">#{withdrawal.id.slice(0, 8)}</span>
            <StatusBadge status={withdrawal.status} />
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <Printer size={20} />
        </button>
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
                  {isEn ? 'Requested Date' : 'Data da Solicitação'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  {new Date(withdrawal.created_at).toLocaleDateString()}
                </p>
              </div>
              {withdrawal.completed_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Completed Date' : 'Data de Conclusão'}
                  </p>
                  <p className="font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle size={16} />
                    {new Date(withdrawal.completed_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {withdrawal.reference && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Reference' : 'Referência'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">
                    {withdrawal.reference}
                  </p>
                </div>
              )}
            </div>
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

            {withdrawal.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Notes' : 'Observações'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {withdrawal.notes}
                </p>
              </div>
            )}
          </div>

          {/* Informações da Empresa */}
          {withdrawal.company && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Company Information' : 'Informações da Empresa'}
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Building2 size={32} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {withdrawal.company.name}
                  </p>
                  {withdrawal.company.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail size={14} />
                      {withdrawal.company.email}
                    </p>
                  )}
                  {withdrawal.company.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone size={14} />
                      {withdrawal.company.phone}
                    </p>
                  )}
                  {withdrawal.company.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className="text-gray-400">📍</span>
                      {typeof withdrawal.company.address === 'string' 
                        ? withdrawal.company.address 
                        : JSON.stringify(withdrawal.company.address)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ações */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Actions' : 'Ações'}
            </h3>
            
            <div className="space-y-2">
              {(withdrawal.status === 'pending' || withdrawal.status === 'processing') && (
                <>
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {isEn ? 'Approve & Complete' : 'Aprovar & Concluir'}
                  </button>
                  <button
                    onClick={() => updateStatus('failed')}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                    {isEn ? 'Reject' : 'Rejeitar'}
                  </button>
                </>
              )}
              {withdrawal.status === 'pending' && (
                <button
                  onClick={() => updateStatus('processing')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                  {isEn ? 'Mark as Processing' : 'Marcar como Processando'}
                </button>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(withdrawal.id)
                  toast.success(isEn ? 'ID copied!' : 'ID copiado!')
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                {isEn ? 'Copy ID' : 'Copiar ID'}
              </button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {isEn ? 'Important' : 'Importante'}
                </p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-300 mt-1 space-y-1">
                  <li>• {isEn 
                    ? 'Verify bank details before approving'
                    : 'Verifique os dados bancários antes de aprovar'
                  }</li>
                  <li>• {isEn 
                    ? 'This action cannot be undone'
                    : 'Esta ação não pode ser desfeita'
                  }</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}