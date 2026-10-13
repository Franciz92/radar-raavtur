// src/pages/public/EventsPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { getEvents } from '../../services/eventService';
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Search,
  AlertCircle,
  RefreshCw,
  Ticket,
  Music,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE CARD DE EVENTO
// ============================================

const EventCard = ({ event, isEn }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link 
      to={`/evento/${event.id}`}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
    >
      {/* Imagem do Evento */}
      <div className="relative h-56 overflow-hidden">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music size={48} className="text-white/50" />
          </div>
        )}
        
        {/* Badge de Categoria */}
        {event.category && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            {event.category}
          </div>
        )}

        {/* Badge de Data */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Calendar size={14} />
          {new Date(event.date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })}
        </div>

        {/* Botão de Ingressos */}
        <div className="absolute bottom-4 right-4 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-purple-700 transition">
          <Ticket size={14} />
          {isEn ? 'Tickets' : 'Ingressos'}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition line-clamp-1">
          {event.title}
        </h3>
        
        {event.description && (
          <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 text-sm">
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {event.location}
            </span>
          )}
          {event.organizer && (
            <span className="flex items-center gap-1">
              <Users size={14} />
              {event.organizer}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            <Ticket size={16} />
            {isEn ? 'Get Tickets' : 'Comprar Ingressos'}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(event.date)}
          </span>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function EventsPage() {
  const { isEn } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEvents();
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
        toast.error(isEn ? 'Error loading events' : 'Erro ao carregar eventos');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      setError(error.message);
      toast.error(isEn ? 'Error loading events' : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
    toast.success(isEn ? 'Updated!' : 'Atualizado!');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-purple-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading events...' : 'Carregando eventos...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Error loading events' : 'Erro ao carregar eventos'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Try again' : 'Tentar novamente'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                <Calendar size={32} />
                {isEn ? 'Events' : 'Eventos'}
              </h1>
              <p className="text-white/80 text-lg mt-1">
                {isEn 
                  ? 'Discover the best events in Angola'
                  : 'Descubra os melhores eventos em Angola'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition flex items-center gap-2"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {isEn ? 'Refresh' : 'Atualizar'}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              🎫 {events.length} {isEn ? 'events' : 'eventos'}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="container mx-auto px-4 -mt-6 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={isEn ? 'Search events...' : 'Pesquisar eventos...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Eventos */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEn ? 'No events found' : 'Nenhum evento encontrado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isEn 
                ? 'Check back later for new events'
                : 'Volte mais tarde para novos eventos'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} isEn={isEn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}