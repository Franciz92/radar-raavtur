// src/components/chat/ChatWidget.jsx

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useLanguage } from '../../context/LanguageContext'
import { 
  X, 
  Send, 
  MessageCircle, 
  User, 
  Building2,
  Check,
  CheckCheck,
  Clock,
  Loader2,
  Minimize2,
  Maximize2,
  Phone,
  Mail,
  Info,
  ArrowLeft
} from 'lucide-react'
// Remover imports do date-fns e usar formatação manual
import toast from 'react-hot-toast'

export default function ChatWidget({ 
  companyId, 
  companyName, 
  companyLogo,
  onClose,
  initialMessage,
  isMinimized: propIsMinimized = false
}) {
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const {
    currentConversation,
    messages,
    loading,
    sending,
    openConversation,
    sendChatMessage,
    setCurrentConversation,
    loadMessages
  } = useChat()

  const [messageInput, setMessageInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(propIsMinimized)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ============================================
  // FUNÇO PARA FORMATAR DATA MANUALMENTE
  // ============================================
  const formatMessageDate = (date) => {
    const now = new Date()
    const messageDate = new Date(date)
    
    const diffInHours = (now - messageDate) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes} ${isEn ? 'min' : 'min'}`
    }
    
    if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours}${isEn ? 'h' : 'h'}`
    }
    
    if (diffInHours < 48) {
      return isEn ? 'Yesterday' : 'Ontem'
    }
    
    if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24)
      return `${days} ${isEn ? 'd' : 'd'}`
    }
    
    // Formatação manual
    const day = String(messageDate.getDate()).padStart(2, '0')
    const month = String(messageDate.getMonth() + 1).padStart(2, '0')
    const year = messageDate.getFullYear()
    const hours = String(messageDate.getHours()).padStart(2, '0')
    const minutes = String(messageDate.getMinutes()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // ============================================
  // INICIAR CONVERSA
  // ============================================
  useEffect(() => {
    if (isAuthenticated && user && companyId) {
      const userId = user.id
      openConversation(userId, companyId)
    }
  }, [isAuthenticated, user, companyId])

  // ============================================
  // ROLAR PARA ÚLTIMA MENSAGEM
  // ============================================
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ============================================
  // FOCAR NO INPUT
  // ============================================
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isMinimized])

  // ============================================
  // ENVIAR MENSAGEM
  // ============================================
  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageInput.trim()) return
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to send messages' : 'Faça login para enviar mensagens')
      return
    }

    const message = messageInput.trim()
    setMessageInput('')
    await sendChatMessage(message)
  }

  // ============================================
  // STATUS DA MENSAGEM
  // ============================================
  const MessageStatus = ({ isRead, createdAt }) => {
    if (isRead) {
      return <CheckCheck size={14} className="text-blue-500" />
    }
    return <Check size={14} className="text-gray-400" />
  }

  // ============================================
  // COMPONENTE DE MENSAGEM
  // ============================================
  const MessageBubble = ({ message }) => {
    const isMine = message.sender_id === user?.id
    
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-[85%] ${isMine ? 'order-2' : 'order-1'}`}>
          <div className={`rounded-2xl px-4 py-2.5 ${
            isMine 
              ? 'bg-primary-500 text-white rounded-br-none' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
          }`}>
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.message}
            </p>
          </div>
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span>{formatMessageDate(message.created_at)}</span>
            {isMine && <MessageStatus isRead={message.is_read} createdAt={message.created_at} />}
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // MENSAGEM DE CARREGAMENTO
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 size={32} className="animate-spin text-primary-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading conversation...' : 'Carregando conversa...'}
        </p>
      </div>
    )
  }

  // ============================================
  // RENDERIZAÇO PRINCIPAL
  // ============================================
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-primary-500 text-white rounded-t-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2 min-w-0">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={companyName}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Building2 size={16} className="text-white" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {companyName || 'Empresa'}
              </p>
              <p className="text-xs text-white/70 truncate">
                {isEn ? 'Online' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Corpo do Chat */}
      {!isMinimized && (
        <>
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 dark:bg-gray-900/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <MessageCircle size={40} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">
                  {isEn ? 'No messages yet' : 'Nenhuma mensagem ainda'}
                </p>
                <p className="text-xs">
                  {isEn 
                    ? 'Send a message to start the conversation' 
                    : 'Envie uma mensagem para iniciar a conversa'
                  }
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble key={message.id || index} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start mb-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2.5 rounded-bl-none">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={isEn ? 'Type a message...' : 'Digite uma mensagem...'}
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}