// src/components/chat/ChatMessage.jsx

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import {
  Check,
  CheckCheck,
  Clock,
  User,
  Building2,
  MoreVertical,
  Copy,
  Trash2,
  Flag,
  Reply,
  Smile,
  X
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function ChatMessage({ 
  message, 
  isMine, 
  showAvatar = true,
  showDate = true,
  onReply,
  onDelete,
  onReport,
  onCopy,
  isLastMessage = false
}) {
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [reactions, setReactions] = useState(message.reactions || [])
  const [isHovered, setIsHovered] = useState(false)

  const locale = isEn ? enUS : ptBR

  // ============================================
  // FORMATAR DATA
  // ============================================
  const formatMessageDate = (date) => {
    const now = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'HH:mm', { locale })
    }
    
    if (messageDate > new Date(now.setDate(now.getDate() - 7))) {
      return format(messageDate, 'EEE HH:mm', { locale })
    }
    
    return format(messageDate, 'dd/MM/yyyy HH:mm', { locale })
  }

  const formatTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale 
    })
  }

  // ============================================
  // STATUS DA MENSAGEM
  // ============================================
  const MessageStatus = ({ isRead, createdAt }) => {
    if (isRead) {
      return (
        <span className="text-blue-500" title={isEn ? 'Read' : 'Lida'}>
          <CheckCheck size={14} />
        </span>
      )
    }
    return (
      <span className="text-gray-400" title={isEn ? 'Sent' : 'Enviada'}>
        <Check size={14} />
      </span>
    )
  }

  // ============================================
  // TIPO DE REMETENTE
  // ============================================
  const SenderType = ({ senderType }) => {
    if (senderType === 'company') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-primary-500">
          <Building2 size={12} />
          {isEn ? 'Company' : 'Empresa'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <User size={12} />
        {isEn ? 'User' : 'Usuário'}
      </span>
    )
  }

  // ============================================
  // AÇÕES DA MENSAGEM
  // ============================================
  const handleCopy = () => {
    navigator.clipboard.writeText(message.message)
    toast.success(isEn ? 'Message copied!' : 'Mensagem copiada!')
    setShowActions(false)
    if (onCopy) onCopy(message)
  }

  const handleReply = () => {
    if (onReply) onReply(message)
    setShowActions(false)
  }

  const handleDelete = () => {
    if (confirm(isEn ? 'Delete this message?' : 'Excluir esta mensagem?')) {
      if (onDelete) onDelete(message)
    }
    setShowActions(false)
  }

  const handleReport = () => {
    if (confirm(isEn ? 'Report this message?' : 'Denunciar esta mensagem?')) {
      if (onReport) onReport(message)
      toast.success(isEn ? 'Message reported!' : 'Mensagem denunciada!')
    }
    setShowActions(false)
  }

  // ============================================
  // EMOJI REACTIONS
  // ============================================
  const emojis = ['👍', '❤️', '😄', '😮', '😢', '🙏']

  const handleReaction = (emoji) => {
    const existing = reactions.find(r => r === emoji)
    if (existing) {
      setReactions(reactions.filter(r => r !== emoji))
    } else {
      setReactions([...reactions, emoji])
    }
    setShowReactions(false)
  }

  // ============================================
  // RENDERIZAÇO
  // ============================================
  return (
    <div 
      className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
        {/* Avatar do remetente (apenas para mensagens de outros) */}
        {!isMine && showAvatar && message.sender && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {message.sender.avatar_url ? (
                <img 
                  src={message.sender.avatar_url} 
                  alt={message.sender.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500 font-medium">
                  {message.sender.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {message.sender.name}
            </span>
            <SenderType senderType={message.sender_type} />
          </div>
        )}

        {/* Bolha da mensagem */}
        <div 
          className={`relative rounded-2xl px-4 py-2.5 ${
            isMine 
              ? 'bg-primary-500 text-white rounded-br-none' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
          } ${isLastMessage && !isMine ? 'rounded-bl-2xl' : ''}`}
        >
          {/* Conteúdo da mensagem */}
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.message}
          </p>

          {/* Menu de ações (hover) */}
          {isHovered && (
            <div className={`absolute -top-2 ${isMine ? '-left-12' : '-right-12'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <MoreVertical size={14} className="text-gray-500" />
              </button>
              
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Smile size={14} className="text-gray-500" />
              </button>
            </div>
          )}

          {/* Menu de ações expandido */}
          {showActions && (
            <div className={`absolute ${isMine ? 'right-0' : 'left-0'} bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10 min-w-[160px]`}>
              <button
                onClick={handleReply}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Reply size={16} />
                {isEn ? 'Reply' : 'Responder'}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Copy size={16} />
                {isEn ? 'Copy' : 'Copiar'}
              </button>
              {isMine && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <Trash2 size={16} />
                  {isEn ? 'Delete' : 'Excluir'}
                </button>
              )}
              <button
                onClick={handleReport}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
              >
                <Flag size={16} />
                {isEn ? 'Report' : 'Denunciar'}
              </button>
            </div>
          )}

          {/* Reactions Popup */}
          {showReactions && (
            <div className={`absolute ${isMine ? 'right-0' : 'left-0'} bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10`}>
              <div className="flex items-center gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-lg ${
                      reactions.includes(emoji) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  onClick={() => setShowReactions(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center justify-center"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reactions exibidas abaixo da mensagem */}
        {reactions.length > 0 && (
          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
              {reactions.slice(0, 5).map((emoji, index) => (
                <span key={index} className="text-sm">{emoji}</span>
              ))}
              {reactions.length > 5 && (
                <span className="text-xs text-gray-400">+{reactions.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Data e Status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
          {showDate && (
            <>
              <span>{formatMessageDate(message.created_at)}</span>
              {isMine && <MessageStatus isRead={message.is_read} createdAt={message.created_at} />}
            </>
          )}
          {!isMine && message.sender_type === 'company' && (
            <span className="text-xs text-primary-400">
              • {isEn ? 'Company' : 'Empresa'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}