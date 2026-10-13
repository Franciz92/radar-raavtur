// src/pages/public/HotelDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Wifi,
  Coffee,
  ParkingCircle,
  Utensils,
  Snowflake,
  Tv,
  Share2,
  Heart,
  Waves,
  Car,
  Bed,
  Bath,
  Sparkles,
  CreditCard,
  Shield
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES
// ============================================

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

const AmenityBadge = ({ icon: Icon, label, available }) => {
  if (!available) return null
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
      <Icon size={16} className="text-primary-500" />
      {label}
    </span>
  )
}

const ServiceCard = ({ service, onBook, isEn }) => {
  const [showDetails, setShowDetails] = useState(false)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{service.icon || '📦'}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {service.name}
            </h3>
            {service.room_type && (
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                {service.room_type}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {service.description}
          </p>
          {service.items && service.items.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {service.items.slice(0, 3).map((item, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300"
                >
                  {item}
                </span>
              ))}
              {service.items.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{service.items.length - 3}
                </span>
              )}
            </div>
          )}
          {service.capacity && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <Users size={12} />
              <span>Capacidade: {service.capacity} {isEn ? 'people' : 'pessoas'}</span>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-primary-500">
            {formatCurrency(service.price)}
          </p>
          <p className="text-xs text-gray-400">{service.duration || 'por pessoa'}</p>
          <button
            onClick={() => onBook(service.id)}
            className="mt-2 px-4 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium"
          >
            {isEn ? 'Book Now' : 'Reservar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const BookingModal = ({ isOpen, onClose, service, onConfirm, isEn }) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen || !service) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onConfirm(service.id, formData)
    setLoading(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Book Service' : 'Reservar Serviço'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resumo do serviço */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{service.icon || '📦'}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{service.name}</p>
                <p className="text-sm text-primary-500">{formatCurrency(service.price)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Check-in' : 'Check-in'} *
              </label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Check-out' : 'Check-out'} *
              </label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                required
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Number of guests' : 'Número de pessoas'} *
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Your name' : 'Seu nome'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Email' : 'Email'} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Phone' : 'Telefone'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Additional notes' : 'Observações'}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Resumo do pagamento */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {isEn ? 'Total' : 'Total'}
              </span>
              <span className="font-bold text-primary-500">
                {formatCurrency(service.price * formData.guests)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isEn ? 'Payment will be processed securely' : 'Pagamento será processado com segurança'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CreditCard size={18} />
              )}
              {loading ? (isEn ? 'Processing...' : 'Processando...') : (isEn ? 'Confirm & Pay' : 'Confirmar e Pagar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function HotelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  
  const [hotel, setHotel] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    if (id) {
      loadHotelData()
    }
  }, [id])

  const loadHotelData = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando hotel:', id)

      // 1. Buscar hotel
      const { data: hotelData, error: hotelError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .maybeSingle()

      if (hotelError) throw hotelError

      if (!hotelData) {
        toast.error(isEn ? 'Hotel not found' : 'Hotel não encontrado')
        navigate('/hoteis')
        return
      }

      setHotel(hotelData)

      // 2. Buscar serviços do hotel
      const { data: servicesData, error: servicesError } = await supabase
        .from('company_services')
        .select('*')
        .eq('company_id', id)
        .eq('status', 'active')
        .in('category', ['Hotel', 'Pacote'])
        .order('price', { ascending: true })

      if (!servicesError) {
        setServices(servicesData || [])
        console.log('📦 Serviços carregados:', servicesData?.length || 0)
      }

    } catch (error) {
      console.error('❌ Erro ao carregar hotel:', error)
      toast.error(isEn ? 'Error loading hotel' : 'Erro ao carregar hotel')
    } finally {
      setLoading(false)
    }
  }

  const handleBookService = (serviceId) => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to book' : 'Faça login para reservar')
      navigate('/login')
      return
    }

    const service = services.find(s => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      setShowBookingModal(true)
    }
  }

  const handleConfirmBooking = async (serviceId, formData) => {
    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) throw new Error('Service not found')

      // Calcular valores
      const subtotal = service.price * formData.guests
      const platformFee = subtotal * 0.10
      const totalPrice = subtotal + platformFee

      // Criar reserva
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          service_id: serviceId,
          company_id: service.company_id,
          booking_date_service: formData.checkIn,
          booking_time: null,
          guests: formData.guests || 1,
          customer_name: formData.name || user.name,
          customer_email: formData.email || user.email,
          customer_phone: formData.phone || '',
          subtotal: subtotal,
          platform_fee: platformFee,
          total_price: totalPrice,
          payment_method: 'pending',
          payment_status: 'pending',
          status: 'pending',
          notes: formData.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single()

      if (error) throw error

      toast.success(isEn ? 'Booking created successfully!' : 'Reserva criada com sucesso!')
      setShowBookingModal(false)
      
      // Redirecionar para pagamento
      navigate(`/pagamento/${booking.id}`)
      
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error)
      toast.error(error.message || (isEn ? 'Error creating booking' : 'Erro ao criar reserva'))
    }
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
          {isEn ? 'Loading hotel...' : 'Carregando hotel...'}
        </p>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'Hotel not found' : 'Hotel não encontrado'}
        </h2>
        <Link to="/hoteis" className="mt-4 inline-block text-primary-500 hover:underline">
          {isEn ? 'Back to hotels' : 'Voltar para hotéis'}
        </Link>
      </div>
    )
  }

  const amenities = [
    { icon: Wifi, label: 'Wi-Fi', key: 'wifi' },
    { icon: Coffee, label: 'Café da Manhã', key: 'cafe' },
    { icon: ParkingCircle, label: 'Estacionamento', key: 'parking' },
    { icon: Utensils, label: 'Restaurante', key: 'restaurante' },
    { icon: Snowflake, label: 'Ar Condicionado', key: 'ac' },
    { icon: Tv, label: 'TV a Cabo', key: 'tv' },
    { icon: Waves, label: 'Piscina', key: 'piscina' },
    { icon: Sparkles, label: 'Spa', key: 'spa' },
  ]

  const hotelAmenities = hotel.amenities || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Voltar */}
      <Link to="/hoteis" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft size={18} />
        {isEn ? 'Back to hotels' : 'Voltar para hotéis'}
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Imagem de capa */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden h-80">
            {hotel.cover_image ? (
              <img
                src={hotel.cover_image}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                <Building2 size={64} className="text-primary-400" />
              </div>
            )}
          </div>

          {/* Informações do hotel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>{hotel.address?.city}, {hotel.address?.province}</span>
                  </div>
                  {hotel.stars > 0 && (
                    <div className="flex items-center gap-1">
                      <StarRating rating={hotel.stars} />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {hotel.stars}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Heart size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Avaliação */}
            {hotel.rating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={Math.round(hotel.rating)} />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {hotel.rating}
                </span>
                <span className="text-sm text-gray-400">
                  ({hotel.total_reviews || 0} {isEn ? 'reviews' : 'avaliações'})
                </span>
              </div>
            )}

            {/* Descrição */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {hotel.description || 'Sem descrição disponível'}
              </p>
            </div>

            {/* Comodidades */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {isEn ? 'Amenities' : 'Comodidades'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => {
                  const available = hotelAmenities.some(a =>
                    a.toLowerCase().includes(amenity.key) ||
                    amenity.label.toLowerCase().includes(a.toLowerCase())
                  )
                  return (
                    <AmenityBadge
                      key={amenity.key}
                      icon={amenity.icon}
                      label={amenity.label}
                      available={available}
                    />
                  )
                })}
                {hotelAmenities.filter(a => 
                  !amenities.some(am => 
                    a.toLowerCase().includes(am.key) || 
                    am.label.toLowerCase().includes(a.toLowerCase())
                  )
                ).map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle size={16} className="text-green-500" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Endereço */}
            {hotel.address && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {isEn ? 'Address' : 'Endereço'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {hotel.address.street && `${hotel.address.street}, `}
                  {hotel.address.city && `${hotel.address.city}, `}
                  {hotel.address.province && hotel.address.province}
                  {hotel.address.country && `, ${hotel.address.country}`}
                </p>
              </div>
            )}
          </div>

          {/* Serviços do Hotel */}
          {services.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                📦 {isEn ? 'Services' : 'Serviços'}
                <span className="text-sm font-normal text-gray-400">
                  ({services.length})
                </span>
              </h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBook={handleBookService}
                    isEn={isEn}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Informações de contato */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Contact Information' : 'Informações de Contato'}
            </h3>

            <div className="space-y-3 text-sm">
              {hotel.phone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Phone size={18} className="text-gray-400" />
                  <a href={`tel:${hotel.phone}`} className="hover:text-primary-500">
                    {hotel.phone}
                  </a>
                </div>
              )}
              {hotel.email && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Mail size={18} className="text-gray-400" />
                  <a href={`mailto:${hotel.email}`} className="hover:text-primary-500 break-all">
                    {hotel.email}
                  </a>
                </div>
              )}
              {hotel.website && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <Globe size={18} className="text-gray-400" />
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 break-all">
                    {hotel.website}
                  </a>
                </div>
              )}
            </div>

            {hotel.working_hours && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  {isEn ? 'Working Hours' : 'Horário de Funcionamento'}
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {Object.entries(hotel.working_hours).map(([day, hours]) => {
                    const dayNames = {
                      monday: 'Segunda',
                      tuesday: 'Terça',
                      wednesday: 'Quarta',
                      thursday: 'Quinta',
                      friday: 'Sexta',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    }
                    return (
                      <div key={day} className="flex justify-between">
                        <span>{dayNames[day] || day}</span>
                        <span>{hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Fechado'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Botão de reserva rápido */}
            {services.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    const firstService = services[0]
                    if (firstService) handleBookService(firstService.id)
                  }}
                  className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  {isEn ? 'Book Now' : 'Reservar Agora'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        service={selectedService}
        onConfirm={handleConfirmBooking}
        isEn={isEn}
      />
    </div>
  )
}