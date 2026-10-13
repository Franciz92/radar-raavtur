// src/pages/public/ReviewDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, User, Calendar, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'

export default function ReviewDetailPage() {
  const { id } = useParams()
  const { isEn } = useLanguage()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReview()
  }, [id])

  const loadReview = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id (id, name, avatar_url),
          service:service_id (id, name, category, price),
          company:company_id (id, name, logo)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setReview(data)
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{isEn ? 'Review not found' : 'Avaliação não encontrada'}</p>
        <Link to="/avaliacoes" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to reviews' : 'Voltar para avaliações'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/avaliacoes" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft size={18} />
        {isEn ? 'Back to reviews' : 'Voltar para avaliações'}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-2xl text-primary-500 font-semibold">
              {review.user?.name?.[0] || 'U'}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {review.user?.name || 'Usuário'}
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {review.title && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
            {review.title}
          </h2>
        )}

        {review.comment && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300">
              {review.comment}
            </p>
          </div>
        )}

        {review.reply && (
          <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-l-4 border-primary-500">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {isEn ? 'Company Response' : 'Resposta da Empresa'}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-1">
              {review.reply}
            </p>
          </div>
        )}

        {review.service?.name && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              {isEn ? 'Service' : 'Serviço'}: {review.service.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}