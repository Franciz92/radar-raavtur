// src/pages/admin/BlogAdminPage.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import {
  Plus, Edit, Trash2, Eye, Search, Loader2,
  FileText, Calendar, Tag, ChevronLeft, ChevronRight,
  Shield, AlertCircle, Image, Music, File, Video,
  RefreshCw
} from 'lucide-react'

export default function BlogAdminPage() {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadPosts()
    }
  }, [isAdmin])

  const loadPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Carregando posts do blog...')
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro na query:', error)
        throw error
      }

      console.log('✅ Posts carregados:', data?.length || 0)
      setPosts(data || [])
      
    } catch (error) {
      console.error('❌ Erro ao carregar posts:', error)
      setError(error.message)
      toast.error('Erro ao carregar posts: ' + error.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Post excluído com sucesso!')
      await loadPosts()
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      toast.error('Erro ao excluir post: ' + error.message)
    }
  }

  // Filtrar posts - com segurança para null/undefined
  const filteredPosts = posts.filter(post => {
    const title = post.title || ''
    const status = post.status || ''
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    if (status === 'published' || status === 'public') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Publicado</span>
    } else if (status === 'draft') {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Rascunho</span>
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400">{status || 'Desconhecido'}</span>
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      noticias: 'Notícias',
      artigos: 'Artigos',
      guias: 'Guias Turísticos',
      eventos: 'Eventos',
      promocoes: 'Promoções',
      cultura: 'Cultura',
      gastronomia: 'Gastronomia',
      musica: 'Música',
      videos: 'Vídeos'
    }
    return labels[category] || category || 'Geral'
  }

  // Se não for admin, mostrar acesso negado
  if (!isAdmin) {
    return (
      <div className="container-custom py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <Shield size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Acesso Negado
          </h2>
          <p className="text-red-600 dark:text-red-300">
            Apenas administradores podem acessar esta página.
          </p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary-500 hover:underline">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Manage Blog' : 'Gerenciar Blog'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Manage all blog posts' : 'Gerencie todos os posts do blog'}
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-1">⚠️ {error}</p>
          )}
        </div>
        <Link to="/admin/blog/novo" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {isEn ? 'New Post' : 'Novo Post'}
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={isEn ? 'Search posts...' : 'Buscar posts...'}
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">{isEn ? 'All' : 'Todos'}</option>
          <option value="published">{isEn ? 'Published' : 'Publicados'}</option>
          <option value="draft">{isEn ? 'Drafts' : 'Rascunhos'}</option>
        </select>
        <button
          onClick={loadPosts}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {isEn ? 'Refresh' : 'Atualizar'}
        </button>
      </div>

      {/* Lista de Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto mb-4" size={48} />
          <p>{isEn ? 'No posts found.' : 'Nenhum post encontrado.'}</p>
          <Link to="/admin/blog/novo" className="text-primary-500 hover:underline mt-2 inline-block">
            {isEn ? 'Create first post' : 'Criar primeiro post'}
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isEn ? 'Title' : 'Título'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isEn ? 'Status' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isEn ? 'Category' : 'Categoria'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isEn ? 'Date' : 'Data'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {isEn ? 'Actions' : 'Ações'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {post.title || 'Sem título'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {post.content?.substring(0, 80)}...
                        </p>
                        {/* Exibir quantidade de mídia */}
                        {post.media && post.media.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {post.media.some(m => m.type?.startsWith('image/')) && (
                              <Image size={12} className="text-green-500" />
                            )}
                            {post.media.some(m => m.type?.startsWith('audio/')) && (
                              <Music size={12} className="text-purple-500" />
                            )}
                            {post.media.some(m => m.type?.startsWith('video/')) && (
                              <Video size={12} className="text-red-500" />
                            )}
                            <span className="text-xs text-gray-400">
                              {post.media.length} arquivo(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {getCategoryLabel(post.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/blog/${post.slug || post.id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                          title={isEn ? 'View' : 'Visualizar'}
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/blog/${post.id}/editar`}
                          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                          title={isEn ? 'Edit' : 'Editar'}
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title={isEn ? 'Delete' : 'Excluir'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Contador de posts */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
            {filteredPosts.length} {isEn ? 'posts' : 'posts'} 
            {posts.length !== filteredPosts.length && ` (${posts.length} ${isEn ? 'total' : 'total'})`}
          </div>
        </div>
      )}
    </div>
  )
}