// src/pages/public/DestinationsPage.jsx
// ============================================
// DESTINOS - COM FILTROS VIA URL (integração homepage)
// ============================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Star, Search, Loader2, MapPin, Filter, ChevronDown, 
  Globe, Compass, ChevronRight, Heart, AlertCircle,
  RefreshCw, Grid3x3, List, X, Calendar
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE CARD DE DESTINO
// ============================================
const DestinationCard = ({ destination, isEn, isFavorite, onToggleFavorite }) => {
  const getPlaceholderImage = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(destination.name)}&size=400&background=4F46E5&color=fff&font-size=0.4`;
  };

  return (
    <Link 
      to={`/destinos/${destination.id}`} 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
        {destination.image_url ? (
          <img 
            src={destination.image_url} 
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = getPlaceholderImage();
            }}
          />
        ) : (
          <img 
            src={getPlaceholderImage()}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        )}
        
        <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
          {destination.province || 'Angola'}
        </span>

        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg z-10"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300 group-hover:text-red-500 transition'}
          />
        </button>

        {destination.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {typeof destination.rating === 'number' ? destination.rating.toFixed(1) : destination.rating}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-primary-500 transition line-clamp-1">
          {destination.name}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 flex-1">
          {destination.description || (isEn ? 'Discover this amazing destination in Angola' : 'Descubra este incrível destino em Angola')}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
          {destination.attractions && (
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <MapPin size={12} />
              {destination.attractions} {isEn ? 'attractions' : 'atrações'}
            </span>
          )}
          {destination.best_time && (
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              📅 {destination.best_time}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1 transition">
            {isEn ? 'Explore' : 'Explorar'}
            <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
          </span>
          {destination.latitude && destination.longitude && (
            <span className="text-xs text-green-500 dark:text-green-400 flex items-center gap-1">
              <Globe size={12} />
              {isEn ? 'Map' : 'Mapa'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ============================================
// CHIP DE FILTRO ATIVO
// ============================================
const FilterChip = ({ label, icon: Icon, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
    {Icon && <Icon size={12} />}
    <span className="max-w-[200px] truncate">{label}</span>
    <button
      onClick={onRemove}
      className="ml-0.5 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition"
      aria-label="Remover filtro"
    >
      <X size={12} />
    </button>
  </span>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DestinationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ============================================
  // LER FILTROS DA URL
  // ============================================
  const urlQ = searchParams.get('q') || '';
  const urlProvince = searchParams.get('province') || 'all';
  const urlDate = searchParams.get('date') || '';

  // Estados
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);
  const [selectedProvince, setSelectedProvince] = useState(urlProvince);
  const [selectedDate, setSelectedDate] = useState(urlDate);
  const [provinces, setProvinces] = useState([]);
  const [mapDestinations, setMapDestinations] = useState([]);
  const [showMap, setShowMap] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const isFirstRender = useRef(true);

  // ============================================
  // DEBOUNCE DA BUSCA
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================
  // SINCRONIZAR ESTADO → URL
  // ============================================
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    if (selectedProvince && selectedProvince !== 'all') params.set('province', selectedProvince);
    if (selectedDate) params.set('date', selectedDate);

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedProvince, selectedDate, setSearchParams]);

  // ============================================
  // SINCRONIZAR URL → ESTADO (quando muda externamente)
  // ============================================
  useEffect(() => {
    if (urlQ !== searchTerm && !debouncedSearch) {
      setSearchTerm(urlQ);
      setDebouncedSearch(urlQ);
    }
    if (urlProvince !== selectedProvince) {
      setSelectedProvince(urlProvince);
    }
    if (urlDate !== selectedDate) {
      setSelectedDate(urlDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ, urlProvince, urlDate]);

  // ============================================
  // FUNÇO: Carregar Destinos
  // ============================================
  const loadDestinations = useCallback(async () => {
    console.log('🔄 [DestinationsPage] Carregando destinos...');
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DestinationsPage] Erro ao buscar destinos:', error);
        throw error;
      }
      
      console.log('✅ [DestinationsPage] Destinos carregados:', data?.length || 0);
      setDestinations(data || []);

      const withCoords = data?.filter(d => d.latitude && d.longitude) || [];
      setMapDestinations(withCoords);

      const uniqueProvinces = [...new Set(data?.map(d => d.province).filter(Boolean))].sort();
      setProvinces(uniqueProvinces);

    } catch (error) {
      console.error('❌ [DestinationsPage] Erro ao carregar destinos:', error);
      setError(error.message || 'Erro ao carregar destinos');
      toast.error(isEn ? 'Error loading destinations' : 'Erro ao carregar destinos');
    } finally {
      setLoading(false);
    }
  }, [isEn]);

  // ============================================
  // FUNÇO: Carregar Favoritos
  // ============================================
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      return;
    }
    
    setIsFavoritesLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'destination');

      if (error) throw error;
      
      const favoriteIds = data?.map(f => f.item_id) || [];
      setFavorites(favoriteIds);
      
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, [isAuthenticated, user]);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, loadFavorites]);

  // ============================================
  // FUNÇO: Toggle Favorite
  // ============================================
  const toggleFavorite = async (destinationId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to add favorites' : 'Faça login para adicionar favoritos');
      return;
    }

    if (!user) {
      toast.error(isEn ? 'User not found' : 'Usuário não encontrado');
      return;
    }

    const isFavorite = favorites.includes(destinationId);
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', destinationId)
          .eq('item_type', 'destination');
        
        if (error) throw error;
        
        setFavorites(prev => prev.filter(id => id !== destinationId));
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos');
        
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: destinationId,
            item_type: 'destination',
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        
        setFavorites(prev => [...prev, destinationId]);
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('❌ Erro ao favoritar:', error);
      toast.error(isEn ? 'Error updating favorite' : 'Erro ao favoritar');
    }
  };

  // ============================================
  // FUNÇO: Refresh
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDestinations();
    if (isAuthenticated) {
      await loadFavorites();
    }
    setRefreshing(false);
    toast.success(isEn ? 'Updated!' : 'Atualizado!');
  };

  // ============================================
  // FUNÇO: Limpar Filtros
  // ============================================
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedProvince('all');
    setSelectedDate('');
    setSearchParams({}, { replace: true });
  };

  const removeFilter = (key) => {
    if (key === 'q') {
      setSearchTerm('');
      setDebouncedSearch('');
    } else if (key === 'province') {
      setSelectedProvince('all');
    } else if (key === 'date') {
      setSelectedDate('');
    }
  };

  // ============================================
  // FILTROS (com data opcional)
  // ============================================
  const filteredDestinations = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();
    const month = selectedDate ? new Date(selectedDate + 'T00:00:00').getMonth() : null;

    return destinations.filter(dest => {
      // Busca por texto
      const matchesSearch = !search ||
        dest.name?.toLowerCase().includes(search) ||
        dest.description?.toLowerCase().includes(search) ||
        dest.province?.toLowerCase().includes(search);

      // Filtro por província
      const matchesProvince = selectedProvince === 'all' || dest.province === selectedProvince;

      // Filtro por data (best_time) - se destino tem best_months (array) ou best_time (texto)
      let matchesDate = true;
      if (selectedDate) {
        // Se o destino tem best_months como array de números [0-11]
        if (Array.isArray(dest.best_months) && dest.best_months.length > 0) {
          matchesDate = dest.best_months.includes(month);
        } 
        // Se tem best_time como string, faz match parcial com o nome do mês
        else if (typeof dest.best_time === 'string' && dest.best_time) {
          const monthNames = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
          ];
          const monthNamesEn = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
          ];
          const bt = dest.best_time.toLowerCase();
          matchesDate = bt.includes(monthNames[month]) || bt.includes(monthNamesEn[month]);
        }
        // Sem informação de best_time: não excluir (mantém resultado)
      }

      return matchesSearch && matchesProvince && matchesDate;
    });
  }, [destinations, debouncedSearch, selectedProvince, selectedDate]);

  // ============================================
  // CONTAR FILTROS ATIVOS
  // ============================================
  const activeFiltersCount = 
    (debouncedSearch.trim() ? 1 : 0) + 
    (selectedProvince !== 'all' ? 1 : 0) + 
    (selectedDate ? 1 : 0);

  // ============================================
  // GERAR URL DO MAPA
  // ============================================
  const getMapUrl = () => {
    if (mapDestinations.length === 0) return null;
    
    const lats = mapDestinations.map(d => parseFloat(d.latitude)).filter(v => !isNaN(v));
    const lngs = mapDestinations.map(d => parseFloat(d.longitude)).filter(v => !isNaN(v));
    
    if (lats.length === 0 || lngs.length === 0) return null;
    
    const minLat = Math.min(...lats) - 1.5;
    const maxLat = Math.max(...lats) + 1.5;
    const minLng = Math.min(...lngs) - 1.5;
    const maxLng = Math.max(...lngs) + 1.5;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
  };

  // ============================================
  // RENDERIZAÇO - LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading destinations...' : 'Carregando destinos...'}
        </p>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇO - ERROR
  // ============================================
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Error loading destinations' : 'Erro ao carregar destinos'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Try again' : 'Tentar novamente'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇO - SEM DESTINOS
  // ============================================
  if (destinations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <Compass size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {isEn ? 'No destinations found' : 'Nenhum destino encontrado'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isEn 
              ? 'Add destinations to the database to get started' 
              : 'Adicione destinos ao banco de dados para começar'}
          </p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇO PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                <Compass size={32} />
                {isEn ? 'Destinations' : 'Destinos'}
              </h1>
              <p className="text-white/80 text-lg">
                {isEn ? 'Discover the wonders of Angola' : 'Descubra as maravilhas de Angola'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-2 md:mt-0 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {isEn ? 'Refresh' : 'Atualizar'}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {destinations.length} {isEn ? 'destinations' : 'destinos'}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {provinces.length} {isEn ? 'provinces' : 'províncias'}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {mapDestinations.length} {isEn ? 'with map' : 'com mapa'}
            </span>
            {isAuthenticated && (
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                ❤️ {favorites.length} {isEn ? 'favorites' : 'favoritos'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={isEn ? 'Search destinations...' : 'Pesquisar destinos...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchTerm && (
                <button
                  onClick={() => removeFilter('q')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtro por Província */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">{isEn ? 'All Provinces' : 'Todas as Províncias'}</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro por Data */}
            <div className="relative min-w-[180px]">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                placeholder={isEn ? 'Date' : 'Data'}
              />
              {selectedDate && (
                <button
                  onClick={() => removeFilter('date')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                  aria-label="Limpar data"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Visualização */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="Grid view"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                {filteredDestinations.length} {isEn ? 'results' : 'resultados'}
              </span>
            </div>
          </div>

          {/* Chips de filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {isEn ? 'Active filters:' : 'Filtros ativos:'}
              </span>
              
              {debouncedSearch.trim() && (
                <FilterChip
                  label={`"${debouncedSearch.trim()}"`}
                  icon={Search}
                  onRemove={() => removeFilter('q')}
                />
              )}
              
              {selectedProvince !== 'all' && (
                <FilterChip
                  label={selectedProvince}
                  icon={MapPin}
                  onRemove={() => removeFilter('province')}
                />
              )}
              
              {selectedDate && (
                <FilterChip
                  label={new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                    isEn ? 'en-US' : 'pt-PT',
                    { day: '2-digit', month: 'short', year: 'numeric' }
                  )}
                  icon={Calendar}
                  onRemove={() => removeFilter('date')}
                />
              )}

              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition"
              >
                {isEn ? 'Clear all' : 'Limpar tudo'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mapa Interativo */}
      {mapDestinations.length > 0 && showMap && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                {isEn ? 'Destinations Map' : 'Mapa de Destinos'}
                <span className="text-xs font-normal text-gray-400">
                  ({mapDestinations.length} {isEn ? 'locations' : 'localizações'})
                </span>
              </h2>
              <button
                onClick={() => setShowMap(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              >
                {isEn ? 'Hide map' : 'Ocultar mapa'}
              </button>
            </div>
            <div className="relative" style={{ height: '400px' }}>
              {getMapUrl() ? (
                <iframe
                  src={getMapUrl()}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de Destinos em Angola"
                  className="bg-gray-100 dark:bg-gray-700"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <MapPin size={48} className="opacity-30" />
                  <span className="ml-2">{isEn ? 'Map unavailable' : 'Mapa indisponível'}</span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300 shadow-lg">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-blue-500" />
                  {mapDestinations.length} {isEn ? 'destinations' : 'destinos'} em Angola
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Destinos */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              {isEn ? 'No destinations found' : 'Nenhum destino encontrado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isEn ? 'Try adjusting your search or filters' : 'Tente ajustar sua busca ou filtros'}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
              >
                <X size={16} />
                {isEn ? 'Clear filters' : 'Limpar filtros'}
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredDestinations.map((dest) => (
              <DestinationCard 
                key={dest.id} 
                destination={dest} 
                isEn={isEn}
                isFavorite={favorites.includes(dest.id)}
                onToggleFavorite={(e) => toggleFavorite(dest.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}