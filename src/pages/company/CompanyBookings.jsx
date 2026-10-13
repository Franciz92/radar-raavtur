// src/pages/company/CompanyBookings.jsx

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  Building2,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Search,
  Filter,
  Package,
  User,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE STATUS
// ============================================

const StatusBadge = ({ status, isEn }) => {
  const statusMap = {
    pending: {
      label: isEn ? 'Pending' : 'Pendente',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: ClockIcon,
    },
    confirmed: {
      label: isEn ? 'Confirmed' : 'Confirmada',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
    },
    completed: {
      label: isEn ? 'Completed' : 'Concluída',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: CheckCircle,
    },
    cancelled: {
      label: isEn ? 'Cancelled' : 'Cancelada',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: XCircle,
    },
  };

  const statusInfo = statusMap[status] || statusMap.pending;
  const Icon = statusInfo.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
      <Icon className="w-3 h-3" />
      {statusInfo.label}
    </span>
  );
};

// ============================================
// COMPONENTE DE CARD DE RESERVA
// ============================================

const BookingCard = ({ booking, onViewDetails, onUpdateStatus, isEn, loading }) => {
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return `${Number(price).toLocaleString()} Kz`;
  };

  const serviceName = booking.item_name || 
                      booking.service_name || 
                      booking.service?.name || 
                      'Serviço';

  const userName = booking.user_name || 
                   booking.user?.name || 
                   'Usuário';

  const serviceImage = booking.service?.images?.[0] || 
                       booking.item_image || 
                       null;

  const userAvatar = booking.user?.avatar_url || null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {serviceImage ? (
                <img
                  src={serviceImage}
                  alt={serviceName}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Package className="w-7 h-7 text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {serviceName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {userName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(booking.date)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.time || '10:00'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {booking.guests || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preço e Status */}
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(booking.total_price)}
            </p>
            <StatusBadge status={booking.status} isEn={isEn} />
            <p className="text-xs text-gray-400 mt-1">
              #{booking.id?.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
            {isEn ? 'View Details' : 'Ver Detalhes'}
          </button>

          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(booking, 'confirmed')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isEn ? 'Approve' : 'Aprovar'}
              </button>
              <button
                onClick={() => onUpdateStatus(booking, 'cancelled')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {isEn ? 'Reject' : 'Rejeitar'}
              </button>
            </>
          )}

          {booking.status === 'confirmed' && booking.status !== 'completed' && (
            <button
              onClick={() => onUpdateStatus(booking, 'completed')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isEn ? 'Complete' : 'Concluir'}
            </button>
          )}

          {booking.status === 'cancelled' && (
            <button
              onClick={() => onUpdateStatus(booking, 'pending')}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              {isEn ? 'Reopen' : 'Reabrir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE MODAL DE DETALHES
// ============================================

const BookingDetailModal = ({ booking, isEn, onClose, onUpdateStatus, loading }) => {
  if (!booking) return null;

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return `${Number(price).toLocaleString()} Kz`;
  };

  const serviceName = booking.item_name || 
                      booking.service_name || 
                      booking.service?.name || 
                      'Serviço';
  
  const userName = booking.user_name || 
                   booking.user?.name || 
                   'Usuário';
  
  const userEmail = booking.user_email || 
                    booking.user?.email || 
                    '';
  
  const userPhone = booking.user_phone || 
                    booking.user?.phone || 
                    '';

  const serviceImage = booking.service?.images?.[0] || 
                       booking.item_image || 
                       null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <StatusBadge status={booking.status} isEn={isEn} />
            <span className="text-sm text-gray-500 font-mono">
              #{booking.id}
            </span>
          </div>

          {/* Serviço */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-start gap-4">
              {serviceImage ? (
                <img
                  src={serviceImage}
                  alt={serviceName}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {serviceName}
                </h3>
                <p className="text-sm text-gray-500">
                  {isEn ? 'Service' : 'Serviço'}
                </p>
                {booking.service?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {booking.service.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {userName}
                </h4>
                {userEmail && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {userEmail}
                  </p>
                )}
                {userPhone && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {userPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detalhes da Reserva */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Date' : 'Data'}
              </label>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(booking.date)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Time' : 'Horário'}
              </label>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                {booking.time || '10:00'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Guests' : 'Hóspedes'}
              </label>
              <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                {booking.guests || 1}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Total' : 'Total'}
              </label>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(booking.total_price)}
              </p>
            </div>
          </div>

          {/* Observações */}
          {booking.notes && (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Notes' : 'Observações'}
              </label>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{booking.notes}</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(booking, 'confirmed')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isEn ? 'Approve' : 'Aprovar'}
                </button>
                <button
                  onClick={() => onUpdateStatus(booking, 'cancelled')}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  {isEn ? 'Reject' : 'Rejeitar'}
                </button>
              </>
            )}
            {booking.status === 'confirmed' && booking.status !== 'completed' && (
              <button
                onClick={() => onUpdateStatus(booking, 'completed')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isEn ? 'Complete' : 'Concluir'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CompanyBookings() {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  // Buscar empresa do usuário
  useEffect(() => {
    if (user) {
      loadCompany();
    }
  }, [user]);

  const loadCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar empresa:', error);
        toast.error(isEn ? 'Company not found' : 'Empresa não encontrada');
        return;
      }

      setCompany(data);
      loadBookings(data.id);
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(isEn ? 'Error loading company' : 'Erro ao carregar empresa');
    }
  };

  const loadBookings = async (companyId) => {
    if (!companyId) return;

    try {
      setLoading(true);
      console.log('🔄 Carregando reservas da empresa:', companyId);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:service_id (
            id,
            name,
            description,
            price,
            category,
            images
          ),
          user:user_id (
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar reservas:', error);
        toast.error(isEn ? 'Error loading bookings' : 'Erro ao carregar reservas');
        return;
      }

      // Processar dados
      const processedData = (data || []).map(booking => ({
        ...booking,
        service_name: booking.service?.name || booking.item_name || 'Serviço',
        user_name: booking.user?.name || 'Usuário',
        user_email: booking.user?.email || '',
        user_phone: booking.user?.phone || '',
        service_price: booking.service?.price || booking.total_price || 0,
        service_image: booking.service?.images?.[0] || booking.item_image || null,
      }));

      setBookings(processedData);

      // Calcular estatísticas
      const statsData = {
        total: processedData.length,
        pending: processedData.filter(b => b.status === 'pending').length,
        confirmed: processedData.filter(b => b.status === 'confirmed').length,
        completed: processedData.filter(b => b.status === 'completed').length,
        cancelled: processedData.filter(b => b.status === 'cancelled').length,
      };
      setStats(statsData);

      console.log('✅ Reservas carregadas:', processedData.length);
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(isEn ? 'Error loading bookings' : 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (booking, newStatus) => {
    try {
      setUpdating(true);
      console.log(`🔄 Atualizando status: ${booking.id} → ${newStatus}`);

      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      } else if (newStatus === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id);

      if (error) {
        console.error('❌ Erro ao atualizar status:', error);
        toast.error(isEn ? 'Error updating booking' : 'Erro ao atualizar reserva');
        return;
      }

      // Atualizar lista local
      setBookings(prev => 
        prev.map(b => 
          b.id === booking.id 
            ? { ...b, status: newStatus, updated_at: new Date().toISOString() }
            : b
        )
      );

      // Atualizar estatísticas
      setStats(prev => {
        const oldStatus = booking.status;
        const newStats = { ...prev };
        
        if (oldStatus !== newStatus) {
          newStats[oldStatus] = Math.max(0, (newStats[oldStatus] || 0) - 1);
          newStats[newStatus] = (newStats[newStatus] || 0) + 1;
        }
        
        return newStats;
      });

      // Fechar modal se estiver aberto
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedBooking(null);
      }

      const statusMessages = {
        confirmed: isEn ? '✅ Booking approved!' : '✅ Reserva aprovada!',
        cancelled: isEn ? '❌ Booking rejected' : '❌ Reserva rejeitada',
        completed: isEn ? '📌 Booking completed!' : '📌 Reserva concluída!',
        pending: isEn ? '🔄 Booking reopened' : '🔄 Reserva reaberta',
      };

      toast.success(statusMessages[newStatus] || (isEn ? 'Status updated' : 'Status atualizado'));

    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(isEn ? 'Error updating booking' : 'Erro ao atualizar reserva');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const handleRefresh = () => {
    if (company?.id) {
      loadBookings(company.id);
    }
  };

  // Filtros
  const filteredBookings = bookings.filter((booking) => {
    if (filter !== 'all' && booking.status !== filter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Booking Management' : 'Gestão de Reservas'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn 
              ? `You have ${bookings.length} booking(s)` 
              : `Você tem ${bookings.length} reserva(s)`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {isEn ? 'Refresh' : 'Atualizar'}
        </button>
      </div>

      {/* Estatísticas */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500">{isEn ? 'Total' : 'Total'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">{isEn ? 'Pending' : 'Pendente'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-xs text-gray-500">{isEn ? 'Confirmed' : 'Confirmada'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">{isEn ? 'Completed' : 'Concluída'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500">{isEn ? 'Cancelled' : 'Cancelada'}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
          <option value="pending">{isEn ? 'Pending' : 'Pendente'}</option>
          <option value="confirmed">{isEn ? 'Confirmed' : 'Confirmada'}</option>
          <option value="completed">{isEn ? 'Completed' : 'Concluída'}</option>
          <option value="cancelled">{isEn ? 'Cancelled' : 'Cancelada'}</option>
        </select>

        <span className="text-sm text-gray-500">
          {filteredBookings.length} {isEn ? 'bookings' : 'reservas'}
        </span>
      </div>

      {/* Lista de Reservas */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEn ? 'No bookings found' : 'Nenhuma reserva encontrada'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isEn 
              ? 'Bookings from customers will appear here' 
              : 'Reservas de clientes aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              isEn={isEn}
              loading={updating}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isEn={isEn}
          onClose={handleCloseModal}
          onUpdateStatus={handleUpdateStatus}
          loading={updating}
        />
      )}
    </div>
  );
}