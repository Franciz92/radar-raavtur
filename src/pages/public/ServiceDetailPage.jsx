// src/pages/public/ServiceDetailPage.jsx
// ============================================
// Detalhe do serviço com ação contextual
// ✅ Colunas REAIS da tabela `bookings`
// ============================================

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Users,
  Heart,
  Share2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Building2,
  CreditCard,
  Shield,
  Sparkles,
  ShoppingCart,
  Ticket,
  PenTool,
  Wrench,
  Handshake,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getServiceAction, isFoodCategory } from '../../utils/serviceActions'
import toast from 'react-hot-toast'

// ============================================
// ÍCONES DAS AÇÕES
// ============================================
const ACTION_ICONS = {
  Calendar,
  ShoppingCart,
  Ticket,
  PenTool,
  Wrench,
  Handshake,
};

// ============================================
// TRADUÇÕES
// ============================================
const translations = {
  pt: {
    serviceNotFound: 'Serviço não encontrado',
    serviceNotFoundDesc: 'O serviço que você procura não existe.',
    errorLoading: 'Erro ao carregar serviço',
    backToServices: 'Voltar para serviços',

    home: 'Home',
    services: 'Serviços',

    description: 'Descrição',
    whatsIncluded: 'O que está incluído',
    noDescription: 'Sem descrição disponível',
    perPerson: 'por pessoa',
    reviews: 'avaliações',

    aboutCompany: 'Sobre a Empresa',
    viewAllServices: 'Ver todos os serviços',
    securePayment: 'Pagamento seguro',
    instantConfirmation: 'Confirmação instantânea',

    buyService: 'Comprar Serviço',
    bookService: 'Reservar Serviço',
    markService: 'Marcar Serviço',
    enrollService: 'Inscrever no Serviço',
    buyNow: 'Comprar Agora',
    bookNow: 'Reservar Agora',
    markNow: 'Marcar Agora',
    enrollNow: 'Inscrever Agora',

    date: 'Data',
    time: 'Horário',
    guests: 'Número de pessoas',
    notes: 'Observações',
    total: 'Total',
    cancel: 'Cancelar',
    processing: 'Processando...',
    confirmAndPay: 'Confirmar e Pagar',
    willBeRedirected: 'Você será redirecionado para o pagamento',

    loginToBuy: 'Faça login para comprar',
    loginToBook: 'Faça login para reservar',
    selectDate: 'Selecione uma data',
    purchaseSuccess: 'Compra criada com sucesso!',
    bookingSuccess: 'Reserva criada com sucesso!',
    errorCreating: 'Erro ao criar',
  },
  en: {
    serviceNotFound: 'Service not found',
    serviceNotFoundDesc: 'The service you are looking for does not exist.',
    errorLoading: 'Error loading service',
    backToServices: 'Back to services',

    home: 'Home',
    services: 'Services',

    description: 'Description',
    whatsIncluded: "What's included",
    noDescription: 'No description available',
    perPerson: 'per person',
    reviews: 'reviews',

    aboutCompany: 'About the Company',
    viewAllServices: 'View all services',
    securePayment: 'Secure payment',
    instantConfirmation: 'Instant confirmation',

    buyService: 'Buy Service',
    bookService: 'Book Service',
    markService: 'Schedule Service',
    enrollService: 'Enroll in Service',
    buyNow: 'Buy Now',
    bookNow: 'Book Now',
    markNow: 'Schedule Now',
    enrollNow: 'Enroll Now',

    date: 'Date',
    time: 'Time',
    guests: 'Number of guests',
    notes: 'Notes',
    total: 'Total',
    cancel: 'Cancel',
    processing: 'Processing...',
    confirmAndPay: 'Confirm & Pay',
    willBeRedirected: 'You will be redirected to payment',

    loginToBuy: 'Please login to buy',
    loginToBook: 'Please login to book',
    selectDate: 'Please select a date',
    purchaseSuccess: 'Purchase created successfully!',
    bookingSuccess: 'Booking created successfully!',
    errorCreating: 'Error creating',
  },
};

