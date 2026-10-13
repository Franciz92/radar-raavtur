// src/pages/admin/AdminNotifications.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  User,
  Building2,
  Package,
  DollarSign,
  Star,
  MessageCircle,
  CheckCheck
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminNotifications() {
  const { isEn } = useLanguage()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterRead, setFilterRead] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          user:user_id (id, name, email)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const notificationsData = data || []
      setNotifications(notificationsData)
      
      setStats({
        total: notificationsData.length,
        unread: notificationsData.filter(n => !n.read).length,
        read: notificationsData.filter(n => n.read).length
      })
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
      toast.error(isEn ? 'Error loading notifications' : 'Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadNotifications()
    setRefreshing(false)
    toast.success(isEn ? 'Notifications updated!' : 'Notificações atualizadas!')
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      
      setStats(prev => ({
        ...prev,
        unread: prev.unread - 1,
        read: prev.read + 1
      }))
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error marking as read' : 'Erro ao marcar como lida')
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) {
      toast.info(isEn ? 'No unread notifications' : 'Nenhuma notificação não lida')
      return
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)
      
      if (error) throw error
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }))
      
      toast.success(isEn ? 'All marked as read!' : 'Todas marcadas como lidas!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error marking all as read' : 'Erro ao marcar todas como lidas')
    }
  }

  const deleteNotification = async (notificationId) => {
    if (!confirm(isEn ? 'Delete this notification?' : 'Excluir esta notificação?')) return
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
      
      if (error) throw error
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: prev.unread - (notifications.find(n => n.id === notificationId)?.read ? 0 : 1),
        read: prev.read - (notifications.find(n => n.id === notificationId)?.read ? 1 : 0)
      }))
      
      toast.success(isEn ? 'Notification deleted!' : 'Notificação excluída!')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error deleting notification' : 'Erro ao excluir notificação')
    }
  }

  const getIcon = (type) => {
    const icons = {
      booking_created: Calendar,
      booking_confirmed: CheckCircle,
      booking_completed: CheckCheck,
      booking_cancelled: XCircle,
      payment_received: DollarSign,
      review_created: Star,
      reply_received: MessageCircle,
      withdrawal_request: DollarSign,
      withdrawal_completed: CheckCircle,
      withdrawal_failed: XCircle,
      service_approved: CheckCircle,
      service_rejected: XCircle,
      company_approved: CheckCircle,
      company_rejected: XCircle
    }
    return icons[type] || Bell
  }

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || n.type === filterType
    const matchesRead = filterRead === 'all' || 
                        (filterRead === 'unread' && !n.read) ||
                        (filterRead === 'read' && n.read)
    
    return matchesSearch && matchesType && matchesRead
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
            <Bell size={28} className="text-primary-500" />
            {isEn ? 'Notifications' : 'Notificações'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage all platform notifications (${stats.total})`
              : `Gerencie todas as notificações da plataforma (${stats.total})`
            }
          </p>
        </div>
        <div className="flex gap-2">
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition flex items-center gap-2"
            >
              <CheckCheck size={16} />
              {isEn ? 'Mark all as read' : 'Marcar todas como lidas'}
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-primary-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Unread' : 'Não lidas'}</p>
          <p className="text-2xl font-bold text-primary-500">{stats.unread}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Read' : 'Lidas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.read}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search notifications...' : 'Pesquisar notificações...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All Types' : 'Todos os Tipos'}</option>
            <option value="booking_created">{isEn ? 'Bookings' : 'Reservas'}</option>
            <option value="payment_received">{isEn ? 'Payments' : 'Pagamentos'}</option>
            <option value="review_created">{isEn ? 'Reviews' : 'Avaliações'}</option>
            <option value="withdrawal_request">{isEn ? 'Withdrawals' : 'Saques'}</option>
            <option value="service_approved">{isEn ? 'Services' : 'Serviços'}</option>
          </select>
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All' : 'Todas'}</option>
            <option value="unread">{isEn ? 'Unread' : 'Não lidas'}</option>
            <option value="read">{isEn ? 'Read' : 'Lidas'}</option>
          </select>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No notifications found' : 'Nenhuma notificação encontrada'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type)
            const isUnread = !notification.read
            
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition
                  ${isUnread ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/5' : 'border-gray-100 dark:border-gray-700'}
                `}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isUnread ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'}
                  `}>
                    <Icon size={18} className={isUnread ? 'text-primary-500' : 'text-gray-400'} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm ${isUnread ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUnread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg transition"
                            title={isEn ? 'Mark as read' : 'Marcar como lida'}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                          title={isEn ? 'Delete' : 'Excluir'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      {notification.user?.name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {notification.user.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}