// src/pages/blog/BlogPostDetailPage.jsx

import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Heart,
  Tag,
  Share2,
  Loader2,
  FileText,
  AlertCircle,
  Download,
  Image as ImageIcon,
  Music2,
  Film,
  File,
  Play,
  Pause,
  Lock,
  Unlock,
  ExternalLink,
  Shield
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function BlogPostDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [audioError, setAudioError] = useState({})
  const [isPlaying, setIsPlaying] = useState({})
  const [signedUrls, setSignedUrls] = useState({})
  const [loadingUrls, setLoadingUrls] = useState(true)
  const audioRefs = useRef({})

  useEffect(() => {
    if (slug) {
      loadPost()
    }
  }, [slug])

  // ============================================
  // FUNÇO PARA GERAR URL ASSINADA
  // ============================================
  const generateSignedUrl = async (filePath) => {
    try {
      let path = filePath
      
      if (filePath.includes('/public/')) {
        const parts = filePath.split('/public/')
        if (parts.length >= 2) {
          path = parts[1]
        }
      }
      
      if (path.startsWith('blog-media/')) {
        path = path.replace('blog-media/', '')
      }
      
      if (path.startsWith('/')) {
        path = path.substring(1)
      }
      
      console.log('🔄 Gerando URL assinada para:', path)
      
      const { data, error } = await supabase.storage
        .from('blog-media')
        .createSignedUrl(path, 3600)
      
      if (error) {
        console.error('❌ Erro ao gerar URL assinada:', error)
        return null
      }
      
      return data?.signedUrl || null
      
    } catch (error) {
      console.error('❌ Erro ao gerar URL assinada:', error)
      return null
    }
  }

  // ============================================
  // FUNÇO PARA GERAR URLs ASSINADAS PARA TODA MÍDIA
  // ============================================
  const generateAllSignedUrls = async (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) {
      setLoadingUrls(false)
      return
    }
    
    setLoadingUrls(true)
    const newSignedUrls = {}
    
    for (let i = 0; i < mediaItems.length; i++) {
      const media = mediaItems[i]
      const url = media.url
      
      try {
        let path = url
        
        if (url.includes('/public/')) {
          const parts = url.split('/public/')
          if (parts.length >= 2) {
            path = parts[1]
          }
        }
        
        if (path.startsWith('blog-media/')) {
          path = path.replace('blog-media/', '')
        }
        
        if (path.startsWith('/')) {
          path = path.substring(1)
        }
        
        const { data, error } = await supabase.storage
          .from('blog-media')
          .createSignedUrl(path, 3600)
        
        if (error) {
          console.error(`❌ Erro ao gerar URL para ${media.name}:`, error)
          newSignedUrls[i] = url
        } else {
          newSignedUrls[i] = data?.signedUrl || url
        }
      } catch (err) {
        console.error(`❌ Erro ao processar ${media.name}:`, err)
        newSignedUrls[i] = url
      }
    }
    
    setSignedUrls(newSignedUrls)
    setLoadingUrls(false)
  }

  // ============================================
  // FUNÇO LOAD POST
  // ============================================
  const loadPost = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Carregando post:', slug)
      
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
      
      if (postError) {
        console.error('❌ Erro ao buscar post:', postError)
        throw postError
      }
      
      if (!postData) {
        setError(isEn ? 'Post not found' : 'Post não encontrado')
        setLoading(false)
        return
      }
      
      console.log('✅ Post encontrado:', postData.title)
      
      let author = null
      if (postData.author_id) {
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', postData.author_id)
          .maybeSingle()
        
        if (!authorError && authorData) {
          author = authorData
        } else {
          author = { name: postData.author_name || 'Admin' }
        }
      }
      
      await supabase
        .from('blog_posts')
        .update({ views: (postData.views || 0) + 1 })
        .eq('id', postData.id)
      
      setPost({ ...postData, author })
      
      if (postData.media && postData.media.length > 0) {
        await generateAllSignedUrls(postData.media)
      } else {
        setLoadingUrls(false)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar post:', error)
      setError(error.message || (isEn ? 'Error loading post' : 'Erro ao carregar post'))
      setLoadingUrls(false)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // FUNÇO PARA BAIXAR ARQUIVOS - BLOQUEADA SEM LOGIN
  // ============================================
  const handleDownload = async (mediaUrl, fileName, index) => {
    // 🔒 VERIFICAR LOGIN - PROTEÇO PRINCIPAL
    if (!isAuthenticated || !user) {
      toast.error(isEn 
        ? '🔒 Faça login para baixar arquivos' 
        : '🔒 Login required to download files'
      )
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }

    if (!mediaUrl) {
      toast.error(isEn ? 'File URL not found' : 'URL do arquivo não encontrada')
      return
    }

    try {
      let downloadUrl = signedUrls[index] || mediaUrl
      
      if (!signedUrls[index]) {
        const url = await generateSignedUrl(mediaUrl)
        if (url) {
          downloadUrl = url
        }
      }

      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.download = fileName || 'arquivo'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(isEn ? `📥 Baixando ${fileName || 'arquivo'}...` : `📥 Downloading ${fileName || 'file'}...`)
      
    } catch (error) {
      console.error('❌ Erro no download:', error)
      toast.error(isEn ? 'Error downloading file' : 'Erro ao baixar arquivo')
    }
  }

  // ============================================
  // FUNÇO PARA COMPARTILHAR
  // ============================================
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt || post?.title,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(isEn ? 'Link copied!' : 'Link copiado!')
    }
  }

  // ============================================
  // FUNÇO PARA TOCAR ÁUDIO
  // ============================================
  const toggleAudio = (index) => {
    const audio = audioRefs.current[index]
    if (audio) {
      if (audio.paused) {
        audio.play()
        setIsPlaying({ ...isPlaying, [index]: true })
      } else {
        audio.pause()
        setIsPlaying({ ...isPlaying, [index]: false })
      }
    }
  }

  const handleAudioError = (index) => {
    setAudioError({ ...audioError, [index]: true })
    console.warn('⚠️ Erro ao carregar áudio:', index)
  }

  // ============================================
  // BLOQUEAR CLIQUE DIREITO (SALVAR COMO)
  // ============================================
  const handleContextMenu = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      toast.error(isEn 
        ? '🔒 Faça login para baixar este arquivo' 
        : '🔒 Login required to download this file'
      )
      return false
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  const getMediaIcon = (type, name) => {
    if (type?.startsWith('image/')) return <ImageIcon size={18} className="text-green-500" />
    if (type?.startsWith('audio/') || name?.match(/\.(m4a|mp3|aac|wav|ogg|flac)$/i)) 
      return <Music2 size={18} className="text-purple-500" />
    if (type?.startsWith('video/') || name?.match(/\.(mp4|webm|mov|avi|mkv)$/i)) 
      return <Film size={18} className="text-red-500" />
    if (type === 'application/pdf') return <FileText size={18} className="text-blue-500" />
    return <File size={18} className="text-gray-500" />
  }

  const isAudioFile = (media) => {
    return media.type?.startsWith('audio/') || 
           media.name?.match(/\.(m4a|mp3|aac|wav|ogg|flac)$/i)
  }

  const isVideoFile = (media) => {
    return media.type?.startsWith('video/') || 
           media.name?.match(/\.(mp4|webm|mov|avi|mkv)$/i)
  }

  if (loading || loadingUrls) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading post...' : 'Carregando post...'}
        </p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'Post not found' : 'Post não encontrado'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error || (isEn ? 'The post you are looking for does not exist' : 'O post que você procura não existe')}
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition"
        >
          <ArrowLeft size={18} />
          {isEn ? 'Back to blog' : 'Voltar ao blog'}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Voltar */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 transition mb-6"
      >
        <ArrowLeft size={18} />
        {isEn ? 'Back to blog' : 'Voltar ao blog'}
      </Link>

      {/* Post */}
      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        {/* Imagem de Capa - COM PROTEÇO DE CLIQUE DIREITO */}
        {post.cover_image && (
          <div className="mb-6 rounded-xl overflow-hidden relative">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto max-h-[400px] object-cover rounded-xl"
              onError={(e) => { e.target.style.display = 'none' }}
              onContextMenu={handleContextMenu}
              draggable={false}
            />
            {!isAuthenticated && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Lock size={12} />
                {isEn ? 'Protected' : 'Protegido'}
              </div>
            )}
          </div>
        )}

        {/* Cabeçalho */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            {post.category && (
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.created_at)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-primary-500 font-semibold text-sm">
                  {post.author?.name?.[0] || post.author_name?.[0] || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {post.author?.name || post.author_name || 'Admin'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Eye size={16} />
                {post.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={16} />
                {post.likes || 0}
              </span>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post.excerpt && (
            <div className="text-lg text-gray-600 dark:text-gray-300 border-l-4 border-primary-500 pl-4 mb-6 italic">
              {post.excerpt}
            </div>
          )}
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  <Tag size={14} className="text-gray-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ============================================
            MÍDIA COM PROTEÇO DE DOWNLOAD
            ============================================ */}
        {post.media && post.media.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText size={16} />
                {isEn ? 'Attachments' : 'Arquivos Anexos'} ({post.media.length})
              </h4>
              {!isAuthenticated ? (
                <span className="text-xs text-yellow-500 flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                  <Lock size={12} />
                  {isEn ? '🔒 Login to download' : '🔒 Login para baixar'}
                </span>
              ) : (
                <span className="text-xs text-green-500 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  <Unlock size={12} />
                  {isEn ? '📥 Downloads available' : '📥 Downloads disponíveis'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.media.map((media, index) => {
                const isAudio = isAudioFile(media)
                const isVideo = isVideoFile(media)
                const isImage = media.type?.startsWith('image/')
                const isPDF = media.type === 'application/pdf'
                const hasAudioError = audioError[index]
                const mediaUrl = signedUrls[index] || media.url

                return (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50"
                  >
                    {/* Cabeçalho do arquivo */}
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {getMediaIcon(media.type, media.name)}
                      <span className="truncate flex-1">{media.name}</span>
                      {media.size && (
                        <span className="text-xs text-gray-400 flex-shrink-0">({formatFileSize(media.size)})</span>
                      )}
                      {!isAuthenticated && (
                        <Lock size={14} className="text-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* PLAYER DE ÁUDIO - VISÍVEL PARA TODOS, DOWNLOAD BLOQUEADO */}
                    {isAudio && mediaUrl && (
                      <div className="mb-3">
                        {hasAudioError ? (
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <Music2 size={24} className="text-purple-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 flex-1 truncate">
                              {media.name}
                            </span>
                            <a
                              href={mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition flex items-center gap-1"
                              onClick={(e) => {
                                if (!isAuthenticated) {
                                  e.preventDefault()
                                  toast.error(isEn ? '🔒 Login required' : '🔒 Login necessário')
                                  navigate('/login')
                                }
                              }}
                            >
                              <Play size={14} />
                              {isEn ? 'Listen' : 'Ouvir'}
                            </a>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <audio
                              ref={(el) => {
                                if (el) audioRefs.current[index] = el
                              }}
                              controls
                              controlsList="nodownload noremoteplayback"
                              className="w-full h-10 rounded-lg"
                              preload="metadata"
                              src={mediaUrl}
                              onError={() => handleAudioError(index)}
                              onPlay={() => setIsPlaying({ ...isPlaying, [index]: true })}
                              onPause={() => setIsPlaying({ ...isPlaying, [index]: false })}
                              onContextMenu={handleContextMenu}
                            >
                              <source src={mediaUrl} type="audio/mp4" />
                              <source src={mediaUrl} type="audio/m4a" />
                              <source src={mediaUrl} type="audio/aac" />
                              <source src={mediaUrl} type="audio/x-m4a" />
                              <source src={mediaUrl} type="audio/mpeg" />
                              <source src={mediaUrl} type="audio/ogg" />
                              <source src={mediaUrl} type="audio/wav" />
                              Seu navegador não suporta áudio.
                            </audio>
                            <a
                              href={mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-500 hover:underline flex items-center gap-1"
                              onClick={(e) => {
                                if (!isAuthenticated) {
                                  e.preventDefault()
                                  toast.error(isEn ? '🔒 Login required' : '🔒 Login necessário')
                                  navigate('/login')
                                }
                              }}
                            >
                              <ExternalLink size={12} />
                              {isEn ? 'Open in new tab' : 'Abrir em nova aba'}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PLAYER DE VÍDEO - VISÍVEL PARA TODOS, DOWNLOAD BLOQUEADO */}
                    {isVideo && mediaUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <video
                          src={mediaUrl}
                          controls
                          controlsList="nodownload noremoteplayback"
                          className="w-full max-h-48 object-cover"
                          poster={post.cover_image}
                          preload="metadata"
                          onContextMenu={handleContextMenu}
                        >
                          <source src={mediaUrl} type="video/mp4" />
                          <source src={mediaUrl} type="video/webm" />
                          Seu navegador não suporta vídeo.
                        </video>
                      </div>
                    )}

                    {/* IMAGEM - VISÍVEL PARA TODOS, DOWNLOAD BLOQUEADO */}
                    {isImage && mediaUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img
                          src={mediaUrl}
                          alt={media.name}
                          className="w-full h-32 object-cover hover:scale-105 transition cursor-pointer"
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error(isEn ? '🔒 Login required' : '🔒 Login necessário')
                              navigate('/login')
                              return
                            }
                            window.open(mediaUrl, '_blank')
                          }}
                          onContextMenu={handleContextMenu}
                          draggable={false}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                        {!isAuthenticated && (
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock size={10} />
                            {isEn ? 'Protected' : 'Protegido'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* PDF - VISÍVEL PARA TODOS, DOWNLOAD BLOQUEADO */}
                    {isPDF && mediaUrl && (
                      <div className="mb-3">
                        <a
                          href={mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                          onClick={(e) => {
                            if (!isAuthenticated) {
                              e.preventDefault()
                              toast.error(isEn ? '🔒 Login required' : '🔒 Login necessário')
                              navigate('/login')
                            }
                          }}
                        >
                          <FileText size={14} />
                          {isEn ? '📄 View PDF' : '📄 Ver PDF'}
                        </a>
                      </div>
                    )}

                    {/* BOTO DE DOWNLOAD - ÚNICA PROTEÇO */}
                    {!isAuthenticated ? (
                      <button
                        onClick={() => {
                          toast.error(isEn 
                            ? '🔒 Faça login para baixar este arquivo' 
                            : '🔒 Login required to download this file'
                          )
                          navigate('/login', { state: { from: window.location.pathname } })
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg text-sm cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                      >
                        <Lock size={16} />
                        {isEn ? 'Login to Download' : 'Login para Baixar'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(media.url, media.name, index)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition"
                      >
                        <Download size={16} />
                        {isEn ? 'Download' : 'Baixar'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Compartilhar */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition"
          >
            <Share2 size={16} />
            {isEn ? 'Share this post' : 'Compartilhar este post'}
          </button>
        </div>

        {/* Aviso de proteção */}
        {!isAuthenticated && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
            <Shield size={14} className="flex-shrink-0" />
            <span>
              {isEn 
                ? '🔒 This content is protected. Login to download files.'
                : '🔒 Este conteúdo está protegido. Faça login para baixar arquivos.'}
            </span>
          </div>
        )}
      </article>
    </div>
  )
}