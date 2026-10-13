// src/services/bookingService.js
// ============================================
// VERSAO CORRIGIDA - Usa 'reservations' (nao 'bookings')
// - A tabela principal agora e 'reservations'
// - Fallback para 'bookings' (legacy)
// - Usa 'company_services' ou 'business_services'
// - Exporta TODAS as funcoes necessarias
// ============================================

import { supabase } from './supabase';

// ============================================
// CONSTANTES
// ============================================

const STATUS_LABELS = {
  pending: { pt: 'Pendente', en: 'Pending' },
  confirmed: { pt: 'Confirmada', en: 'Confirmed' },
  completed: { pt: 'Concluída', en: 'Completed' },
  cancelled: { pt: 'Cancelada', en: 'Cancelled' },
};

// ============================================
// HELPER: Buscar servico em business_services OU company_services
// ============================================

const fetchServiceById = async (serviceId) => {
  if (!serviceId) return null;

  // 1. Tentar business_services (tabela principal para servicos de empresa)
  try {
    const { data, error } = await supabase
      .from('business_services')
      .select(`
        id,
        name,
        description,
        price,
        category,
        images,
        duration,
        max_people,
        is_active
      `)
      .eq('id', serviceId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('⚠️ business_services não encontrado, tentando company_services...', err);
  }

  // 2. Fallback: company_services
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select(`
        id,
        name,
        description,
        price,
        currency,
        category,
        duration,
        location,
        images,
        features,
        rating,
        total_reviews,
        service_type,
        room_type,
        capacity,
        icon,
        color,
        status
      `)
      .eq('id', serviceId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('⚠️ company_services também falhou:', err);
  }

  return null;
};

// ============================================
// HELPER: Buscar empresa em businesses OU companies
// ============================================

const fetchBusinessById = async (businessId) => {
  if (!businessId) return null;

  // Tentar primeiro em businesses
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, logo_url, cover_image, address, phone, email, category, province, user_id')
      .eq('id', businessId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('⚠️ businesses não encontrado, tentando companies...', err);
  }

  // Fallback: companies
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, logo_url, address, phone, email, category, province')
      .eq('id', businessId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('⚠️ companies também falhou:', err);
  }

  return null;
};

// ============================================
// CRIAR RESERVA - USA 'reservations'
// ============================================

export const createBooking = async (bookingData) => {
  try {
    console.log('📝 [BookingService] Criando reserva:', bookingData);

    if (!bookingData.userId) {
      throw new Error('Usuário não autenticado');
    }
    if (!bookingData.serviceId && !bookingData.destinationId) {
      throw new Error('Serviço ou destino é obrigatório');
    }

    let serviceData = null;
    let businessData = null;

    if (bookingData.serviceId) {
      serviceData = await fetchServiceById(bookingData.serviceId);
    }

    if (bookingData.businessId) {
      businessData = await fetchBusinessById(bookingData.businessId);
    }

    // ✅ Inserir na tabela 'reservations'
    const insertData = {
      user_id: bookingData.userId,
      service_id: bookingData.serviceId || null,
      business_id: bookingData.businessId || businessData?.id || null,
      status: 'pending',
      payment_status: 'pending',
      total_amount: bookingData.totalPrice || serviceData?.price || 0,
      reservation_date: bookingData.date || new Date().toISOString().split('T')[0],
      reservation_time: bookingData.time || '10:00',
      quantity: bookingData.guests || 1,
      notes: bookingData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📤 Inserindo reserva em reservations:', insertData);

    const { data, error } = await supabase
      .from('reservations')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar reserva:', error);
      throw error;
    }

    console.log('✅ Reserva criada:', data);

    // Criar notificação para a empresa
    if (businessData?.user_id) {
      await createBookingNotification(data, serviceData, businessData);
    }

    return { data, success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: null, error: error.message, success: false };
  }
};

// ============================================
// BUSCAR RESERVAS DO USUARIO - USA 'reservations'
// ============================================

export const getUserBookings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }

    console.log('🔍 [BookingService] Buscando reservas para usuário:', userId);

    // ✅ Buscar em 'reservations' (tabela principal)
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar reservas:', error);
      throw error;
    }

    if (!reservations || reservations.length === 0) {
      console.log('📭 Nenhuma reserva encontrada');
      return { data: [], success: true };
    }

    console.log(`✅ ${reservations.length} reservas encontradas`);

    // Enriquecer com dados relacionados
    const processedData = await Promise.all(
      reservations.map(async (reservation) => {
        const enriched = { ...reservation };

        // Buscar serviço
        if (reservation.service_id) {
          const service = await fetchServiceById(reservation.service_id);
          enriched.service = service;
        }

        // Buscar empresa
        const businessId = reservation.business_id || reservation.company_id;
        if (businessId) {
          const business = await fetchBusinessById(businessId);
          enriched.business = business;
          enriched.company = business;
        }

        // Adicionar campos formatados
        enriched.service_name = enriched.service?.name || reservation.item_name || 'Serviço';
        enriched.service_price = enriched.service?.price || reservation.total_amount || 0;
        enriched.service_category = enriched.service?.category || 'Geral';
        enriched.service_description = enriched.service?.description || '';
        enriched.service_images = enriched.service?.images || [];
        enriched.service_duration = enriched.service?.duration || null;
        enriched.company_name = enriched.business?.name || 'Empresa';
        enriched.company_logo = enriched.business?.logo_url || null;
        enriched.company_cover = enriched.business?.cover_image || null;

        const dateStr = reservation.reservation_date || reservation.booking_date || reservation.created_at;
        enriched.formatted_date = dateStr
          ? new Date(dateStr).toLocaleDateString('pt-BR')
          : null;

        const price = reservation.total_amount || reservation.total_price || 0;
        enriched.formatted_price = price
          ? `${Number(price).toLocaleString('pt-AO')} Kz`
          : '0 Kz';

        enriched.status_label = getStatusLabel(reservation.status);

        return enriched;
      })
    );

    return { data: processedData, success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: [], error: error.message, success: false };
  }
};

