// src/components/blog/ProtectedDownload.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Lock, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function ProtectedDownload({ 
  fileUrl, 
  fileName, 
  fileType, 
  children,
  className = '',
  variant = 'button' // 'button' | 'link' | 'icon'
}) {
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Verificar se está logado
    if (!isAuthenticated || !user) {
      toast.error(isEn 
        ? 'Please login to download files' 
        : 'Faça login para baixar arquivos'
      )
      
      // Redirecionar para login com retorno
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }

    if (!fileUrl) {
      toast.error(isEn ? 'File not available' : 'Arquivo não disponível')
      return
    }

    setDownloading(true)

    try {
      // Criar link para download
      const link = document.createElement('a')
      link.href = fileUrl
      link.target = '_blank'
      link.download = fileName || 'arquivo'
      
      // Adicionar token de autenticação (se necessário)
      // const token = await supabase.auth.getSession()
      // link.href = `${fileUrl}?token=${token.data.session?.access_token}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(isEn 
        ? `Downloading ${fileName || 'file'}...` 
        : `Baixando ${fileName || 'arquivo'}...`
      )
    } catch (error) {
      console.error('Erro ao baixar:', error)
      toast.error(isEn ? 'Error downloading file' : 'Erro ao baixar arquivo')
    } finally {
      setDownloading(false)
    }
  }

  // Renderizar botão de download
  if (variant === 'button') {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${className} ${
          isAuthenticated 
            ? 'bg-primary-500 text-white hover:bg-primary-600' 
            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
        }`}
        title={!isAuthenticated ? (isEn ? 'Login to download' : 'Faça login para baixar') : ''}
      >
        {downloading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : !isAuthenticated ? (
          <Lock size={18} />
        ) : (
          <Download size={18} />
        )}
        {children || (isEn ? 'Download' : 'Baixar')}
        {!isAuthenticated && (
          <span className="text-xs opacity-60">
            ({isEn ? 'Login required' : 'Login necessário'})
          </span>
        )}
      </button>
    )
  }

  // Renderizar link
  if (variant === 'link') {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`flex items-center gap-1 text-sm transition ${className} ${
          isAuthenticated 
            ? 'text-primary-500 hover:text-primary-600' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={!isAuthenticated ? (isEn ? 'Login to download' : 'Faça login para baixar') : ''}
      >
        {!isAuthenticated ? <Lock size={14} /> : <Download size={14} />}
        {children || fileName || (isEn ? 'Download' : 'Baixar')}
      </button>
    )
  }

  // Renderizar ícone
  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`p-2 rounded-lg transition ${className} ${
        isAuthenticated 
          ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300' 
          : 'text-gray-400 cursor-not-allowed'
      }`}
      title={!isAuthenticated ? (isEn ? 'Login to download' : 'Faça login para baixar') : (isEn ? 'Download' : 'Baixar')}
    >
      {downloading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : !isAuthenticated ? (
        <Lock size={18} />
      ) : (
        <Download size={18} />
      )}
    </button>
  )
}