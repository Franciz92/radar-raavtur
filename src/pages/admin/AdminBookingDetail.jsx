// src/pages/admin/AdminBookingDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Building2,
  Printer,
  MapPin,
  Users,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminBookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBooking()
  }, [id])

  // ============================================
  // FUNÇO LOAD BOOKING - CORRIGIDA (SEM JOINS)
  // ============================================
  const loadBooking = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando reserva para admin:', id)
      
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
        navigate('/admin/reservas')
        return
      }
      
      console.log('✅ Reserva encontrada:', bookingData.id)
      
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
        }
      }

      // 3. Buscar dados da empresa
      let companyData = null
      if (bookingData.company_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, logo, email, phone, address, description')
          .eq('id', bookingData.company_id)
          .maybeSingle()
        
        if (!error && data) {
          companyData = data
          console.log('🏢 Empresa encontrada:', data.name)
        } else {
          console.warn('⚠️ Empresa não encontrada:', bookingData.company_id)
        }
      }

      // 4. Buscar dados do serviço
      let serviceData = null
      if (bookingData.service_id) {
        const { data, error } = await supabase
          .from('company_services')
          .select('id, name, category, price, currency, description, location, duration, images')
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
      navigate('/admin/reservas')
    } finally {
      setLoading(false)
    }
  }

  const StatusBadge = ({ status }) => {
    const statusMap = {
      pending: { label: isEn ? 'Pending' : 'Pendente', variant: 'warning', icon: Clock },
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
        <Clock size={14} />
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
        <Link to="/admin/reservas" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to bookings' : 'Voltar para reservas'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/reservas" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
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
              {isEn ? 'Booking Information' : 'Informações da Reserva'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Service' : 'Serviço'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Package size={16} className="text-gray-400" />
                  {booking.service?.name || 'N/A'}
                </p>
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
                  {booking.booking_date_service 
                    ? new Date(booking.booking_date_service).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : 'N/A'
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
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Users size={16} className="text-gray-400" />
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Customer' : 'Cliente'}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-500 font-semibold text-lg">
                  {booking.user?.name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.user?.name || 'Cliente'}
                </p>
                {booking.user?.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail size={14} />
                    {booking.user.email}
                  </p>
                )}
                {booking.user?.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone size={14} />
                    {booking.user.phone}
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

          {/* Empresa */}
          {booking.company && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Building2 size={18} className="text-primary-500" />
                {isEn ? 'Company' : 'Empresa'}
              </h3>
              
              <div className="flex items-center gap-3">
                {booking.company.logo ? (
                  <img 
                    src={booking.company.logo} 
                    alt={booking.company.name}
                    className="w-12 h-12 rounded-xl object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Building2 size={24} className="text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
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
              {booking.company.address && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {typeof booking.company.address === 'string' 
                    ? booking.company.address 
                    : JSON.stringify(booking.company.address)}
                </p>
              )}
              <Link
                to={`/admin/empresas/${booking.company.id}`}
                className="mt-2 inline-block text-sm text-primary-500 hover:text-primary-600 transition"
              >
                {isEn ? 'View company' : 'Ver empresa'} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}