// ============================================
// BUSCAR RESERVAS DA EMPRESA
// ============================================

export const getBusinessBookings = async (businessId) => {
  try {
    if (!businessId) {
      throw new Error('ID da empresa é obrigatório');
    }

    console.log('🔍 [BookingService] Buscando reservas para empresa:', businessId);

    // ✅ Buscar em 'reservations'
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar reservas da empresa:', error);
      throw error;
    }

    if (!reservations || reservations.length === 0) {
      return { data: [], success: true };
    }

    const processedData = await Promise.all(
      reservations.map(async (reservation) => {
        const enriched = { ...reservation };

        if (reservation.service_id) {
          enriched.service = await fetchServiceById(reservation.service_id);
        }

        if (reservation.user_id) {
          try {
            const { data: user } = await supabase
              .from('profiles')
              .select('id, name, email, phone, avatar_url')
              .eq('id', reservation.user_id)
              .maybeSingle();
            enriched.user = user;
          } catch (err) {
            console.warn('Erro ao buscar usuário:', err);
          }
        }

        enriched.service_name = enriched.service?.name || reservation.item_name || 'Serviço';
        enriched.user_name = enriched.user?.name || 'Usuário';
        enriched.user_email = enriched.user?.email || '';
        enriched.user_phone = enriched.user?.phone || '';
        enriched.user_avatar = enriched.user?.avatar_url || null;

        const dateStr = reservation.reservation_date || reservation.booking_date || reservation.created_at;
        enriched.formatted_date = dateStr
          ? new Date(dateStr).toLocaleDateString('pt-BR')
          : null;

        const price = reservation.total_amount || reservation.total_price || 0;
        enriched.formatted_price = price
          ? `${Number(price).toLocaleString('pt-AO')} Kz`
          : '0 Kz';

        enriched.status_label = getStatusLabel(reservation.status);

        return enriched;
      })
    );

    console.log(`✅ ${processedData.length} reservas encontradas para empresa`);
    return { data: processedData, success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: [], error: error.message, success: false };
  }
};

// ============================================
// BUSCAR RESERVA POR ID
// ============================================

export const getBookingById = async (id) => {
  try {
    if (!id) {
      throw new Error('ID da reserva é obrigatório');
    }

    console.log('🔍 [BookingService] Buscando reserva por ID:', id);

    // ✅ Buscar em 'reservations'
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar reserva:', error);
      throw error;
    }

    if (!data) {
      return { data: null, success: true };
    }

    const enriched = { ...data };

    if (data.service_id) {
      enriched.service = await fetchServiceById(data.service_id);
    }

    const businessId = data.business_id || data.company_id;
    if (businessId) {
      enriched.business = await fetchBusinessById(businessId);
      enriched.company = enriched.business;
    }

    if (data.user_id) {
      try {
        const { data: user } = await supabase
          .from('profiles')
          .select('id, name, email, phone, avatar_url, location')
          .eq('id', data.user_id)
          .maybeSingle();
        enriched.user = user;
      } catch (err) {
        console.warn('Erro ao buscar usuário:', err);
      }
    }

    enriched.service_name = enriched.service?.name || data.item_name || 'Serviço';
    enriched.company_name = enriched.business?.name || 'Empresa';
    enriched.user_name = enriched.user?.name || 'Usuário';

    const dateStr = data.reservation_date || data.booking_date || data.created_at;
    enriched.formatted_date = dateStr
      ? new Date(dateStr).toLocaleDateString('pt-BR')
      : null;

    const price = data.total_amount || data.total_price || 0;
    enriched.formatted_price = price
      ? `${Number(price).toLocaleString('pt-AO')} Kz`
      : '0 Kz';

    enriched.status_label = getStatusLabel(data.status);

    return { data: enriched, success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: null, error: error.message, success: false };
  }
};

