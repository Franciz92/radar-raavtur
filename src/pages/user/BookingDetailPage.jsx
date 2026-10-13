// src/pages/user/UserBookingDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Clock, 
  Users, 
  MapPin, 
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  User,
  DollarSign,
  Building2,
  Star,
  RefreshCw,
  Download,
  Printer,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getBookingById } from '../../services/bookingService';
import { BookingReceipt } from '../../components/BookingReceipt';
import toast from 'react-hot-toast';

// ============================================
// FUNÇO DE STATUS
// ============================================

const getStatusInfo = (status) => {
  const statusMap = {
    pending: {
      label: 'Pendente',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: '⏳',
      description: 'Aguardando aprovação da empresa',
      borderColor: 'border-yellow-500'
    },
    confirmed: {
      label: 'Confirmada',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: '✅',
      description: 'Reserva confirmada pela empresa!',
      borderColor: 'border-green-500'
    },
    completed: {
      label: 'Concluída',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: '📌',
      description: 'Serviço concluído com sucesso!',
      borderColor: 'border-blue-500'
    },
    cancelled: {
      label: 'Cancelada',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: '❌',
      description: 'Reserva cancelada',
      borderColor: 'border-red-500'
    }
  };
  return statusMap[status] || statusMap.pending;
};

// ============================================
// COMPONENTES
// ============================================

