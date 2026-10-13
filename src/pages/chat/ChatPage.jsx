// src/pages/chat/ChatPage.jsx

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import { useLanguage } from '../../context/LanguageContext'
import {
  Search,
  Send,
  MessageCircle,
  User,
  Building2,
  Check,
  CheckCheck,
  Loader2,
  ArrowLeft,
  MoreVertical,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isEn } = useLanguage()
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    loadConversations,
    sendChatMessage,
    setCurrentConversation,
    markMessagesAsRead
  } = useChat()

  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
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
    
    // Formatação completa
    const day = String(messageDate.getDate()).padStart(2, '0')
    const month = String(messageDate.getMonth() + 1).padStart(2, '0')
    const year = messageDate.getFullYear()
    const hours = String(messageDate.getHours()).padStart(2, '0')
    const minutes = String(messageDate.getMinutes()).padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  // ============================================
  // FORMATAR DATA DA ÚLTIMA MENSAGEM (MAIS CURTA)
  // ============================================
  const formatLastMessageDate = (date) => {
    if (!date) return ''
    
    const now = new Date()
    const messageDate = new Date(date)
    const diffInSeconds = (now - messageDate) / 1000
    
    if (diffInSeconds < 60) {
      return isEn ? 'Just now' : 'Agora'
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${isEn ? 'min' : 'min'}`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} ${isEn ? 'h' : 'h'}`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} ${isEn ? 'd' : 'd'}`
    }
    
    const day = String(messageDate.getDate()).padStart(2, '0')
    const month = String(messageDate.getMonth() + 1).padStart(2, '0')
    const year = messageDate.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  // ============================================
  // CARREGAR CONVERSAS
  // ============================================
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations()
    }
  }, [isAuthenticated])

  // ============================================
  // ABRIR CONVERSA ESPECÍFICA
  // ============================================
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        setCurrentConversation(conv)
        markMessagesAsRead(conv.id, user.id)
      }
    }
  }, [conversationId, conversations])

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
    if (currentConversation && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentConversation])

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
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className={`max-w-[75%] ${isMine ? 'order-2' : 'order-1'}`}>
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
  // RENDERIZAÇO
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <MessageCircle size={48} className="text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Please login to access chat' : 'Faça login para acessar o chat'}
        </p>
        <Link to="/login" className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
          {isEn ? 'Login' : 'Entrar'}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Sidebar - Lista de Conversas */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-primary-500" />
              {isEn ? 'Chats' : 'Conversas'}
              {unreadTotal > 0 && (
                <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                  {unreadTotal}
                </span>
              )}
            </h2>
            <Link 
              to="/dashboard" 
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <X size={18} />
            </Link>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search conversations...' : 'Buscar conversas...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-gray-400">{isEn ? 'Loading...' : 'Carregando...'}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <MessageCircle size={40} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">
                {searchTerm 
                  ? (isEn ? 'No conversations found' : 'Nenhuma conversa encontrada')
                  : (isEn ? 'No conversations yet' : 'Nenhuma conversa ainda')
                }
              </p>
              <p className="text-xs">
                {isEn 
                  ? 'Start a conversation with a company' 
                  : 'Inicie uma conversa com uma empresa'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setCurrentConversation(conv)
                    markMessagesAsRead(conv.id, user.id)
                    navigate(`/chat/${conv.id}`)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    currentConversation?.id === conv.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-sm font-semibold">
                      {(conv.company?.name || conv.user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conv.company?.name || conv.user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.last_message || (isEn ? 'No messages' : 'Sem mensagens')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatLastMessageDate(conv.last_message_at)}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="w-5 h-5 bg-primary-500 text-white text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {currentConversation ? (
          <>
            {/* Header do Chat */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <ArrowLeft size={18} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-semibold">
                      {(currentConversation.company?.name || currentConversation.user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currentConversation.company?.name || currentConversation.user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {currentConversation.company?.category || (isEn ? 'Company' : 'Empresa')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 dark:bg-gray-900/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <MessageCircle size={48} className="mb-3 opacity-30" />
                  <p className="text-base font-medium">
                    {isEn ? 'No messages yet' : 'Nenhuma mensagem ainda'}
                  </p>
                  <p className="text-sm">
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
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={isEn ? 'Type a message...' : 'Digite uma mensagem...'}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          // Estado sem conversa selecionada
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
            <MessageCircle size={64} className="mb-4 opacity-20" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              {isEn ? 'Select a conversation' : 'Selecione uma conversa'}
            </h3>
            <p className="text-sm max-w-sm mt-1">
              {isEn 
                ? 'Choose a conversation from the list to start chatting' 
                : 'Escolha uma conversa da lista para começar a conversar'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}