// ============================================
// Helper — contexto da ação
// ============================================
function getActionContext(category, language) {
  const action = getServiceAction(category, language);
  const isFood = isFoodCategory(category);

  let modalTitle, ctaLabel, successMsg;

  if (isFood) {
    modalTitle = language === 'en' ? 'Buy Service' : 'Comprar Serviço';
    ctaLabel = language === 'en' ? 'Buy Now' : 'Comprar Agora';
    successMsg =
      language === 'en' ? 'Purchase created successfully!' : 'Compra criada com sucesso!';
  } else if (action.icon === 'PenTool') {
    modalTitle = language === 'en' ? 'Schedule Service' : 'Marcar Serviço';
    ctaLabel = language === 'en' ? 'Schedule Now' : 'Marcar Agora';
    successMsg =
      language === 'en' ? 'Booking created successfully!' : 'Marcação criada com sucesso!';
  } else {
    modalTitle = language === 'en' ? 'Book Service' : 'Reservar Serviço';
    ctaLabel = language === 'en' ? 'Book Now' : 'Reservar Agora';
    successMsg =
      language === 'en' ? 'Booking created successfully!' : 'Reserva criada com sucesso!';
  }

  return {
    label: action.label,
    icon: ACTION_ICONS[action.icon] || Calendar,
    modalTitle,
    ctaLabel,
    successMsg,
    isFood,
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { language, isEn } = useLanguage()

  const t = translations[language === 'en' ? 'en' : 'pt']

  const [service, setService] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [error, setError] = useState(null)
  const [bookingData, setBookingData] = useState({
    serviceDate: '',
    serviceTime: '',
    guests: 1,
    notes: '',
  })

  // ============================================
  // Carregar serviço
  // ============================================
  useEffect(() => {
    if (id) loadService()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadService = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Buscando serviço:', id)

      const { data: serviceData, error: serviceError } = await supabase
        .from('company_services')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (serviceError) {
        console.error('❌ Erro ao buscar serviço:', serviceError)
        throw serviceError
      }

      if (!serviceData) {
        setError(t.serviceNotFound)
        setLoading(false)
        return
      }

      console.log('✅ Serviço encontrado:', serviceData)
      setService(serviceData)

      if (serviceData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select(
            'id, name, logo, description, address, phone, email, rating, category, website'
          )
          .eq('id', serviceData.company_id)
          .maybeSingle()

        if (!companyError && companyData) {
          console.log('🏢 Empresa encontrada:', companyData.name)
          setCompany(companyData)
        } else {
          console.warn('⚠️ Empresa não encontrada para o serviço')
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar serviço:', error)
      setError(error.message || t.errorLoading)
      toast.error(t.errorLoading)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Ação contextual
  // ============================================
  const category = service?.category || company?.category
  const actionCtx = getActionContext(category, language)
  const ActionIcon = actionCtx.icon

  // ============================================
  // Criar reserva / compra
  // ✅ Payload ALINHADO com as colunas reais da tabela `bookings`
  // ============================================
  const handleBooking = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error(actionCtx.isFood ? t.loginToBuy : t.loginToBook)
      navigate('/login')
      return
    }

    if (!bookingData.serviceDate) {
      toast.error(t.selectDate)
      return
    }

    setBookingLoading(true)

    try {
      // Calcular total (a tabela só tem total_price, não tem subtotal/platform_fee)
      const totalPrice = service.price * bookingData.guests

      // ✅ Payload EXATO para as colunas reais da tabela `bookings`
      const payload = {
        user_id: user.id,
        service_id: service.id,
        company_id: service.company_id,     // legado (compatibilidade)
        business_id: service.company_id,    // novo
        item_type: 'service',               // identificador
        item_name: service.name,            // snapshot do nome
        item_image: service.image_url || service.logo_url || null, // snapshot da imagem
        date: bookingData.serviceDate,
        time: bookingData.serviceTime || null,
        guests: bookingData.guests || 1,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
        notes: bookingData.notes || '',
        reviewed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('📤 [ServiceDetail] Inserindo em bookings:', payload)

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([payload])
        .select('id')
        .maybeSingle()

      if (bookingError) {
        console.error('❌ [ServiceDetail] Erro ao criar booking:', bookingError)
        throw bookingError
      }

      if (!booking?.id) {
        throw new Error('Não foi possível criar a reserva')
      }

      console.log('✅ [ServiceDetail] Booking criado:', booking.id)
      toast.success(actionCtx.successMsg)
      setShowBookingModal(false)
      navigate(`/pagamento/${booking.id}`)
    } catch (error) {
      console.error('❌ Erro ao criar:', error)
      toast.error(`${t.errorCreating}: ${error.message}`)
    } finally {
      setBookingLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.serviceNotFound}
        </h2>
        <p className="text-gray-500 mt-2">{error || t.serviceNotFoundDesc}</p>
        <Link to="/servicos" className="mt-4 inline-block text-primary-500 hover:underline">
          {t.backToServices}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-500">
          {t.home}
        </Link>
        <span>/</span>
        <Link to="/servicos" className="hover:text-primary-500">
          {t.services}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden h-80">
            {service.images && service.images.length > 0 ? (
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                <span className="text-4xl">{service.icon || '📦'}</span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {service.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {service.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold">
                      <ActionIcon size={12} />
                      {actionCtx.label}
                    </span>
                  )}
                  {company && (
                    <Link
                      to={`/empresa/${service.company_id}`}
                      className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    >
                      <Building2 size={14} />
                      {company.name}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <Heart size={20} className="text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href)
                    toast.success(isEn ? 'Link copied!' : 'Link copiado!')
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <Share2 size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {service.rating > 0 && (
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {parseFloat(service.rating).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({service.reviews_count || 0} {t.reviews})
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {t.description}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {service.description || t.noDescription}
              </p>
            </div>

            {service.items && service.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  {t.whatsIncluded}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.items.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1"
                    >
                      <CheckCircle size={14} className="text-green-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary-500">
                {formatCurrency(service.price)}
              </span>
              <span className="text-sm text-gray-500">{t.perPerson}</span>
            </div>

            <div className="space-y-3 text-sm">
              {service.duration && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock size={16} className="text-gray-400" />
                  <span>{service.duration}</span>
                </div>
              )}
              {service.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{service.location}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full mt-6 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-semibold flex items-center justify-center gap-2"
            >
              <ActionIcon size={18} />
              {actionCtx.ctaLabel}
            </button>

            {company && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t.aboutCompany}
                </h4>
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-12 h-12 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-500">
                        {company.name?.charAt(0) || 'E'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {company.name}
                    </p>
                    {company.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {parseFloat(company.rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {company.description}
                  </p>
                )}
                <Link
                  to={`/empresa/${company.id}`}
                  className="w-full mt-3 block text-center px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition text-sm"
                >
                  {t.viewAllServices}
                </Link>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield size={14} className="text-green-500" />
                <span>{t.securePayment}</span>
                <span className="mx-1">•</span>
                <Sparkles size={14} className="text-yellow-500" />
                <span>{t.instantConfirmation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ActionIcon size={20} className="text-primary-500" />
                  {actionCtx.modalTitle}
                </h2>
                <p className="text-sm text-gray-500">{service.name}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBooking} className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon || '📦'}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500">{service.category}</p>
                    </div>
                  </div>
                  <span className="font-bold text-primary-500">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.date} *
                  </label>
                  <input
                    type="date"
                    value={bookingData.serviceDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, serviceDate: e.target.value })
                    }
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t.time}
                  </label>
                  <input
                    type="time"
                    value={bookingData.serviceTime}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, serviceTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.guests} *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={bookingData.guests}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      guests: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-gray-900 dark:text-white">{t.total}</span>
                  <span className="text-primary-500">
                    {formatCurrency(service.price * bookingData.guests)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CreditCard size={18} />
                  )}
                  {bookingLoading ? t.processing : t.confirmAndPay}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">{t.willBeRedirected}</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}