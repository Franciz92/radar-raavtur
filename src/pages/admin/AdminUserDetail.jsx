// src/pages/admin/AdminUserDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Package,
  DollarSign
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    bookings: 0,
    reviews: 0,
    totalSpent: 0
  })

  useEffect(() => {
    loadUser()
  }, [id])

  const loadUser = async () => {
    setLoading(true)
    try {
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (profileError) throw profileError
      setUser(profile)

      // Buscar estatísticas
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('user_id', id)
        .eq('status', 'completed')
      
      if (!bookingsError) {
        setStats(prev => ({
          ...prev,
          bookings: bookings?.length || 0,
          totalSpent: bookings?.reduce((acc, b) => acc + b.total_price, 0) || 0
        }))
      }

      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', id)
      
      if (!reviewsError) {
        setStats(prev => ({
          ...prev,
          reviews: reviews?.length || 0
        }))
      }

    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      toast.error(isEn ? 'Error loading user' : 'Erro ao carregar usuário')
      navigate('/admin/utilizadores')
    } finally {
      setLoading(false)
    }
  }

  const RoleBadge = ({ role }) => {
    const roles = {
      admin: { label: 'Admin', variant: 'purple' },
      company: { label: 'Empresa', variant: 'blue' },
      user: { label: 'Utilizador', variant: 'green' }
    }
    
    const info = roles[role] || roles.user
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${info.variant === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
        ${info.variant === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${info.variant === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
      `}>
        {info.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isEn ? 'User not found' : 'Utilizador não encontrado'}</p>
        <Link to="/admin/utilizadores" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to users' : 'Voltar para utilizadores'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/utilizadores" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={28} className="text-primary-500" />
            {user.name || 'Utilizador'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <RoleBadge role={user.role} />
            <span className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do usuário */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'User Information' : 'Informações do Utilizador'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Name' : 'Nome'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <User size={16} className="text-gray-400" />
                  {user.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Mail size={16} className="text-gray-400" />
                  {user.email || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Phone' : 'Telefone'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Phone size={16} className="text-gray-400" />
                  {user.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Location' : 'Localização'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <MapPin size={16} className="text-gray-400" />
                  {user.location || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Role' : 'Função'}
                </p>
                <RoleBadge role={user.role} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Joined' : 'Registado em'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEn ? 'Bio' : 'Biografia'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {user.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estatísticas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Statistics' : 'Estatísticas'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {isEn ? 'Bookings' : 'Reservas'}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats.bookings}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {isEn ? 'Reviews' : 'Avaliações'}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats.reviews}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {isEn ? 'Total Spent' : 'Total Gasto'}
                  </span>
                </div>
                <span className="font-bold text-primary-500">
                  {new Intl.NumberFormat('pt-AO', {
                    style: 'currency',
                    currency: 'AOA',
                    minimumFractionDigits: 0
                  }).format(stats.totalSpent)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full px-4 py-2 text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2">
                <Trash2 size={18} />
                {isEn ? 'Delete User' : 'Excluir Utilizador'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}