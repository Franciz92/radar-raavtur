// src/pages/user/UserNotificationsPage.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCircle, Loader2, RefreshCw, Trash2, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function UserNotificationsPage() {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error loading notifications' : 'Erro ao carregar notificações')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) { console.error('Erro:', error) }
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Bell size={28} className="text-primary-500" /> {isEn ? 'Notifications' : 'Notificações'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{notifications.length} {isEn ? 'notifications' : 'notificações'}</p>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{isEn ? 'No notifications' : 'Nenhuma notificação'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border ${!n.read ? 'border-primary-200 dark:border-primary-800' : 'border-gray-100 dark:border-gray-700'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-medium ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="p-1 text-primary-500 hover:bg-primary-50 rounded-lg">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button className="p-1 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}