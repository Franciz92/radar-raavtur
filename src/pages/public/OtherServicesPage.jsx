// src/pages/public/OtherServicesPage.jsx
// ============================================
// PAGINA DE OUTROS SERVICOS
// - Lista empresas com category = 'other'
// - Filtra por subcategory (via URL)
// ============================================

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { 
  Loader2, Truck, Utensils, Palette, Heart, ShoppingBag, Gamepad2, Briefcase,
  MapPin, Star, Building2, Search, ArrowLeft, Grid3x3
} from 'lucide-react'

// ============================================
// SUBCATEGORIAS
// ============================================
const SUBCATEGORIES = {
  pt: [
    { value: 'transport', label: 'Transporte', icon: Truck, color: '#3b82f6' },
    { value: 'food', label: 'Alimentação', icon: Utensils, color: '#f97316' },
    { value: 'culture', label: 'Cultura', icon: Palette, color: '#a855f7' },
    { value: 'health', label: 'Saúde', icon: Heart, color: '#ef4444' },
    { value: 'shopping', label: 'Compras', icon: ShoppingBag, color: '#ec4899' },
    { value: 'leisure', label: 'Lazer', icon: Gamepad2, color: '#22c55e' },
    { value: 'business', label: 'Negócios', icon: Briefcase, color: '#64748b' }
  ],
  en: [
    { value: 'transport', label: 'Transport', icon: Truck, color: '#3b82f6' },
    { value: 'food', label: 'Food', icon: Utensils, color: '#f97316' },
    { value: 'culture', label: 'Culture', icon: Palette, color: '#a855f7' },
    { value: 'health', label: 'Health', icon: Heart, color: '#ef4444' },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
    { value: 'leisure', label: 'Leisure', icon: Gamepad2, color: '#22c55e' },
    { value: 'business', label: 'Business', icon: Briefcase, color: '#64748b' }
  ]
}

export default function OtherServicesPage() {
  const { subcategory } = useParams()
  const { isEn } = useLanguage()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const subcategories = isEn ? SUBCATEGORIES.en : SUBCATEGORIES.pt
  const currentSub = subcategories.find(s => s.value === subcategory)

  // ============================================
  // CARREGAR EMPRESAS
  // ============================================
  useEffect(() => {
    loadBusinesses()
  }, [subcategory])

  const loadBusinesses = async () => {
    setLoading(true)
    console.log('🔍 [OtherServicesPage] ===== INÍCIO =====')
    console.log('🔍 [OtherServicesPage] Subcategoria:', subcategory || 'TODAS')

    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .eq('category', 'other')

      if (subcategory) {
        query = query.eq('subcategory', subcategory)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [OtherServicesPage] Erro Supabase:', error)
        throw error
      }

      console.log('✅ [OtherServicesPage] Empresas encontradas:', data?.length || 0)
      console.log('✅ [OtherServicesPage] Dados:', data)
      setBusinesses(data || [])
    } catch (error) {
      console.error('❌ [OtherServicesPage] Erro:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
      console.log('🔍 [OtherServicesPage] ===== FIM =====')
    }
  }

  const filtered = businesses.filter(b =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        {subcategory && (
          <Link
            to="/outros-servicos"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-4 transition"
          >
            <ArrowLeft size={16} />
            {isEn ? 'Back to all services' : 'Voltar a todos os serviços'}
          </Link>
        )}
        
        <div className="flex items-center gap-3">
          {currentSub ? (
            <>
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${currentSub.color}20` }}
              >
                <currentSub.icon size={28} style={{ color: currentSub.color }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentSub.label}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isEn 
                    ? `${filtered.length} services found` 
                    : `${filtered.length} serviços encontrados`}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                <Grid3x3 size={28} className="text-primary-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEn ? 'Other Services' : 'Outros Serviços'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {isEn 
                    ? `${filtered.length} services available` 
                    : `${filtered.length} serviços disponíveis`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filtros por subcategoria */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          to="/outros-servicos"
          className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
            !subcategory 
              ? 'bg-primary-500 text-white shadow-md' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Grid3x3 size={16} />
          {isEn ? 'All' : 'Todos'}
        </Link>
        {subcategories.map(sub => {
          const Icon = sub.icon
          const isActive = subcategory === sub.value
          return (
            <Link
              key={sub.value}
              to={`/outros-servicos/${sub.value}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
              }`}
              style={isActive ? { backgroundColor: sub.color } : {}}
            >
              <Icon size={16} />
              {sub.label}
            </Link>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={isEn ? 'Search services...' : 'Pesquisar serviços...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'No services found' : 'Nenhum serviço encontrado'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {subcategory 
              ? (isEn 
                  ? `No services in "${currentSub?.label}" yet` 
                  : `Ainda não há serviços em "${currentSub?.label}"`)
              : (isEn 
                  ? 'No other services registered yet' 
                  : 'Ainda não há outros serviços registados')}
          </p>
          {subcategory && (
            <Link
              to="/outros-servicos"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
            >
              <ArrowLeft size={16} />
              {isEn ? 'See all services' : 'Ver todos os serviços'}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(business => {
            const businessSub = subcategories.find(s => s.value === business.subcategory)
            return (
              <Link
                key={business.id}
                to={`/empresa/${business.id}`}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group border border-gray-100 dark:border-gray-700"
              >
                {/* Cover */}
                <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {business.cover_image ? (
                    <img
                      src={business.cover_image}
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Building2 size={32} />
                    </div>
                  )}
                  
                  {/* Subcategory badge */}
                  {businessSub && (
                    <div 
                      className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1"
                      style={{ backgroundColor: businessSub.color }}
                    >
                      <businessSub.icon size={12} />
                      {businessSub.label}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {business.logo_url && (
                      <img
                        src={business.logo_url}
                        alt={business.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 -mt-8 relative z-10 shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {business.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {business.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {business.province && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {business.province}
                      </span>
                    )}
                    {business.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-current" />
                        {Number(business.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}