const StatusBadge = ({ status }) => {
  const info = getStatusInfo(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${info.color}`}>
      <span>{info.icon}</span>
      {info.label}
    </span>
  );
};

const StatusCard = ({ status }) => {
  const info = getStatusInfo(status);
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 ${info.borderColor} border-gray-100 dark:border-gray-700 transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{info.icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {info.label}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {info.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function UserBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEn } = useLanguage();
  
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 🔥 ESCUTAR MUDANÇAS EM TEMPO REAL
  useEffect(() => {
    if (id) {
      loadBooking();
      
      // 🔥 INSCREVER-SE PARA ATUALIZAÇÕES EM TEMPO REAL
      const channel = supabase
        .channel(`booking-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `id=eq.${id}`
          },
          (payload) => {
            console.log('🔄 [Realtime] Mudança detectada na reserva:', payload);
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (newStatus !== oldStatus) {
              console.log(`📊 Status alterado: ${oldStatus} → ${newStatus}`);
              setBooking(prev => ({
                ...prev,
                status: newStatus,
                updated_at: payload.new.updated_at
              }));
              
              toast.success(
                newStatus === 'confirmed' 
                  ? (isEn ? '✅ Booking confirmed!' : '✅ Reserva confirmada!')
                  : newStatus === 'cancelled'
                  ? (isEn ? '❌ Booking cancelled' : '❌ Reserva cancelada')
                  : (isEn ? `Status updated: ${newStatus}` : `Status atualizado: ${newStatus}`)
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 [Realtime] Status da inscrição:', status);
        });
      
      return () => {
        console.log('🧹 [Realtime] Removendo inscrição...');
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  // 🔥 ESCUTAR MUDANÇAS DE CONEXO
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadBooking = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando reserva:', id);

      const result = await getBookingById(id);

      if (!result.success || !result.data) {
        toast.error(isEn ? 'Booking not found' : 'Reserva não encontrada');
        navigate('/minhas-reservas');
        return;
      }

      const bookingData = result.data;

      if (bookingData.user_id !== user?.id) {
        toast.error(isEn ? 'Access denied' : 'Acesso negado');
        navigate('/minhas-reservas');
        return;
      }

      console.log('✅ Reserva encontrada:', bookingData.id);
      console.log('📊 Status atual:', bookingData.status);
      setBooking(bookingData);

      // Buscar serviço se não veio no resultado
      if (bookingData.service_id && !bookingData.service) {
        const { data: serviceData } = await supabase
          .from('company_services')
          .select('id, name, category, price, currency, description, location, duration, images, icon, rating')
          .eq('id', bookingData.service_id)
          .maybeSingle();
        if (serviceData) setService(serviceData);
      } else if (bookingData.service) {
        setService(bookingData.service);
      }

      // Buscar empresa se não veio no resultado
      if (bookingData.company_id && !bookingData.company) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('id, name, logo, email, phone, address, description, rating')
          .eq('id', bookingData.company_id)
          .maybeSingle();
        if (companyData) setCompany(companyData);
      } else if (bookingData.company) {
        setCompany(bookingData.company);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar reserva:', error);
      toast.error(error.message || (isEn ? 'Error loading booking' : 'Erro ao carregar reserva'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setUpdating(true);
    await loadBooking();
    setUpdating(false);
    toast.success(isEn ? 'Booking updated!' : 'Reserva atualizada!');
  };

  const handleDownloadReceipt = () => {
    if (!booking) return;

    const serviceData = {
      name: service?.name || booking.item_name || 'Serviço',
      description: service?.description || '',
      images: service?.images || (booking.item_image ? [booking.item_image] : []),
    };

    const companyData = {
      name: company?.name || booking.company_name || 'Empresa',
      logo: company?.logo || null,
    };

    setReceiptData({
      booking: booking,
      service: serviceData,
      company: companyData,
    });
    setShowReceipt(true);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0 Kz';
    return `${Number(value).toLocaleString()} Kz`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading booking...' : 'Carregando reserva...'}
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Booking not found' : 'Reserva não encontrada'}
        </p>
        <Link to="/minhas-reservas" className="mt-4 inline-block text-blue-500 hover:underline">
          {isEn ? 'Back to bookings' : 'Voltar para reservas'}
        </Link>
      </div>
    );
  }

  // Nome do serviço
  const serviceName = service?.name || booking.item_name || booking.service_name || 'Serviço';
  const companyName = company?.name || booking.company_name || 'Empresa';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/minhas-reservas" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">#{booking.id.slice(0, 8)}</span>
              <StatusBadge status={booking.status} />
              {!isOnline && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {isEn ? 'Offline' : 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={updating}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
          title={isEn ? 'Refresh' : 'Atualizar'}
        >
          <RefreshCw size={20} className={updating ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Status Card */}
      <StatusCard status={booking.status} />

      {/* Indicador de atualização em tempo real */}
      <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isOnline 
          ? (isEn ? 'Live updates enabled' : 'Atualizações ao vivo ativadas')
          : (isEn ? 'Offline - updates paused' : 'Offline - atualizações pausadas')
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Serviço */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package size={20} className="text-gray-400" />
              {isEn ? 'Service' : 'Serviço'}
            </h2>
            
            <div>
              <div className="flex items-center gap-3">
                {service?.images?.[0] || booking.item_image ? (
                  <img
                    src={service?.images?.[0] || booking.item_image}
                    alt={serviceName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{serviceName}</h3>
                  <p className="text-sm text-gray-500 capitalize">{service?.category || ''}</p>
                </div>
              </div>
              {service?.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-3 text-sm">
                  {service.description}
                </p>
              )}
            </div>
          </div>

          {/* Detalhes da reserva */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Date' : 'Data'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(booking.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Time' : 'Horário'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Clock size={16} className="text-gray-400" />
                  {booking.time || '10:00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Guests' : 'Pessoas'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Users size={16} className="text-gray-400" />
                  {booking.guests || 1}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Total' : 'Total'}
                </p>
                <p className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <DollarSign size={16} />
                  {formatCurrency(booking.total_price)}
                </p>
              </div>
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Notes' : 'Observações'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Empresa */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-gray-400" />
              {isEn ? 'Company' : 'Empresa'}
            </h3>
            
            <div className="flex items-center gap-3">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={companyName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-500">
                  {companyName.charAt(0) || 'E'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{companyName}</p>
                {company?.rating && (
                  <div className="flex items-center gap-1 text-sm text-yellow-500">
                    <Star size={14} className="fill-yellow-400" />
                    {company.rating}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {company?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span>{company.email}</span>
                </div>
              )}
              {company?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company?.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{company.address}</span>
                </div>
              )}
            </div>

            <Link
              to={`/empresa/${company?.id || booking.company_id}`}
              className="w-full mt-4 block text-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition text-sm"
            >
              {isEn ? 'View Company' : 'Ver Empresa'}
            </Link>
          </div>

          {/* Botões de Ação */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Actions' : 'Ações'}
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition text-sm"
              >
                <Download size={16} />
                {isEn ? 'Download Receipt' : 'Baixar Comprovativo'}
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition text-sm"
              >
                <Printer size={16} />
                {isEn ? 'Print' : 'Imprimir'}
              </button>
            </div>
          </div>

          {/* Mensagens de status */}
          {booking.status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    {isEn ? 'Awaiting Approval' : 'Aguardando Aprovação'}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {isEn 
                      ? 'The company is reviewing your booking. The status will update automatically.'
                      : 'A empresa está analisando sua reserva. O status será atualizado automaticamente.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {isEn ? 'Booking Confirmed!' : 'Reserva Confirmada!'}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {isEn 
                      ? 'Your booking has been confirmed. Enjoy your experience!'
                      : 'Sua reserva foi confirmada. Aproveite sua experiência!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {booking.status === 'cancelled' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {isEn ? 'Booking Cancelled' : 'Reserva Cancelada'}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {isEn 
                      ? 'Your booking was cancelled. Please try another service.'
                      : 'Sua reserva foi cancelada. Tente outro serviço.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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