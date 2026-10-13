import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getUserBookings, cancelBooking, confirmBooking } from '../../services/bookingService'
import { Calendar, MapPin, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

const EmptyState = ({ title, description, icon: Icon = Calendar }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={64} className="mb-4 text-gray-300 dark:text-gray-600" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">{description}</p>
      <Link to="/destinos">
        <Button>{title === 'Nenhuma reserva' ? 'Explorar Destinos' : 'Voltar'}</Button>
      </Link>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (isAuthenticated && user) {
      loadBookings()
    }
  }, [isAuthenticated, user])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const { data } = await getUserBookings(user.id)
      setBookings(data || [])
    } catch (error) {
      console.error('Erro ao carregar reservas:', error)
      toast.error('Erro ao carregar reservas')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (id) => {
    if (!confirm(isEn ? 'Are you sure you want to cancel this booking?' : 'Tem certeza que deseja cancelar esta reserva?')) {
      return
    }
    try {
      await cancelBooking(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      toast.success(isEn ? 'Booking cancelled' : 'Reserva cancelada')
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error)
      toast.error('Erro ao cancelar reserva')
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      pending: <Badge variant="warning">{isEn ? 'Pending' : 'Pendente'}</Badge>,
      confirmed: <Badge variant="success">{isEn ? 'Confirmed' : 'Confirmada'}</Badge>,
      completed: <Badge variant="primary">{isEn ? 'Completed' : 'Concluída'}</Badge>,
      cancelled: <Badge variant="danger">{isEn ? 'Cancelled' : 'Cancelada'}</Badge>,
    }
    return map[status] || <Badge>{status}</Badge>
  }

  const getStatusIcon = (status) => {
    const map = {
      pending: <Clock size={16} className="text-yellow-500" />,
      confirmed: <CheckCircle size={16} className="text-green-500" />,
      completed: <CheckCircle size={16} className="text-blue-500" />,
      cancelled: <XCircle size={16} className="text-red-500" />,
    }
    return map[status] || <AlertCircle size={16} className="text-gray-400" />
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true
    return b.status === filter
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="max-w-md mx-auto">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Faça login para ver suas reservas</h2>
          <p className="text-gray-500 mb-6">Gerencie suas reservas de viagens.</p>
          <Link to="/login">
            <Button>Entrar</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="skeleton h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'My Bookings' : 'Minhas Reservas'}
          </h1>
          <p className="text-sm text-gray-500">
            {bookings.length} {isEn ? 'bookings found' : 'reservas encontradas'}
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 sm:grid-cols-5 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">{isEn ? 'Total' : 'Total'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center border-l-4 border-yellow-500">
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">{isEn ? 'Pending' : 'Pendentes'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center border-l-4 border-green-500">
          <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-xs text-gray-500">{isEn ? 'Confirmed' : 'Confirmadas'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center border-l-4 border-blue-500">
          <p className="text-xl font-bold text-blue-600">{stats.completed}</p>
          <p className="text-xs text-gray-500">{isEn ? 'Completed' : 'Concluídas'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center border-l-4 border-red-500">
          <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-500">{isEn ? 'Cancelled' : 'Canceladas'}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: isEn ? 'All' : 'Todas' },
          { key: 'pending', label: isEn ? 'Pending' : 'Pendentes' },
          { key: 'confirmed', label: isEn ? 'Confirmed' : 'Confirmadas' },
          { key: 'completed', label: isEn ? 'Completed' : 'Concluídas' },
          { key: 'cancelled', label: isEn ? 'Cancelled' : 'Canceladas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ml-1 text-xs opacity-70">
                ({stats[tab.key] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de Reservas */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title={isEn ? 'No bookings found' : 'Nenhuma reserva encontrada'}
          description={isEn 
            ? 'Start exploring and book your next adventure!' 
            : 'Comece a explorar e reserve sua próxima aventura!'}
        />
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {booking.item_name || 'Reserva'}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(booking.date).toLocaleDateString('pt-PT')}
                    </span>
                    {booking.guests && (
                      <span className="flex items-center gap-1">
                        👤 {booking.guests} {isEn ? 'guests' : 'hóspedes'}
                      </span>
                    )}
                    {booking.total_price > 0 && (
                      <span className="font-semibold text-primary-600">
                        {booking.total_price.toLocaleString()} Kz
                      </span>
                    )}
                  </div>
                  
                  {booking.notes && (
                    <p className="text-xs text-gray-400 mt-1">{booking.notes}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">Ref: {booking.id?.slice(0, 8)}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(booking.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/reservas/${booking.id}`}>
                    <Button variant="secondary" size="sm" icon={Eye}>
                      {isEn ? 'Details' : 'Detalhes'}
                    </Button>
                  </Link>
                  
                  {booking.status === 'pending' && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {isEn ? 'Cancel' : 'Cancelar'}
                    </Button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      {isEn ? 'Cancel' : 'Cancelar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}