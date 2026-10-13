// src/pages/company/CompanyNotifications.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bell,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  Calendar,
  Loader2,
  Check,
  Trash2,
  X,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// ============================================
// COMPONENTE PRINCIPAL - EXPORTADO COMO DEFAULT
// ============================================

export default function CompanyNotifications() {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Nova notificação:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.success(payload.new.title);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success(isEn ? 'All notifications marked as read' : 'Todas notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(isEn ? 'Notification deleted' : 'Notificação removida');
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'booking':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'review_reply':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isEn ? 'Just now' : 'Agora mesmo';
    if (minutes < 60) return `${minutes}m ${isEn ? 'ago' : 'atrás'}`;
    if (hours < 24) return `${hours}h ${isEn ? 'ago' : 'atrás'}`;
    if (days < 7) return `${days}d ${isEn ? 'ago' : 'atrás'}`;
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEn ? 'Notifications' : 'Notificações'}
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            {isEn ? 'Mark all as read' : 'Marcar todas como lidas'}
          </button>
        )}
      </div>

      {/* Lista de Notificações */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {isEn ? 'No notifications yet' : 'Nenhuma notificação ainda'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                        >
                          {isEn ? 'View details →' : 'Ver detalhes →'}
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(notification.created_at)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title={isEn ? 'Mark as read' : 'Marcar como lida'}
                        >
                          <Check className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title={isEn ? 'Delete' : 'Remover'}
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}