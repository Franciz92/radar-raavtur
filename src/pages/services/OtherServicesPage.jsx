import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Filter, Grid, List, MapPin, Star, Heart, 
  Building2, Wifi, Coffee, Car, Utensils, Camera, 
  Shield, Clock, DollarSign, ChevronRight, 
  Loader2, Sparkles, TrendingUp, Award, ShoppingBag,
  Globe, PenTool, Users, Image as ImageIcon
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

// ============================================
// SERVIÇOS DISPONÍVEIS
// ============================================
const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Grid },
  { id: 'transporte', label: 'Transporte', icon: Car },
  { id: 'alimentacao', label: 'Alimentação', icon: Utensils },
  { id: 'cultura', label: 'Cultura', icon: Camera },
  { id: 'saude', label: 'Saúde', icon: Shield },
  { id: 'compras', label: 'Compras', icon: ShoppingBag },
  { id: 'lazer', label: 'Lazer', icon: Sparkles },
  { id: 'negocios', label: 'Negócios', icon: Building2 },
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function OtherServicesPage() {
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [favorites, setFavorites] = useState([])
  const [sortBy, setSortBy] = useState('rating')

  // Carregar serviços
  useEffect(() => {
    loadServices()
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated])

  const loadServices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('other_services')
        .select(`
          *,
          company:company_id (
            id,
            name,
            logo,
            rating
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (error) throw error
      console.log('Serviços carregados:', data)
      setServices(data || [])
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      toast.error(isEn ? 'Error loading services' : 'Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('item_type', 'other_service')

      if (error) throw error
      setFavorites(data?.map(f => f.item_id) || [])
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  // Toggle favorito
  const toggleFavorite = async (serviceId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error(isEn ? 'Login to favorite' : 'Faça login para favoritar')
      return
    }

    const isFavorite = favorites.includes(serviceId)
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', serviceId)
          .eq('item_type', 'other_service')
        
        if (error) throw error
        setFavorites(prev => prev.filter(id => id !== serviceId))
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos')
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: serviceId,
            item_type: 'other_service'
          }])
        
        if (error) throw error
        setFavorites(prev => [...prev, serviceId])
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos')
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      toast.error(isEn ? 'Error favoriting' : 'Erro ao favoritar')
    }
  }

  // Filtrar serviços
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Ordenar serviços
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'price') return (a.price || 0) - (b.price || 0)
    return a.name?.localeCompare(b.name) || 0
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isEn ? 'Other Services' : 'Outros Serviços'}
          </h1>
          <p className="text-white/80 text-lg">
            {isEn ? 'Find the best services for your trip in Angola' : 'Encontre os melhores serviços para sua viagem em Angola'}
          </p>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={isEn ? 'Search services, location...' : 'Buscar serviços, localização...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="rating">{isEn ? 'Top Rated' : 'Mais Avaliados'}</option>
              <option value="price">{isEn ? 'Lowest Price' : 'Menor Preço'}</option>
              <option value="name">{isEn ? 'Name A-Z' : 'Nome A-Z'}</option>
            </select>

            {/* View mode */}
            <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <cat.icon size={14} />
                {isEn ? cat.label : cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {services.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Building2 size={16} />
              {services.length} {isEn ? 'services found' : 'serviços encontrados'}
            </span>
            {filteredServices.length !== services.length && (
              <span className="flex items-center gap-1">
                <Filter size={16} />
                {filteredServices.length} {isEn ? 'filtered' : 'filtrados'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Lista de serviços */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {sortedServices.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              {isEn ? 'No services found' : 'Nenhum serviço encontrado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isEn ? 'Try adjusting your search or filters' : 'Tente ajustar os filtros ou buscar por outro termo'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isFavorite={favorites.includes(service.id)}
                onToggleFavorite={(e) => toggleFavorite(service.id, e)}
                isEn={isEn}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedServices.map(service => (
              <ServiceListItem
                key={service.id}
                service={service}
                isFavorite={favorites.includes(service.id)}
                onToggleFavorite={(e) => toggleFavorite(service.id, e)}
                isEn={isEn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SERVICE CARD (GRID)
// ============================================
function ServiceCard({ service, isFavorite, onToggleFavorite, isEn }) {
  const categoryLabel = SERVICE_CATEGORIES.find(c => c.id === service.category)?.label || service.category

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <Link to={`/servicos/${service.id}`} className="block">
        {/* Imagem */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
              <Building2 size={48} className="text-primary-400 dark:text-primary-600" />
            </div>
          )}
          
          {/* Badge de categoria */}
          <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {isEn ? categoryLabel : categoryLabel}
          </span>

          {/* Botão favorito */}
          <button
            onClick={onToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg z-10"
          >
            <Heart
              size={18}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}
            />
          </button>

          {/* Preço */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
            {service.price ? `Kz ${service.price.toLocaleString()}` : (isEn ? 'On request' : 'Sob consulta')}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-primary-500 transition">
            {service.name}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {service.description || (isEn ? 'No description available' : 'Sem descrição disponível')}
          </p>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{service.location || (isEn ? 'Location not defined' : 'Localização não definida')}</span>
            </div>
            {service.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{service.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {service.company?.logo && (
                <img
                  src={service.company.logo}
                  alt={service.company.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {service.company?.name || (isEn ? 'Company' : 'Empresa')}
              </span>
            </div>
            <span className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              {isEn ? 'View More' : 'Ver mais'}
              <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ============================================
// SERVICE LIST ITEM
// ============================================
function ServiceListItem({ service, isFavorite, onToggleFavorite, isEn }) {
  const categoryLabel = SERVICE_CATEGORIES.find(c => c.id === service.category)?.label || service.category

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 p-4">
      <Link to={`/servicos/${service.id}`} className="block">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Imagem */}
          <div className="relative w-full md:w-48 h-32 md:h-auto bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 size={32} className="text-gray-400" />
              </div>
            )}
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
              {isEn ? categoryLabel : categoryLabel}
            </span>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {service.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {service.description || (isEn ? 'No description available' : 'Sem descrição disponível')}
                </p>
              </div>
              <button
                onClick={onToggleFavorite}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition flex-shrink-0"
              >
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{service.location || (isEn ? 'Location not defined' : 'Localização não definida')}</span>
              </div>
              {service.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span>{service.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                <DollarSign size={14} />
                <span>{service.price ? `Kz ${service.price.toLocaleString()}` : (isEn ? 'On request' : 'Sob consulta')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {service.company?.logo && (
                  <img
                    src={service.company.logo}
                    alt={service.company.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {service.company?.name || (isEn ? 'Company' : 'Empresa')}
                </span>
              </div>
              <span className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
                {isEn ? 'View More' : 'Ver mais'}
                <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}