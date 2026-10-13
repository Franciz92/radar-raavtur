// src/pages/admin/BlogPostForm.jsx
// ============================================
// BLOG POST FORM - Admin profissional
// - Categorias + Subcategorias (estilo Vicente News)
// - Preview em tempo real
// - Upload de capa + midia
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon,
  Music2, FileText, Film, Plus, Trash2, AlertCircle,
  Camera, Eye, Clock, Tag, Hash, Link as LinkIcon,
  Sparkles, CheckCircle, Info, Newspaper, Mic, Grid, Disc,
  Home, Calendar, User, TrendingUp,
} from 'lucide-react'

// ============================================
// CATEGORIAS PRINCIPAIS
// ============================================
const CATEGORIES = [
  { value: 'inicio', label: 'Inicio', labelEn: 'Home', icon: Home },
  { value: 'artistas', label: 'Artistas', labelEn: 'Artists', icon: Mic },
  { value: 'categorias', label: 'Categorias', labelEn: 'Categories', icon: Grid },
  { value: 'albuns', label: 'Albuns', labelEn: 'Albums', icon: Disc },
  { value: 'noticias', label: 'Noticias', labelEn: 'News', icon: Newspaper },
]

// ============================================
// SUBCATEGORIAS - Estilo Vicente News
// Aparecem quando "Categorias" esta selecionado
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

