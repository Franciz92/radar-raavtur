// src/pages/admin/AdminBookings.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw,
  User,
  Building2,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminBookings() {
  const { isEn } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadBookings()
  }, [])

  // ============================================
  // FUNÇO LOAD BOOKINGS - CORRIGIDA (SEM JOINS)
  // ============================================
  const loadBookings = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando reservas para admin...')
      
      // 1. Buscar reservas
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (bookingsError) {
        console.error('❌ Erro ao buscar reservas:', bookingsError)
        throw bookingsError
      }
      
      console.log('✅ Reservas encontradas:', bookingsData?.length || 0)

      // 2. Se houver reservas, buscar dados adicionais
      if (bookingsData && bookingsData.length > 0) {
        // Buscar dados dos utilizadores
        const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))]
        let userMap = {}
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, name, email, phone, avatar_url')
            .in('id', userIds)
          
          if (!usersError && users) {
            userMap = users.reduce((acc, u) => {
              acc[u.id] = u
              return acc
            }, {})
            console.log('👤 Utilizadores encontrados:', Object.keys(userMap).length)
          }
        }

        // Buscar dados das empresas
        const companyIds = [...new Set(bookingsData.map(b => b.company_id).filter(Boolean))]
        let companyMap = {}
        if (companyIds.length > 0) {
          const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id, name, logo')
            .in('id', companyIds)
          
          if (!companiesError && companies) {
            companyMap = companies.reduce((acc, c) => {
              acc[c.id] = c
              return acc
            }, {})
            console.log('🏢 Empresas encontradas:', Object.keys(companyMap).length)
          }
        }

        // 3. Combinar dados
        const bookingsWithDetails = bookingsData.map(booking => ({
          ...booking,
          profiles: userMap[booking.user_id] || null,
          company: companyMap[booking.company_id] || null
        }))

        setBookings(bookingsWithDetails)
        console.log('✅ Reservas com detalhes:', bookingsWithDetails.length)
      } else {
        setBookings([])
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar reservas:', error)
      toast.error(isEn ? 'Error loading bookings' : 'Erro ao carregar reservas')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadBookings()
    setRefreshing(false)
    toast.success(isEn ? 'Bookings updated!' : 'Reservas atualizadas!')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: isEn ? 'Pending' : 'Pendente', variant: 'warning', icon: Clock },
      confirmed: { label: isEn ? 'Confirmed' : 'Confirmada', variant: 'success', icon: CheckCircle },
      completed: { label: isEn ? 'Completed' : 'Concluída', variant: 'info', icon: CheckCircle },
      cancelled: { label: isEn ? 'Cancelled' : 'Cancelada', variant: 'danger', icon: XCircle },
    }
    
    const info = statusMap[status] || statusMap.pending
    const Icon = info.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
        ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
      `}>
        <Icon size={12} />
        {info.label}
      </span>
    )
  }

  const getPaymentBadge = (status) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle size={12} />
          {isEn ? 'Paid' : 'Pago'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock size={12} />
        {isEn ? 'Pending' : 'Pendente'}
      </span>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading bookings...' : 'Carregando reservas...'}
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
            <Calendar size={28} className="text-primary-500" />
            {isEn ? 'Bookings' : 'Reservas'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage all bookings (${stats.total})`
              : `Gerencie todas as reservas (${stats.total})`
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Confirmed' : 'Confirmadas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.confirmed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Completed' : 'Concluídas'}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Cancelled' : 'Canceladas'}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search bookings...' : 'Pesquisar reservas...'}
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
            <option value="confirmed">{isEn ? 'Confirmed' : 'Confirmadas'}</option>
            <option value="completed">{isEn ? 'Completed' : 'Concluídas'}</option>
            <option value="cancelled">{isEn ? 'Cancelled' : 'Canceladas'}</option>
          </select>
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Reservas */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No bookings found' : 'Nenhuma reserva encontrada'}
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
          ) : null}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'ID' : 'ID'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Customer' : 'Cliente'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Company' : 'Empresa'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Amount' : 'Valor'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Status' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Payment' : 'Pagamento'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Actions' : 'Ações'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {booking.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.profiles?.name || booking.customer_name || 'Cliente'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.profiles?.email || booking.customer_email || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {booking.company?.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-primary-500">
                        {formatCurrency(booking.total_price || booking.subtotal || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-4">
                      {getPaymentBadge(booking.payment_status)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/reservas/${booking.id}`}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition inline-block"
                        title={isEn ? 'View details' : 'Ver detalhes'}
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}