// src/pages/admin/BlogAdmin.jsx

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import {
  Plus, Edit, Trash2, Image, Music, File, Video,
  Upload, X, Save, Loader2, Eye, Download,
  FileText, Music2, Image as ImageIcon, Film
} from 'lucide-react'

export default function BlogAdmin() {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'noticias',
    tags: '',
    status: 'published'
  })
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaPreviews, setMediaPreviews] = useState([])

  const categories = [
    { value: 'noticias', label: 'Notícias' },
    { value: 'artigos', label: 'Artigos' },
    { value: 'guias', label: 'Guias Turísticos' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'promocoes', label: 'Promoções' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'gastronomia', label: 'Gastronomia' }
  ]

  // Verificar se é admin
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadPosts()
    }
  }, [isAdmin])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      toast.error('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  const handleMediaUpload = async (files) => {
    const uploadedFiles = []
    const previews = []

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `blog/${fileName}`

        // Verificar se o bucket existe
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some(b => b.name === 'blog-media')

        if (!bucketExists) {
          await supabase.storage.createBucket('blog-media', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          })
        }

        const { error } = await supabase.storage
          .from('blog-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('blog-media')
          .getPublicUrl(filePath)

        uploadedFiles.push({
          url: publicUrl,
          type: file.type,
          name: file.name
        })

        previews.push({
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name
        })

        toast.success(`${file.name} enviado com sucesso!`)

      } catch (error) {
        console.error('Erro ao enviar arquivo:', error)
        toast.error(`Erro ao enviar ${file.name}`)
      }
    }

    setMediaFiles([...mediaFiles, ...uploadedFiles])
    setMediaPreviews([...mediaPreviews, ...previews])
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Preencha título e conteúdo')
      return
    }

    setUploading(true)
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: formData.status,
        media: mediaFiles,
        author_id: user.id,
        updated_at: new Date().toISOString()
      }

      let result

      if (editingPost) {
        // Atualizar post existente
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
          .select()
          .single()

        if (error) throw error
        result = data
        toast.success('Post atualizado com sucesso!')
      } else {
        // Criar novo post
        postData.created_at = new Date().toISOString()
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single()

        if (error) throw error
        result = data
        toast.success('Post criado com sucesso!')
      }

      await loadPosts()
      resetForm()
      setShowForm(false)

    } catch (error) {
      console.error('Erro ao salvar post:', error)
      toast.error(error.message || 'Erro ao salvar post')
    } finally {
      setUploading(false)
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
      toast.error('Erro ao excluir post')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'noticias',
      tags: '',
      status: 'published'
    })
    setMediaFiles([])
    setMediaPreviews([])
    setEditingPost(null)
  }

  const editPost = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category || 'noticias',
      tags: (post.tags || []).join(', '),
      status: post.status || 'published'
    })
    setMediaFiles(post.media || [])
    setMediaPreviews([])
    setShowForm(true)
  }

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
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciar Blog
          </h1>
          <p className="text-gray-500">Crie, edite e gerencie os posts do blog</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Novo Post'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingPost ? 'Editar Post' : 'Novo Post'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Título do post"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Conteúdo *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input-field h-48"
                placeholder="Conteúdo do post..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="ex: turismo, cultura, gastronomia"
              />
            </div>

            {/* Upload de Mídia */}
            <div>
              <label className="block text-sm font-medium mb-2">Mídia</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary-500 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*,application/pdf"
                  onChange={(e) => handleMediaUpload(e.target.files)}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer block">
                  <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-gray-500">Clique para fazer upload de imagens, músicas, vídeos ou documentos</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB por arquivo</p>
                </label>
              </div>

              {/* Pré-visualização da mídia */}
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {mediaPreviews.map((media, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {media.type.startsWith('image/') && (
                        <img src={media.url} alt={media.name} className="w-full h-32 object-cover" />
                      )}
                      {media.type.startsWith('audio/') && (
                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Music2 className="text-gray-400" size={32} />
                        </div>
                      )}
                      {media.type.startsWith('video/') && (
                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Film className="text-gray-400" size={32} />
                        </div>
                      )}
                      {media.type === 'application/pdf' && (
                        <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FileText className="text-gray-400" size={32} />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                        <p className="text-white text-xs truncate">{media.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="btn-primary flex items-center gap-2"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {uploading ? 'Salvando...' : editingPost ? 'Atualizar' : 'Publicar'}
              </button>
              <button
                onClick={() => { setShowForm(false); resetForm() }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary-500" size={40} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="mx-auto mb-4" size={48} />
          <p>Nenhum post criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {categories.find(c => c.value === post.category)?.label || post.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.content}</p>
                  
                  {(post.media?.length > 0) && (
                    <div className="flex gap-2 mt-2">
                      {post.media.map((m, i) => (
                        <span key={i} className="text-xs text-gray-400 flex items-center gap-1">
                          {m.type.startsWith('image/') && <ImageIcon size={12} />}
                          {m.type.startsWith('audio/') && <Music2 size={12} />}
                          {m.type.startsWith('video/') && <Film size={12} />}
                          {m.type === 'application/pdf' && <FileText size={12} />}
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(post.tags || []).map(tag => (
                      <span key={tag} className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editPost(post)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}