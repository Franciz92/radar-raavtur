import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getReviewsByItem,
  getReviewStats,
  getUserReview,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from '../services/reviewService'
import toast from 'react-hot-toast'

export function useReviews(itemId, itemType) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    percentage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [userReview, setUserReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const [reviewsData, statsData, userReviewData] = await Promise.all([
        getReviewsByItem(itemId, itemType),
        getReviewStats(itemId, itemType),
        isAuthenticated && user ? getUserReview(user.id, itemId, itemType) : null,
      ])

      setReviews(reviewsData || [])
      setStats(statsData)
      setUserReview(userReviewData || null)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setLoading(false)
    }
  }, [itemId, itemType, isAuthenticated, user])

  useEffect(() => {
    if (itemId && itemType) {
      loadReviews()
    }
  }, [itemId, itemType, loadReviews])

  const submitReview = useCallback(async (rating, comment, images = []) => {
    if (!isAuthenticated) {
      toast.error('Faça login para avaliar')
      return null
    }

    setSubmitting(true)
    try {
      let result
      
      if (userReview) {
        // Atualizar avaliação existente
        result = await updateReview(userReview.id, { rating, comment, images })
        toast.success('Avaliação atualizada!')
      } else {
        // Criar nova avaliação
        result = await createReview({
          userId: user.id,
          itemId,
          itemType,
          rating,
          comment,
          images,
        })
        toast.success('Avaliação enviada!')
      }

      await loadReviews()
      return result
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('Erro ao enviar avaliação')
      return null
    } finally {
      setSubmitting(false)
    }
  }, [isAuthenticated, user, userReview, itemId, itemType, loadReviews])

  const deleteReviewHandler = useCallback(async () => {
    if (!userReview) return

    if (!confirm('Tem certeza que deseja excluir sua avaliação?')) return

    setSubmitting(true)
    try {
      await deleteReview(userReview.id)
      setUserReview(null)
      toast.success('Avaliação excluída!')
      await loadReviews()
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error)
      toast.error('Erro ao excluir avaliação')
    } finally {
      setSubmitting(false)
    }
  }, [userReview, loadReviews])

  const markHelpful = useCallback(async (reviewId) => {
    try {
      await markReviewHelpful(reviewId)
      // Atualizar lista localmente
      setReviews(prev => 
        prev.map(r => 
          r.id === reviewId 
            ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
            : r
        )
      )
    } catch (error) {
      console.error('Erro ao marcar como útil:', error)
    }
  }, [])

  return {
    reviews,
    stats,
    userReview,
    loading,
    submitting,
    loadReviews,
    submitReview,
    deleteReview: deleteReviewHandler,
    markHelpful,
    hasReviewed: !!userReview,
  }
}