export default function BlogPostForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isEn } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasMediaColumn, setHasMediaColumn] = useState(null)

  const isAdmin = user?.role === 'admin'

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'noticias',
    subcategory: '',
    tags: [],
    status: 'draft',
    slug: '',
    media: [],
    cover_image: null,
    cover_file: null,
  })

  const [tagInput, setTagInput] = useState('')
  const [coverPreview, setCoverPreview] = useState(null)

  // ============================================
  // VERIFICAR SE A COLUNA MEDIA EXISTE
  // ============================================
  useEffect(() => {
    const checkMediaColumn = async () => {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .select('media')
          .limit(1)

        if (error && error.message?.includes('column "media" does not exist')) {
          setHasMediaColumn(false)
          console.warn('Coluna media nao encontrada, usando fallback')
        } else {
          setHasMediaColumn(true)
        }
      } catch (err) {
        setHasMediaColumn(false)
        console.warn('Erro ao verificar coluna media:', err)
      }
    }
    checkMediaColumn()
  }, [])

  useEffect(() => {
    if (id) loadPost()
  }, [id])

  // ============================================
  // GERAR SLUG AUTOMATICO
  // ============================================
  useEffect(() => {
    if (formData.title && !id) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.title, id])

  // ============================================
  // GUARD
  // ============================================
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Acesso Negado
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            Apenas administradores podem acessar esta pagina.
          </p>
          <button
            onClick={() => navigate('/admin/blog')}
            className="text-[#EF4444] hover:underline font-semibold"
          >
            Voltar ao blog
          </button>
        </div>
      </div>
    )
  }

  // ============================================
  // CARREGAR POST
  // ============================================
  const loadPost = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          category: data.category || 'noticias',
          subcategory: data.subcategory || '',
          tags: data.tags || [],
          status: data.status || 'draft',
          slug: data.slug || '',
          media: data.media || [],
          cover_image: data.cover_image || null,
          cover_file: null,
        })
        if (data.cover_image) setCoverPreview(data.cover_image)
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error)
      toast.error('Erro ao carregar post')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // UPLOAD DA CAPA
  // ============================================
  const handleCoverUpload = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isEn ? 'Cover must be < 5MB' : 'Imagem de capa deve ter menos de 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error(isEn ? 'Select an image' : 'Selecione uma imagem')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `cover-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === 'blog-media')
      if (!bucketExists) {
        await supabase.storage.createBucket('blog-media', {
          public: true,
          fileSizeLimit: 52428800,
        })
      }

      const { error } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath)

      setFormData((prev) => ({ ...prev, cover_image: publicUrl, cover_file: file }))
      setCoverPreview(publicUrl)
      toast.success(isEn ? 'Cover uploaded!' : 'Capa enviada!')
    } catch (error) {
      console.error('Erro ao enviar capa:', error)
      toast.error(isEn ? 'Error uploading cover' : 'Erro ao enviar capa')
    } finally {
      setUploading(false)
    }
  }

  const removeCover = () => {
    setFormData((prev) => ({ ...prev, cover_image: null, cover_file: null }))
    setCoverPreview(null)
  }

  // ============================================
  // UPLOAD DE MIDIA
  // ============================================
  const handleMediaUpload = async (files) => {
    if (!files.length) return

    setUploading(true)
    setUploadProgress(0)
    const uploaded = []
    const totalFiles = files.length
    let completed = 0

    for (const file of files) {
      try {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} e muito grande. Max 50MB`)
          completed++
          setUploadProgress(Math.round((completed / totalFiles) * 100))
          continue
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `blog/${fileName}`

        let contentType = file.type
        if (file.name.match(/\.m4a$/i)) contentType = 'audio/mp4'
        else if (file.name.match(/\.mp3$/i)) contentType = 'audio/mpeg'
        else if (file.name.match(/\.wav$/i)) contentType = 'audio/wav'
        else if (file.name.match(/\.aac$/i)) contentType = 'audio/aac'
        else if (file.name.match(/\.ogg$/i)) contentType = 'audio/ogg'
        else if (file.name.match(/\.flac$/i)) contentType = 'audio/flac'
        else if (!contentType || contentType === 'application/octet-stream') {
          contentType = 'application/octet-stream'
        }

        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some((b) => b.name === 'blog-media')
        if (!bucketExists) {
          await supabase.storage.createBucket('blog-media', {
            public: true,
            fileSizeLimit: 52428800,
          })
        }

        const { error } = await supabase.storage
          .from('blog-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType,
          })

        if (error) throw new Error(`Falha ao enviar ${file.name}: ${error.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('blog-media')
          .getPublicUrl(filePath)

        let displayType = contentType || file.type || 'audio/m4a'
        if (file.name.match(/\.m4a$/i)) displayType = 'audio/m4a'

        uploaded.push({
          url: publicUrl,
          type: displayType,
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        })

        toast.success(`${file.name} enviado!`)
      } catch (error) {
        console.error('Erro ao enviar arquivo:', error)
        toast.error(`Erro em ${file.name}: ${error.message}`)
      }

      completed++
      setUploadProgress(Math.round((completed / totalFiles) * 100))
    }

    setFormData((prev) => ({ ...prev, media: [...prev.media, ...uploaded] }))
    setUploading(false)
    setUploadProgress(0)

    if (uploaded.length > 0) {
      toast.success(`${uploaded.length} arquivo(s) enviado(s)!`)
    }
  }

  const removeMedia = (index) => {
    setFormData((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }))
  }

  // ============================================
  // TAGS
  // ============================================
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }
  const removeTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (status = 'published') => {
    if (!formData.title || !formData.content) {
      toast.error(isEn ? 'Fill in title and content' : 'Preencha titulo e conteudo')
      return
    }

    setSaving(true)
    try {
      let coverImageUrl = formData.cover_image
      if (coverImageUrl && coverImageUrl.startsWith('/')) {
        coverImageUrl = `https://jcprdnatipbbwxiyewgg.supabase.co/storage/v1/object/public${coverImageUrl}`
      }
      if (coverImageUrl && !coverImageUrl.startsWith('http')) {
        coverImageUrl = `https://jcprdnatipbbwxiyewgg.supabase.co/storage/v1/object/public/${coverImageUrl}`
      }

      const baseData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        subcategory: formData.subcategory || null,
        tags: formData.tags,
        status,
        slug: formData.slug,
        cover_image: coverImageUrl,
        updated_at: new Date().toISOString(),
      }

      let postData = { ...baseData }
      if (hasMediaColumn === true) {
        postData.media = formData.media
      } else if (hasMediaColumn === false) {
        const mediaUrls = formData.media.map((m) => m.url).join(',')
        postData.content = `${formData.content}\n\n---\nMidia: ${mediaUrls}`
      }

      if (id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        toast.success('Post atualizado!')
      } else {
        postData.author_id = user.id
        postData.created_at = new Date().toISOString()
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single()
        if (error) throw error
        toast.success('Post criado!')
      }

      navigate('/admin/blog')
    } catch (error) {
      console.error('Erro ao salvar post:', error)
      toast.error(error.message || 'Erro ao salvar post')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  const isAudioFile = (media) =>
    media.type?.startsWith('audio/') || media.name?.match(/\.(m4a|mp3|aac|wav|ogg|flac)$/i)
  const isVideoFile = (media) =>
    media.type?.startsWith('video/') || media.name?.match(/\.(mp4|webm|mov|avi)$/i)

  const currentCategory = CATEGORIES.find((c) => c.value === formData.category)

  // ============================================
  // LOADING
  // ============================================
  if (hasMediaColumn === null || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={40} className="animate-spin text-[#EF4444]" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isEn ? 'Loading...' : 'A carregar...'}
        </p>
      </div>
    )
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="bg-[#F1F5F9] dark:bg-[#0F172A] min-h-screen py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-lg flex-shrink-0">
                <Newspaper size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {id ? (isEn ? 'Edit Post' : 'Editar Post') : (isEn ? 'New Post' : 'Novo Post')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Radar Blog <span className="text-[#38BDF8] font-bold">RAAVTUR</span>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving || uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm transition disabled:opacity-50"
            >
              <Save size={16} />
              {isEn ? 'Save Draft' : 'Rascunho'}
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={saving || uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white font-bold text-sm transition shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {id ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Publish' : 'Publicar')}
            </button>
          </div>
        </div>

        {/* AVISO MEDIA */}
        {hasMediaColumn === false && (
          <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {isEn
                ? 'The "media" column was not found. Files will be saved as text links.'
                : 'A coluna "media" nao foi encontrada. Os ficheiros serao guardados como links.'}
            </p>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* FORMULARIO 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* SECAO 1: INFO BASICA */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                  <FileText size={16} className="text-[#EF4444]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Basic Info' : 'Informacoes Basicas'}
                </h2>
              </div>

              <div className="space-y-4">
                {/* Titulo */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    {isEn ? 'Title' : 'Titulo'} <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/10 transition text-base font-semibold"
                    placeholder={isEn ? 'Post title' : 'Titulo do post'}
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    {isEn ? 'Excerpt' : 'Resumo'}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({isEn ? 'short description' : 'descricao curta'})
                    </span>
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                    maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/10 transition resize-none text-sm"
                    placeholder={isEn ? 'Short summary...' : 'Resumo curto...'}
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {formData.excerpt.length}/200
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    URL <span className="text-xs font-normal text-slate-400">(slug)</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-[#EF4444] focus-within:ring-4 focus-within:ring-[#EF4444]/10 transition">
                    <span className="px-3 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm border-r border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                      <LinkIcon size={12} />
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="flex-1 px-3 py-3 bg-transparent text-slate-900 dark:text-white focus:outline-none text-sm"
                      placeholder="url-do-post"
                    />
                  </div>
                </div>

                {/* CATEGORIA */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    {isEn ? 'Category' : 'Categoria'}
                  </label>

                  {/* Categorias principais */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      const active = formData.category === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              category: cat.value,
                              subcategory: cat.value === 'categorias' ? prev.subcategory : '',
                            }))
                          }}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                            active
                              ? 'bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white shadow-lg shadow-red-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#EF4444]/50 hover:bg-[#EF4444]/5'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{isEn ? cat.labelEn : cat.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* SUBCATEGORIAS - So aparece se "Categorias" esta ativo */}
                  {formData.category === 'categorias' && (
                    <div className="mt-4 p-4 rounded-xl bg-[#EF4444]/5 border-2 border-[#EF4444]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Grid size={14} className="text-[#EF4444]" />
                        <label className="text-xs font-black uppercase tracking-wider text-[#EF4444]">
                          {isEn ? 'Select Subcategory' : 'Selecione a Subcategoria'}
                        </label>
                      </div>

                      {/* Grid de subcategorias */}
                      <div className="flex flex-wrap gap-2">
                        {SUBCATEGORIES.map((sub) => {
                          const active = formData.subcategory === sub
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, subcategory: sub }))
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                active
                                  ? 'bg-[#EF4444] text-white shadow-md shadow-red-500/20 scale-105'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#EF4444]/50 hover:text-[#EF4444]'
                              }`}
                            >
                              {sub}
                            </button>
                          )
                        })}
                      </div>

                      {/* Selecao atual */}
                      {formData.subcategory && (
                        <div className="mt-3 pt-3 border-t border-[#EF4444]/20 flex items-center gap-2">
                          <CheckCircle size={14} className="text-[#EF4444]" />
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {isEn ? 'Selected: ' : 'Selecionado: '}
                            <strong className="text-[#EF4444]">{formData.subcategory}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECAO 2: CAPA */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                  <ImageIcon size={16} className="text-[#EF4444]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Cover Image' : 'Imagem de Capa'}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Capa"
                      className="w-full h-full object-cover"
                      onError={() => setCoverPreview(null)}
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <Camera size={28} className="mx-auto mb-1" />
                      <span className="text-xs">{isEn ? 'No cover' : 'Sem capa'}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCoverUpload(file)
                    }}
                    className="hidden"
                    id="cover-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="cover-upload"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#EF4444] hover:bg-[#EF4444]/5 hover:text-[#EF4444] cursor-pointer transition text-sm font-semibold ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {uploading
                      ? isEn ? 'Uploading...' : 'A enviar...'
                      : isEn ? 'Upload cover' : 'Carregar capa'}
                  </label>

                  {coverPreview && (
                    <button
                      onClick={removeCover}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <X size={14} />
                      {isEn ? 'Remove cover' : 'Remover capa'}
                    </button>
                  )}

                  <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <Info size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      {isEn
                        ? 'Recommended: 1200x630px - Max 5MB'
                        : 'Recomendado: 1200x630px - Max 5MB'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECAO 3: CONTEUDO */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-[#EF4444]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Content' : 'Conteudo'}
                </h2>
              </div>

              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/10 transition resize-none text-sm leading-relaxed"
                rows={14}
                placeholder={isEn ? 'Write your article content here...' : 'Escreva o conteudo do artigo aqui...'}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                <span>{formData.content.split(/\s+/).filter(Boolean).length} {isEn ? 'words' : 'palavras'}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {Math.max(1, Math.ceil(formData.content.split(/\s+/).length / 200))} min
                </span>
              </div>
            </div>

            {/* SECAO 4: MIDIA */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                  <Music2 size={16} className="text-[#EF4444]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Media' : 'Midia'}
                </h2>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-[#EF4444] hover:bg-[#EF4444]/5 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,audio/*,video/*,application/pdf,.m4a,.mp3,.aac,.wav,.ogg,.flac"
                  onChange={(e) => handleMediaUpload(e.target.files)}
                  className="hidden"
                  id="media-upload"
                  disabled={uploading}
                />
                <label htmlFor="media-upload" className="cursor-pointer block">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-[#EF4444]" size={32} />
                      <p className="text-sm text-slate-500 mt-2">
                        {isEn ? 'Uploading...' : 'A enviar...'} {uploadProgress}%
                      </p>
                      <div className="w-full max-w-xs h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">
                        {isEn ? 'Click to upload files' : 'Clique para carregar ficheiros'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isEn
                          ? 'Images, Audio, Video, PDF - Max 50MB'
                          : 'Imagens, Audio, Video, PDF - Max 50MB'}
                      </p>
                    </>
                  )}
                </label>
              </div>

              {formData.media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {formData.media.map((media, index) => {
                    const isAudio = isAudioFile(media)
                    const isVideo = isVideoFile(media)
                    const isImage = media.type?.startsWith('image/')
                    const isPDF = media.type === 'application/pdf'

                    return (
                      <div
                        key={index}
                        className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-900"
                      >
                        {isImage && (
                          <img src={media.url} alt={media.name} className="w-full h-32 object-cover" />
                        )}
                        {isAudio && (
                          <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-purple-900/20 flex items-center justify-center flex-col p-2">
                            <Music2 size={28} className="text-purple-500" />
                            <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate w-full text-center px-1">
                              {media.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatFileSize(media.size || 0)}
                            </span>
                          </div>
                        )}
                        {isVideo && (
                          <div className="w-full h-32 bg-gradient-to-br from-red-500/20 to-red-900/20 flex items-center justify-center flex-col p-2">
                            <Film size={28} className="text-red-500" />
                            <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate w-full text-center px-1">
                              {media.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatFileSize(media.size || 0)}
                            </span>
                          </div>
                        )}
                        {isPDF && (
                          <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-blue-900/20 flex items-center justify-center flex-col">
                            <FileText size={28} className="text-blue-500" />
                            <span className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate w-full text-center px-1">
                              {media.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatFileSize(media.size || 0)}
                            </span>
                          </div>
                        )}

                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-600"
                          title="Remover"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                          <p className="text-white text-[10px] truncate">{media.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* SECAO 5: TAGS */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
                  <Hash size={16} className="text-[#EF4444]" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Tags' : 'Tags'}
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/10 transition text-sm"
                  placeholder={isEn ? 'Add tag and press Enter...' : 'Adicionar tag e premir Enter...'}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl transition font-semibold text-sm"
                >
                  <Plus size={16} />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-full text-xs font-bold"
                    >
                      <Tag size={11} />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-700 transition"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* BOTOES MOBILE */}
            <div className="flex flex-col sm:flex-row gap-3 md:hidden">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition disabled:opacity-50"
              >
                <Save size={16} />
                {isEn ? 'Save Draft' : 'Rascunho'}
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-bold text-sm transition shadow-lg disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {id ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Publish' : 'Publicar')}
              </button>
            </div>
          </div>

          {/* SIDEBAR PREVIEW 1/3 */}
          <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-6 h-fit">

            {/* Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 flex items-center justify-center">
                  <Eye size={16} className="text-[#38BDF8]" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Live Preview' : 'Pre-visualizacao'}
                </h3>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={28} className="text-slate-300" />
                    </div>
                  )}
                  {currentCategory && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 flex-wrap max-w-[90%]">
                      <span>{isEn ? currentCategory.labelEn : currentCategory.label}</span>
                      {formData.subcategory && (
                        <>
                          <span className="opacity-60">/</span>
                          <span>{formData.subcategory}</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {Math.max(1, Math.ceil(formData.content.split(/\s+/).length / 200))} min
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-2">
                    {formData.title || (isEn ? 'Post title...' : 'Titulo do post...')}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {formData.excerpt || formData.content.slice(0, 100) || (isEn ? 'Short description...' : 'Descricao curta...')}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User size={11} />
                      <span className="truncate max-w-[100px]">{user?.name || 'Admin'}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Eye size={10} />
                        0
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingUp size={10} />
                        Novo
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info post */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                {isEn ? 'Post Details' : 'Detalhes do Post'}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isEn ? 'Status' : 'Estado'}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      formData.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {formData.status === 'published'
                      ? isEn ? 'Published' : 'Publicado'
                      : isEn ? 'Draft' : 'Rascunho'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isEn ? 'Subcategory' : 'Subcategoria'}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white text-xs">
                    {formData.subcategory || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isEn ? 'Words' : 'Palavras'}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.content.split(/\s+/).filter(Boolean).length}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isEn ? 'Media' : 'Midia'}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.media.length}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isEn ? 'Tags' : 'Tags'}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.tags.length}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}