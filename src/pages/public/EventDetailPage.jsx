// src/pages/public/EventDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  User,
  Loader2,
  AlertCircle,
  Clock,
  DollarSign,
  CheckCircle,
  Share2,
  QrCode,
  Plus,
  Minus,
  Heart,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE INGRESSO
// ============================================

const TicketCard = ({ ticket, selected, onSelect, isEn }) => {
  const available = ticket.quantity - (ticket.sold || 0);

  return (
    <div
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500'
          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:shadow-md'
      } ${available <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => {
        if (available > 0) {
          onSelect(ticket);
        } else {
          toast.error(isEn ? 'This ticket is sold out' : 'Este ingresso está esgotado');
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {ticket.name}
            </h4>
            {ticket.benefits && ticket.benefits.length > 0 && (
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                {isEn ? 'Benefits' : 'Benefícios'}
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {ticket.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {ticket.price.toLocaleString()} Kz
            </p>
            <p className="text-sm text-gray-400">
              {available > 0 ? (
                <span>
                  {available} {isEn ? 'available' : 'disponíveis'}
                </span>
              ) : (
                <span className="text-red-500">{isEn ? 'Sold out' : 'Esgotado'}</span>
              )}
            </p>
          </div>
          {ticket.benefits && ticket.benefits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {ticket.benefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <div className="text-purple-500">
            <CheckCircle size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;

      if (!eventData || eventData.status === 'inactive') {
        throw new Error(isEn ? 'Event not found' : 'Evento não encontrado');
      }

      setEvent(eventData);
      setLikesCount(eventData.likes_count || 0);

      // Buscar ingressos
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', id)
        .eq('status', 'active')
        .gt('quantity', 0)
        .order('price', { ascending: true });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

      // Verificar like do usuário
      if (isAuthenticated && user) {
        const { data: likeData } = await supabase
          .from('event_likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_id', id)
          .single();

        setIsLiked(!!likeData);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar evento:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to like' : 'Faça login para curtir');
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        // Remover like
        const { error } = await supabase
          .from('event_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', id);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Adicionar like
        const { error } = await supabase
          .from('event_likes')
          .insert({
            user_id: user.id,
            event_id: id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('❌ Erro ao curtir:', error);
      toast.error(isEn ? 'Error liking' : 'Erro ao curtir');
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/evento/${id}`;
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: event?.description?.slice(0, 100),
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(isEn ? 'Link copied!' : 'Link copiado!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  const handleBuyTicket = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to buy tickets' : 'Faça login para comprar ingressos');
      navigate('/login');
      return;
    }

    if (!selectedTicket) {
      toast.error(isEn ? 'Select a ticket' : 'Selecione um ingresso');
      return;
    }

    if (quantity < 1) {
      toast.error(isEn ? 'Quantity must be at least 1' : 'A quantidade deve ser pelo menos 1');
      return;
    }

    const available = selectedTicket.quantity - (selectedTicket.sold || 0);
    if (quantity > available) {
      toast.error(isEn ? 'Not enough tickets available' : 'Ingressos insuficientes disponíveis');
      return;
    }

    setBuying(true);
    try {
      const totalPrice = selectedTicket.price * quantity;

      // Criar compra
      const { data: purchase, error: purchaseError } = await supabase
        .from('event_purchases')
        .insert({
          user_id: user.id,
          event_id: id,
          ticket_id: selectedTicket.id,
          ticket_name: selectedTicket.name,
          quantity: quantity,
          unit_price: selectedTicket.price,
          total_price: totalPrice,
          payment_method: 'pending',
          payment_status: 'pending',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Atualizar ingressos vendidos
      const { error: updateError } = await supabase
        .from('event_tickets')
        .update({
          sold: (selectedTicket.sold || 0) + quantity
        })
        .eq('id', selectedTicket.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar ingressos vendidos:', updateError);
      }

      toast.success(isEn ? '🎉 Purchase created! Proceed to payment.' : '🎉 Compra criada! Siga para o pagamento.');

      // Redirecionar para página de pagamento (Etapa 1)
      navigate(`/evento/pagamento/${purchase.id}`);

    } catch (error) {
      console.error('❌ Erro ao comprar ingresso:', error);
      toast.error(error.message || (isEn ? 'Error purchasing ticket' : 'Erro ao comprar ingresso'));
    } finally {
      setBuying(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-purple-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading event...' : 'Carregando evento...'}
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Event not found' : 'Evento não encontrado'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
          >
            <ArrowLeft size={18} />
            {isEn ? 'Back to events' : 'Voltar para eventos'}
          </Link>
        </div>
      </div>
    );
  }

  const isEventActive = event.status === 'active';
  const hasTickets = tickets.length > 0;
  const availableTickets = tickets.some(t => (t.quantity - (t.sold || 0)) > 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Voltar */}
      <Link
        to="/eventos"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-500 transition mb-6"
      >
        <ArrowLeft size={18} />
        {isEn ? 'Back to events' : 'Voltar para eventos'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda - Informações do Evento */}
        <div className="lg:col-span-2">
          {/* Imagem */}
          {event.image_url && (
            <div className="relative rounded-2xl overflow-hidden mb-6">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-80 object-cover"
              />
              {event.featured && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {isEn ? 'Featured' : 'Destaque'}
                </span>
              )}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h1>

          {/* Categoria */}
          {event.category && (
            <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-sm mb-4">
              {event.category}
            </span>
          )}

          {/* Informações */}
          <div className="space-y-3 text-gray-600 dark:text-gray-300 mb-6">
            {event.date && (
              <p className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" />
                {formatDate(event.date)}
              </p>
            )}
            {event.location && (
              <p className="flex items-center gap-2">
                <MapPin size={18} className="text-purple-500" />
                {event.location}
                {event.address && ` - ${event.address}`}
              </p>
            )}
            {event.organizer && (
              <p className="flex items-center gap-2">
                <User size={18} className="text-purple-500" />
                {isEn ? 'Organized by' : 'Organizado por'}: {event.organizer}
              </p>
            )}
          </div>

          {/* Descrição */}
          {event.description && (
            <div className="prose dark:prose-invert max-w-none mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isEn ? 'Description' : 'Descrição'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Ações - Like e Share */}
          <div className="flex items-center gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                isLiked
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
              <span className="font-medium">{likesCount}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
            >
              <Share2 className="w-5 h-5" />
              <span>{isEn ? 'Share' : 'Partilhar'}</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita - Compra de Ingressos */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Ticket size={22} className="text-purple-500" />
              {isEn ? 'Tickets' : 'Ingressos'}
            </h3>

            {!isEventActive ? (
              <div className="text-center py-8">
                <AlertCircle size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {isEn ? 'This event is not available' : 'Este evento não está disponível'}
                </p>
              </div>
            ) : !hasTickets ? (
              <div className="text-center py-8">
                <Ticket size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {isEn ? 'No tickets available for this event' : 'Nenhum ingresso disponível para este evento'}
                </p>
              </div>
            ) : !availableTickets ? (
              <div className="text-center py-8">
                <Ticket size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">
                  {isEn ? 'All tickets are sold out' : 'Todos os ingressos estão esgotados'}
                </p>
              </div>
            ) : (
              <>
                {/* Lista de ingressos */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {tickets.map((ticket) => {
                    const available = ticket.quantity - (ticket.sold || 0);
                    return (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        selected={selectedTicket?.id === ticket.id}
                        onSelect={(t) => {
                          setSelectedTicket(t);
                          setQuantity(1);
                        }}
                        isEn={isEn}
                      />
                    );
                  })}
                </div>

                {/* Seleção de quantidade e compra */}
                {selectedTicket && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isEn ? 'Quantity' : 'Quantidade'}:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            const available = selectedTicket.quantity - (selectedTicket.sold || 0);
                            setQuantity(Math.min(available, quantity + 1));
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        {isEn ? 'Total' : 'Total'}:
                      </span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {(selectedTicket.price * quantity).toLocaleString()} Kz
                      </span>
                    </div>

                    <button
                      onClick={handleBuyTicket}
                      disabled={buying}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buying ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          {isEn ? 'Processing...' : 'Processando...'}
                        </>
                      ) : (
                        <>
                          <Ticket size={18} />
                          {isEn ? 'Buy Ticket' : 'Comprar Ingresso'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}