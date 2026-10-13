// src/services/supportService.js
// ============================================
// SERVIÇO DE APOIO AO CLIENTE
// ============================================

import { supabase } from './supabase';

// ============================================
// CONSTANTES
// ============================================
export const SUPPORT_CATEGORIES = [
  { value: 'technical', labelPt: 'Problema Técnico', labelEn: 'Technical Issue', icon: '🔧' },
  { value: 'payment', labelPt: 'Pagamento', labelEn: 'Payment', icon: '💳' },
  { value: 'booking', labelPt: 'Reserva', labelEn: 'Booking', icon: '📅' },
  { value: 'account', labelPt: 'Conta', labelEn: 'Account', icon: '👤' },
  { value: 'company', labelPt: 'Empresa/Serviço', labelEn: 'Company/Service', icon: '🏢' },
  { value: 'suggestion', labelPt: 'Sugestão', labelEn: 'Suggestion', icon: '💡' },
  { value: 'complaint', labelPt: 'Reclamação', labelEn: 'Complaint', icon: '⚠️' },
  { value: 'other', labelPt: 'Outro', labelEn: 'Other', icon: '📝' },
];

export const TICKET_STATUS = {
  open: { pt: 'Aberto', en: 'Open', color: 'yellow', bg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', icon: '🟡' },
  in_progress: { pt: 'Em Progresso', en: 'In Progress', color: 'blue', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: '🔵' },
  resolved: { pt: 'Resolvido', en: 'Resolved', color: 'green', bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: '🟢' },
  closed: { pt: 'Fechado', en: 'Closed', color: 'gray', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: '⚫' },
};

export const TICKET_PRIORITY = {
  low: { pt: 'Baixa', en: 'Low', color: 'gray', bg: 'bg-gray-100 text-gray-700' },
  normal: { pt: 'Normal', en: 'Normal', color: 'blue', bg: 'bg-blue-100 text-blue-700' },
  high: { pt: 'Alta', en: 'High', color: 'orange', bg: 'bg-orange-100 text-orange-700' },
  urgent: { pt: 'Urgente', en: 'Urgent', color: 'red', bg: 'bg-red-100 text-red-700' },
};

// ============================================
// CRIAR TICKET
// ============================================
export const createTicket = async (data, userId) => {
  try {
    if (!userId) throw new Error('Não autenticado');
    if (!data.subject?.trim()) throw new Error('Assunto obrigatório');
    if (!data.message?.trim()) throw new Error('Mensagem obrigatória');

    console.log('📝 [Support] Criando ticket...');

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert([{
        user_id: userId,
        subject: data.subject.trim(),
        category: data.category || 'other',
        priority: data.priority || 'normal',
        status: 'open',
      }])
      .select()
      .single();

    if (ticketError) throw ticketError;

    const { error: messageError } = await supabase
      .from('support_messages')
      .insert([{
        ticket_id: ticket.id,
        sender_id: userId,
        sender_role: 'user',
        message: data.message.trim(),
      }]);

    if (messageError) throw messageError;

    console.log('✅ [Support] Ticket criado:', ticket.id);
    return { success: true, data: ticket };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// LISTAR TICKETS DO UTILIZADOR
// ============================================
export const getUserTickets = async (userId) => {
  try {
    if (!userId) return { success: true, data: [] };

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    if (!tickets || tickets.length === 0) return { success: true, data: [] };

    const ticketIds = tickets.map(t => t.id);
    const { data: unreadCounts } = await supabase
      .from('support_messages')
      .select('ticket_id, sender_role')
      .in('ticket_id', ticketIds)
      .eq('is_read', false)
      .neq('sender_role', 'user');

    const unreadMap = (unreadCounts || []).reduce((acc, m) => {
      acc[m.ticket_id] = (acc[m.ticket_id] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: tickets.map(t => ({ ...t, unread_count: unreadMap[t.id] || 0 })),
    };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================
// LISTAR TODOS OS TICKETS (ADMIN)
// ============================================
export const getAllTickets = async (filters = {}) => {
  try {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.priority) query = query.eq('priority', filters.priority);

    const { data: tickets, error } = await query;
    if (error) throw error;
    if (!tickets || tickets.length === 0) return { success: true, data: [] };

    const userIds = [...new Set(tickets.map(t => t.user_id).filter(Boolean))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, role')
      .in('id', userIds);

    const userMap = (profiles || []).reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    const ticketIds = tickets.map(t => t.id);
    const { data: unreadCounts } = await supabase
      .from('support_messages')
      .select('ticket_id, sender_role')
      .in('ticket_id', ticketIds)
      .eq('is_read', false)
      .eq('sender_role', 'user');

    const unreadMap = (unreadCounts || []).reduce((acc, m) => {
      acc[m.ticket_id] = (acc[m.ticket_id] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: tickets.map(t => ({
        ...t,
        user: userMap[t.user_id] || null,
        unread_count: unreadMap[t.id] || 0,
      })),
    };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================
// BUSCAR TICKET POR ID
// ============================================
export const getTicketById = async (ticketId) => {
  try {
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (error) throw error;
    if (!ticket) return { success: true, data: null };

    const { data: user } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, role')
      .eq('id', ticket.user_id)
      .maybeSingle();

    ticket.user = user;

    const { data: messages } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (messages && messages.length > 0) {
      const senderIds = [...new Set(messages.map(m => m.sender_id).filter(Boolean))];
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role')
        .in('id', senderIds);

      const senderMap = (senders || []).reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      ticket.messages = messages.map(m => ({
        ...m,
        sender: senderMap[m.sender_id] || null,
      }));
    } else {
      ticket.messages = [];
    }

    return { success: true, data: ticket };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ENVIAR MENSAGEM
// ============================================
export const sendMessage = async (ticketId, senderId, senderRole, message) => {
  try {
    if (!message?.trim()) throw new Error('Mensagem vazia');

    const { data, error } = await supabase
      .from('support_messages')
      .insert([{
        ticket_id: ticketId,
        sender_id: senderId,
        sender_role: senderRole,
        message: message.trim(),
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('support_tickets')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: senderRole === 'admin' ? 'in_progress' : undefined,
      })
      .eq('id', ticketId);

    const { data: sender } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, role')
      .eq('id', senderId)
      .maybeSingle();

    return { success: true, data: { ...data, sender } };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ATUALIZAR ESTADO
// ============================================
export const updateTicketStatus = async (ticketId, status, userId) => {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'closed') {
      updates.closed_at = new Date().toISOString();
      updates.closed_by = userId;
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// MARCAR COMO LIDAS
// ============================================
export const markMessagesAsRead = async (ticketId, role) => {
  try {
    const senderRoleToMark = role === 'admin' ? 'user' : 'admin';

    const { error } = await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('sender_role', senderRoleToMark)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ESTATÍSTICAS (ADMIN)
// ============================================
export const getSupportStats = async () => {
  try {
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('status');

    const stats = {
      total: tickets?.length || 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    (tickets || []).forEach(t => {
      if (stats[t.status] !== undefined) stats[t.status]++;
    });

    const { count: unreadCount } = await supabase
      .from('support_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .eq('sender_role', 'user');

    stats.unread = unreadCount || 0;

    return { success: true, data: stats };
  } catch (error) {
    console.error('❌ [Support] Erro:', error);
    return { success: false, error: error.message };
  }
};

// Export default
export default {
  SUPPORT_CATEGORIES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicketById,
  sendMessage,
  updateTicketStatus,
  markMessagesAsRead,
  getSupportStats,
};