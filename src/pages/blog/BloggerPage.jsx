// src/pages/blog/BloggerPage.jsx
// ============================================
// RADAR BLOG RAAVTUR - Estilo Vicente News
// - Menu lateral com subcategorias
// - Filtro duplo (categoria + subcategoria)
// - Cards profissionais
// ============================================

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Calendar, User, Eye, Heart, ArrowRight,
  Loader2, FileText, ChevronRight, Lock,
  Clock, TrendingUp, Flame, Sparkles,
  Home, Mic, Grid, Disc, Newspaper,
  Menu, X, SlidersHorizontal, CheckCircle,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'

// ============================================
// MENU LATERAL - Categorias principais
// ============================================
const SIDEBAR_MENU = [
  { id: 'all', label: 'Inicio', labelEn: 'Home', icon: Home },
  { id: 'artistas', label: 'Artistas', labelEn: 'Artists', icon: Mic },
  { id: 'categorias', label: 'Categorias', labelEn: 'Categories', icon: Grid },
  { id: 'albuns', label: 'Albuns', labelEn: 'Albums', icon: Disc },
  { id: 'noticias', label: 'Noticias', labelEn: 'News', icon: Newspaper },
]

// ============================================
// SUBCATEGORIAS - Aparecem quando "Categorias" esta ativo
// ============================================
const SUBCATEGORIES = [
  'Afro Pop',
  'Naija',
  'Hip Hop',
  'Afrobeat',
  'Amapiano',
  'R&B',
  'Ghetto Zouk',
  'Tarraxinha',
  'Instrumentais',
  'Mix de DJs',
  'Musica Internacional',
  'Outros',
  'Novos Talentos',
]

