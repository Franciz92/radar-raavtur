// src/pages/admin/AdminAnalytics.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Package,
  DollarSign,
  Calendar,
  Star,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Download,
  Printer,
  Activity,
  Clock
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminAnalytics() {  // <-- CERTIFICAR-SE QUE TEM "export default"
  const { isEn } = useLanguage()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('month')
  const [stats, setStats] = useState({
    users: { total: 0, new: 0, active: 0 },
    companies: { total: 0, pending: 0, approved: 0, rejected: 0 },
    services: { total: 0, pending: 0, approved: 0, active: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
    revenue: { total: 0, fees: 0, earnings: 0, count: 0 },
    reviews: { total: 0, avg: 0, rating5: 0, rating4: 0, rating3: 0, rating2: 0, rating1: 0 }
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Buscar usuários
      const { count: usersTotal } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Buscar empresas
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('status')
      
      if (companiesError) throw companiesError

      // Buscar serviços
      const { data: services, error: servicesError } = await supabase
        .from('company_services')
        .select('status')
      
      if (servicesError) throw servicesError

      // Buscar reservas
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('status, total_price')
      
      if (bookingsError) throw bookingsError

      // Buscar transações
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, platform_fee, company_amount, status')
      
      if (transactionsError) throw transactionsError

      // Buscar avaliações
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
      
      if (reviewsError) throw reviewsError

      // Processar dados
      const completedBookings = bookings?.filter(b => b.status === 'completed') || []
      const completedTransactions = transactions?.filter(t => t.status === 'completed') || []
      
      setStats({
        users: {
          total: usersTotal || 0,
          new: 0,
          active: 0
        },
        companies: {
          total: companies?.length || 0,
          pending: companies?.filter(c => c.status === 'pending').length || 0,
          approved: companies?.filter(c => c.status === 'approved').length || 0,
          rejected: companies?.filter(c => c.status === 'rejected').length || 0
        },
        services: {
          total: services?.length || 0,
          pending: services?.filter(s => s.status === 'pending').length || 0,
          approved: services?.filter(s => s.status === 'approved').length || 0,
          active: services?.filter(s => s.status === 'active').length || 0
        },
        bookings: {
          total: bookings?.length || 0,
          pending: bookings?.filter(b => b.status === 'pending').length || 0,
          confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
          completed: completedBookings.length,
          cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0
        },
        revenue: {
          total: completedTransactions.reduce((acc, t) => acc + t.amount, 0),
          fees: completedTransactions.reduce((acc, t) => acc + t.platform_fee, 0),
          earnings: completedTransactions.reduce((acc, t) => acc + t.company_amount, 0),
          count: completedTransactions.length
        },
        reviews: {
          total: reviews?.length || 0,
          avg: reviews?.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0,
          rating5: reviews?.filter(r => r.rating === 5).length || 0,
          rating4: reviews?.filter(r => r.rating === 4).length || 0,
          rating3: reviews?.filter(r => r.rating === 3).length || 0,
          rating2: reviews?.filter(r => r.rating === 2).length || 0,
          rating1: reviews?.filter(r => r.rating === 1).length || 0
        }
      })

    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
      toast.error(isEn ? 'Error loading analytics' : 'Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
    toast.success(isEn ? 'Analytics updated!' : 'Analytics atualizados!')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={28} className="text-primary-500" />
            {isEn ? 'Analytics' : 'Análises'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? 'Platform performance and statistics'
              : 'Desempenho e estatísticas da plataforma'
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
          <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2">
            <Download size={16} />
            {isEn ? 'Export' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total Users' : 'Total Utilizadores'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-primary-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Companies' : 'Empresas'}</p>
          <p className="text-2xl font-bold text-primary-500">{stats.companies.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Services' : 'Serviços'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.services.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-400 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Bookings' : 'Reservas'}</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.bookings.total}</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total Revenue' : 'Receita Total'}</p>
          <p className="text-2xl font-bold text-primary-500">{formatCurrency(stats.revenue.total)}</p>
          <p className="text-xs text-gray-400">{stats.revenue.count} {isEn ? 'transactions' : 'transações'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Platform Fees' : 'Taxas da Plataforma'}</p>
          <p className="text-2xl font-bold text-yellow-500">{formatCurrency(stats.revenue.fees)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Company Earnings' : 'Ganhos das Empresas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.revenue.earnings)}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookings Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
            {isEn ? 'Booking Status' : 'Status das Reservas'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{isEn ? 'Completed' : 'Concluídas'}</span>
              <span className="font-medium text-green-500">{stats.bookings.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{isEn ? 'Confirmed' : 'Confirmadas'}</span>
              <span className="font-medium text-blue-500">{stats.bookings.confirmed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{isEn ? 'Pending' : 'Pendentes'}</span>
              <span className="font-medium text-yellow-500">{stats.bookings.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{isEn ? 'Cancelled' : 'Canceladas'}</span>
              <span className="font-medium text-red-500">{stats.bookings.cancelled}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
              <span className="text-gray-900 dark:text-white">{isEn ? 'Total' : 'Total'}</span>
              <span className="text-gray-900 dark:text-white">{stats.bookings.total}</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
            {isEn ? 'Reviews' : 'Avaliações'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{isEn ? 'Average Rating' : 'Média'}</span>
              <span className="font-medium text-yellow-500 flex items-center gap-1">
                {stats.reviews.avg.toFixed(1)} <Star size={14} className="fill-yellow-400 text-yellow-400" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">5 ⭐</span>
              <span className="font-medium text-green-500">{stats.reviews.rating5}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">4 ⭐</span>
              <span className="font-medium text-blue-500">{stats.reviews.rating4}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">3 ⭐</span>
              <span className="font-medium text-yellow-500">{stats.reviews.rating3}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">2 ⭐</span>
              <span className="font-medium text-orange-500">{stats.reviews.rating2}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">1 ⭐</span>
              <span className="font-medium text-red-500">{stats.reviews.rating1}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
              <span className="text-gray-900 dark:text-white">{isEn ? 'Total' : 'Total'}</span>
              <span className="text-gray-900 dark:text-white">{stats.reviews.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}