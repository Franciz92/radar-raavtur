import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  MapPin, Star, ArrowLeft, Languages, Clock, 
  Phone, Mail, Globe, Award, Users, Calendar,
  Loader2, Heart, Share2, CheckCircle, Building2
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function GuideDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const { isEn } = useLanguage()
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadGuide()
  }, [id])

  useEffect(() => {
    if (guide && isAuthenticated) {
      checkFavorite()
    }
  }, [guide, isAuthenticated])

  const loadGuide = async () => {
    setLoading(true)
    try {
      // Buscar guia da tabela guides
      const { data, error } = await supabase
        .from('guides')
        .select(`
          *,
          profile:user_id (
            id,
            name,
            email,
            avatar_url,
            phone,
            location
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .maybeSingle()

      if (error) {
        // Se a tabela guides não existir, buscar profile com role 'guide'
        console.log('Tabela guides não encontrada, buscando profile...')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('role', 'guide')
          .maybeSingle()

        if (profileError) throw profileError
        
        if (profile) {
          const mappedGuide = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || '+244 900 000 000',
            location: profile.location || 'Luanda',
            avatar_url: profile.avatar_url,
            rating: 4.7,
            reviews_count: 12,
            languages: ['Português', 'Inglês'],
            price: 15000,
            price_type: 'por dia',
            experience: '5+ anos',
            bio: profile.bio || 'Guia turístico profissional apaixonado por Angola',
            specialties: ['História', 'Cultura', 'Natureza'],
            availability: 'Disponível para agendamentos',
            status: 'active'
          }
          setGuide(mappedGuide)
        } else {
          toast.error(isEn ? 'Guide not found' : 'Guia não encontrado')
        }
        setLoading(false)
        return
      }

      if (error) throw error
      
      if (!data) {
        toast.error(isEn ? 'Guide not found' : 'Guia não encontrado')
      }
      setGuide(data)
    } catch (error) {
      console.error('Erro ao carregar guia:', error)
      toast.error(isEn ? 'Error loading guide' : 'Erro ao carregar guia')
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .eq('item_type', 'guide')
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

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'guide')

        if (error) throw error
        setIsFavorite(false)
        toast.success(isEn ? 'Removed from favorites' : 'Removido dos favoritos')
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            item_id: id,
            item_type: 'guide'
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
          title: guide.name,
          text: `Conheça o guia turístico ${guide.name} em Angola!`,
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

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'G'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Users size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
          {isEn ? 'Guide not found' : 'Guia não encontrado'}
        </h2>
        <Link 
          to="/guias" 
          className="text-primary-500 hover:text-primary-600 mt-2 inline-block"
        >
          {isEn ? 'Back to guides' : 'Voltar para guias'}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com Imagem de Capa */}
      <div className="relative h-64 bg-gradient-to-r from-primary-500 to-primary-600 overflow-hidden">
        {guide.cover_image ? (
          <img 
            src={guide.cover_image} 
            alt={guide.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users size={64} className="text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Botões de Ação */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={toggleFavorite}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
          >
            <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition shadow-lg"
          >
            <Share2 size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/guias" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={16} /> {isEn ? 'Back to guides' : 'Voltar para guias'}
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Avatar e Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center sticky top-24">
              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto -mt-20">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  {guide.avatar_url ? (
                    <img 
                      src={guide.avatar_url} 
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-500 dark:text-primary-400">
                        {getInitials(guide.name)}
                      </span>
                    </div>
                  )}
                </div>
                
                {guide.rating > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-1.5 shadow-lg">
                    <Star size={16} className="fill-white text-white" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
                {guide.name}
              </h1>
              
              {guide.location && (
                <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 text-sm">
                  <MapPin size={14} />
                  {guide.location}
                </p>
              )}

              {/* Avaliação */}
              {guide.rating > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {guide.rating.toFixed(1)}
                  </span>
                  {guide.reviews_count > 0 && (
                    <span className="text-sm text-gray-500">
                      ({guide.reviews_count} {isEn ? 'reviews' : 'avaliações'})
                    </span>
                  )}
                </div>
              )}

              {/* Preço */}
              {guide.price > 0 && (
                <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Price' : 'Preço'}
                  </p>
                  <p className="text-2xl font-bold text-primary-500 dark:text-primary-400">
                    Kz {guide.price.toLocaleString()}
                  </p>
                  {guide.price_type && (
                    <p className="text-xs text-gray-400">
                      / {guide.price_type}
                    </p>
                  )}
                </div>
              )}

              {/* Botão Contactar */}
              <Link
                to={`/contacto?guide=${guide.id}`}
                className="w-full mt-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition text-center block"
              >
                {isEn ? 'Contact Guide' : 'Contactar Guia'}
              </Link>

              {/* Informações de Contato */}
              {(guide.phone || guide.email) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isEn ? 'Contact Info' : 'Contacto'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {guide.phone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                        <Phone size={14} className="text-primary-500" />
                        <span>{guide.phone}</span>
                      </div>
                    )}
                    {guide.email && (
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                        <Mail size={14} className="text-primary-500" />
                        <span>{guide.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita - Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {isEn ? 'About' : 'Sobre'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {guide.bio || (isEn ? 'Experienced tour guide in Angola' : 'Guia turístico experiente em Angola')}
              </p>
            </div>

            {/* Especialidades */}
            {guide.specialties && guide.specialties.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {isEn ? 'Specialties' : 'Especialidades'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {guide.specialties.map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium"
                    >
                      <Award size={14} className="inline mr-1" />
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Idiomas */}
            {guide.languages && guide.languages.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Languages size={18} className="inline mr-2 text-primary-500" />
                  {isEn ? 'Languages' : 'Idiomas'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang) => (
                    <span 
                      key={lang}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experiência e Disponibilidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.experience && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isEn ? 'Experience' : 'Experiência'}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                    <Clock size={18} className="text-primary-500" />
                    {guide.experience}
                  </p>
                </div>
              )}

              {guide.availability && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isEn ? 'Availability' : 'Disponibilidade'}
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                    <Calendar size={18} className="text-primary-500" />
                    {guide.availability}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}