// ============================================
// HELPERS
// ============================================
const getCoverImage = (post) => {
  if (post.cover_image) {
    if (post.cover_image.startsWith('/')) {
      return `https://jcprdnatipbbwxiyewgg.supabase.co/storage/v1/object/public${post.cover_image}`
    }
    if (post.cover_image.startsWith('http')) return post.cover_image
    if (post.cover_image.includes('blog-media')) {
      return `https://jcprdnatipbbwxiyewgg.supabase.co/storage/v1/object/public/${post.cover_image}`
    }
    return post.cover_image
  }
  if (post.media && post.media.length > 0) {
    const firstImage = post.media.find((m) => m.type?.startsWith('image/'))
    if (firstImage) return firstImage.url
  }
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

const truncateText = (text, max = 140) => {
  if (!text) return ''
  if (text.length <= max) return text
  return text.substring(0, max).trim() + '...'
}

const estimateReadTime = (content) => {
  if (!content) return '3 min'
  const words = content.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function BloggerPage() {
  const { isEn } = useLanguage()
  const { isAuthenticated } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (postsData?.length > 0) {
        const authorIds = [...new Set(postsData.map((p) => p.author_id).filter(Boolean))]
        let authorMap = {}

        if (authorIds.length > 0) {
          const { data: authorsData } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', authorIds)

          if (authorsData) {
            authorMap = authorsData.reduce((acc, a) => {
              acc[a.id] = a
              return acc
            }, {})
          }
        }

        setPosts(
          postsData.map((post) => ({
            ...post,
            author: authorMap[post.author_id] || { name: post.author_name || 'Radar RAAVTUR' },
          }))
        )
      } else {
        setPosts([])
      }
    } catch (err) {
      console.error(err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  // ============================================
  // FILTROS
  // ============================================
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchTerm ||
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase()

      const matchesSubcategory =
        selectedSubcategory === 'all' ||
        post.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase()

      return matchesSearch && matchesCategory && matchesSubcategory
    })
  }, [posts, searchTerm, selectedCategory, selectedSubcategory])

  const featuredPost = filteredPosts[0]
  const otherPosts = filteredPosts.slice(1)

  const topPosts = useMemo(
    () => [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    [posts]
  )

  // Contadores
  const getCategoryCount = (catId) => {
    if (catId === 'all') return posts.length
    return posts.filter((p) => p.category?.toLowerCase() === catId.toLowerCase()).length
  }

  const getSubcategoryCount = (subName) => {
    return posts.filter((p) => p.subcategory?.toLowerCase() === subName.toLowerCase()).length
  }

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId)
    setSelectedSubcategory('all')
    setSidebarOpen(false)
  }

  const handleSubcategoryClick = (subName) => {
    setSelectedSubcategory(subName === selectedSubcategory ? 'all' : subName)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedSubcategory('all')
  }

  const hasActiveFilters =
    searchTerm || selectedCategory !== 'all' || selectedSubcategory !== 'all'

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="bg-[#F1F5F9] dark:bg-[#0F172A] min-h-screen">

      {/* BANNER PUBLICITARIO */}
      <section className="relative w-full h-[140px] sm:h-[200px] lg:h-[280px] overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#020617]">
        <img
          src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1600&q=80"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-[#0F172A]/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <img
              src="/images/Logotipo.png"
              alt="Radar RAAVTUR"
              className="h-16 sm:h-20 lg:h-24 w-auto object-contain mb-4 sm:mb-0 drop-shadow-2xl"
            />
            <div className="text-white">
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#38BDF8] mb-1 sm:mb-2">
                Radar Blog
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight leading-tight">
                {isEn ? 'Discover Angola' : 'Descubra Angola'}
                <br />
                <span className="bg-gradient-to-r from-[#38BDF8] via-[#7FC0FA] to-[#D4A72C] bg-clip-text text-transparent">
                  {isEn ? 'through stories.' : 'atraves de historias.'}
                </span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* HEADER DO BLOG */}
      <section className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-lg">
              <Newspaper size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Radar Blog <span className="text-[#38BDF8]">RAAVTUR</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isEn ? 'Stories, guides and inspiration' : 'Historias, guias e inspiracao'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800"
            aria-label="Abrir categorias"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </section>

      {/* GRID PRINCIPAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-12 gap-6">

          {/* SIDEBAR ESQUERDA */}
          <aside className={`fixed lg:static inset-0 z-50 lg:z-auto lg:col-span-2 lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <div className="relative bg-white dark:bg-[#1E293B] lg:rounded-2xl lg:sticky lg:top-4 border-r lg:border border-slate-200 dark:border-slate-700 shadow-xl lg:shadow-sm h-full lg:h-auto overflow-y-auto">
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <p className="font-black uppercase tracking-wider text-xs text-slate-900 dark:text-white">
                  {isEn ? 'Categories' : 'Categorias'}
                </p>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="p-2 lg:p-3 space-y-0.5">
                {SIDEBAR_MENU.map((item) => {
                  const Icon = item.icon
                  const active = selectedCategory === item.id
                  const count = getCategoryCount(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCategoryClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-lg shadow-red-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                      <span className="flex-1 text-left">
                        {isEn ? item.labelEn : item.label}
                      </span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* CONTEUDO CENTRAL */}
          <main className="col-span-12 lg:col-span-7 space-y-6">

            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                  {isEn ? 'Discover' : 'Descobrir'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isEn
                    ? `${filteredPosts.length} articles available`
                    : `${filteredPosts.length} artigos disponiveis`}
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-[#EF4444] hover:bg-red-100 dark:hover:bg-red-950/40 text-xs font-bold transition"
                >
                  <X size={12} />
                  {isEn ? 'Clear' : 'Limpar'}
                </button>
              )}
            </div>

            {/* PESQUISA */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder={isEn ? 'What are you looking for?' : 'O que procuras?'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/10 transition-all shadow-sm"
              />
            </div>

            {/* SUBCATEGORIAS (so quando "Categorias" esta ativo) */}
            {selectedCategory === 'categorias' && (
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal size={14} className="text-[#EF4444]" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {isEn ? 'Subcategories' : 'Subcategorias'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSubcategoryClick('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedSubcategory === 'all'
                        ? 'bg-[#EF4444] text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isEn ? 'All' : 'Todas'}
                  </button>
                  {SUBCATEGORIES.map((sub) => {
                    const active = selectedSubcategory === sub
                    const count = getSubcategoryCount(sub)
                    return (
                      <button
                        key={sub}
                        onClick={() => handleSubcategoryClick(sub)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          active
                            ? 'bg-[#EF4444] text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {sub}
                        {count > 0 && (
                          <span
                            className={`text-[10px] px-1.5 rounded-full ${
                              active ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* FILTRO ATIVO */}
            {selectedSubcategory !== 'all' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? 'Filtered by:' : 'Filtrado por:'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EF4444] text-white text-xs font-bold">
                  <CheckCircle size={11} />
                  {selectedSubcategory}
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className="hover:opacity-70"
                  >
                    <X size={11} />
                  </button>
                </span>
              </div>
            )}

            {/* POST EM DESTAQUE */}
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.slug || featuredPost.id}`}
                className="group block relative rounded-2xl overflow-hidden bg-slate-900 shadow-xl"
              >
                <div className="relative aspect-[16/9]">
                  <img
                    src={getCoverImage(featuredPost)}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444] text-white text-xs font-bold shadow-lg">
                      <Flame size={12} />
                      {isEn ? 'Featured' : 'Destaque'}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 text-white">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {featuredPost.category && (
                        <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                          {featuredPost.category}
                        </span>
                      )}
                      {featuredPost.subcategory && (
                        <span className="inline-block px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold uppercase tracking-wider">
                          {featuredPost.subcategory}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight mb-3 line-clamp-2">
                      {featuredPost.title}
                    </h3>
                    <p className="text-sm text-white/80 line-clamp-2 mb-4 max-w-2xl">
                      {featuredPost.excerpt || truncateText(featuredPost.content, 160)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                      <span className="flex items-center gap-1.5">
                        <User size={12} />
                        {featuredPost.author?.name || 'Radar RAAVTUR'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatDate(featuredPost.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye size={12} />
                        {featuredPost.views || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* GRELHA DE POSTS */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-[#EF4444]" />
                <p className="text-sm text-slate-500 mt-3">
                  {isEn ? 'Loading...' : 'A carregar...'}
                </p>
              </div>
            ) : otherPosts.length === 0 && !featuredPost ? (
              <div className="text-center py-16 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700">
                <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-semibold mb-2">
                  {isEn ? 'No articles found' : 'Nenhum artigo encontrado'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#EF4444] hover:underline font-bold"
                  >
                    {isEn ? 'Clear filters' : 'Limpar filtros'}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {otherPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className="group bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img
                        src={getCoverImage(post)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
                        }}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                        {post.category && (
                          <span className="px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold uppercase tracking-wider">
                            {post.category}
                          </span>
                        )}
                        {post.subcategory && (
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {post.subcategory}
                          </span>
                        )}
                      </div>
                      {post.media?.length > 0 && (
                        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                          {post.media.length}
                          {!isAuthenticated && <Lock size={9} className="text-amber-300" />}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {estimateReadTime(post.content)}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#EF4444] transition-colors line-clamp-2 mb-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {post.excerpt || truncateText(post.content, 100)}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <User size={12} />
                          <span className="truncate max-w-[100px]">
                            {post.author?.name || 'Radar RAAVTUR'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye size={11} />
                            {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={11} />
                            {post.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isAuthenticated && posts.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                <Lock size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {isEn
                    ? 'Login to download files from posts'
                    : 'Faca login para baixar arquivos dos posts'}
                </p>
              </div>
            )}
          </main>

          {/* SIDEBAR DIREITA - TOP 5 */}
          <aside className="col-span-12 lg:col-span-3 space-y-5 lg:sticky lg:top-4 h-fit">

            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center">
                  <TrendingUp size={16} className="text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Top 5' : 'TOP 5'}
                </h3>
              </div>
              <div className="space-y-2.5">
                {topPosts.map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="text-base font-black text-slate-300 dark:text-slate-600 w-5 text-center tabular-nums flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                      <img
                        src={getCoverImage(post)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=80'
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#EF4444] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>
                    </div>
                  </Link>
                ))}
                {topPosts.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">
                    {isEn ? 'No posts yet' : 'Sem posts ainda'}
                  </p>
                )}
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#38BDF8]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#38BDF8] flex items-center justify-center mb-3">
                  <Sparkles size={18} className="text-[#0F172A]" />
                </div>
                <h3 className="text-base font-black text-white mb-2 leading-tight">
                  {isEn ? 'Weekly news' : 'Novidades semanais'}
                </h3>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  {isEn
                    ? 'Get the best articles directly.'
                    : 'Receba os melhores artigos diretamente.'}
                </p>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0F172A] font-bold text-xs transition-all"
                >
                  {isEn ? 'Subscribe' : 'Subscrever'}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#D4A72C] to-[#B88A1A] rounded-2xl p-5 text-center shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/60 mb-1">
                {isEn ? 'Sponsored' : 'Patrocinado'}
              </p>
              <p className="text-sm font-black text-[#0F172A] leading-tight mb-3">
                {isEn ? 'Advertise your business here' : 'Anuncie a sua empresa aqui'}
              </p>
              <Link
                to="/contacto"
                className="inline-block px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-bold hover:bg-[#1E293B] transition-all"
              >
                {isEn ? 'Learn more' : 'Saber mais'}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}