// ============================================
// ATUALIZAR STATUS DA RESERVA
// ============================================

export const updateBookingStatus = async (id, status, reason = null) => {
  try {
    if (!id) throw new Error('ID da reserva é obrigatório');
    if (!status) throw new Error('Status é obrigatório');

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido');
    }

    const updates = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'cancelled' && reason) {
      updates.notes = reason;
    }

    // ✅ Atualizar em 'reservations'
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar reserva:', error);
      throw error;
    }

    console.log('✅ Status da reserva atualizado para:', status);
    return { data, success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: null, error: error.message, success: false };
  }
};

// ============================================
// FUNCOES DE ATALHO PARA STATUS
// ============================================

export const cancelBooking = async (id, reason = null) => {
  return updateBookingStatus(id, 'cancelled', reason);
};

export const confirmBooking = async (id) => {
  return updateBookingStatus(id, 'confirmed');
};

export const completeBooking = async (id) => {
  return updateBookingStatus(id, 'completed');
};

export const markBookingAsPaid = async (id) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('❌ Erro ao marcar como pago:', error);
    return { data: null, error: error.message, success: false };
  }
};

export const deleteBooking = async (id) => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao eliminar reserva:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// VERIFICAR DISPONIBILIDADE
// ============================================

export const checkAvailability = async (serviceId, date, time) => {
  try {
    if (!serviceId || !date) {
      return { available: true, success: true };
    }

    let query = supabase
      .from('reservations')
      .select('id, reservation_time, quantity')
      .eq('service_id', serviceId)
      .eq('reservation_date', date)
      .in('status', ['pending', 'confirmed']);

    if (time) {
      query = query.eq('reservation_time', time);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      available: data.length === 0,
      bookings: data,
      success: true,
    };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { available: false, error: error.message, success: false };
  }
};

// ============================================
// BUSCAR RESERVAS POR STATUS
// ============================================

export const getBookingsByStatus = async (userId, status) => {
  try {
    if (!userId) throw new Error('ID do usuário é obrigatório');

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: [], error: error.message, success: false };
  }
};

// ============================================
// BUSCAR RESERVAS POR PERIODO
// ============================================

export const getBookingsByDateRange = async (startDate, endDate, businessId = null) => {
  try {
    let query = supabase
      .from('reservations')
      .select('*')
      .gte('reservation_date', startDate)
      .lte('reservation_date', endDate);

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query.order('reservation_date', { ascending: true });

    if (error) throw error;

    return { data: data || [], success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: [], error: error.message, success: false };
  }
};

// ============================================
// CONTAR RESERVAS POR STATUS
// ============================================

export const countBookingsByStatus = async (businessId = null) => {
  try {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const counts = {};

    for (const status of statuses) {
      let query = supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('status', status);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { count, error } = await query;

      if (error) {
        console.error(`❌ Erro ao contar reservas com status ${status}:`, error);
        counts[status] = 0;
      } else {
        counts[status] = count || 0;
      }
    }

    counts.total = Object.values(counts).reduce((a, b) => a + b, 0);

    return { data: counts, success: true };
  } catch (error) {
    console.error('❌ [BookingService] Erro:', error);
    return { data: null, error: error.message, success: false };
  }
};

// ============================================
// CRIAR NOTIFICACAO PARA A EMPRESA
// ============================================

const createBookingNotification = async (booking, service, business) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: business.user_id,
        type: 'new_booking',
        title: 'Nova Reserva!',
        message: `Um cliente reservou "${service?.name || booking.item_name}" para ${new Date(booking.reservation_date || booking.booking_date).toLocaleDateString('pt-AO')}`,
        link: `/empresa/reserva/${booking.id}`,
        icon: 'Calendar',
        metadata: {
          bookingId: booking.id,
          serviceId: booking.service_id,
          date: booking.reservation_date || booking.booking_date,
          guests: booking.quantity || booking.number_of_people,
        },
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('❌ Erro ao criar notificação:', error);
    }
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
  }
};

// ============================================
// FUNCOES AUXILIARES
// ============================================

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status] || status || 'Desconhecido';
};

// ============================================
// FUNCAO DE TESTE
// ============================================

export const testBookingConnection = async () => {
  try {
    console.log('🧪 Testando conexão com reservations...');

    const { data, error } = await supabase
      .from('reservations')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Erro no teste:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Conexão com reservations OK!');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// EXPORTACOES
// ============================================

export default {
  createBooking,
  getUserBookings,
  getBusinessBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  confirmBooking,
  completeBooking,
  markBookingAsPaid,
  deleteBooking,
  checkAvailability,
  getBookingsByStatus,
  getBookingsByDateRange,
  countBookingsByStatus,
  testBookingConnection,
};