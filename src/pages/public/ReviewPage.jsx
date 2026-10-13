// src/pages/public/ReviewPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Building2,
  Package,
  Bell,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [company, setCompany] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookingData();
  }, [bookingId, isAuthenticated]);

  // ============================================
  // CARREGAR DADOS DA RESERVA
  // ============================================
  const loadBookingData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando dados para avaliação:', bookingId);
      
      // 1. Buscar reserva
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();
      
      if (bookingError) throw bookingError;
      
      if (!bookingData) {
        toast.error(isEn ? 'Booking not found' : 'Reserva não encontrada');
        navigate('/minhas-reservas');
        return;
      }
      
      // Verificar se a reserva pertence ao usuário
      if (bookingData.user_id !== user.id) {
        toast.error(isEn ? 'Unauthorized' : 'Não autorizado');
        navigate('/minhas-reservas');
        return;
      }
      
      // Verificar se a reserva está concluída
      if (bookingData.status !== 'completed') {
        toast.error(isEn ? 'You can only review completed bookings' : 'Só pode avaliar reservas concluídas');
        navigate(`/minha-reserva/${bookingId}`);
        return;
      }
      
      setBooking(bookingData);
      
      // 2. Buscar serviço
      if (bookingData.service_id) {
        const { data, error } = await supabase
          .from('company_services')
          .select('id, name, category, price, currency, images')
          .eq('id', bookingData.service_id)
          .maybeSingle();
        
        if (!error && data) {
          setService(data);
        }
      }
      
      // 3. Buscar empresa
      if (bookingData.company_id) {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, logo, user_id')
          .eq('id', bookingData.company_id)
          .maybeSingle();
        
        if (!error && data) {
          setCompany(data);
        }
      }
      
      // 4. Verificar se já existe avaliação
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle();
      
      if (!reviewError && reviewData) {
        setExistingReview(reviewData);
        setFormData({
          rating: reviewData.rating,
          title: reviewData.title || '',
          comment: reviewData.comment || '',
        });
        toast.info(isEn ? 'You already reviewed this booking' : 'Você já avaliou esta reserva');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error(error.message || (isEn ? 'Error loading data' : 'Erro ao carregar dados'));
      navigate('/minhas-reservas');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ENVIAR NOTIFICAÇO PARA A EMPRESA
  // ============================================
  const sendCompanyNotification = async (reviewData) => {
    try {
      if (!company?.user_id) {
        console.log('⚠️ Empresa sem user_id, não é possível enviar notificação');
        return;
      }

      console.log('🔔 Enviando notificação para empresa:', company.user_id);

      const ratingLabels = {
        1: isEn ? 'Terrible' : 'Péssimo',
        2: isEn ? 'Poor' : 'Ruim',
        3: isEn ? 'Average' : 'Regular',
        4: isEn ? 'Good' : 'Bom',
        5: isEn ? 'Excellent' : 'Excelente',
      };

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: company.user_id,
          type: 'review',
          title: isEn ? '⭐ New Review Received!' : '⭐ Nova Avaliação Recebida!',
          message: isEn 
            ? `${user?.name || 'Um cliente'} avaliou "${service?.name || 'Serviço'}" com ${reviewData.rating} estrelas (${ratingLabels[reviewData.rating]})`
            : `${user?.name || 'Um cliente'} avaliou "${service?.name || 'Serviço'}" com ${reviewData.rating} estrelas (${ratingLabels[reviewData.rating]})`,
          link: '/empresa/avaliacoes',
          icon: 'Star',
          metadata: {
            booking_id: bookingId,
            rating: reviewData.rating,
            user_name: user?.name || 'Cliente',
            service_name: service?.name || 'Serviço',
            company_id: company?.id,
            review_id: reviewData.id,
            comment: reviewData.comment || '',
          },
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Erro ao enviar notificação:', error);
      } else {
        console.log('✅ Notificação enviada com sucesso!');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
    }
  };

  // ============================================
  // SUBMETER AVALIAÇO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error(isEn ? 'Please select a rating' : 'Selecione uma avaliação');
      return;
    }
    
    if (existingReview) {
      toast.error(isEn ? 'You already reviewed this booking' : 'Você já avaliou esta reserva');
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('📝 Enviando avaliação...');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          booking_id: bookingId,
          user_id: user.id,
          service_id: booking.service_id,
          company_id: booking.company_id,
          rating: formData.rating,
          title: formData.title.trim() || null,
          comment: formData.comment.trim() || null,
          is_public: true,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Avaliação enviada:', data.id);
      
      // 🔔 ENVIAR NOTIFICAÇO PARA A EMPRESA
      await sendCompanyNotification(data);
      
      toast.success(isEn ? '✅ Review submitted successfully!' : '✅ Avaliação enviada com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/minha-reserva/${bookingId}`);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao enviar avaliação:', error);
      toast.error(error.message || (isEn ? 'Error submitting review' : 'Erro ao enviar avaliação'));
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // COMPONENTE DE ESTRELAS
  // ============================================
  const StarRating = ({ rating, hoverRating, onRatingChange, onHoverChange }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => onHoverChange(star)}
            onMouseLeave={() => onHoverChange(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={40}
              className={`${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDERIZAÇO
  // ============================================
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading...' : 'Carregando...'}
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'Booking not found' : 'Reserva não encontrada'}
        </h2>
        <Link to="/minhas-reservas" className="mt-4 inline-block text-blue-500">
          {isEn ? 'Back to bookings' : 'Voltar para reservas'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to={`/minha-reserva/${bookingId}`}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {existingReview ? (isEn ? 'Edit Review' : 'Editar Avaliação') : (isEn ? 'Write a Review' : 'Escrever Avaliação')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn ? 'Share your experience' : 'Partilhe a sua experiência'}
          </p>
        </div>
      </div>

      {/* Informações da Reserva */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {service?.images && service.images.length > 0 ? (
              <img 
                src={service.images[0]} 
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={32} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {service?.name || 'Serviço'}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {company && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {company.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {booking.date ? new Date(booking.date).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {isEn ? 'Status' : 'Status'}
            </span>
            <p className="text-sm font-semibold text-green-500">✅ {isEn ? 'Completed' : 'Concluída'}</p>
          </div>
        </div>
      </div>

      {/* Formulário de Avaliação */}
      {existingReview ? (
        // Exibir avaliação existente
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isEn ? 'Review Already Submitted' : 'Avaliação já enviada'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isEn 
              ? 'You have already reviewed this booking. Thank you for your feedback!' 
              : 'Você já avaliou esta reserva. Obrigado pelo seu feedback!'
            }
          </p>
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={star <= existingReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          {existingReview.comment && (
            <p className="text-gray-600 dark:text-gray-300 italic">"{existingReview.comment}"</p>
          )}
          <Link
            to={`/minha-reserva/${bookingId}`}
            className="mt-6 inline-block px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            {isEn ? 'Back to Booking' : 'Voltar para Reserva'}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border border-gray-100 dark:border-gray-700">
          {/* Avaliação por Estrelas */}
          <div className="mb-6 text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isEn ? 'How was your experience?' : 'Como foi a sua experiência?'}
            </label>
            <StarRating
              rating={formData.rating}
              hoverRating={hoverRating}
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
              onHoverChange={setHoverRating}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {formData.rating > 0 && (
                <span>
                  {formData.rating === 1 && (isEn ? 'Terrible' : 'Péssimo')}
                  {formData.rating === 2 && (isEn ? 'Poor' : 'Ruim')}
                  {formData.rating === 3 && (isEn ? 'Average' : 'Regular')}
                  {formData.rating === 4 && (isEn ? 'Good' : 'Bom')}
                  {formData.rating === 5 && (isEn ? 'Excellent' : 'Excelente')}
                </span>
              )}
            </p>
          </div>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Title (optional)' : 'Título (opcional)'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isEn ? 'Summarize your experience' : 'Resuma a sua experiência'}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              maxLength={100}
            />
          </div>

          {/* Comentário */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Review (optional)' : 'Comentário (opcional)'}
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder={isEn ? 'Share details about your experience...' : 'Partilhe detalhes sobre a sua experiência...'}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {formData.comment.length}/1000
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Link
              to={`/minha-reserva/${bookingId}`}
              className="flex-1 px-4 py-2.5 text-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </Link>
            <button
              type="submit"
              disabled={submitting || formData.rating === 0}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isEn ? 'Submitting...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Star size={18} className="fill-white" />
                  {isEn ? 'Submit Review' : 'Enviar Avaliação'}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
            <Bell size={14} />
            <span>
              {isEn 
                ? 'The company will be notified of your review'
                : 'A empresa será notificada sobre a sua avaliação'}
            </span>
          </div>

          <p className="text-xs text-gray-400 text-center mt-2">
            {isEn 
              ? 'Your review helps other travelers make better decisions. Thank you!' 
              : 'A sua avaliação ajuda outros viajantes a tomar melhores decisões. Obrigado!'}
          </p>
        </form>
      )}
    </div>
  );
}