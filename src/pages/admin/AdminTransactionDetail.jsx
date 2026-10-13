// src/pages/admin/AdminTransactionDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Mail,
  Building2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  CreditCard,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminTransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransaction()
  }, [id])

  const loadTransaction = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          booking:booking_id (
            id,
            booking_date_service,
            customer_name,
            customer_email,
            customer_phone,
            guests,
            service:service_id (
              id,
              name,
              category,
              price,
              currency
            )
          ),
          company:company_id (
            id,
            name,
            logo,
            email,
            phone
          ),
          user:user_id (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setTransaction(data)
    } catch (error) {
      console.error('Erro ao carregar transação:', error)
      toast.error(isEn ? 'Error loading transaction' : 'Erro ao carregar transação')
      navigate('/admin/transacoes')
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
    }).format(value || 0)
  }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isEn ? 'Transaction not found' : 'Transação não encontrada'}</p>
        <Link to="/admin/transacoes" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to transactions' : 'Voltar para transações'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/transacoes" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Transaction Details' : 'Detalhes da Transação'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">#{transaction.id.slice(0, 8)}</span>
            <StatusBadge status={transaction.status} />
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Transaction Summary' : 'Resumo da Transação'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Type' : 'Tipo'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {transaction.transaction_type || 'Payment'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Date' : 'Data'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  {new Date(transaction.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Payment Method' : 'Método de Pagamento'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <CreditCard size={16} className="text-gray-400" />
                  {transaction.payment_method || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Payment Details' : 'Detalhes do Pagamento'}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Total Amount' : 'Valor Total'}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Platform Fee (10%)' : 'Taxa da Plataforma (10%)'}
                </span>
                <span className="font-medium text-yellow-500">
                  {formatCurrency(transaction.platform_fee)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-green-600 dark:text-green-400">
                  {isEn ? 'Company Earnings' : 'Ganhos da Empresa'}
                </span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(transaction.company_amount)}
                </span>
              </div>
            </div>
          </div>

          {transaction.booking && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Booking Information' : 'Informações da Reserva'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{isEn ? 'Service' : 'Serviço'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.booking.service?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{isEn ? 'Customer' : 'Cliente'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.booking.customer_name || transaction.user?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{isEn ? 'Date' : 'Data'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(transaction.booking.booking_date_service).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Customer' : 'Cliente'}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-500 font-semibold">
                  {transaction.user?.name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.user?.name || 'Cliente'}
                </p>
                {transaction.user?.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail size={14} />
                    {transaction.user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Company' : 'Empresa'}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Building2 size={24} className="text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transaction.company?.name || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}