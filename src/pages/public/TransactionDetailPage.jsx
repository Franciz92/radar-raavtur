// src/pages/public/TransactionDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, DollarSign, Calendar, User, Mail, CheckCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'

export default function TransactionDetailPage() {
  const { id } = useParams()
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
            service:service_id (name, category)
          ),
          company:company_id (id, name, logo),
          user:user_id (id, name, email)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setTransaction(data)
    } catch (error) {
      console.error('Erro ao carregar transação:', error)
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
        <Link to="/transacoes" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to transactions' : 'Voltar para transações'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/transacoes" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft size={18} />
        {isEn ? 'Back to transactions' : 'Voltar para transações'}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {isEn ? 'Transaction Details' : 'Detalhes da Transação'}
        </h1>

        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500">{isEn ? 'Transaction ID' : 'ID da Transação'}</span>
            <span className="font-mono text-sm text-gray-900 dark:text-white">{transaction.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500">{isEn ? 'Amount' : 'Valor'}</span>
            <span className="font-bold text-primary-500">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500">{isEn ? 'Status' : 'Status'}</span>
            <span className={`font-medium ${transaction.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
              {transaction.status}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500">{isEn ? 'Date' : 'Data'}</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(transaction.created_at).toLocaleString()}
            </span>
          </div>
          {transaction.booking?.service?.name && (
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500">{isEn ? 'Service' : 'Serviço'}</span>
              <span className="text-gray-900 dark:text-white">{transaction.booking.service.name}</span>
            </div>
          )}
          {transaction.company?.name && (
            <div className="flex justify-between py-2">
              <span className="text-gray-500">{isEn ? 'Company' : 'Empresa'}</span>
              <span className="text-gray-900 dark:text-white">{transaction.company.name}</span>
            </div>
          )}
          {transaction.status === 'completed' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-green-700 dark:text-green-300">
                {isEn ? 'Payment completed successfully' : 'Pagamento concluído com sucesso'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}