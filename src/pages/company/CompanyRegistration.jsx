// src/pages/public/RestaurantsPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Loader2,
  Filter,
  ChevronDown,
  Globe,
  Utensils,
  ChevronRight,
  Heart,
  AlertCircle,
  RefreshCw,
  Grid3x3,
  List,
  Clock,
  Phone,
  Mail,
  Building2,
  DollarSign,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE CARD DE RESTAURANTE
// ============================================

const RestaurantCard = ({ restaurant, isEn, isFavorite, onToggleFavorite }) => {
  const getPlaceholderImage = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&size=400&background=4F46E5&color=fff&font-size=0.4`;
  };

  // Verificar se a empresa está pendente
  const isPending = restaurant.status === 'pending';

  return (
    <Link 
      to={`/restaurante/${restaurant.id}`} 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
        {restaurant.cover_image ? (
          <img 
            src={restaurant.cover_image} 
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = getPlaceholderImage();
            }}
          />
        ) : (
          <img 
            src={getPlaceholderImage()}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Badge da categoria */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
          <Utensils size={12} />
          {restaurant.category || 'Restaurante'}
        </span>

        {/* Badge de status pendente */}
        {isPending && (
          <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/80 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
            ⏳ {isEn ? 'Pending' : 'Pendente'}
          </span>
        )}

        {/* Botão Favorito */}
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

        {/* Rating */}
        {restaurant.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            {typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : restaurant.rating}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-blue-500 transition line-clamp-1">
          {restaurant.name}
        </h3>
        
        {restaurant.address && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <MapPin size={14} />
            {typeof restaurant.address === 'string' 
              ? restaurant.address 
              : `${restaurant.address?.city || ''}, ${restaurant.address?.province || ''}`}
          </div>
        )}

        {restaurant.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 flex-1">
            {restaurant.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
          {restaurant.working_hours && (
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <Clock size={12} />
              {isEn ? 'Open' : 'Aberto'}
            </span>
          )}
          {restaurant.phone && (
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <Phone size={12} />
              {restaurant.phone}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 transition">
            {isEn ? 'View Menu' : 'Ver Menu'}
            <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
          </span>
          {isPending && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              {isEn ? 'Awaiting approval' : 'Aguardando aprovação'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function RestaurantsPage() {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [showPending, setShowPending] = useState(false);

  // ============================================
  // CARREGAR RESTAURANTES
  // ============================================
  const loadRestaurants = useCallback(async () => {
    console.log('🔄 [RestaurantsPage] Carregando restaurantes...');
    setLoading(true);
    setError(null);
    
    try {
      // Buscar empresas com categoria 'restaurant'
      let query = supabase
        .from('companies')
        .select('*')
        .eq('category', 'restaurant');
      
      // Se o usuário for dono de uma empresa, mostrar também as pendentes
      // Se não, mostrar apenas aprovadas/ativas
      if (!isAuthenticated || !user) {
        query = query.in('status', ['approved', 'active']);
      } else {
        // Buscar empresas do usuário para ver qual é o dono
        const { data: userCompanies } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id);
        
        const userCompanyIds = userCompanies?.map(c => c.id) || [];
        
        // Mostrar todas as empresas aprovadas + as pendentes do usuário
        query = query.or(`status.in.(approved,active),and(user_id.eq.${user.id},status.eq.pending)`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [RestaurantsPage] Erro ao buscar restaurantes:', error);
        throw error;
      }
      
      console.log('✅ [RestaurantsPage] Restaurantes carregados:', data?.length || 0);
      
      // Filtrar pendentes se o usuário não quiser ver
      let filteredData = data || [];
      if (!showPending && isAuthenticated && user) {
        filteredData = filteredData.filter(r => 
          r.status === 'approved' || r.status === 'active' || r.user_id !== user.id
        );
      }
      
      setRestaurants(filteredData);

      // Extrair cidades únicas
      const uniqueCities = [...new Set(filteredData.map(r => r.address?.city).filter(Boolean))];
      setCities(uniqueCities);

    } catch (error) {
      console.error('❌ [RestaurantsPage] Erro ao carregar restaurantes:', error);
      setError(error.message || 'Erro ao carregar restaurantes');
      toast.error(isEn ? 'Error loading restaurants' : 'Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
    }
  }, [isEn, isAuthenticated, user, showPending]);

  // ============================================
  // CARREGAR FAVORITOS
  // ============================================
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setFavorites([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'restaurant');

      if (error) throw error;
      
      const favoriteIds = data?.map(f => f.item_id) || [];
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
    }
  }, [isAuthenticated, user]);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, loadFavorites]);

  // ============================================
  // TOGGLE FAVORITE
  // ============================================
  const toggleFavorite = async (restaurantId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to add favorites' : 'Faça login para adicionar favoritos');
      return;
    }

    const isFavorite = favorites.includes(restaurantId);
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', restaurantId)
          .eq('item_type', 'restaurant');
        
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== restaurantId));
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: restaurantId,
            item_type: 'restaurant',
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        setFavorites(prev => [...prev, restaurantId]);
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('❌ Erro ao favoritar:', error);
      toast.error(isEn ? 'Error updating favorite' : 'Erro ao favoritar');
    }
  };

  // ============================================
  // FILTROS
  // ============================================
  const filteredRestaurants = restaurants.filter(rest => {
    const matchesSearch = rest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rest.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rest.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === 'all' || rest.address?.city === selectedCity;
    
    return matchesSearch && matchesCity;
  });

  // ============================================
  // REFRESH
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    if (isAuthenticated) {
      await loadFavorites();
    }
    setRefreshing(false);
    toast.success(isEn ? 'Updated!' : 'Atualizado!');
  };

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading restaurants...' : 'Carregando restaurantes...'}
        </p>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR
  // ============================================
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Error loading restaurants' : 'Erro ao carregar restaurantes'}
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
  // RENDER: SEM RESTAURANTES
  // ============================================
  if (restaurants.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <Utensils size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {isEn ? 'No restaurants found' : 'Nenhum restaurante encontrado'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isEn 
              ? 'Register your restaurant and start receiving orders!' 
              : 'Registe o seu restaurante e comece a receber pedidos!'}
          </p>
          {isAuthenticated && (
            <Link
              to="/cadastrar-empresa"
              className="mt-4 inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
            >
              {isEn ? 'Register Your Restaurant' : 'Registar seu Restaurante'}
            </Link>
          )}
          <button
            onClick={handleRefresh}
            className="mt-4 ml-3 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                <Utensils size={32} />
                {isEn ? 'Restaurants' : 'Restaurantes'}
              </h1>
              <p className="text-white/80 text-lg">
                {isEn ? 'Discover the best restaurants in Angola' : 'Descubra os melhores restaurantes em Angola'}
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
              {restaurants.length} {isEn ? 'restaurants' : 'restaurantes'}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              {cities.length} {isEn ? 'cities' : 'cidades'}
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
                placeholder={isEn ? 'Search restaurants...' : 'Pesquisar restaurantes...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Filtro por Cidade */}
            {cities.length > 0 && (
              <div className="relative min-w-[180px]">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">{isEn ? 'All Cities' : 'Todas as Cidades'}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}

            {/* Visualização */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Estatísticas */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                {filteredRestaurants.length} {isEn ? 'results' : 'resultados'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Restaurantes */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <Utensils size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              {isEn ? 'No restaurants found' : 'Nenhum restaurante encontrado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isEn ? 'Try adjusting your search or filters' : 'Tente ajustar sua busca ou filtros'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                isEn={isEn}
                isFavorite={favorites.includes(restaurant.id)}
                onToggleFavorite={(e) => toggleFavorite(restaurant.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}