// src/pages/admin/AdminReviews.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  Search,
  Filter,
  Eye,
  Loader2,
  RefreshCw,
  User,
  Calendar,
  Building2,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const { isEn } = useLanguage()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0
  })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (id, name, avatar_url),
          service:service_id (id, name, category),
          company:company_id (id, name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const reviewsData = data || []
      setReviews(reviewsData)

      const total = reviewsData.length
      const avg = total > 0 ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / total : 0
      
      setStats({
        total,
        avgRating: avg,
        rating5: reviewsData.filter(r => r.rating === 5).length,
        rating4: reviewsData.filter(r => r.rating === 4).length,
        rating3: reviewsData.filter(r => r.rating === 3).length,
        rating2: reviewsData.filter(r => r.rating === 2).length,
        rating1: reviewsData.filter(r => r.rating === 1).length
      })
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      toast.error(isEn ? 'Error loading reviews' : 'Erro ao carregar avaliações')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReviews()
    setRefreshing(false)
    toast.success(isEn ? 'Reviews updated!' : 'Avaliações atualizadas!')
  }

  const toggleVisibility = async (reviewId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          is_public: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
      
      if (error) throw error
      
      setReviews(prev => 
        prev.map(r => r.id === reviewId ? { ...r, is_public: !currentStatus } : r)
      )
      
      toast.success(
        !currentStatus 
          ? (isEn ? 'Review published' : 'Avaliação publicada')
          : (isEn ? 'Review hidden' : 'Avaliação ocultada')
      )
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error updating review' : 'Erro ao atualizar avaliação')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
      </div>
    )
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating)
    
    return matchesSearch && matchesRating
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={28} className="text-yellow-400 fill-yellow-400" />
            {isEn ? 'Reviews' : 'Avaliações'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? `Manage all platform reviews (${stats.total})`
              : `Gerencie todas as avaliações da plataforma (${stats.total})`
            }
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {isEn ? 'Refresh' : 'Atualizar'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-400 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Average' : 'Média'}</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.avgRating.toFixed(1)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">5 ⭐</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.rating5}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">4 ⭐</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.rating4}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">3 ⭐</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.rating3}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-orange-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">2 ⭐</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.rating2}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">1 ⭐</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rating1}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search reviews...' : 'Pesquisar avaliações...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All Ratings' : 'Todas as Notas'}</option>
            <option value="5">5 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="1">1 ⭐</option>
          </select>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No reviews found' : 'Nenhuma avaliação encontrada'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-500 font-semibold">
                        {review.user?.name?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.user?.name || 'Usuário'}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Package size={14} />
                          {review.service?.name || '-'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {review.company?.name || '-'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${review.is_public 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {review.is_public 
                        ? (isEn ? 'Published' : 'Publicado') 
                        : (isEn ? 'Hidden' : 'Oculto')
                      }
                    </span>
                    <button
                      onClick={() => toggleVisibility(review.id, review.is_public)}
                      className="p-1.5 text-gray-500 hover:text-primary-500 rounded-lg transition"
                      title={review.is_public ? (isEn ? 'Hide' : 'Ocultar') : (isEn ? 'Publish' : 'Publicar')}
                    >
                      {review.is_public ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <Link
                      to={`/admin/avaliacoes/${review.id}`}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {review.comment}
                  </p>
                )}
                {review.reply && (
                  <div className="mt-2 pl-4 border-l-2 border-primary-300 dark:border-primary-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-primary-500">{isEn ? 'Reply:' : 'Resposta:'}</span>
                      {review.reply}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}