// src/services/chatService.js

import { supabase } from './supabase'

// ============================================
// CRIAR OU OBTER CONVERSA
// ============================================
export const getOrCreateConversation = async (userId, companyId) => {
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

    if (existing) {
      return existing
    }

    // Criar nova conversa
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        company_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar/obter conversa:', error)
    throw error
  }
}

// ============================================
// ENVIAR MENSAGEM
// ============================================
export const sendMessage = async (conversationId, senderId, senderType, message) => {
  try {
    // Inserir mensagem
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        message: message.trim(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Atualizar última mensagem da conversa
    await supabase
      .from('conversations')
      .update({
        last_message: message.trim(),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    return data
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    throw error
  }
}

// ============================================
// BUSCAR MENSAGENS DA CONVERSA
// ============================================
export const getMessages = async (conversationId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return []
  }
}

// ============================================
// BUSCAR CONVERSAS DO USUÁRIO
// ============================================
export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
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
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar conversas do usuário:', error)
    return []
  }
}

// ============================================
// BUSCAR CONVERSAS DA EMPRESA
// ============================================
export const getCompanyConversations = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('company_id', companyId)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar conversas da empresa:', error)
    return []
  }
}

// ============================================
// MARCAR MENSAGENS COMO LIDAS
// ============================================
export const markMessagesAsRead = async (conversationId, userId) => {
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

    return true
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error)
    return false
  }
}

// ============================================
// INCREMENTAR CONTADOR DE NO LIDAS
// ============================================
export const incrementUnreadCount = async (conversationId) => {
  try {
    // Buscar contador atual
    const { data, error } = await supabase
      .from('conversations')
      .select('unread_count')
      .eq('id', conversationId)
      .single()

    if (error) throw error

    const currentCount = data?.unread_count || 0

    // Atualizar contador
    await supabase
      .from('conversations')
      .update({ 
        unread_count: currentCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    return true
  } catch (error) {
    console.error('Erro ao incrementar contador:', error)
    return false
  }
}

// ============================================
// SUBSCRIÇO EM TEMPO REAL
// ============================================
export const subscribeToMessages = (conversationId, onNewMessage) => {
  const channel = supabase
    .channel(`chat-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('📨 Nova mensagem em tempo real:', payload)
        if (onNewMessage) {
          onNewMessage(payload.new)
        }
      }
    )
    .subscribe((status) => {
      console.log(`📡 Status do chat ${conversationId}:`, status)
    })

  return channel
}

// ============================================
// SUBSCRIÇO PARA NOVAS CONVERSAS
// ============================================
export const subscribeToNewConversations = (userId, onNewConversation) => {
  const channel = supabase
    .channel(`user-conversations-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('💬 Nova conversa criada:', payload)
        if (onNewConversation) {
          onNewConversation(payload.new)
        }
      }
    )
    .subscribe()

  return channel
}