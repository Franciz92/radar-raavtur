// src/pages/public/MyBookingsPage.jsx - CORRIGIDO

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  MapPin,
  Building2,
  ChevronRight,
  Loader2,
  Eye,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Search,
  Filter,
  CalendarDays,
  Package,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUserBookings } from '../../services/bookingService';
import { BookingReceipt } from '../../components/BookingReceipt';
import { supabase } from '../../services/supabase';
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

const BookingCard = ({ booking, onViewDetails, onDownloadReceipt, isEn }) => {
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

  const companyName = booking.company_name || 
                      booking.company?.name || 
                      'Empresa';

  const serviceImage = booking.service?.images?.[0] || 
                       booking.item_image || 
                       null;

  // Função segura para abrir detalhes
  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(booking);
    }
  };

  // Função segura para baixar comprovativo
  const handleDownloadReceipt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownloadReceipt) {
      onDownloadReceipt(booking);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {serviceImage ? (
                <img
                  src={serviceImage}
                  alt={serviceName}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {serviceName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {companyName}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(booking.date)}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {booking.time || '10:00'}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {booking.guests || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

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

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleViewDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
            {isEn ? 'View Details' : 'Ver Detalhes'}
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            {isEn ? 'Receipt' : 'Comprovativo'}
          </button>
          <button
            onClick={handleViewDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
          >
            <Printer className="w-4 h-4" />
            {isEn ? 'Print' : 'Imprimir'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE MODAL DE DETALHES
// ============================================

const BookingDetailModal = ({ booking, isEn, onClose, onDownloadReceipt }) => {
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
  
  const companyName = booking.company_name || 
                      booking.company?.name || 
                      'Empresa';
  
  const serviceImage = booking.service?.images?.[0] || 
                       booking.item_image || 
                       null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <StatusBadge status={booking.status} isEn={isEn} />
            <span className="text-sm text-gray-500 font-mono">
              #{booking.id}
            </span>
          </div>

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
                <p className="text-sm text-gray-500">{companyName}</p>
                {booking.service?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {booking.service.description}
                  </p>
                )}
                {booking.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    📝 {booking.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

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

          {booking.payment_method && (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                {isEn ? 'Payment Method' : 'Método de Pagamento'}
              </label>
              <p className="text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                {booking.payment_method}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-400 space-y-1">
            <p>{isEn ? 'Created' : 'Criado'}: {formatDate(booking.created_at)}</p>
            {booking.updated_at && (
              <p>{isEn ? 'Updated' : 'Atualizado'}: {formatDate(booking.updated_at)}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onClose();
                if (onDownloadReceipt) {
                  onDownloadReceipt(booking);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              {isEn ? 'Download Receipt' : 'Baixar Comprovativo'}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              {isEn ? 'Print' : 'Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const result = await getUserBookings(user.id);
      
      if (result.success) {
        setBookings(result.data || []);
      } else {
        toast.error(result.error || (isEn ? 'Error loading bookings' : 'Erro ao carregar reservas'));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar reservas:', error);
      toast.error(isEn ? 'Error loading bookings' : 'Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    console.log('📋 Abrindo detalhes da reserva:', booking.id);
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  // CORRIGIDO: Buscar dados completos da empresa e serviço
  const handleDownloadReceipt = async (booking) => {
    console.log('📄 Baixando comprovativo da reserva:', booking.id);
    
    try {
      let companyData = booking.company || null;
      let serviceData = booking.service || null;

      // Se não tiver os dados completos, buscar do banco
      if (!companyData || !companyData.logo) {
        console.log('🔍 Buscando dados completos da empresa...');
        const { data: companyFull } = await supabase
          .from('companies')
          .select('*')
          .eq('id', booking.company_id)
          .single();
        
        if (companyFull) {
          companyData = companyFull;
        }
      }

      if (!serviceData || !serviceData.name) {
        console.log('🔍 Buscando dados completos do serviço...');
        const { data: serviceFull } = await supabase
          .from('company_services')
          .select('*')
          .eq('id', booking.service_id)
          .single();
        
        if (serviceFull) {
          serviceData = serviceFull;
        }
      }

      // Criar objeto com dados completos
      const completeService = {
        name: serviceData?.name || booking.item_name || booking.service_name || 'Serviço',
        description: serviceData?.description || '',
        images: serviceData?.images || (booking.item_image ? [booking.item_image] : []),
        category: serviceData?.category || '',
        price: serviceData?.price || booking.total_price || 0,
      };

      const completeCompany = {
        name: companyData?.name || booking.company_name || 'Empresa',
        logo: companyData?.logo || null,
        email: companyData?.email || '',
        phone: companyData?.phone || '',
        address: companyData?.address || null,
        category: companyData?.category || '',
      };

      console.log('✅ Dados completos carregados:', { 
        company: completeCompany, 
        service: completeService 
      });

      setReceiptData({
        booking: booking,
        service: completeService,
        company: completeCompany,
      });
      setShowReceipt(true);
    } catch (error) {
      console.error('❌ Erro ao buscar dados para comprovativo:', error);
      toast.error(isEn ? 'Error loading receipt data' : 'Erro ao carregar dados do comprovativo');
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  // Filtros
  const filteredBookings = bookings.filter((booking) => {
    if (filter !== 'all' && booking.status !== filter) {
      return false;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const itemName = (booking.item_name || booking.service_name || booking.service?.name || '').toLowerCase();
      const companyName = (booking.company_name || booking.company?.name || '').toLowerCase();
      const bookingId = booking.id?.toLowerCase() || '';
      
      return itemName.includes(term) || companyName.includes(term) || bookingId.includes(term);
    }
    
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Título */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'My Bookings' : 'Minhas Reservas'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn 
              ? `You have ${bookings.length} booking(s)` 
              : `Você tem ${bookings.length} reserva(s)`}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {isEn ? 'New Booking' : 'Nova Reserva'}
          <ChevronRight className="w-4 h-4" />
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

      {/* Filtros e Busca */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search bookings...' : 'Buscar reservas...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

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

        <button
          onClick={loadBookings}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {isEn ? 'Refresh' : 'Atualizar'}
        </button>
      </div>

      {/* Lista de Reservas */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <CalendarDays className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEn ? 'No bookings found' : 'Nenhuma reserva encontrada'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isEn 
              ? 'Start exploring and make your first booking!' 
              : 'Comece a explorar e faça sua primeira reserva!'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            {isEn ? 'Explore Services' : 'Explorar Serviços'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={handleViewDetails}
              onDownloadReceipt={handleDownloadReceipt}
              isEn={isEn}
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
          onDownloadReceipt={handleDownloadReceipt}
        />
      )}

      {/* Modal do Comprovativo */}
      {showReceipt && receiptData && (
        <BookingReceipt
          booking={receiptData.booking}
          service={receiptData.service}
          company={receiptData.company}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}