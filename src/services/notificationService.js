import { supabase } from './supabase'

// ============================================
// TIPOS DE NOTIFICAÇO
// ============================================
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  NEW_REVIEW: 'new_review',
  NEW_FAVORITE: 'new_favorite',
  COMPANY_APPROVED: 'company_approved',
  COMPANY_REJECTED: 'company_rejected',
  SERVICE_APPROVED: 'service_approved',
  SERVICE_REJECTED: 'service_rejected',
  NEW_MESSAGE: 'new_message',
  REMINDER: 'reminder',
  PROMOTION: 'promotion',
}

// ============================================
// MAPEAMENTO DE ÍCONES (SEM EMOJIS)
// ============================================
export const NOTIFICATION_ICONS = {
  booking_confirmed: 'CheckCircle',
  booking_cancelled: 'XCircle',
  booking_completed: 'CalendarCheck',
  new_review: 'Star',
  new_favorite: 'Heart',
  company_approved: 'Building2',
  company_rejected: 'XCircle',
  service_approved: 'CheckCircle',
  service_rejected: 'XCircle',
  new_message: 'MessageCircle',
  reminder: 'Bell',
  promotion: 'Gift',
}

// ============================================
// CRIAR NOTIFICAÇO
// ============================================
export const createNotification = async (notificationData) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        link: notificationData.link || null,
        icon: notificationData.icon || NOTIFICATION_ICONS[notificationData.type] || 'Bell',
        metadata: notificationData.metadata || {},
        read: false,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
    throw error
  }
}

// ============================================
// BUSCAR NOTIFICAÇÕES DO USUÁRIO
// ============================================
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar notificações:', error)
    return []
  }
}

// ============================================
// MARCAR NOTIFICAÇO COMO LIDA
// ============================================
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
    return false
  }
}

// ============================================
// MARCAR TODAS COMO LIDAS
// ============================================
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error)
    return false
  }
}

// ============================================
// DELETAR NOTIFICAÇO
// ============================================
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar notificação:', error)
    return false
  }
}

// ============================================
// CONTAR NOTIFICAÇÕES NO LIDAS
// ============================================
export const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Erro ao contar notificações:', error)
    return 0
  }
}

// ============================================
// CRIAR NOTIFICAÇÕES PARA EVENTOS COMUNS
// ============================================
export const notifyBookingConfirmed = async (userId, bookingData) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
    title: 'Reserva Confirmada',
    message: `Sua reserva para "${bookingData.serviceName}" foi confirmada.`,
    link: `/reservas/${bookingData.id}`,
    metadata: { bookingId: bookingData.id },
  })
}

export const notifyBookingCancelled = async (userId, bookingData) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.BOOKING_CANCELLED,
    title: 'Reserva Cancelada',
    message: `Sua reserva para "${bookingData.serviceName}" foi cancelada.`,
    link: `/reservas/${bookingData.id}`,
    metadata: { bookingId: bookingData.id },
  })
}

export const notifyNewReview = async (userId, reviewData) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.NEW_REVIEW,
    title: 'Nova Avaliação',
    message: `${reviewData.userName} avaliou seu serviço "${reviewData.serviceName}" com ${reviewData.rating} estrelas.`,
    link: `/empresa/avaliacoes`,
    metadata: { reviewId: reviewData.id },
  })
}

export const notifyCompanyApproved = async (userId, companyData) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.COMPANY_APPROVED,
    title: 'Empresa Aprovada',
    message: `Sua empresa "${companyData.name}" foi aprovada.`,
    link: `/empresa/dashboard`,
    metadata: { companyId: companyData.id },
  })
}

export const notifyServiceApproved = async (userId, serviceData) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SERVICE_APPROVED,
    title: 'Serviço Aprovado',
    message: `Seu serviço "${serviceData.name}" foi aprovado.`,
    link: `/empresa/servicos`,
    metadata: { serviceId: serviceData.id },
  })
}

export const notifyNewMessage = async (userId, messageData) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    title: 'Nova Mensagem',
    message: `Você recebeu uma nova mensagem de ${messageData.fromName}.`,
    link: `/admin/chat`,
    metadata: { messageId: messageData.id },
  })
}