// src/pages/public/ReviewsPage.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, User, Calendar, Loader2, Search, Filter, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'

export default function ReviewsPage() {
  const { isEn } = useLanguage()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState('all')

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
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
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
      review.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft size={18} />
        {isEn ? 'Back to home' : 'Voltar para início'}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isEn ? 'Reviews' : 'Avaliações'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {isEn 
          ? `What people are saying (${reviews.length})`
          : `O que as pessoas estão dizendo (${reviews.length})`
        }
      </p>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search reviews...' : 'Pesquisar avaliações...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative min-w-[150px]">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All Ratings' : 'Todas as Notas'}</option>
            <option value="5">5 {isEn ? 'Stars' : 'Estrelas'}</option>
            <option value="4">4 {isEn ? 'Stars' : 'Estrelas'}</option>
            <option value="3">3 {isEn ? 'Stars' : 'Estrelas'}</option>
            <option value="2">2 {isEn ? 'Stars' : 'Estrelas'}</option>
            <option value="1">1 {isEn ? 'Stars' : 'Estrelas'}</option>
          </select>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{isEn ? 'No reviews found' : 'Nenhuma avaliação encontrada'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-primary-500 font-semibold">
                      {review.user?.name?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {review.user?.name || 'Usuário'}
                    </p>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.service?.name && (
                  <span className="text-xs text-gray-400">
                    {review.service.name}
                  </span>
                )}
              </div>
              {review.comment && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
              )}
              {review.reply && (
                <div className="mt-2 pl-4 border-l-2 border-primary-300 dark:border-primary-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-primary-500">{isEn ? 'Response:' : 'Resposta:'}</span>
                    {review.reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}