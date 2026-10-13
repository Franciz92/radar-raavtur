// src/pages/user/UserTransactionsPage.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Calendar, Loader2, RefreshCw, Eye, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function UserTransactionsPage() {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) loadTransactions()
  }, [user])

  const loadTransactions = async () => {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`*, booking:booking_id (id, service:service_id (name)), company:company_id (id, name, logo)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error loading transactions' : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(value)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft size={18} /> {isEn ? 'Back' : 'Voltar'}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEn ? 'My Transactions' : 'Minhas Transações'}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{transactions.length} {isEn ? 'transactions' : 'transações'}</p>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{isEn ? 'No transactions yet' : 'Nenhuma transação ainda'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{t.booking?.service?.name || 'Transação'}</p>
                <p className="text-sm text-gray-500">{t.company?.name}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {formatCurrency(t.amount)}
                </p>
                <Link to={`/usuario/transacoes/${t.id}`} className="text-sm text-primary-500">{isEn ? 'View' : 'Ver'}</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}