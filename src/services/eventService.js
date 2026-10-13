// src/services/eventService.js

import { supabase } from './supabase';

// ============================================
// EVENTOS
// ============================================

// Buscar todos os eventos (admin - todos os status)
export const getAllEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar todos os eventos:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar todos os eventos ativos (público)
export const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('date', { ascending: true });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar eventos em destaque
export const getFeaturedEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('date', { ascending: true })
      .limit(6);

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar eventos em destaque:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar evento por ID
export const getEventById = async (id) => {
  try {
    if (!id) throw new Error('ID do evento é obrigatório');

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar evento:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Criar evento (admin) - COM INGRESSOS E PERSONALIZAÇO
export const createEvent = async (eventData) => {
  try {
    if (!eventData.title) throw new Error('Título é obrigatório');
    if (!eventData.date) throw new Error('Data é obrigatória');

    const { tickets, ...eventInfo } = eventData;

    // 1. Criar o evento com todos os campos incluindo personalização
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        title: eventInfo.title,
        description: eventInfo.description || '',
        image_url: eventInfo.image_url || null,
        banner_url: eventInfo.banner_url || null,
        date: eventInfo.date,
        location: eventInfo.location || '',
        address: eventInfo.address || '',
        category: eventInfo.category || '',
        organizer: eventInfo.organizer || '',
        organizer_logo: eventInfo.organizer_logo || null,
        organizer_website: eventInfo.organizer_website || null,
        organizer_phone: eventInfo.organizer_phone || null,
        organizer_email: eventInfo.organizer_email || null,
        ticket_color: eventInfo.ticket_color || '#7c3aed',
        status: eventInfo.status || 'active',
        featured: eventInfo.featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (eventError) throw eventError;

    // 2. Criar os ingressos se existirem
    if (tickets && tickets.length > 0) {
      const ticketsWithEventId = tickets.map(ticket => ({
        event_id: event.id,
        name: ticket.name,
        description: ticket.description || '',
        price: ticket.price,
        quantity: ticket.quantity || 0,
        sold: 0,
        benefits: ticket.benefits || [],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: ticketsError } = await supabase
        .from('event_tickets')
        .insert(ticketsWithEventId);

      if (ticketsError) {
        console.error('❌ Erro ao criar ingressos:', ticketsError);
      }
    }

    return { data: event, success: true };
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Atualizar evento (admin) - COM INGRESSOS E PERSONALIZAÇO
export const updateEvent = async (id, updates) => {
  try {
    if (!id) throw new Error('ID do evento é obrigatório');

    const { tickets, ...eventInfo } = updates;

    // 1. Atualizar o evento com todos os campos
    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({
        title: eventInfo.title,
        description: eventInfo.description || '',
        image_url: eventInfo.image_url || null,
        banner_url: eventInfo.banner_url || null,
        date: eventInfo.date,
        location: eventInfo.location || '',
        address: eventInfo.address || '',
        category: eventInfo.category || '',
        organizer: eventInfo.organizer || '',
        organizer_logo: eventInfo.organizer_logo || null,
        organizer_website: eventInfo.organizer_website || null,
        organizer_phone: eventInfo.organizer_phone || null,
        organizer_email: eventInfo.organizer_email || null,
        ticket_color: eventInfo.ticket_color || '#7c3aed',
        status: eventInfo.status || 'active',
        featured: eventInfo.featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (eventError) throw eventError;

    // 2. Atualizar ingressos se fornecidos
    if (tickets !== undefined) {
      // Remover ingressos antigos (apenas os que não têm compras)
      const { data: existingTickets } = await supabase
        .from('event_tickets')
        .select('id, sold')
        .eq('event_id', id);

      // Remover apenas ingressos sem vendas
      const ticketsToDelete = existingTickets?.filter(t => t.sold === 0) || [];
      if (ticketsToDelete.length > 0) {
        const idsToDelete = ticketsToDelete.map(t => t.id);
        await supabase
          .from('event_tickets')
          .delete()
          .in('id', idsToDelete);
      }

      // Criar novos ingressos
      if (tickets.length > 0) {
        const ticketsWithEventId = tickets.map(ticket => ({
          event_id: id,
          name: ticket.name,
          description: ticket.description || '',
          price: ticket.price,
          quantity: ticket.quantity || 0,
          sold: 0,
          benefits: ticket.benefits || [],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const { error: ticketsError } = await supabase
          .from('event_tickets')
          .insert(ticketsWithEventId);

        if (ticketsError) {
          console.error('❌ Erro ao criar ingressos:', ticketsError);
        }
      }
    }

    return { data: event, success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Remover evento (admin)
export const deleteEvent = async (id) => {
  try {
    if (!id) throw new Error('ID do evento é obrigatório');

    const { error } = await supabase
      .from('events')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao remover evento:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// INGRESSOS
// ============================================

// Buscar ingressos de um evento
export const getEventTickets = async (eventId) => {
  try {
    if (!eventId) throw new Error('ID do evento é obrigatório');

    const { data, error } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'active')
      .order('price', { ascending: true });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar ingressos:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar ingresso por ID
export const getTicketById = async (id) => {
  try {
    if (!id) throw new Error('ID do ingresso é obrigatório');

    const { data, error } = await supabase
      .from('event_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar ingresso:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Criar ingresso (admin)
export const createTicket = async (ticketData) => {
  try {
    if (!ticketData.event_id) throw new Error('Evento é obrigatório');
    if (!ticketData.name) throw new Error('Nome do ingresso é obrigatório');
    if (!ticketData.price) throw new Error('Preço é obrigatório');

    const { data, error } = await supabase
      .from('event_tickets')
      .insert([{
        event_id: ticketData.event_id,
        name: ticketData.name,
        description: ticketData.description || '',
        price: ticketData.price,
        quantity: ticketData.quantity || 0,
        sold: 0,
        benefits: ticketData.benefits || [],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao criar ingresso:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Atualizar ingresso (admin)
export const updateTicket = async (id, updates) => {
  try {
    if (!id) throw new Error('ID do ingresso é obrigatório');

    const { data, error } = await supabase
      .from('event_tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar ingresso:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Remover ingresso (admin)
export const deleteTicket = async (id) => {
  try {
    if (!id) throw new Error('ID do ingresso é obrigatório');

    // Verificar se há vendas
    const { data: ticket, error: ticketError } = await supabase
      .from('event_tickets')
      .select('sold')
      .eq('id', id)
      .single();

    if (ticketError) throw ticketError;

    if (ticket.sold > 0) {
      throw new Error('Não é possível remover um ingresso que já foi vendido');
    }

    const { error } = await supabase
      .from('event_tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao remover ingresso:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// COMPRAS
// ============================================

// Comprar ingresso
export const purchaseTicket = async (purchaseData) => {
  try {
    if (!purchaseData.user_id) throw new Error('Usuário é obrigatório');
    if (!purchaseData.event_id) throw new Error('Evento é obrigatório');
    if (!purchaseData.ticket_id) throw new Error('Ingresso é obrigatório');
    if (!purchaseData.quantity || purchaseData.quantity < 1) {
      throw new Error('Quantidade deve ser pelo menos 1');
    }

    // Buscar informações do ingresso
    const { data: ticket, error: ticketError } = await supabase
      .from('event_tickets')
      .select('name, price, quantity, sold')
      .eq('id', purchaseData.ticket_id)
      .single();

    if (ticketError) throw ticketError;

    // Verificar disponibilidade
    if (ticket.quantity > 0 && (ticket.quantity - (ticket.sold || 0)) < purchaseData.quantity) {
      throw new Error('Ingressos insuficientes disponíveis');
    }

    const totalPrice = ticket.price * purchaseData.quantity;

    // Criar compra
    const { data, error } = await supabase
      .from('event_purchases')
      .insert([{
        user_id: purchaseData.user_id,
        event_id: purchaseData.event_id,
        ticket_id: purchaseData.ticket_id,
        ticket_name: ticket.name,
        quantity: purchaseData.quantity,
        unit_price: ticket.price,
        total_price: totalPrice,
        payment_method: purchaseData.payment_method || 'pending',
        payment_status: 'pending',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Atualizar ingressos vendidos
    const { error: updateError } = await supabase
      .from('event_tickets')
      .update({ 
        sold: (ticket.sold || 0) + purchaseData.quantity 
      })
      .eq('id', purchaseData.ticket_id);

    if (updateError) {
      console.error('❌ Erro ao atualizar ingressos vendidos:', updateError);
    }

    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao comprar ingresso:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Buscar compras do usuário
export const getUserPurchases = async (userId) => {
  try {
    if (!userId) throw new Error('ID do usuário é obrigatório');

    const { data, error } = await supabase
      .from('event_purchases')
      .select(`
        *,
        event:event_id (
          id,
          title,
          image_url,
          date,
          location,
          organizer,
          organizer_logo,
          ticket_color
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar compras:', error);
    return { data: [], error: error.message, success: false };
  }
};

// Buscar compra por ID (completa)
export const getPurchaseById = async (id) => {
  try {
    if (!id) throw new Error('ID da compra é obrigatório');

    const { data, error } = await supabase
      .from('event_purchases')
      .select(`
        *,
        event:event_id (
          id,
          title,
          image_url,
          banner_url,
          date,
          location,
          address,
          organizer,
          organizer_logo,
          organizer_website,
          organizer_phone,
          organizer_email,
          ticket_color,
          category,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar compra:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Atualizar status da compra
export const updatePurchaseStatus = async (id, status, paymentStatus = null) => {
  try {
    if (!id) throw new Error('ID da compra é obrigatório');

    const updates = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    if (status === 'confirmed' || status === 'paid') {
      updates.payment_status = 'paid';
    }

    if (status === 'cancelled') {
      // Reverter ingressos vendidos
      const { data: purchase, error: purchaseError } = await supabase
        .from('event_purchases')
        .select('ticket_id, quantity')
        .eq('id', id)
        .single();

      if (!purchaseError && purchase) {
        const { data: ticket } = await supabase
          .from('event_tickets')
          .select('sold')
          .eq('id', purchase.ticket_id)
          .single();

        if (ticket) {
          await supabase
            .from('event_tickets')
            .update({ 
              sold: Math.max(0, (ticket.sold || 0) - purchase.quantity) 
            })
            .eq('id', purchase.ticket_id);
        }
      }
    }

    const { data, error } = await supabase
      .from('event_purchases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar compra:', error);
    return { data: null, error: error.message, success: false };
  }
};

// Buscar todas as compras (admin)
export const getAllPurchases = async () => {
  try {
    const { data, error } = await supabase
      .from('event_purchases')
      .select(`
        *,
        event:event_id (
          id,
          title,
          organizer
        ),
        profile:user_id (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ Erro ao buscar todas as compras:', error);
    return { data: [], error: error.message, success: false };
  }
};

// ============================================
// LIKES
// ============================================

// Verificar se usuário curtiu evento
export const checkUserLike = async (userId, eventId) => {
  try {
    if (!userId || !eventId) return false;

    const { data, error } = await supabase
      .from('event_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('❌ Erro ao verificar like:', error);
    return false;
  }
};

// Curtir/Descurtir evento
export const toggleLike = async (userId, eventId) => {
  try {
    if (!userId || !eventId) throw new Error('Usuário e evento são obrigatórios');

    const isLiked = await checkUserLike(userId, eventId);

    if (isLiked) {
      // Remover like
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (error) throw error;

      // Decrementar contador
      await supabase.rpc('decrement_event_likes', { event_id: eventId });

      return { liked: false, success: true };
    } else {
      // Adicionar like
      const { error } = await supabase
        .from('event_likes')
        .insert({
          user_id: userId,
          event_id: eventId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Incrementar contador
      await supabase.rpc('increment_event_likes', { event_id: eventId });

      return { liked: true, success: true };
    }
  } catch (error) {
    console.error('❌ Erro ao curtir:', error);
    return { liked: false, success: false, error: error.message };
  }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Formatar data para exibição
export const formatEventDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formatar preço
export const formatEventPrice = (price) => {
  if (!price) return '0 Kz';
  return price.toLocaleString() + ' Kz';
};

// Verificar se evento está disponível
export const isEventAvailable = (event) => {
  if (!event) return false;
  if (event.status !== 'active') return false;
  
  const eventDate = new Date(event.date);
  const now = new Date();
  
  // Evento pode ser visualizado mesmo após a data
  return true;
};

// Obter disponibilidade de ingressos
export const getTicketsAvailability = (tickets) => {
  if (!tickets || tickets.length === 0) {
    return { total: 0, available: 0, sold: 0 };
  }

  const total = tickets.reduce((sum, t) => sum + t.quantity, 0);
  const sold = tickets.reduce((sum, t) => sum + (t.sold || 0), 0);
  const available = total - sold;

  return { total, available, sold };
};

// Gerar código QR (dados para o QR)
export const generateQRData = (purchase, event, user) => {
  return JSON.stringify({
    ticket_id: purchase?.id,
    event: event?.title,
    holder: user?.name || user?.email || 'Anonymous',
    organizer: event?.organizer || 'RAVTUR',
    date: event?.date,
    ticket: purchase?.ticket_name,
    quantity: purchase?.quantity,
    total: purchase?.total_price,
    verified: false
  });
};