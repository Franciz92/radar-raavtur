// src/components/notifications/NotificationBell.jsx
// ============================================
// SINO DE NOTIFICAÇÕES - COM NAVEGAÇO SPA
// ✅ Dropdown responsivo em mobile
// ✅ Não corta em telemóvel
// ============================================

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BellDot,
  BellRing,
  CheckCheck,
  X,
  Calendar,
  DollarSign,
  Star,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Package,
  User,
  Trash2,
  Eye,
  Heart,
  Sparkles,
  LifeBuoy,
  UserPlus,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

// ============================================
// MAPA DE ÍCONES
// ============================================
const ICON_MAP = {
  Bell,
  Calendar,
  CalendarCheck: Calendar,
  DollarSign,
  Star,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Package,
  User,
  Eye,
  Trash2,
  Heart,
  Sparkles,
  LifeBuoy,
  UserPlus,
}

const TYPE_ICONS = {
  booking_created: Calendar,
  new_booking: Calendar,
  booking_status: Calendar,
  booking_confirmed: CheckCircle,
  booking_completed: CheckCircle,
  booking_cancelled: XCircle,
  payment_received: DollarSign,
  new_transaction: DollarSign,
  review_created: Star,
  new_review: Star,
  new_comment: MessageCircle,
  new_like: Heart,
  new_follower: UserPlus,
  new_user: User,
  new_business: Building2,
  business_approved: CheckCircle,
  new_experience: Sparkles,
  support_ticket: LifeBuoy,
  support_message: MessageCircle,
  support_reply: MessageCircle,
  ticket_status: CheckCircle,
}

const TYPE_COLORS = {
  booking_created: 'text-blue-500',
  new_booking: 'text-blue-500',
  booking_status: 'text-blue-500',
  booking_confirmed: 'text-green-500',
  booking_completed: 'text-green-500',
  booking_cancelled: 'text-red-500',
  payment_received: 'text-yellow-500',
  new_transaction: 'text-yellow-500',
  review_created: 'text-orange-500',
  new_review: 'text-orange-500',
  new_comment: 'text-purple-500',
  new_like: 'text-red-500',
  new_follower: 'text-blue-500',
  new_user: 'text-blue-500',
  new_business: 'text-purple-500',
  business_approved: 'text-green-500',
  new_experience: 'text-amber-500',
  support_ticket: 'text-amber-500',
  support_message: 'text-blue-500',
  support_reply: 'text-blue-500',
  ticket_status: 'text-green-500',
}

