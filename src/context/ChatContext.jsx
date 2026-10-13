// src/context/ChatContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'
import { useCompany } from './CompanyContext'
import toast from 'react-hot-toast'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const { company } = useCompany()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadTotal, setUnreadTotal] = useState(0)

  // ============================================
  // CARREGAR CONVERSAS DO USUÁRIO
  // ============================================
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      let query = supabase
        .from('conversations')
        .select(`
          *,
          company:company_id (
            id,
            name,
            logo,
            category
          )
        `)
        .order('last_message_at', { ascending: false })

      // Se for empresa, buscar conversas da empresa
      if (user.role === 'company' || user.role === 'admin') {
        if (company?.id) {
          query = query.eq('company_id', company.id)
        } else {
          setConversations([])
          setLoading(false)
          return
        }
      } else {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar conversas:', error)
        return
      }

      setConversations(data || [])
      
      // Calcular total de não lidas
      const total = data?.reduce((acc, conv) => acc + (conv.unread_count || 0), 0) || 0
      setUnreadTotal(total)

    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, company])

  // ============================================
  // ABRIR CONVERSA
  // ============================================
  const openConversation = useCallback(async (userId, companyId) => {
    try {
      // Verificar se já existe conversa
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle()

      if (findError && findError.code !== 'PGRST116') {
        throw findError
      }

      let conversation = existing

      if (!existing) {
        // Criar nova conversa
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert([{
            user_id: userId,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) throw createError
        conversation = newConv
        
        // Recarregar conversas
        await loadConversations()
      }

      setCurrentConversation(conversation)
      
      // Carregar mensagens
      if (conversation) {
        await loadMessages(conversation.id)
        await markMessagesAsRead(conversation.id, userId)
      }

      return conversation
    } catch (error) {
      console.error('Erro ao abrir conversa:', error)
      toast.error('Erro ao abrir conversa')
      return null
    }
  }, [loadConversations])

  // ============================================
  // CARREGAR MENSAGENS
  // ============================================
  const loadMessages = useCallback(async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) throw error
      setMessages(data || [])
      return data || []
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      return []
    }
  }, [])

  // ============================================
  // ENVIAR MENSAGEM
  // ============================================
  const sendChatMessage = useCallback(async (message) => {
    if (!currentConversation) {
      toast.error('Nenhuma conversa selecionada')
      return
    }

    if (!message.trim()) {
      toast.error('Digite uma mensagem')
      return
    }

    setSending(true)
    try {
      const senderType = user?.role === 'company' || user?.role === 'admin' ? 'company' : 'user'
      
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversation.id,
          sender_id: user.id,
          sender_type: senderType,
          message: message.trim(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Atualizar lista de mensagens
      setMessages(prev => [...prev, newMessage])

      // Atualizar última mensagem da conversa
      await supabase
        .from('conversations')
        .update({
          last_message: message.trim(),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentConversation.id)

      // Atualizar lista de conversas
      setConversations(prev =>
        prev.map(c =>
          c.id === currentConversation.id
            ? { ...c, last_message: message.trim(), last_message_at: new Date().toISOString() }
            : c
        )
      )

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }, [currentConversation, user])

  // ============================================
  // MARCAR MENSAGENS COMO LIDAS
  // ============================================
  const markMessagesAsRead = useCallback(async (conversationId, userId) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (error) throw error

      // Resetar contador de não lidas
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)

      // Atualizar contador total
      setUnreadTotal(prev => Math.max(0, prev - 1))

      return true
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
      return false
    }
  }, [])

  // ============================================
  // CARREGAR CONVERSAS AO LOGAR
  // ============================================
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // ============================================
  // SUBSCREVER A MENSAGENS EM TEMPO REAL
  // ============================================
  useEffect(() => {
    if (!currentConversation?.id) return

    const channel = supabase
      .channel(`chat-${currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${currentConversation.id}`
        },
        async (payload) => {
          const newMessage = payload.new
          
          // Adicionar mensagem à lista
          setMessages(prev => [...prev, newMessage])
          
          // Se a mensagem não for do usuário atual, marcar como lida
          if (newMessage.sender_id !== user?.id) {
            await markMessagesAsRead(currentConversation.id, user?.id)
            
            // Atualizar contador de não lidas na conversa
            setConversations(prev =>
              prev.map(c =>
                c.id === currentConversation.id
                  ? { ...c, unread_count: 0 }
                  : c
              )
            )
            
            toast.success('Nova mensagem!', { icon: '💬' })
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Status do chat ${currentConversation.id}:`, status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentConversation?.id, user?.id, markMessagesAsRead])

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    loadConversations,
    openConversation,
    sendChatMessage,
    setCurrentConversation,
    loadMessages,
    markMessagesAsRead
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat deve ser usado dentro de ChatProvider')
  }
  return context
}