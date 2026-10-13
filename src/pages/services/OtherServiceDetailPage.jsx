// src/pages/services/OtherServiceDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, MapPin, Star, Phone, Mail, Globe, 
  Clock, DollarSign, Shield, Heart, Share2, 
  Building2, Calendar, Users, Award, Sparkles,
  Loader2, ChevronRight, CheckCircle, AlertCircle,
  Wifi, Coffee, Car, Utensils, Camera, ShoppingBag,
  Sun, Moon, Cloud, Info
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function OtherServiceDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [company, setCompany] = useState(null)

  useEffect(() => {
    loadService()
  }, [id])

  useEffect(() => {
    if (service && isAuthenticated) {
      checkFavorite()
    }
  }, [service, isAuthenticated])

  // ============================================
  // FUNÇO LOAD SERVICE - CORRIGIDA (SEM JOINS)
  // ============================================
  const loadService = async () => {
    setLoading(true)
    try {
      console.log('🔄 Carregando serviço:', id)
      
      // 1. Buscar o serviço
      const { data: serviceData, error: serviceError } = await supabase
        .from('other_services')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle()

      if (serviceError) {
        console.error('❌ Erro ao buscar serviço:', serviceError)
        throw serviceError
      }

      if (!serviceData) {
        console.warn('⚠️ Serviço não encontrado')
        setService(null)
        setLoading(false)
        return
      }

      console.log('✅ Serviço encontrado:', serviceData.name)
      setService(serviceData)

      // 2. Buscar a empresa separadamente
      if (serviceData.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name, logo, cover_image, rating, description, phone, email, website, address')
          .eq('id', serviceData.company_id)
          .maybeSingle()

        if (!companyError && companyData) {
          console.log('🏢 Empresa encontrada:', companyData.name)
          setCompany(companyData)
        } else {
          console.warn('⚠️ Empresa não encontrada para ID:', serviceData.company_id)
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar serviço:', error)
      toast.error(isEn ? 'Error loading service' : 'Erro ao carregar serviço')
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    if (!user?.id || !service?.id) return
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', service.id)
        .eq('item_type', 'other_service')
        .maybeSingle()

      if (error) throw error
      setIsFavorite(!!data)
    } catch (error) {
      console.error('Erro ao verificar favorito:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Login to favorite' : 'Faça login para favoritar')
      return
    }

    if (!service?.id) {
      toast.error(isEn ? 'Service not found' : 'Serviço não encontrado')
      return
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', service.id)
          .eq('item_type', 'other_service')
        
        if (error) throw error
        setIsFavorite(false)
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos')
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: service.id,
            item_type: 'other_service'
          }])
        
        if (error) throw error
        setIsFavorite(true)
        toast.success(isEn ? 'Added to favorites' : 'Adicionado aos favoritos')
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error)
      toast.error(isEn ? 'Error favoriting' : 'Erro ao favoritar')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: service?.name || 'Serviço',
          text: `Descubra o serviço ${service?.name || ''} em Angola!`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success(isEn ? 'Link copied!' : 'Link copiado!')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error)
      }
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'transporte': Car,
      'alimentacao': Utensils,
      'cultura': Camera,
      'saude': Shield,
      'compras': ShoppingBag,
      'lazer': Sparkles,
      'negocios': Building2,
      'educacao': Award,
      'turismo': Globe,
    }
    return icons[category] || Building2
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading service...' : 'Carregando serviço...'}
        </p>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
          {isEn ? 'Service not found' : 'Serviço não encontrado'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isEn ? 'The service you are looking for does not exist or has been removed.' : 'O serviço que você está procurando não existe ou foi removido.'}
        </p>
        <Link 
          to="/servicos" 
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mt-4 transition group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {isEn ? 'Back to services' : 'Voltar para serviços'}
        </Link>
      </div>
    )
  }

  const CategoryIcon = getCategoryIcon(service.category)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com Imagem */}
      <div className="relative h-[350px] md:h-[400px] bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {service.image_url ? (
          <img 
            src={service.image_url} 
            alt={service.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                  <span class="text-6xl">🏢</span>
                </div>
              `
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
            <CategoryIcon size={80} className="text-primary-400 dark:text-primary-600" />
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

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-5xl mx-auto">
            <Link 
              to="/servicos" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={16} /> {isEn ? 'Back to services' : 'Voltar para serviços'}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">{service.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {service.location && (
                <span className="flex items-center gap-1 text-white/80">
                  <MapPin size={16} /> {service.location}
                </span>
              )}
              {service.category && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {service.category}
                </span>
              )}
              {service.rating > 0 && (
                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  {service.rating.toFixed(1)}
                </span>
              )}
              {service.is_featured && (
                <span className="bg-amber-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Sparkles size={14} />
                  {isEn ? 'Featured' : 'Destaque'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Info size={20} className="text-primary-500" />
                {isEn ? 'Description' : 'Descrição'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {service.description || (isEn ? 'No description available' : 'Sem descrição disponível')}
              </p>
            </div>

            {/* Características */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary-500" />
                  {isEn ? 'Features' : 'Características'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Horário de Funcionamento */}
            {service.working_hours && typeof service.working_hours === 'object' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-primary-500" />
                  {isEn ? 'Working Hours' : 'Horário de Funcionamento'}
                </h2>
                <div className="space-y-2">
                  {Object.entries(service.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">{day}</span>
                      <span className="text-gray-900 dark:text-white">{hours || 'Fechado'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empresa */}
            {company && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-primary-500" />
                  {isEn ? 'Provided by' : 'Oferecido por'}
                </h2>
                <Link 
                  to={`/empresa/${company.id}`}
                  className="flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-xl transition"
                >
                  {company.logo && (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-16 h-16 rounded-xl object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {company.name}
                    </h3>
                    {company.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {company.description}
                      </p>
                    )}
                    {company.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {company.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Avaliações - Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Star size={20} className="text-primary-500" />
                {isEn ? 'Reviews' : 'Avaliações'}
              </h2>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Star size={32} className="mx-auto mb-2 opacity-30" />
                <p>{isEn ? 'No reviews yet' : 'Nenhuma avaliação ainda'}</p>
                <p className="text-sm">{isEn ? 'Be the first to review this service' : 'Seja o primeiro a avaliar este serviço'}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm"
                >
                  {isEn ? 'Write a Review' : 'Escrever Avaliação'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <Info size={18} className="text-primary-500" />
                {isEn ? 'Information' : 'Informações'}
              </h3>

              <div className="space-y-4">
                {service.price > 0 && (
                  <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      {isEn ? 'Price' : 'Preço'}
                    </label>
                    <p className="text-2xl font-bold text-primary-500">
                      {formatCurrency(service.price)}
                    </p>
                  </div>
                )}

                {service.location && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {isEn ? 'Location:' : 'Localização:'}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium block">
                        {service.location}
                      </span>
                    </div>
                  </div>
                )}

                {service.contact_phone && (
                  <div className="flex items-start gap-3 text-sm">
                    <Phone size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {isEn ? 'Phone:' : 'Telefone:'}
                      </span>
                      <a 
                        href={`tel:${service.contact_phone}`}
                        className="text-gray-900 dark:text-white font-medium block hover:text-primary-500 transition"
                      >
                        {service.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {service.contact_email && (
                  <div className="flex items-start gap-3 text-sm">
                    <Mail size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {isEn ? 'Email:' : 'Email:'}
                      </span>
                      <a 
                        href={`mailto:${service.contact_email}`}
                        className="text-gray-900 dark:text-white font-medium block hover:text-primary-500 transition"
                      >
                        {service.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {service.website && (
                  <div className="flex items-start gap-3 text-sm">
                    <Globe size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {isEn ? 'Website:' : 'Website:'}
                      </span>
                      <a 
                        href={service.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600 font-medium block truncate"
                      >
                        {service.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                {service.category && (
                  <div className="flex items-start gap-3 text-sm">
                    <CategoryIcon size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        {isEn ? 'Category:' : 'Categoria:'}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium block capitalize">
                        {service.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="w-full mt-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                {isEn ? 'Contact' : 'Contactar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}