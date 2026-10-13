// src/pages/company/CompanyReviewDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  User,
  Mail,
  Calendar,
  ArrowLeft,
  Loader2,
  MessageCircle,
  Reply,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  Package,
  Phone,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useCompany } from '../../context/CompanyContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function CompanyReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { company } = useCompany();
  const { isEn } = useLanguage();
  
  const [review, setReview] = useState(null);
  const [userData, setUserData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadReviewDetail();
    }
  }, [id]);

  // ============================================
  // CARREGAR DETALHES DA AVALIAÇO
  // ============================================
  const loadReviewDetail = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando avaliação:', id);

      // 1. Buscar avaliação
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();

      if (reviewError) {
        console.error('❌ Erro ao buscar avaliação:', reviewError);
        throw reviewError;
      }

      if (!reviewData) {
        toast.error(isEn ? 'Review not found' : 'Avaliação não encontrada');
        navigate('/empresa/avaliacoes');
        return;
      }

      // Verificar se a avaliação pertence à empresa
      if (reviewData.company_id !== company?.id) {
        toast.error(isEn ? 'Access denied' : 'Acesso negado');
        navigate('/empresa/avaliacoes');
        return;
      }

      setReview(reviewData);

      // 2. Buscar dados do usuário (sem phone)
      if (reviewData.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .eq('id', reviewData.user_id)
          .single();

        if (!userError && userData) {
          setUserData(userData);
        }
      }

      // 3. Buscar dados do serviço
      if (reviewData.service_id) {
        const { data: serviceData, error: serviceError } = await supabase
          .from('company_services')
          .select('id, name, category, price, description, images')
          .eq('id', reviewData.service_id)
          .single();

        if (!serviceError && serviceData) {
          setServiceData(serviceData);
        }
      }

      console.log('✅ Avaliação carregada:', reviewData.id);
    } catch (error) {
      console.error('❌ Erro ao carregar avaliação:', error);
      toast.error(error.message || (isEn ? 'Error loading review' : 'Erro ao carregar avaliação'));
      navigate('/empresa/avaliacoes');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ENVIAR RESPOSTA
  // ============================================
  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error(isEn ? 'Please write a reply' : 'Por favor, escreva uma resposta');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          reply: replyText.trim(),
          reply_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setReview(prev => ({
        ...prev,
        reply: replyText.trim(),
        reply_date: new Date().toISOString(),
      }));

      toast.success(isEn ? 'Reply sent successfully!' : 'Resposta enviada com sucesso!');
      setReplying(false);
      setReplyText('');
    } catch (error) {
      console.error('❌ Erro ao enviar resposta:', error);
      toast.error(error.message || (isEn ? 'Error sending reply' : 'Erro ao enviar resposta'));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: isEn ? 'Terrible' : 'Péssimo',
      2: isEn ? 'Poor' : 'Ruim',
      3: isEn ? 'Average' : 'Regular',
      4: isEn ? 'Good' : 'Bom',
      5: isEn ? 'Excellent' : 'Excelente',
    };
    return labels[rating] || '';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading review...' : 'Carregando avaliação...'}
        </p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Review not found' : 'Avaliação não encontrada'}
        </p>
        <Link to="/empresa/avaliacoes" className="mt-4 inline-block text-blue-500 hover:underline">
          {isEn ? 'Back to reviews' : 'Voltar para avaliações'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/empresa/avaliacoes"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Review Details' : 'Detalhes da Avaliação'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn ? 'Review from customer' : 'Avaliação do cliente'}
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-6">
        {/* Status e Informações */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userData?.name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userData?.name || 'Cliente'}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {getRatingLabel(review.rating)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(review.created_at)}
                  </span>
                  {userData?.email && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {userData.email}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              {review.reply ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle size={14} />
                  {isEn ? 'Replied' : 'Respondida'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  <Clock size={14} />
                  {isEn ? 'Pending Reply' : 'Aguardando Resposta'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Serviço */}
        {serviceData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package size={16} />
              {isEn ? 'Service' : 'Serviço'}
            </h3>
            <div className="flex items-start gap-4">
              {serviceData.images?.[0] ? (
                <img
                  src={serviceData.images[0]}
                  alt={serviceData.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <Package size={24} className="text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {serviceData.name}
                </h4>
                <p className="text-sm text-gray-500">{serviceData.category}</p>
                {serviceData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {serviceData.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Avaliação */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageCircle size={16} />
            {isEn ? 'Review' : 'Avaliação'}
          </h3>
          {review.title && (
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {review.title}
            </h4>
          )}
          {review.comment ? (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {review.comment}
            </p>
          ) : (
            <p className="text-gray-400 italic">
              {isEn ? 'No comment provided' : 'Nenhum comentário fornecido'}
            </p>
          )}
        </div>

        {/* Resposta da Empresa */}
        {review.reply ? (
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                <Reply size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                    {isEn ? 'Your Reply' : 'Sua Resposta'}
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {formatDate(review.reply_date)}
                  </span>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  {review.reply}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Formulário de resposta
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Reply size={16} />
              {isEn ? 'Reply to this review' : 'Responder a esta avaliação'}
            </h3>
            {replying ? (
              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isEn ? 'Write your reply...' : 'Escreva sua resposta...'}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setReplying(false);
                      setReplyText('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    {isEn ? 'Cancel' : 'Cancelar'}
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={submitting || !replyText.trim()}
                    className="px-6 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Reply size={16} />
                    )}
                    {isEn ? 'Send Reply' : 'Enviar Resposta'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplying(true)}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Reply size={16} />
                {isEn ? 'Write a reply' : 'Escrever resposta'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}