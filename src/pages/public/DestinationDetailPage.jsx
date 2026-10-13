// src/pages/public/DestinationDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { 
  MapPin, 
  Star, 
  Globe, 
  Loader2, 
  ArrowLeft,
  Clock,
  Users,
  Camera,
  Heart,
  Share2,
  Calendar,
  Info,
  CheckCircle,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  BookOpen,
  History,
  Compass,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedDestinations, setRelatedDestinations] = useState([]);

  useEffect(() => {
    loadDestination();
  }, [id]);

  useEffect(() => {
    if (destination && isAuthenticated) {
      checkFavorite();
    }
  }, [destination, isAuthenticated]);

  // ============================================
  // FUNÇO LOAD DESTINATION
  // ============================================
  const loadDestination = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Carregando destino:', id);
      
      // 1. Buscar o destino (apenas status approved ou active)
      const { data: destinationData, error: destinationError } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .in('status', ['approved', 'active'])
        .maybeSingle();
      
      if (destinationError) {
        console.error('❌ Erro ao buscar destino:', destinationError);
        throw destinationError;
      }
      
      if (!destinationData) {
        console.warn('⚠️ Destino não encontrado');
        setError(isEn ? 'Destination not found' : 'Destino não encontrado');
        setLoading(false);
        return;
      }
      
      console.log('✅ Destino encontrado:', destinationData.name);
      console.log('📝 full_description:', destinationData?.full_description);
      console.log('📝 attractions_description:', destinationData?.attractions_description);
      
      setDestination(destinationData);

      // 2. Buscar destinos relacionados (mesma província)
      if (destinationData.province) {
        const { data: relatedData, error: relatedError } = await supabase
          .from('destinations')
          .select('id, name, image_url, province, rating')
          .eq('province', destinationData.province)
          .neq('id', id)
          .in('status', ['approved', 'active'])
          .limit(4);
        
        if (!relatedError && relatedData) {
          setRelatedDestinations(relatedData);
          console.log('📍 Destinos relacionados:', relatedData.length);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar destino:', error);
      setError(error.message || (isEn ? 'Error loading destination' : 'Erro ao carregar destino'));
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user?.id || !destination?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', destination.id)
        .eq('item_type', 'destination')
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Login to favorite' : 'Faça login para favoritar');
      return;
    }

    if (!destination?.id) {
      toast.error(isEn ? 'Destination not found' : 'Destino não encontrado');
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', destination.id)
          .eq('item_type', 'destination');
        
        if (error) throw error;
        setIsFavorite(false);
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: destination.id,
            item_type: 'destination',
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        setIsFavorite(true);
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      toast.error(isEn ? 'Error favoriting' : 'Erro ao favoritar');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: destination?.name || 'Destino',
          text: `Descubra ${destination?.name} em Angola!`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(isEn ? 'Link copied!' : 'Link copiado!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // ============================================
  // RENDERIZAÇO - LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading destination...' : 'Carregando destino...'}
        </p>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇO - ERRO
  // ============================================
  if (error || !destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Destination not found' : 'Destino não encontrado'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error || (isEn ? 'The destination you are looking for does not exist' : 'O destino que você procura não existe')}
          </p>
          <Link
            to="/destinos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            <ArrowLeft size={18} />
            {isEn ? 'Back to destinations' : 'Voltar para destinos'}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇO PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Imagem de Capa */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {destination.image_url ? (
          <img
            src={destination.image_url}
            alt={destination.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700">
                  <span class="text-6xl">📍</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700">
            <MapPin size={80} className="text-blue-500 dark:text-blue-300 opacity-50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Botões de Ação */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleFavorite}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
            aria-label="Share"
          >
            <Share2 size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Informações na Capa */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/destinos"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={16} />
              {isEn ? 'Back to destinations' : 'Voltar para destinos'}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{destination.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {destination.province && (
                <span className="flex items-center gap-1 text-white/80">
                  <MapPin size={16} />
                  {destination.province}
                </span>
              )}
              {destination.rating > 0 && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  {typeof destination.rating === 'number' ? destination.rating.toFixed(1) : destination.rating}
                </span>
              )}
              {destination.attractions && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {destination.attractions} {isEn ? 'attractions' : 'atrações'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição Curta */}
            {destination.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info size={20} className="text-blue-500" />
                  {isEn ? 'Overview' : 'Visão Geral'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {destination.description}
                </p>
              </div>
            )}

            {/* 🆕 História / Descrição Completa */}
            {destination.full_description && destination.full_description.trim() !== '' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <History size={20} className="text-blue-500" />
                  {isEn ? 'History & Culture' : 'História e Cultura'}
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {destination.full_description}
                  </p>
                </div>
              </div>
            )}

            {/* 🆕 O que fazer / Atrações Turísticas */}
            {destination.attractions_description && destination.attractions_description.trim() !== '' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Compass size={20} className="text-green-500" />
                  {isEn ? 'What to Do' : 'O que Fazer'}
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {destination.attractions_description}
                  </p>
                </div>
                {destination.attractions > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Camera size={16} className="text-green-500" />
                    <span>{destination.attractions} {isEn ? 'attractions available' : 'atrações disponíveis'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Destaques */}
            {destination.highlights && destination.highlights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles size={20} className="text-yellow-500" />
                  {isEn ? 'Highlights' : 'Destaques'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {destination.highlights.map((highlight, index) => (
                    <span
                      key={index}
                      className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-full text-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Endereço */}
            {destination.address && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  {isEn ? 'Address' : 'Endereço'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {destination.address}
                </p>
              </div>
            )}

            {/* Melhor época */}
            {destination.best_time && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-500" />
                  {isEn ? 'Best Time to Visit' : 'Melhor Época para Visitar'}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" />
                  {destination.best_time}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Informações Rápidas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                {isEn ? 'Quick Info' : 'Informações Rápidas'}
              </h3>
              
              <div className="space-y-3">
                {destination.province && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isEn ? 'Province' : 'Província'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {destination.province}
                    </span>
                  </div>
                )}
                {destination.rating > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isEn ? 'Rating' : 'Avaliação'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      {typeof destination.rating === 'number' ? destination.rating.toFixed(1) : destination.rating}
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                )}
                {destination.attractions && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isEn ? 'Attractions' : 'Atrações'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {destination.attractions}
                    </span>
                  </div>
                )}
                {destination.address && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isEn ? 'Address' : 'Endereço'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                      {destination.address}
                    </span>
                  </div>
                )}
                {destination.best_time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {isEn ? 'Best Time' : 'Melhor Época'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {destination.best_time}
                    </span>
                  </div>
                )}
              </div>

              {/* Coordenadas */}
              {destination.latitude && destination.longitude && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-400">
                    📍 {destination.latitude}, {destination.longitude}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${destination.latitude},${destination.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 transition"
                  >
                    <ExternalLink size={14} />
                    {isEn ? 'View on map' : 'Ver no mapa'}
                  </a>
                </div>
              )}
            </div>

            {/* Destinos Relacionados */}
            {relatedDestinations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
                  {isEn ? 'Related Destinations' : 'Destinos Relacionados'}
                </h3>
                <div className="space-y-3">
                  {relatedDestinations.map((related) => (
                    <Link
                      key={related.id}
                      to={`/destinos/${related.id}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        {related.image_url ? (
                          <img
                            src={related.image_url}
                            alt={related.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-blue-500 transition">
                          {related.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {related.province}
                        </p>
                      </div>
                      {related.rating > 0 && (
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          {typeof related.rating === 'number' ? related.rating.toFixed(1) : related.rating}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}