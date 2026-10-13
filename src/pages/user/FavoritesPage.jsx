// src/pages/user/FavoritesPage.jsx
// ============================================
// PÁGINA DE FAVORITOS
// ✅ Links corrigidos para /negocio/:id
// ✅ Fallback para itens removidos
// ✅ Traduções PT/EN
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getUserFavorites, removeFavorite } from '../../services/favoriteService'
import { Heart, Trash2, MapPin, Star, AlertCircle, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

const EmptyState = ({ title, description, icon: Icon = Heart, ctaLink = '/destinos', ctaLabel = 'Explorar' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={64} className="mb-4 text-gray-300 dark:text-gray-600" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">{description}</p>
      <Link to={ctaLink}>
        <Button>{ctaLabel}</Button>
      </Link>
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  // ============================================
  // Carregar favoritos
  // ============================================
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites()
    }
  }, [isAuthenticated, user])

  const loadFavorites = async () => {
    setLoading(true)
    try {
      const { data } = await getUserFavorites(user.id)
      setFavorites(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error)
      toast.error(isEn ? 'Error loading favorites' : 'Erro ao carregar favoritos')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Remover favorito (com estado otimista)
  // ============================================
  const handleRemoveFavorite = async (itemId, itemType) => {
    const key = `${itemType}-${itemId}`
    setRemovingId(key)

    // Estado otimista — remover logo da UI
    const previousFavorites = [...favorites]
    setFavorites((prev) =>
      prev.filter((f) => !(f.item_id === itemId && f.item_type === itemType))
    )

    try {
      await removeFavorite(user.id, itemId, itemType)
      toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos')
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error)
      // Reverter em caso de erro
      setFavorites(previousFavorites)
      toast.error(isEn ? 'Error removing favorite' : 'Erro ao remover favorito')
    } finally {
      setRemovingId(null)
    }
  }

  // ============================================
  // ✅ RESOLVER LINK — CORRIGIDO
  // Todos os business types vão para /negocio/:id
  // ============================================
  const getItemLink = (favorite) => {
    const type = (favorite.item_type || '').toLowerCase()

    // ✅ Todas as empresas / serviços → /negocio/:id
    if (
      type === 'business' ||
      type === 'hotel' ||
      type === 'restaurant' ||
      type === 'agency' ||
      type === 'guide' ||
      type === 'experience' ||
      type === 'event' ||
      type === 'shop' ||
      type === 'other'
    ) {
      return `/negocio/${favorite.item_id}`
    }

    // ✅ Destinos → /destinos/:id
    if (type === 'destination') {
      return `/destinos/${favorite.item_id}`
    }

    // ✅ Experiências do utilizador → /experiencia/:id
    if (type === 'user_experience') {
      return `/experiencia/${favorite.item_id}`
    }

    // Fallback
    return `/negocio/${favorite.item_id}`
  }

  // ============================================
  // Labels por tipo
  // ============================================
  const getTypeLabel = (type) => {
    const t = (type || '').toLowerCase()
    const labels = {
      business: isEn ? 'Business' : 'Empresa',
      destination: isEn ? 'Destination' : 'Destino',
      hotel: isEn ? 'Hotel' : 'Hotel',
      restaurant: isEn ? 'Restaurant' : 'Restaurante',
      agency: isEn ? 'Agency' : 'Agência',
      guide: isEn ? 'Guide' : 'Guia',
      experience: isEn ? 'Experience' : 'Experiência',
      event: isEn ? 'Event' : 'Evento',
      shop: isEn ? 'Shop' : 'Loja',
      user_experience: isEn ? 'Post' : 'Publicação',
      other: isEn ? 'Service' : 'Serviço',
    }
    return labels[t] || t
  }

  // ============================================
  // Não autenticado
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="max-w-md mx-auto">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {isEn ? 'Login to see your favorites' : 'Faça login para ver seus favoritos'}
          </h2>
          <p className="text-gray-500 mb-6">
            {isEn
              ? 'Save your favorite destinations and services.'
              : 'Salve seus destinos e serviços favoritos.'}
          </p>
          <Link to="/login">
            <Button>{isEn ? 'Login' : 'Entrar'}</Button>
          </Link>
        </div>
      </div>
    )
  }

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="skeleton h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="container-custom py-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'My Favorites' : 'Meus Favoritos'}
          </h1>
          <p className="text-sm text-gray-500">
            {favorites.length} {isEn ? 'items saved' : 'itens salvos'}
          </p>
        </div>
      </div>

      {/* Lista */}
      {favorites.length === 0 ? (
        <EmptyState
          title={isEn ? 'No favorites yet' : 'Nenhum favorito'}
          description={
            isEn
              ? 'Start exploring destinations and save your favorites!'
              : 'Comece a explorar destinos e salve seus favoritos!'
          }
          ctaLink="/destinos"
          ctaLabel={isEn ? 'Explore Destinations' : 'Explorar Destinos'}
        />
      ) : (
        <div className="grid gap-4">
          {favorites.map((favorite) => {
            const key = `${favorite.item_type}-${favorite.item_id}`
            const link = getItemLink(favorite)
            const isRemoving = removingId === key
            const itemExists = favorite.item_exists !== false

            return (
              <div
                key={key}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-wrap items-center gap-4 ${
                  isRemoving ? 'opacity-50' : ''
                } ${!itemExists ? 'border border-red-200 dark:border-red-800/30' : ''}`}
              >
                {/* Imagem */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {favorite.item_image ? (
                    <img
                      src={favorite.item_image}
                      alt={favorite.item_name || 'Favorite'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling && (e.target.nextSibling.style.display = 'flex')
                      }}
                    />
                  ) : null}

                  {!favorite.item_image && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {itemExists ? (
                        <Building2 size={24} />
                      ) : (
                        <AlertCircle size={24} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  {itemExists ? (
                    <Link to={link} className="inline-block">
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition">
                        {favorite.item_name || (isEn ? 'Untitled' : 'Sem nome')}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="font-semibold text-gray-500 dark:text-gray-400">
                      {isEn ? 'Item no longer available' : 'Item já não está disponível'}
                    </h3>
                  )}

                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                    {/* Badge de tipo */}
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                      {getTypeLabel(favorite.item_type)}
                    </span>

                    {/* Província */}
                    {favorite.item_province && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {favorite.item_province}
                      </span>
                    )}

                    {/* Rating */}
                    {favorite.item_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        {favorite.item_rating}
                      </span>
                    )}

                    {/* Data */}
                    <span className="text-xs text-gray-400">
                      {new Date(favorite.created_at).toLocaleDateString(
                        isEn ? 'en-US' : 'pt-PT'
                      )}
                    </span>
                  </div>

                  {!itemExists && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      {isEn
                        ? 'This business was removed or is no longer active.'
                        : 'Esta empresa foi removida ou já não está ativa.'}
                    </p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {itemExists && (
                    <Link to={link}>
                      <Button variant="secondary">
                        {isEn ? 'View' : 'Ver'}
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    icon={Trash2}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleRemoveFavorite(favorite.item_id, favorite.item_type)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}