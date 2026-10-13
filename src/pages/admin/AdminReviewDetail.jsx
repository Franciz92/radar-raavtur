// src/pages/admin/AdminReviewDetail.jsx

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  User,
  Mail,
  Calendar,
  Building2,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  MessageCircle,
  Reply,
  Edit,
  Trash2,
  Printer,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editingReply, setEditingReply] = useState(false)
  const [replyText, setReplyText] = useState('')

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
          user:user_id (
            id,
            name,
            email,
            avatar_url,
            phone
          ),
          service:service_id (
            id,
            name,
            category,
            price,
            currency,
            description
          ),
          company:company_id (
            id,
            name,
            logo,
            email,
            phone,
            description
          ),
          booking:booking_id (
            id,
            booking_date_service,
            guests,
            total_price
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setReview(data)
      setReplyText(data.reply || '')
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error)
      toast.error(isEn ? 'Error loading review' : 'Erro ao carregar avaliação')
      navigate('/admin/avaliacoes')
    } finally {
      setLoading(false)
    }
  }

  const updateReply = async () => {
    if (!replyText.trim()) {
      toast.error(isEn ? 'Please write a reply' : 'Por favor, escreva uma resposta')
      return
    }

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          reply: replyText.trim(),
          reply_date: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      setReview(prev => ({
        ...prev,
        reply: replyText.trim(),
        reply_date: new Date().toISOString()
      }))
      
      toast.success(isEn ? 'Reply saved!' : 'Resposta salva!')
      setEditingReply(false)
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error.message || (isEn ? 'Error saving reply' : 'Erro ao salvar resposta'))
    } finally {
      setUpdating(false)
    }
  }

  const toggleVisibility = async () => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          is_public: !review.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      setReview(prev => ({ ...prev, is_public: !prev.is_public }))
      
      toast.success(
        !review.is_public 
          ? (isEn ? 'Review published!' : 'Avaliação publicada!')
          : (isEn ? 'Review hidden!' : 'Avaliação ocultada!')
      )
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error updating review' : 'Erro ao atualizar avaliação')
    } finally {
      setUpdating(false)
    }
  }

  const deleteReview = async () => {
    if (!confirm(isEn ? 'Delete this review?' : 'Excluir esta avaliação?')) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(isEn ? 'Review deleted!' : 'Avaliação excluída!')
      navigate('/admin/avaliacoes')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error.message || (isEn ? 'Error deleting review' : 'Erro ao excluir avaliação'))
    } finally {
      setUpdating(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
      </div>
    )
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
        <Link to="/admin/avaliacoes" className="mt-4 inline-block text-primary-500">
          {isEn ? 'Back to reviews' : 'Voltar para avaliações'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/avaliacoes" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={28} className="text-yellow-400 fill-yellow-400" />
            {isEn ? 'Review Details' : 'Detalhes da Avaliação'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">#{review.id.slice(0, 8)}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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
            {renderStars(review.rating)}
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
          {/* Avaliação */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-500 font-semibold text-lg">
                  {review.user?.name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.user?.name || 'Usuário'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Mail size={14} />
                      {review.user?.email || '-'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleString()}
                  </span>
                </div>
                {review.title && (
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-3">
                    {review.title}
                  </h3>
                )}
                {review.comment && (
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resposta */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              {isEn ? 'Company Response' : 'Resposta da Empresa'}
            </h3>

            {editingReply ? (
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isEn ? 'Write a response...' : 'Escreva uma resposta...'}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingReply(false)
                      setReplyText(review.reply || '')
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    {isEn ? 'Cancel' : 'Cancelar'}
                  </button>
                  <button
                    onClick={updateReply}
                    disabled={updating}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {isEn ? 'Save Reply' : 'Salvar Resposta'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {review.reply ? (
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border-l-4 border-primary-500">
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                      <MessageCircle size={16} />
                      <span>{isEn ? 'Reply sent' : 'Resposta enviada'}</span>
                      <span className="text-xs text-gray-400">
                        {review.reply_date ? new Date(review.reply_date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                      {review.reply}
                    </p>
                    <button
                      onClick={() => setEditingReply(true)}
                      className="mt-3 text-sm text-primary-500 hover:text-primary-600 transition flex items-center gap-1"
                    >
                      <Edit size={14} />
                      {isEn ? 'Edit reply' : 'Editar resposta'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingReply(true)}
                    className="text-primary-500 hover:text-primary-600 transition flex items-center gap-2"
                  >
                    <Reply size={16} />
                    {isEn ? 'Add a response' : 'Adicionar resposta'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Informações da reserva */}
          {review.booking && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                {isEn ? 'Booking Information' : 'Informações da Reserva'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{isEn ? 'Booking ID' : 'ID da Reserva'}</p>
                  <p className="font-medium text-gray-900 dark:text-white font-mono">
                    {review.booking.id?.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{isEn ? 'Date' : 'Data'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(review.booking.booking_date_service).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{isEn ? 'Guests' : 'Pessoas'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {review.booking.guests}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
                  <p className="font-medium text-primary-500">
                    {new Intl.NumberFormat('pt-AO', {
                      style: 'currency',
                      currency: 'AOA',
                      minimumFractionDigits: 0
                    }).format(review.booking.total_price)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Ações */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Actions' : 'Ações'}
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={toggleVisibility}
                disabled={updating}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updating ? <Loader2 size={18} className="animate-spin" /> : (review.is_public ? <XCircle size={18} /> : <CheckCircle size={18} />)}
                {review.is_public 
                  ? (isEn ? 'Hide Review' : 'Ocultar Avaliação')
                  : (isEn ? 'Publish Review' : 'Publicar Avaliação')
                }
              </button>
              <button
                onClick={deleteReview}
                disabled={updating}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={18} />
                {isEn ? 'Delete Review' : 'Excluir Avaliação'}
              </button>
            </div>
          </div>

          {/* Serviço */}
          {review.service && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {isEn ? 'Service' : 'Serviço'}
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Package size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {review.service.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {review.service.category}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empresa */}
          {review.company && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {isEn ? 'Company' : 'Empresa'}
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Building2 size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {review.company.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}