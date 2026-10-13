// src/pages/public/Blog.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import { hasPermission } from '../../utils/permissions'
import { 
  Search, Download, Image, Music, File, Video, 
  Calendar, User, Tag, Eye, Loader2,
  FileText, Music2, ImageIcon, Film
} from 'lucide-react'

export default function Blog() {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    'all', 'noticias', 'artigos', 'guias', 'eventos', 'promocoes', 'cultura', 'gastronomia'
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (mediaUrl, fileName) => {
    // Verificar permissão de download
    if (!hasPermission(user?.role, 'DOWNLOAD')) {
      toast.error('Você precisa estar logado para baixar arquivos')
      return
    }

    // Abrir em nova aba para download
    window.open(mediaUrl, '_blank')
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getMediaIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} className="text-green-500" />
    if (type.startsWith('audio/')) return <Music2 size={16} className="text-purple-500" />
    if (type.startsWith('video/')) return <Film size={16} className="text-red-500" />
    if (type === 'application/pdf') return <FileText size={16} className="text-blue-500" />
    return <File size={16} className="text-gray-500" />
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Blog RAVTUR
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Descubra as melhores dicas, guias e novidades sobre turismo em Angola
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Buscar no blog..."
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field w-48"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Todas Categorias' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto mb-4" size={48} />
          <p>Nenhum post encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition">
              {/* Mídia destaque */}
              {post.media?.length > 0 && (
                <div className="relative h-48 overflow-hidden">
                  {post.media[0].type.startsWith('image/') && (
                    <img 
                      src={post.media[0].url} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  {post.media[0].type.startsWith('audio/') && (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-900/20 flex items-center justify-center">
                      <Music2 size={48} className="text-purple-500" />
                    </div>
                  )}
                  {post.media[0].type.startsWith('video/') && (
                    <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center">
                      <Film size={48} className="text-red-500" />
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(post.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Arquivos para download */}
                {post.media?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">📎 Arquivos disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {post.media.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => handleDownload(media.url, media.name)}
                          className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded-lg transition"
                        >
                          {getMediaIcon(media.type)}
                          {media.name}
                          <Download size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}