// ============================================
// RESOLVER LINK
// ============================================
const resolveLink = (notification, user) => {
  const { type, link, metadata } = notification

  if (link && typeof link === 'string' && link.startsWith('/')) {
    if (link.startsWith('/admin/apoio/') && user?.role !== 'admin') {
      return link.replace('/admin/apoio/', '/apoio/')
    }
    return link
  }

  const meta = metadata || {}
  const isAdmin = user?.role === 'admin'

  switch (type) {
    case 'new_follower':
      return meta.follower_id ? `/perfil/${meta.follower_id}` : '/perfil'
    case 'new_like':
    case 'new_comment':
    case 'new_experience':
      return meta.experience_id ? `/experiencia/${meta.experience_id}` : '/experiencias'
    case 'new_booking':
      return isAdmin ? '/admin/reservas' : '/minhas-reservas'
    case 'booking_status':
      return isAdmin ? '/admin/reservas' : '/minhas-reservas'
    case 'new_review':
    case 'review_created':
      return '/empresa/avaliacoes'
    case 'business_approved':
      return '/empresa/dashboard'
    case 'new_business':
      return '/admin/aprovar-empresas'
    case 'new_user':
      return '/admin/utilizadores'
    case 'new_transaction':
      return isAdmin ? '/admin/transacoes' : '/usuario/transacoes'
    case 'support_ticket':
    case 'support_message':
      return meta.ticket_id
        ? (isAdmin ? `/admin/apoio/${meta.ticket_id}` : `/apoio/${meta.ticket_id}`)
        : (isAdmin ? '/admin/apoio' : '/apoio')
    case 'support_reply':
    case 'ticket_status':
      return meta.ticket_id
        ? (isAdmin ? `/admin/apoio/${meta.ticket_id}` : `/apoio/${meta.ticket_id}`)
        : (isAdmin ? '/admin/apoio' : '/apoio')
    default:
      return null
  }
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const {
    user,
    notifications,
    unreadNotifications,
    isRealtimeConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useAuth()
  const { isEn } = useLanguage()

  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const dropdownRef = useRef(null)
  const prevUnreadRef = useRef(unreadNotifications)

  // ============================================
  // ✅ LISTENER PARA NAVEGAÇO SPA
  // ============================================
  useEffect(() => {
    const handleNotificationNavigate = (event) => {
      const { link, notification } = event.detail || {}

      if (!link) return

      console.log('🧭 [NotificationBell] Navegando para:', link)

      if (notification && !notification.read) {
        markAsRead(notification.id).catch(console.warn)
      }

      setIsOpen(false)

      try {
        navigate(link)
      } catch (err) {
        console.warn('⚠️ Erro ao navegar, usando fallback:', err)
        window.location.href = link
      }
    }

    window.addEventListener('notification-navigate', handleNotificationNavigate)
    return () => {
      window.removeEventListener('notification-navigate', handleNotificationNavigate)
    }
  }, [navigate, markAsRead])

  // ============================================
  // FECHAR AO CLICAR FORA
  // ============================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ============================================
  // ANIMAÇO
  // ============================================
  useEffect(() => {
    if (unreadNotifications > prevUnreadRef.current) {
      setHasNewNotification(true)
      const timer = setTimeout(() => setHasNewNotification(false), 3000)
      return () => clearTimeout(timer)
    }
    prevUnreadRef.current = unreadNotifications
  }, [unreadNotifications])

  // ============================================
  // CLICAR NUMA NOTIFICAÇO
  // ============================================
  const handleNotificationClick = async (notification) => {
    console.log('🖱️ [NotificationBell] Clique:', notification.type)

    if (!notification.read) {
      await markAsRead(notification.id)
    }

    setIsOpen(false)

    const finalLink = resolveLink(notification, user)
    console.log('🧭 [NotificationBell] Link:', finalLink)

    if (finalLink) {
      try {
        navigate(finalLink)
      } catch (err) {
        console.warn('⚠️ Erro ao navegar:', err)
        window.location.href = finalLink
      }
    }
  }

  // ============================================
  // ÍCONE
  // ============================================
  const getIcon = (type, iconName) => {
    let IconComponent = Bell

    if (iconName && ICON_MAP[iconName]) {
      IconComponent = ICON_MAP[iconName]
    } else if (type && TYPE_ICONS[type]) {
      IconComponent = TYPE_ICONS[type]
    }

    const color = TYPE_COLORS[type] || 'text-primary-500'
    return <IconComponent size={18} className={color} />
  }

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation()
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    setLoading(true)
    await markAllAsRead()
    setLoading(false)
  }

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation()
    if (confirm(isEn ? 'Delete this notification?' : 'Excluir esta notificação?')) {
      await deleteNotification(notificationId)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await refreshNotifications()
    setLoading(false)
    toast.success(isEn ? 'Refreshed!' : 'Atualizado!')
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return isEn ? 'Just now' : 'Agora mesmo'
    if (minutes < 60) return `${minutes} ${isEn ? 'min' : 'min'}`
    if (hours < 24) return `${hours} ${isEn ? 'h' : 'h'}`
    return `${days} ${isEn ? 'd' : 'd'}`
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOTO DO SINO */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          hasNewNotification ? 'animate-bounce' : ''
        }`}
        aria-label={isEn ? 'Notifications' : 'Notificações'}
      >
        {unreadNotifications > 0 ? (
          <>
            {hasNewNotification ? (
              <BellRing size={22} className="text-amber-500" />
            ) : (
              <BellDot size={22} className="text-amber-500" />
            )}
            <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ${
              hasNewNotification ? 'animate-pulse' : ''
            }`}>
              {unreadNotifications > 99 ? '99+' : unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          </>
        ) : (
          <Bell size={22} className="text-gray-500 dark:text-gray-400" />
        )}

        <span
          className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white dark:border-gray-900 ${
            isRealtimeConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {/* ============================================ */}
      {/* DROPDOWN — RESPONSIVO EM MOBILE              */}
      {/* ============================================ */}
      {isOpen && (
        <>
          {/* Overlay em mobile para fechar ao clicar fora */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="
              fixed sm:absolute
              top-16 sm:top-auto sm:mt-2
              left-2 right-2 sm:left-auto sm:right-0
              w-auto sm:w-96
              max-w-[calc(100vw-1rem)]
              bg-white dark:bg-gray-800
              rounded-2xl shadow-2xl
              border border-gray-200 dark:border-gray-700
              overflow-hidden
              z-50
              notification-dropdown
            "
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                <Bell size={16} className="text-primary-500" />
                <span>{isEn ? 'Notifications' : 'Notificações'}</span>
                {unreadNotifications > 0 && (
                  <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-500 px-1.5 py-0.5 rounded-full">
                    {unreadNotifications} {isEn ? 'new' : 'novas'}
                  </span>
                )}
                {isRealtimeConnected ? (
                  <span className="text-[10px] text-green-500 flex items-center gap-1">
                    <Wifi size={11} />
                    Live
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <WifiOff size={11} />
                    Offline
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition disabled:opacity-50"
                  title={isEn ? 'Refresh' : 'Atualizar'}
                >
                  <CheckCheck size={15} className={loading ? 'animate-spin' : ''} />
                </button>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="p-1.5 text-gray-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition disabled:opacity-50"
                    title={isEn ? 'Mark all as read' : 'Marcar todas como lidas'}
                  >
                    <CheckCheck size={15} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {isEn ? 'No notifications yet' : 'Nenhuma notificação ainda'}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer ${
                      !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        !notification.read
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {getIcon(notification.type, notification.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs sm:text-sm font-medium ${
                              !notification.read
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition opacity-0 group-hover:opacity-100 sm:opacity-0"
                              title={isEn ? 'Delete' : 'Excluir'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => {
                    setIsOpen(false)
                    navigate('/usuario/notificacoes')
                  }}
                  className="text-xs font-medium text-primary-500 hover:text-primary-600 transition"
                >
                  {isEn ? 'View all notifications' : 'Ver todas as notificações'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}