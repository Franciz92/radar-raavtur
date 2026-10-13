// src/pages/public/UserBookingDetailPage.jsx

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
  Star,
  MessageCircle,
  Download,
  Printer,
  Package,
  Building2
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function UserBookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isEn } = useLanguage()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [hasReview, setHasReview] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [id])

  const loadBooking = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando reserva:', id)
      
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
        console.error('❌ Reserva não encontrada')
        toast.error(isEn ? 'Booking not found' : 'Reserva não encontrada')
        navigate('/minhas-reservas')
        return
      }
      
      console.log('✅ Reserva encontrada:', bookingData)
      
      // 2. Buscar serviço
      let service = null
      if (bookingData.service_id) {
        const { data: serviceData, error: serviceError } = await supabase
          .from('company_services')
          .select('id, name, category, description, price, currency, images, location, duration')
          .eq('id', bookingData.service_id)
          .maybeSingle()
        
        if (!serviceError && serviceData) {
          service = serviceData
        }
      }
      
      // 3. Buscar empresa
      let company = null
      if (bookingData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name, logo, email, phone, address')
          .eq('id', bookingData.company_id)
          .maybeSingle()
        
        if (!companyError && companyData) {
          company = companyData
        }
      }
      
      // 4. Verificar se já existe avaliação
      let reviewExists = false
      if (bookingData.status === 'completed') {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', id)
          .maybeSingle()
        
        if (!reviewError && reviewData) {
          reviewExists = true
          console.log('✅ Avaliação já existe:', reviewData.id)
        }
      }
      
      // 5. Montar objeto completo
      const completeBooking = {
        ...bookingData,
        service,
        company,
        reviewed: reviewExists
      }
      
      console.log('✅ Reserva completa:', completeBooking)
      setBooking(completeBooking)
      setHasReview(reviewExists)
      
    } catch (error) {
      console.error('❌ Erro ao carregar reserva:', error)
      toast.error(error.message || (isEn ? 'Error loading booking' : 'Erro ao carregar reserva'))
      navigate('/minhas-reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm(isEn ? 'Are you sure you want to cancel this booking?' : 'Tem certeza que deseja cancelar esta reserva?')) {
      return
    }

    setCancelling(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(isEn ? 'Booking cancelled successfully' : 'Reserva cancelada com sucesso')
      loadBooking()
    } catch (error) {
      console.error('Erro ao cancelar:', error)
      toast.error(error.message || (isEn ? 'Error cancelling booking' : 'Erro ao cancelar reserva'))
    } finally {
      setCancelling(false)
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
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
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle size={14} />
          {isEn ? 'Paid' : 'Pago'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isEn ? 'Booking not found' : 'Reserva não encontrada'}</p>
        <Link to="/minhas-reservas" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to bookings' : 'Voltar para reservas'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/minhas-reservas" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {booking.service?.name || 'Reserva'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              #{booking.id?.slice(0, 8)}
            </span>
            <StatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.payment_status} />
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <Printer size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações da reserva */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Service' : 'Serviço'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Package size={16} className="text-gray-400" />
                  {booking.service?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Category' : 'Categoria'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.service?.category || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Date' : 'Data'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.booking_date_service 
                    ? new Date(booking.booking_date_service).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : '-'
                  }
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
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.guests || 1}
                </p>
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
            </div>

            {booking.service?.location && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Location' : 'Localização'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {booking.service.location}
                </p>
              </div>
            )}
          </div>

          {/* Informações da empresa */}
          {booking.company && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Company Information' : 'Informações da Empresa'}
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Building2 size={32} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {booking.company.name}
                  </p>
                  {booking.company.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail size={14} />
                      {booking.company.email}
                    </p>
                  )}
                  {booking.company.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone size={14} />
                      {booking.company.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resumo de valores */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Payment Summary' : 'Resumo de Pagamento'}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Subtotal' : 'Subtotal'}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(booking.subtotal || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Service Fee (10%)' : 'Taxa de Serviço (10%)'}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(booking.platform_fee || 0)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">
                  {isEn ? 'Total' : 'Total'}
                </span>
                <span className="text-primary-500">
                  {formatCurrency(booking.total_price || 0)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEn ? 'Payment Status' : 'Status do Pagamento'}
              </p>
              <p className={`font-medium ${booking.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                {booking.payment_status === 'paid' 
                  ? (isEn ? 'Paid' : 'Pago') 
                  : (isEn ? 'Pending' : 'Pendente')
                }
              </p>
            </div>

            {/* Ações */}
            {booking.status === 'pending' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelling ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                {cancelling 
                  ? (isEn ? 'Cancelling...' : 'Cancelando...') 
                  : (isEn ? 'Cancel Booking' : 'Cancelar Reserva')
                }
              </button>
            )}

            {/* ============================================
                AVALIAÇO - ATUALIZADO
                ============================================ */}
            {booking.status === 'completed' && !hasReview && (
              <Link
                to={`/avaliar/${booking.id}`}
                className="w-full mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2"
              >
                <Star size={18} />
                {isEn ? 'Leave a Review' : 'Avaliar'}
              </Link>
            )}

            {booking.status === 'completed' && hasReview && (
              <div className="w-full mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                {isEn ? 'Already Reviewed' : 'Já Avaliou'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}