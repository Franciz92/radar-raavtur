// src/pages/public/HotelsPage.jsx
// ============================================
// PÁGINA DE HOTÉIS — com botão de favorito funcional
// ✅ Botão fora do <Link> (evita conflito de cliques)
// ✅ Estado otimista (UI muda logo)
// ✅ Sync com a BD
// ============================================

import { useState, useEffect } from 'react';
import { usePublicBusiness } from '../../context/PublicBusinessContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Phone, Mail, Building2, Search, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HotelsPage() {
  const { hotels, loading, refreshCategory } = usePublicBusiness();
  const { isEn } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [pendingIds, setPendingIds] = useState(new Set());

  // ============================================
  // Carregar hotéis
  // ============================================
  useEffect(() => {
    console.log('🔄 [HotelsPage] Carregando hotéis...');
    refreshCategory('hotel');
  }, []);

  useEffect(() => {
    console.log('📊 [HotelsPage] Hotéis carregados:', hotels);
  }, [hotels]);

  // ============================================
  // ✅ Carregar favoritos do utilizador
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setFavorites(new Set());
      return;
    }

    const loadFavorites = async () => {
      setLoadingFavorites(true);
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('item_id, item_type')
          .eq('user_id', user.id);

        if (error) {
          // Se a tabela não existe, não falhar
          if (error.code === '42P01') {
            console.warn('⚠️ [HotelsPage] Tabela favorites não existe');
            setFavorites(new Set());
            return;
          }
          throw error;
        }

        const favSet = new Set(
          (data || [])
            .filter((f) => f.item_type === 'business' || f.item_type === 'hotel')
            .map((f) => f.item_id)
        );
        setFavorites(favSet);
        console.log('✅ [HotelsPage] Favoritos carregados:', favSet.size);
      } catch (error) {
        console.error('❌ [HotelsPage] Erro ao carregar favoritos:', error);
      } finally {
        setLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, user?.id]);

  // ============================================
  // ✅ Toggle favorito (com estado otimista)
  // ============================================
  const handleToggleFavorite = async (e, hotelId) => {
    // Prevenir navegação se estiver dentro de Link
    e.preventDefault();
    e.stopPropagation();

    console.log('❤️ [HotelsPage] Toggle favorito:', hotelId);

    // 1. Verificar login
    if (!isAuthenticated || !user?.id) {
      toast.error(isEn ? 'Please login to add favorites' : 'Faça login para adicionar favoritos');
      navigate('/login');
      return;
    }

    // 2. Evitar clicks duplos
    if (pendingIds.has(hotelId)) {
      console.log('⏳ [HotelsPage] Pedido já em curso, ignorado');
      return;
    }

    const isFav = favorites.has(hotelId);

    // 3. Estado otimista (UI muda ANTES da BD responder)
    setPendingIds((prev) => new Set(prev).add(hotelId));
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFav) {
        next.delete(hotelId);
      } else {
        next.add(hotelId);
      }
      return next;
    });

    try {
      if (isFav) {
        // REMOVER
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', hotelId);

        if (error) throw error;
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos');
      } else {
        // ADICIONAR
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              item_id: hotelId,
              item_type: 'business',
            },
          ]);

        if (error) {
          // Se já existe (race condition), ignorar
          if (error.code === '23505') {
            console.log('ℹ️ [HotelsPage] Já estava nos favoritos');
          } else {
            throw error;
          }
        }
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('❌ [HotelsPage] Erro ao favoritar:', error);

      // Reverter estado otimista em caso de erro
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(hotelId);
        } else {
          next.delete(hotelId);
        }
        return next;
      });

      // Mensagens específicas
      if (error.code === '42P01') {
        toast.error(isEn ? 'Favorites system not available' : 'Sistema de favoritos indisponível');
      } else if (error.code === '23503') {
        toast.error(isEn ? 'Business not found' : 'Empresa não encontrada');
      } else {
        toast.error(isEn ? 'Error updating favorite' : 'Erro ao atualizar favorito');
      }
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(hotelId);
        return next;
      });
    }
  };

  // ============================================
  // Filtros
  // ============================================
  const filteredHotels = hotels.filter((hotel) => {
    const matchSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProvince = !selectedProvince || hotel.province === selectedProvince;
    return matchSearch && matchProvince;
  });

  const provinces = [...new Set(hotels.map((h) => h.province).filter(Boolean))];

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary-500" />
          {isEn ? 'Hotels' : 'Hotéis'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEn
            ? `Discover the best hotels in Angola (${filteredHotels.length} available)`
            : `Descubra os melhores hotéis em Angola (${filteredHotels.length} disponíveis)`}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search hotels...' : 'Buscar hotéis...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-w-[180px]"
        >
          <option value="">{isEn ? 'All Provinces' : 'Todas Províncias'}</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filteredHotels.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'No hotels found' : 'Nenhum hotel encontrado'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn
              ? 'Try adjusting your search or filters'
              : 'Tente ajustar sua busca ou filtros'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => {
            const isFav = favorites.has(hotel.id);
            const isPending = pendingIds.has(hotel.id);

            return (
              // ✅ Wrapper fora do Link — para o botão funcionar
              <div
                key={hotel.id}
                className="relative group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                {/* Link cobre o card exceto o botão */}
                <Link
                  to={`/negocio/${hotel.id}`}
                  className="block"
                >
                  <div className="h-48 relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {hotel.cover_image ? (
                      <img
                        src={hotel.cover_image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                        <Building2 className="w-16 h-16 text-primary-500/40" />
                      </div>
                    )}

                    {hotel.is_verified && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        {isEn ? 'Verified' : 'Verificado'}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition pr-10">
                      {hotel.name}
                    </h3>
                    {hotel.province && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {hotel.province}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {hotel.description || (isEn ? 'No description' : 'Sem descrição')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {hotel.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {hotel.phone}
                        </span>
                      )}
                      {hotel.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {hotel.email}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* ✅ BOTO DE FAVORITO — FORA DO LINK */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, hotel.id)}
                  disabled={isPending}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 z-10 ${
                    isFav
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-900'
                  } ${isPending ? 'opacity-60 cursor-wait' : 'hover:scale-110 active:scale-95'}`}
                >
                  <Heart
                    size={18}
                    className={`transition-all ${isFav ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}