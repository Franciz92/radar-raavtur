// src/pages/admin/AdminDashboard.jsx
// ============================================
// DASHBOARD DO ADMIN - COM APOIO
// - Usa 'businesses' (nao 'companies')
// - Usa 'is_verified' (nao 'status')
// - Inclui estatisticas de tickets de apoio
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import {
  Users,
  Building2,
  CalendarCheck,
  Star,
  Package,
  DollarSign,
  Settings,
  ArrowRight,
  Loader2,
  AlertCircle,
  Newspaper,
  PlusCircle,
  Zap,
  Activity,
  RefreshCw,
  MapPin,
  CheckCircle,
  Image,
  Music,
  File,
  Calendar,
  Trash2,
  Clock,
  LifeBuoy,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, link, badge }) => {
  const CardContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer hover:scale-[1.02] relative">
      <div className="flex items-center justify-between">
        <div className={`inline-flex rounded-xl p-3 ${bg}`}>
          <Icon size={22} className={color} />
        </div>
        {badge && (
          <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">
            {badge}
          </span>
        )}
        {subtitle && (
          <span className="text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
            {subtitle}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  )

  if (link) return <Link to={link}><CardContent /></Link>
  return <CardContent />
}

const QuickAction = ({ to, icon: Icon, label, description, color }) => (
  <Link
    to={to}
    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-500 transition" />
  </Link>
)

const ActivityItem = ({ icon: Icon, title, description, time, status }) => {
  const statusColors = {
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
      <div className={`p-2 rounded-full ${statusColors[status] || statusColors.info}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AdminDashboard() {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    bookings: 0,
    services: 0,
    reviews: 0,
    revenue: 0,
    pendingCompanies: 0,
    pendingServices: 0,
    destinations: 0,
    // ✅ NOVO: tickets
    ticketsTotal: 0,
    ticketsOpen: 0,
    ticketsUnread: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Perfis
      const { data: profiles } = await supabase.from('profiles').select('*')
      const totalUsers = profiles?.length || 0

      // Empresas
      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })

      const { count: pendingBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)

      // Reservas
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

      // Serviços
      const { count: totalServices } = await supabase
        .from('company_services')
        .select('*', { count: 'exact', head: true })

      const { count: pendingServices } = await supabase
        .from('company_services')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Destinos
      const { count: totalDestinations } = await supabase
        .from('destinations')
        .select('*', { count: 'exact', head: true })

      // Reviews
      const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })

      // Receita
      const { data: paidBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('payment_status', 'paid')

      const totalRevenue = paidBookings?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0

      // ✅ NOVO: Tickets de apoio
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('status')

      const ticketsTotal = tickets?.length || 0
      const ticketsOpen = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0

      const { count: unreadMessages } = await supabase
        .from('support_messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('sender_role', 'user')

      const newStats = {
        users: totalUsers,
        companies: totalBusinesses || 0,
        bookings: totalBookings || 0,
        services: totalServices || 0,
        reviews: totalReviews || 0,
        revenue: totalRevenue,
        pendingCompanies: pendingBusinesses || 0,
        pendingServices: pendingServices || 0,
        destinations: totalDestinations || 0,
        ticketsTotal,
        ticketsOpen,
        ticketsUnread: unreadMessages || 0,
      }

      console.log('✅ [Dashboard] Estatísticas:', newStats)
      setStats(newStats)

      // Atividades recentes
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('id, created_at, status, total_price, user_id')
        .order('created_at', { ascending: false })
        .limit(5)

      let activities = []
      if (recentBookings && recentBookings.length > 0) {
        const userIds = recentBookings.map(b => b.user_id).filter(id => id)
        let userNames = {}
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds)
          if (usersData) {
            userNames = usersData.reduce((acc, u) => ({ ...acc, [u.id]: u.name || 'Usuário' }), {})
          }
        }

        activities = recentBookings.map(b => ({
          id: b.id,
          icon: CalendarCheck,
          title: `Nova reserva #${b.id.slice(0, 8)}`,
          description: `${userNames[b.user_id] || 'Usuário'} - ${b.total_price?.toLocaleString() || 0} Kz`,
          time: new Date(b.created_at).toLocaleString('pt-PT'),
          status: b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'info'
        }))
      }

      // ✅ NOVO: Adicionar tickets recentes às atividades
      const { data: recentTickets } = await supabase
        .from('support_tickets')
        .select('id, subject, created_at, status, user_id')
        .order('created_at', { ascending: false })
        .limit(3)

      if (recentTickets && recentTickets.length > 0) {
        const ticketUserIds = recentTickets.map(t => t.user_id).filter(id => id)
        let ticketUserNames = {}
        if (ticketUserIds.length > 0) {
          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', ticketUserIds)
          if (usersData) {
            ticketUserNames = usersData.reduce((acc, u) => ({ ...acc, [u.id]: u.name || 'Usuário' }), {})
          }
        }

        const ticketActivities = recentTickets.map(t => ({
          id: `ticket-${t.id}`,
          icon: LifeBuoy,
          title: `Ticket: ${t.subject}`,
          description: `${ticketUserNames[t.user_id] || 'Usuário'}`,
          time: new Date(t.created_at).toLocaleString('pt-PT'),
          status: t.status === 'open' ? 'warning' : t.status === 'resolved' ? 'success' : 'info'
        }))

        activities = [...activities, ...ticketActivities].slice(0, 8)
      }

      setRecentActivity(activities)
      setLastUpdated(new Date())

    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error)
      toast.error(isEn ? 'Error loading dashboard' : 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // REALTIME
  // ============================================
  useEffect(() => {
    loadDashboardData()

    const profilesChannel = supabase
      .channel('admin-dashboard-profiles')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => loadDashboardData()
      )
      .subscribe()

    const businessesChannel = supabase
      .channel('admin-dashboard-businesses')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'businesses' },
        () => loadDashboardData()
      )
      .subscribe()

    const bookingsChannel = supabase
      .channel('admin-dashboard-bookings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => loadDashboardData()
      )
      .subscribe()

    // ✅ NOVO: Realtime para tickets
    const ticketsChannel = supabase
      .channel('admin-dashboard-tickets')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => loadDashboardData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(businessesChannel)
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(ticketsChannel)
    }
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const statItems = [
    {
      title: isEn ? 'Users' : 'Usuários',
      value: stats.users,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/admin/utilizadores'
    },
    {
      title: isEn ? 'Companies' : 'Empresas',
      value: stats.companies,
      icon: Building2,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/admin/empresas',
      subtitle: stats.pendingCompanies > 0 ? `${stats.pendingCompanies} pendentes` : undefined
    },
    {
      title: isEn ? 'Pending Approvals' : 'Aprovações Pendentes',
      value: stats.pendingCompanies,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      link: '/admin/aprovar-empresas',
      badge: stats.pendingCompanies > 0 ? 'Novo' : undefined
    },
    {
      title: isEn ? 'Bookings' : 'Reservas',
      value: stats.bookings,
      icon: CalendarCheck,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      link: '/admin/reservas'
    },
    {
      title: isEn ? 'Revenue' : 'Receita',
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      link: '/admin/transacoes'
    },
    {
      title: isEn ? 'Services' : 'Serviços',
      value: stats.services,
      icon: Package,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      link: '/admin/servicos',
      subtitle: stats.pendingServices > 0 ? `${stats.pendingServices} pendentes` : undefined
    },
    {
      title: isEn ? 'Destinations' : 'Destinos',
      value: stats.destinations,
      icon: MapPin,
      color: 'text-teal-500',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      link: '/admin/destinos'
    },
    {
      title: isEn ? 'Reviews' : 'Avaliações',
      value: stats.reviews,
      icon: Star,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      link: '/admin/avaliacoes'
    },
    // ✅ NOVO: Card de Tickets de Apoio
    {
      title: isEn ? 'Support Tickets' : 'Tickets de Apoio',
      value: stats.ticketsOpen,
      icon: LifeBuoy,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      link: '/admin/apoio',
      badge: stats.ticketsUnread > 0 ? `${stats.ticketsUnread} novas` : undefined,
      subtitle: stats.ticketsTotal > 0 && stats.ticketsUnread === 0 ? `${stats.ticketsTotal} total` : undefined
    },
  ]

  const quickActions = [
    {
      to: '/admin/aprovar-empresas',
      icon: Clock,
      label: isEn ? 'Approve Businesses' : 'Aprovar Empresas',
      description: stats.pendingCompanies > 0
        ? isEn ? `${stats.pendingCompanies} pending approvals` : `${stats.pendingCompanies} aprovações pendentes`
        : isEn ? 'Review new businesses' : 'Revisar novas empresas',
      color: stats.pendingCompanies > 0 ? 'bg-yellow-500' : 'bg-gray-500'
    },
    // ✅ NOVO: Ação rápida de Apoio
    {
      to: '/admin/apoio',
      icon: LifeBuoy,
      label: isEn ? 'Support Tickets' : 'Tickets de Apoio',
      description: stats.ticketsUnread > 0
        ? isEn ? `${stats.ticketsUnread} unread messages` : `${stats.ticketsUnread} mensagens não lidas`
        : stats.ticketsOpen > 0
        ? isEn ? `${stats.ticketsOpen} open tickets` : `${stats.ticketsOpen} tickets abertos`
        : isEn ? 'Manage user support' : 'Gerir apoio aos utilizadores',
      color: stats.ticketsUnread > 0 ? 'bg-red-500' : 'bg-amber-500'
    },
    {
      to: '/admin/empresas',
      icon: Building2,
      label: isEn ? 'Manage Companies' : 'Gerenciar Empresas',
      description: isEn ? 'Approve, edit or delete companies' : 'Aprove, edite ou delete empresas',
      color: 'bg-purple-500'
    },
    {
      to: '/admin/servicos',
      icon: Package,
      label: isEn ? 'Manage Services' : 'Gerenciar Serviços',
      description: isEn ? 'Manage all services' : 'Gerencie todos os serviços',
      color: 'bg-indigo-500'
    },
    {
      to: '/admin/reservas',
      icon: CalendarCheck,
      label: isEn ? 'Manage Bookings' : 'Gerenciar Reservas',
      description: isEn ? 'View and manage bookings' : 'Visualize e gerencie reservas',
      color: 'bg-green-500'
    },
    {
      to: '/admin/utilizadores',
      icon: Users,
      label: isEn ? 'Manage Users' : 'Gerenciar Usuários',
      description: isEn ? 'View and manage users' : 'Visualize e gerencie usuários',
      color: 'bg-blue-500'
    },
    {
      to: '/admin/blog',
      icon: Newspaper,
      label: isEn ? 'Manage Blog' : 'Gerenciar Blog',
      description: isEn ? 'Create and edit blog posts' : 'Crie e edite posts do blog',
      color: 'bg-emerald-500'
    },
    {
      to: '/admin/configuracoes',
      icon: Settings,
      label: isEn ? 'Settings' : 'Configurações',
      description: isEn ? 'Platform settings' : 'Configurações da plataforma',
      color: 'bg-gray-500'
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {isEn ? 'Admin Dashboard' : 'Painel do Administrador'}
            <span className="text-sm font-normal text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {isEn ? 'Live' : 'Ao Vivo'}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            {isEn ? 'Welcome back, Administrator!' : 'Bem-vindo de volta, Administrador!'}
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                • {isEn ? 'Updated' : 'Atualizado'} {lastUpdated.toLocaleTimeString('pt-PT')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm hidden sm:inline">
              {isEn ? 'Refresh' : 'Atualizar'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        {statItems.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* ✅ Alerta de Apoio (se houver tickets não lidos) */}
      {stats.ticketsUnread > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-2xl p-4 mb-4 animate-pulse">
          <div className="flex items-center gap-3 flex-wrap">
            <MessageCircle size={24} className="text-red-600" />
            <span className="font-bold text-red-800 dark:text-red-200">
              {isEn ? 'You have unread support messages!' : 'Tem mensagens de apoio não lidas!'}
            </span>
            <Link 
              to="/admin/apoio" 
              className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition"
            >
              {isEn ? 'View now' : 'Ver agora'} ({stats.ticketsUnread})
            </Link>
          </div>
        </div>
      )}

      {/* Alerta de Pendências */}
      {(stats.pendingCompanies > 0 || stats.pendingServices > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <AlertCircle size={20} className="text-yellow-600" />
            <span className="font-medium text-yellow-800 dark:text-yellow-200">
              {isEn ? 'Pending approvals' : 'Aprovações pendentes'}
            </span>
            {stats.pendingCompanies > 0 && (
              <Link to="/admin/aprovar-empresas" className="text-sm text-yellow-600 dark:text-yellow-300 hover:underline">
                {stats.pendingCompanies} {isEn ? 'businesses' : 'empresas'}
              </Link>
            )}
            {stats.pendingServices > 0 && (
              <Link to="/admin/servicos" className="text-sm text-yellow-600 dark:text-yellow-300 hover:underline">
                {stats.pendingServices} {isEn ? 'services' : 'serviços'}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions e Atividades */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap size={18} className="text-gray-400" />
            {isEn ? 'Quick Actions' : 'Ações Rápidas'}
          </h3>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <QuickAction key={action.to} {...action} />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-gray-400" />
              {isEn ? 'Recent Activity' : 'Atividades Recentes'}
            </h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{isEn ? 'No recent activity' : 'Nenhuma atividade recente'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} {...activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ NOVO: Secção de Apoio ao Cliente */}
      <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-xl">
              <LifeBuoy size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {isEn ? 'Support Center' : 'Centro de Apoio'}
                {stats.ticketsUnread > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {stats.ticketsUnread} {isEn ? 'new' : 'novas'}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {stats.ticketsTotal > 0
                  ? isEn
                    ? `${stats.ticketsTotal} total tickets · ${stats.ticketsOpen} open`
                    : `${stats.ticketsTotal} tickets no total · ${stats.ticketsOpen} abertos`
                  : isEn
                  ? 'No support tickets yet'
                  : 'Nenhum ticket de apoio ainda'}
              </p>
            </div>
          </div>
          <Link
            to="/admin/apoio"
            className="btn-primary flex items-center gap-2"
            style={{ background: '#f59e0b' }}
          >
            <LifeBuoy size={18} />
            {isEn ? 'Manage Support' : 'Gerir Apoio'}
          </Link>
        </div>
      </div>

      {/* Gerenciamento de Conteúdo */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Trash2 size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEn ? 'Content Management' : 'Gerenciamento de Conteúdo'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isEn
                  ? 'Manage and delete all content types from one place'
                  : 'Gerencie e delete todos os tipos de conteúdo em um só lugar'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/empresas" className="btn-primary flex items-center gap-2">
              <Building2 size={16} />
              {isEn ? 'Companies' : 'Empresas'}
            </Link>
            <Link to="/admin/servicos" className="btn-primary flex items-center gap-2" style={{ background: '#6366f1' }}>
              <Package size={16} />
              {isEn ? 'Services' : 'Serviços'}
            </Link>
            <Link to="/admin/reservas" className="btn-primary flex items-center gap-2" style={{ background: '#22c55e' }}>
              <CalendarCheck size={16} />
              {isEn ? 'Bookings' : 'Reservas'}
            </Link>
            <Link to="/admin/destinos" className="btn-primary flex items-center gap-2" style={{ background: '#14b8a6' }}>
              <MapPin size={16} />
              {isEn ? 'Destinations' : 'Destinos'}
            </Link>
          </div>
        </div>
      </div>

      {/* Blog */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <Newspaper size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEn ? 'Blog Management' : 'Gerenciamento do Blog'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isEn
                  ? 'Create, edit and manage all blog posts from one place'
                  : 'Crie, edite e gerencie todos os posts do blog em um só lugar'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/blog" className="btn-primary flex items-center gap-2">
              <Newspaper size={18} />
              {isEn ? 'Manage Blog' : 'Gerenciar Blog'}
            </Link>
            <Link to="/admin/blog/novo" className="btn-secondary flex items-center gap-2">
              <PlusCircle size={18} />
              {isEn ? 'New Post' : 'Novo Post'}
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <CheckCircle size={14} className="text-green-500" />
            {isEn ? 'Create posts' : 'Criar posts'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Image size={14} className="text-blue-500" />
            {isEn ? 'Upload images' : 'Enviar imagens'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Music size={14} className="text-purple-500" />
            {isEn ? 'Add audio' : 'Adicionar áudio'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <File size={14} className="text-orange-500" />
            {isEn ? 'Attach documents' : 'Anexar documentos'}
          </span>
        </div>
      </div>
    </div>
  )
}