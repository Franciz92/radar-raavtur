// src/pages/company/CompanyReviews.jsx - CORRIGIDO (sem joins)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  User,
  Mail,
  Calendar,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Reply,
  Eye,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useCompany } from '../../context/CompanyContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function CompanyReviews() {
  const { company } = useCompany();
  const { isEn } = useLanguage();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (company?.id) {
      loadReviews();
    }
  }, [company]);

  // ============================================
  // CARREGAR AVALIAÇÕES - SEM JOINS
  // ============================================
  const loadReviews = async () => {
    if (!company?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Buscar avaliações da empresa
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.error('❌ Erro ao carregar avaliações:', reviewsError);
        throw reviewsError;
      }

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // 2. Buscar dados dos usuários
      const userIds = reviewsData.map(r => r.user_id).filter(id => id);
      let usersMap = {};
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', userIds);

        if (!usersError && usersData) {
          usersData.forEach(u => { usersMap[u.id] = u; });
        }
      }

      // 3. Buscar dados dos serviços
      const serviceIds = reviewsData.map(r => r.service_id).filter(id => id);
      let servicesMap = {};
      if (serviceIds.length > 0) {
        const { data: servicesData, error: servicesError } = await supabase
          .from('company_services')
          .select('id, name, category')
          .in('id', serviceIds);

        if (!servicesError && servicesData) {
          servicesData.forEach(s => { servicesMap[s.id] = s; });
        }
      }

      // 4. Combinar os dados
      const combinedData = reviewsData.map(review => ({
        ...review,
        user: usersMap[review.user_id] || null,
        service: servicesMap[review.service_id] || null,
      }));

      setReviews(combinedData);
      
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast.error(isEn ? 'Error loading reviews' : 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
    setUnreadCount(0);
    toast.success(isEn ? 'Reviews updated!' : 'Avaliações atualizadas!');
  };

  const handleReply = async (reviewId) => {
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
        .eq('id', reviewId);
      
      if (error) throw error;
      
      setReviews(prev => 
        prev.map(r => 
          r.id === reviewId 
            ? { ...r, reply: replyText.trim(), reply_date: new Date().toISOString() }
            : r
        )
      );
      
      toast.success(isEn ? 'Reply sent!' : 'Resposta enviada!');
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Erro ao responder:', error);
      toast.error(error.message || (isEn ? 'Error sending reply' : 'Erro ao enviar resposta'));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // FILTROS
  // ============================================
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  // ============================================
  // ESTATÍSTICAS
  // ============================================
  const stats = {
    total: reviews.length,
    average: reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
    byRating: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    },
    withReply: reviews.filter(r => r.reply).length,
    withoutReply: reviews.filter(r => !r.reply).length,
  };

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
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading reviews...' : 'Carregando avaliações...'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={28} className="text-yellow-400 fill-yellow-400" />
            {isEn ? 'Reviews' : 'Avaliações'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            {isEn 
              ? `Manage all customer reviews (${stats.total})`
              : `Gerencie todas as avaliações dos clientes (${stats.total})`
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total Reviews' : 'Total de Avaliações'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-400 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Average Rating' : 'Média de Avaliações'}</p>
          <p className="text-2xl font-bold text-yellow-500 flex items-center gap-1">
            {stats.average}
            <Star size={20} className="fill-yellow-400 text-yellow-400" />
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? '5 Stars' : '5 Estrelas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.byRating[5]}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Replied' : 'Respondidas'}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.withReply}</p>
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all">{isEn ? 'All Ratings' : 'Todas as Notas'}</option>
            <option value="5">5 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="1">1 ⭐</option>
          </select>
          <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Lista de Avaliações */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterRating !== 'all' 
              ? (isEn ? 'No reviews match your filters' : 'Nenhuma avaliação corresponde aos filtros')
              : (isEn ? 'No reviews yet' : 'Nenhuma avaliação ainda')
            }
          </p>
          {searchTerm || filterRating !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRating('all');
              }}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600 transition"
            >
              {isEn ? 'Clear filters' : 'Limpar filtros'}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                {/* Cabeçalho */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {review.user?.name?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.user?.name || 'Cliente'}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{review.service?.name || 'Serviço'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {review.created_at 
                            ? new Date(review.created_at).toLocaleDateString('pt-BR')
                            : ''}
                        </span>
                        {review.user?.email && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {review.user.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/empresa/avaliacao/${review.id}`}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    title={isEn ? 'View details' : 'Ver detalhes'}
                  >
                    <Eye size={18} />
                  </Link>
                </div>

                {/* Comentário */}
                {review.comment && (
                  <div className="mt-3">
                    {review.title && (
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.title}
                      </h4>
                    )}
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {review.comment}
                    </p>
                  </div>
                )}

                {/* Resposta da empresa */}
                {review.reply ? (
                  <div className="mt-4 pl-4 border-l-4 border-blue-300 dark:border-blue-700 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                      <MessageCircle size={16} />
                      {isEn ? 'Your reply' : 'Sua resposta'}
                      <span className="text-xs text-gray-400">
                        {review.reply_date 
                          ? new Date(review.reply_date).toLocaleDateString('pt-BR')
                          : ''}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                      {review.reply}
                    </p>
                  </div>
                ) : (
                  replyingTo === review.id ? (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={isEn ? 'Write your reply...' : 'Escreva sua resposta...'}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                          {isEn ? 'Cancel' : 'Cancelar'}
                        </button>
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={submitting || !replyText.trim()}
                          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {submitting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Reply size={14} />
                          )}
                          {isEn ? 'Send Reply' : 'Enviar Resposta'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingTo(review.id);
                        setReplyText('');
                      }}
                      className="mt-3 text-sm text-blue-500 hover:text-blue-600 transition flex items-center gap-1"
                    >
                      <Reply size={14} />
                      {isEn ? 'Reply to this review' : 'Responder a esta avaliação'}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}