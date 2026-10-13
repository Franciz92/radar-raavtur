// src/pages/company/CompanyBookingDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Loader2,
  Package,
  Building2,
  Printer,
  Users,
  CreditCard,
  AlertCircle,
  MessageCircle,
  Star,
  RefreshCw,
  Bed,
  Bath,
  Sparkles,
  Shield,
  Wallet
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useCompany } from '../../context/CompanyContext'
import toast from 'react-hot-toast'

export default function CompanyBookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { company } = useCompany()
  const { isEn } = useLanguage()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (id) {
      loadBooking()
    }
  }, [id])

  // ============================================
  // FUNÇO LOAD BOOKING
  // ============================================
  const loadBooking = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando reserva para empresa:', id)
      
      // 1. Buscar a reserva
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (bookingError) {
        console.error('❌ Erro ao buscar reserva:', bookingError)
        throw bookingError
      }
      
      if (!bookingData) {
        console.warn('⚠️ Reserva não encontrada')
        toast.error(isEn ? 'Booking not found' : 'Reserva não encontrada')
        navigate('/empresa/reservas')
        return
      }
      
      console.log('✅ Reserva encontrada:', bookingData.id)
      console.log('📊 Status atual:', bookingData.status)
      console.log('💳 Payment status:', bookingData.payment_status)
      
      // 2. Buscar dados do usuário
      let userData = null
      if (bookingData.user_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, phone, avatar_url')
          .eq('id', bookingData.user_id)
          .maybeSingle()
        
        if (!error && data) {
          userData = data
          console.log('👤 Usuário encontrado:', data.name)
        } else {
          console.warn('⚠️ Usuário não encontrado:', bookingData.user_id)
          userData = {
            name: bookingData.customer_name || 'Usuário',
            email: bookingData.customer_email || 'Email não disponível',
            phone: bookingData.customer_phone || ''
          }
        }
      }

      // 3. Buscar dados da empresa
      let companyData = null
      if (bookingData.company_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, logo, email, phone, address, description, rating')
          .eq('id', bookingData.company_id)
          .maybeSingle()
        
        if (!error && data) {
          companyData = data
          console.log('🏢 Empresa encontrada:', data.name)
        }
      }

      // 4. Buscar dados do serviço
      let serviceData = null
      if (bookingData.service_id) {
        const { data, error } = await supabase
          .from('company_services')
          .select('id, name, category, price, currency, description, location, duration, images, icon, rating, capacity, room_type, items')
          .eq('id', bookingData.service_id)
          .maybeSingle()
        
        if (!error && data) {
          serviceData = data
          console.log('📦 Serviço encontrado:', data.name)
        } else {
          console.warn('⚠️ Serviço não encontrado:', bookingData.service_id)
        }
      }

      // 5. Montar objeto completo
      const completeBooking = {
        ...bookingData,
        user: userData,
        company: companyData,
        service: serviceData
      }

      console.log('✅ Reserva completa carregada')
      setBooking(completeBooking)

    } catch (error) {
      console.error('❌ Erro ao carregar reserva:', error)
      toast.error(error.message || (isEn ? 'Error loading booking' : 'Erro ao carregar reserva'))
      navigate('/empresa/reservas')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // FUNÇO PARA FORÇAR ATUALIZAÇO
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadBooking()
    setRefreshing(false)
    toast.success(isEn ? 'Booking updated!' : 'Reserva atualizada!')
  }

  // ============================================
  // FUNÇO PARA APROVAR/REJEITAR RESERVA
  // ============================================
  const handleBookingAction = async (action) => {
    if (updating) return
    
    if (!booking || !company) {
      toast.error(isEn ? 'Company not found' : 'Empresa não encontrada')
      return
    }

    setActionType(action)
    setShowConfirmModal(true)
  }

  const confirmAction = async () => {
    setShowConfirmModal(false)
    setUpdating(true)
    
    try {
      const newStatus = actionType === 'approve' ? 'confirmed' : 'cancelled'
      const paymentStatus = actionType === 'approve' ? 'confirmed' : 'refunded'
      
      console.log(`📝 ${actionType === 'approve' ? 'Aprovando' : 'Rejeitando'} reserva:`, id)
      
      // 🔥 ATUALIZAR A RESERVA DIRETAMENTE
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) {
        console.error('❌ Erro ao atualizar:', error)
        throw error
      }
      
      console.log('✅ Reserva atualizada para:', newStatus)
      
      // 🔥 ATUALIZAR O ESTADO LOCAL IMEDIATAMENTE
      setBooking(prev => ({
        ...prev,
        status: newStatus,
        payment_status: paymentStatus
      }))
      
      // 🔥 CRIAR NOTIFICAÇO PARA O USUÁRIO
      const notificationTitle = actionType === 'approve' 
        ? 'Reserva Confirmada' 
        : 'Reserva Rejeitada'
      
      const notificationMessage = actionType === 'approve'
        ? `Sua reserva para ${booking.service?.name || 'serviço'} foi confirmada!`
        : `Sua reserva para ${booking.service?.name || 'serviço'} foi rejeitada.`
      
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: booking.user_id,
          type: `booking_${actionType}`,
          title: notificationTitle,
          message: notificationMessage,
          link: `/minha-reserva/${booking.id}`,
          icon: actionType === 'approve' ? '✅' : '❌',
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      
      if (notifError) {
        console.error('⚠️ Erro ao criar notificação:', notifError)
      } else {
        console.log('🔔 Notificação enviada para o usuário')
      }
      
      toast.success(
        actionType === 'approve'
          ? (isEn ? '✅ Booking approved successfully!' : '✅ Reserva aprovada com sucesso!')
          : (isEn ? '❌ Booking rejected!' : '❌ Reserva rejeitada!')
      )
      
      // 🔥 RECARREGAR PARA GARANTIR CONSISTÊNCIA
      setTimeout(() => {
        loadBooking()
      }, 500)
      
    } catch (error) {
      console.error('❌ Erro ao processar ação:', error)
      toast.error(error.message || (isEn ? 'Error processing action' : 'Erro ao processar ação'))
    } finally {
      setUpdating(false)
      setActionType(null)
    }
  }

  const updateStatus = async (newStatus) => {
    if (updating) return
    
    setUpdating(true)
    try {
      console.log(`📝 Atualizando status para:`, newStatus)
      
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      setBooking(prev => ({ ...prev, status: newStatus }))
      
      toast.success(
        isEn 
          ? `Booking ${newStatus} successfully`
          : `Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'concluída'} com sucesso`
      )
      
      // Recarregar para garantir consistência
      setTimeout(() => {
        loadBooking()
      }, 500)
      
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error)
      toast.error(error.message || (isEn ? 'Error updating booking' : 'Erro ao atualizar reserva'))
    } finally {
      setUpdating(false)
    }
  }

  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { label: isEn ? 'Pending' : 'Pendente', variant: 'warning', icon: ClockIcon },
      confirmed: { label: isEn ? 'Confirmed' : 'Confirmada', variant: 'success', icon: CheckCircle },
      completed: { label: isEn ? 'Completed' : 'Concluída', variant: 'info', icon: CheckCircle },
      cancelled: { label: isEn ? 'Cancelled' : 'Cancelada', variant: 'danger', icon: XCircle },
    }
    
    const info = statusMap[status] || statusMap.pending
    const Icon = info.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
        ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
      `}>
        <Icon size={14} />
        {info.label}
      </span>
    )
  }

  const PaymentStatusBadge = ({ status }) => {
    if (status === 'paid' || status === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle size={14} />
          {isEn ? 'Paid' : 'Pago'}
        </span>
      )
    }
    if (status === 'refunded') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          <XCircle size={14} />
          {isEn ? 'Refunded' : 'Reembolsado'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <ClockIcon size={14} />
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

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading booking...' : 'Carregando reserva...'}
        </p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Booking not found' : 'Reserva não encontrada'}
        </p>
        <Link to="/empresa/reservas" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to bookings' : 'Voltar para reservas'}
        </Link>
      </div>
    )
  }

  const isPending = booking.status === 'pending'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/empresa/reservas" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">#{booking.id.slice(0, 8)}</span>
            <StatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.payment_status} />
            {booking.payment_method && booking.payment_method !== 'pending' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <Wallet size={14} />
                {booking.payment_method}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
            title={isEn ? 'Refresh' : 'Atualizar'}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da reserva */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Booking Information' : 'Informações da Reserva'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Service' : 'Serviço'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  {booking.service?.icon && <span className="text-xl">{booking.service.icon}</span>}
                  <Package size={16} className="text-gray-400" />
                  {booking.service?.name || 'N/A'}
                </p>
                {booking.service?.room_type && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Bed size={12} />
                    {booking.service.room_type}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Category' : 'Categoria'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {booking.service?.category || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Date' : 'Data'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(booking.booking_date_service)}
                </p>
              </div>
              {booking.booking_time && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Time' : 'Horário'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.booking_time}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Guests' : 'Pessoas'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Users size={16} className="text-gray-400" />
                  {booking.guests || 1}
                </p>
                {booking.service?.capacity && (
                  <p className="text-xs text-gray-400">
                    {isEn ? 'Capacity' : 'Capacidade'}: {booking.service.capacity} {isEn ? 'people' : 'pessoas'}
                  </p>
                )}
              </div>
              {booking.service?.duration && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Duration' : 'Duração'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.service.duration}
                  </p>
                </div>
              )}
              {booking.service?.location && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Location' : 'Localização'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <MapPin size={16} className="text-gray-400" />
                    {booking.service.location}
                  </p>
                </div>
              )}
            </div>

            {/* Itens do serviço */}
            {booking.service?.items && booking.service.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Items Included' : 'Itens Incluídos'}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.service.items.map((item, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {booking.service?.description && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Service Description' : 'Descrição do Serviço'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {booking.service.description}
                </p>
              </div>
            )}
          </div>

          {/* Valores */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Payment Summary' : 'Resumo de Pagamento'}
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Subtotal' : 'Subtotal'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(booking.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Platform Fee (10%)' : 'Taxa da Plataforma (10%)'}
                </span>
                <span className="font-medium text-yellow-500">
                  {formatCurrency(booking.platform_fee || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-900 dark:text-white">
                  {isEn ? 'Total' : 'Total'}
                </span>
                <span className="text-primary-500">
                  {formatCurrency(booking.total_price || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Payment Method' : 'Método de Pagamento'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <CreditCard size={14} className="text-gray-400" />
                  {booking.payment_method || '-'}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Payment ID' : 'ID do Pagamento'}
                </span>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                  {booking.payment_id || '-'}
                </span>
              </div>
              {booking.payment_status === 'paid' && (
                <div className="flex justify-between py-2 text-sm bg-green-50 dark:bg-green-900/20 rounded-lg px-3">
                  <span className="text-green-700 dark:text-green-300 flex items-center gap-1">
                    <CheckCircle size={14} className="text-green-500" />
                    {isEn ? 'Payment confirmed' : 'Pagamento confirmado'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {booking.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isEn ? 'Notes' : 'Observações'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {booking.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cliente */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Customer' : 'Cliente'}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-500 font-semibold text-lg">
                  {booking.user?.name?.[0] || booking.customer_name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.user?.name || booking.customer_name || 'Cliente'}
                </p>
                {(booking.user?.email || booking.customer_email) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail size={14} />
                    {booking.user?.email || booking.customer_email}
                  </p>
                )}
                {(booking.user?.phone || booking.customer_phone) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone size={14} />
                    {booking.user?.phone || booking.customer_phone}
                  </p>
                )}
              </div>
            </div>

            {booking.customer_name && booking.customer_name !== booking.user?.name && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Booking Name' : 'Nome na Reserva'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.customer_name}
                </p>
              </div>
            )}
          </div>

          {/* Informações do Pagamento */}
          {booking.payment_status === 'paid' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {isEn ? 'Payment Confirmed' : 'Pagamento Confirmado'}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {isEn 
                      ? 'The customer has already paid for this booking.'
                      : 'O cliente já efetuou o pagamento desta reserva.'}
                  </p>
                  {booking.payment_method && (
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      {isEn ? 'Method' : 'Método'}: {booking.payment_method}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ações - APENAS PARA RESERVAS PENDENTES */}
          {isPending && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Actions' : 'Ações'}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleBookingAction('approve')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 font-medium"
                >
                  {updating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  {updating ? (isEn ? 'Processing...' : 'Processando...') : (isEn ? '✅ Approve' : '✅ Aprovar')}
                </button>
                <button
                  onClick={() => handleBookingAction('reject')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50 font-medium"
                >
                  {updating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <XCircle size={18} />
                  )}
                  {updating ? (isEn ? 'Processing...' : 'Processando...') : (isEn ? '❌ Reject' : '❌ Rejeitar')}
                </button>
              </div>
              
              <p className="text-xs text-gray-400 mt-2 text-center">
                {isEn 
                  ? 'Customer has already paid. Approve to confirm booking.'
                  : 'Cliente já pagou. Aprove para confirmar a reserva.'}
              </p>
            </div>
          )}

          {/* Ações para reservas confirmadas */}
          {booking.status === 'confirmed' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Actions' : 'Ações'}
              </h3>
              <button
                onClick={() => updateStatus('completed')}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 font-medium"
              >
                {updating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                {isEn ? '📌 Mark as Completed' : '📌 Marcar como Concluída'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">
                {actionType === 'approve' ? '✅' : '❌'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {actionType === 'approve' 
                  ? (isEn ? 'Approve Booking' : 'Aprovar Reserva')
                  : (isEn ? 'Reject Booking' : 'Rejeitar Reserva')
                }
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {actionType === 'approve'
                  ? (isEn ? 'Are you sure you want to approve this booking?' : 'Tem certeza que deseja aprovar esta reserva?')
                  : (isEn ? 'Are you sure you want to reject this booking?' : 'Tem certeza que deseja rejeitar esta reserva?')
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
                >
                  {isEn ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  onClick={confirmAction}
                  disabled={updating}
                  className={`flex-1 px-4 py-2 text-white rounded-xl transition flex items-center justify-center gap-2 ${
                    actionType === 'approve' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {updating ? <Loader2 size={18} className="animate-spin" /> : null}
                  {updating 
                    ? (isEn ? 'Processing...' : 'Processando...')
                    : (actionType === 'approve' ? (isEn ? 'Yes, Approve' : 'Sim, Aprovar') : (isEn ? 'Yes, Reject' : 'Sim, Rejeitar'))
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}