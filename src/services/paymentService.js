// src/services/paymentService.js

import { supabase } from './supabase'

// ============================================
// MÉTODOS DE PAGAMENTO
// ============================================

export const getPaymentMethods = async () => {
  return [
    { id: 'multicaixa', name: 'Multicaixa Express', icon: '🏦', description: 'Pagamento via Multicaixa Express' },
    { id: 'referencia', name: 'Referência Multicaixa', icon: '📄', description: 'Pagamento por referência Multicaixa' },
    { id: 'visa', name: 'Visa/Mastercard', icon: '💳', description: 'Cartão de crédito/débito' },
    { id: 'transfer', name: 'Transferência Bancária', icon: '🏛️', description: 'Transferência bancária' },
    { id: 'cash', name: 'Pagamento em Dinheiro', icon: '💰', description: 'Pagamento em dinheiro no local' },
  ]
}

// ============================================
// CONFIGURAÇO DE PAGAMENTO DA EMPRESA
// ============================================

export const getCompanyPaymentMethods = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error)
    return []
  }
}

export const savePaymentMethod = async (companyId, methodData) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{
        company_id: companyId,
        type: methodData.type,
        name: methodData.name,
        config: methodData.config || {},
        is_default: methodData.is_default || false,
        is_active: true,
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao salvar método de pagamento:', error)
    throw error
  }
}

export const updatePaymentMethod = async (methodId, updates) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', methodId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar método de pagamento:', error)
    throw error
  }
}

export const deletePaymentMethod = async (methodId) => {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: false })
      .eq('id', methodId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao remover método de pagamento:', error)
    throw error
  }
}

// ============================================
// TRANSAÇÕES
// ============================================

export const createTransaction = async (transactionData) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        booking_id: transactionData.bookingId,
        company_id: transactionData.companyId,
        user_id: transactionData.userId,
        service_id: transactionData.serviceId,
        amount: transactionData.amount,
        platform_fee: transactionData.platformFee || 0,
        company_amount: transactionData.companyAmount || 0,
        currency: transactionData.currency || 'Kz',
        payment_method: transactionData.paymentMethod,
        status: 'pending',
        payment_data: transactionData.paymentData || {},
        reference: transactionData.reference || `TX-${Date.now()}`,
        metadata: transactionData.metadata || {},
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    throw error
  }
}

export const updateTransactionStatus = async (transactionId, status, paymentId = null) => {
  try {
    const updates = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    if (paymentId) updates.payment_id = paymentId
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar transação:', error)
    throw error
  }
}

export const getCompanyTransactions = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        bookings:booking_id (id, booking_date_service, customer_name),
        profiles:user_id (name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return []
  }
}

export const getUserTransactions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        bookings:booking_id (id, booking_date_service, customer_name),
        company:company_id (id, name, logo)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return []
  }
}

export const getTransactionStats = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, platform_fee, company_amount, status')
      .eq('company_id', companyId)
      .eq('status', 'completed')
    
    if (error) throw error
    
    const total = data.reduce((acc, t) => acc + t.amount, 0)
    const fees = data.reduce((acc, t) => acc + t.platform_fee, 0)
    const earnings = data.reduce((acc, t) => acc + t.company_amount, 0)
    const count = data.length
    
    return { total, fees, earnings, count }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return { total: 0, fees: 0, earnings: 0, count: 0 }
  }
}

// ============================================
// PROCESSAMENTO DE PAGAMENTO COM DISTRIBUIÇO
// ============================================

export const processPayment = async ({ bookingId, paymentMethod, paymentData }) => {
  console.log('💰 Processando pagamento para reserva:', bookingId)
  
  try {
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()
    
    if (bookingError) {
      console.error('❌ Erro ao buscar reserva:', bookingError)
      throw new Error('Reserva não encontrada: ' + bookingError.message)
    }
    
    if (!booking) {
      console.error('❌ Reserva não encontrada para o ID:', bookingId)
      throw new Error('Reserva não encontrada')
    }
    
    console.log('📋 Reserva encontrada:', {
      id: booking.id,
      total: booking.total_price,
      company_id: booking.company_id,
      user_id: booking.user_id,
      service_id: booking.service_id,
      status: booking.status,
      payment_status: booking.payment_status
    })

    if (booking.payment_status === 'paid') {
      console.warn('⚠️ Reserva já foi paga:', bookingId)
      return {
        success: true,
        alreadyPaid: true,
        booking: booking,
        message: 'Esta reserva já foi paga'
      }
    }

    let company = null
    let companyUser = null
    if (booking.company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, user_id, email, phone')
        .eq('id', booking.company_id)
        .maybeSingle()
      
      if (!companyError && companyData) {
        company = companyData
        companyUser = companyData.user_id
        console.log('🏢 Empresa encontrada:', companyData.name)
      } else {
        console.warn('⚠️ Empresa não encontrada para ID:', booking.company_id)
      }
    }

    let service = null
    if (booking.service_id) {
      const { data: serviceData, error: serviceError } = await supabase
        .from('company_services')
        .select('id, name, price, currency, category')
        .eq('id', booking.service_id)
        .maybeSingle()
      
      if (!serviceError && serviceData) {
        service = serviceData
        console.log('📦 Serviço encontrado:', serviceData.name)
      } else {
        console.warn('⚠️ Serviço não encontrado para ID:', booking.service_id)
      }
    }

    const totalAmount = parseFloat(booking.total_price || booking.subtotal || 0)
    if (totalAmount <= 0) {
      throw new Error('Valor total inválido: ' + totalAmount)
    }
    
    const platformFee = totalAmount * 0.10
    const companyAmount = totalAmount * 0.90
    
    console.log('💰 Distribuição:', {
      total: totalAmount,
      platformFee: platformFee,
      companyAmount: companyAmount,
      platformPercent: '10%',
      companyPercent: '90%'
    })

    const paymentResult = await processPaymentGateway({
      amount: totalAmount,
      currency: booking.currency || 'Kz',
      method: paymentMethod,
      data: paymentData
    })

    if (!paymentResult.success) {
      throw new Error(paymentResult.message || 'Erro no processamento do pagamento')
    }

    console.log('✅ Pagamento processado no gateway:', paymentResult.paymentId)

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_method: paymentMethod,
        payment_id: paymentResult.paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar reserva:', updateError)
      throw updateError
    }

    console.log('✅ Reserva atualizada:', updatedBooking.id)

    let transaction = null
    try {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([{
          booking_id: bookingId,
          user_id: booking.user_id,
          company_id: booking.company_id,
          service_id: booking.service_id,
          amount: totalAmount,
          platform_fee: platformFee,
          company_amount: companyAmount,
          payment_method: paymentMethod,
          payment_data: paymentData || {},
          payment_id: paymentResult.paymentId,
          status: 'completed',
          currency: booking.currency || 'Kz',
          reference: `PAY-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (txError) {
        console.warn('⚠️ Erro ao criar transação:', txError)
      } else {
        transaction = txData
        console.log('✅ Transação criada:', transaction.id)
      }
    } catch (txError) {
      console.warn('⚠️ Erro ao criar transação (catch):', txError)
    }

    if (company && company.id) {
      try {
        await updateCompanyBalance(booking.company_id, companyAmount)
      } catch (balanceError) {
        console.warn('⚠️ Erro ao atualizar saldo:', balanceError)
      }
    }

    try {
      await createPaymentNotifications(booking, { 
        platformFee, 
        companyAmount,
        totalAmount,
        paymentMethod,
        companyName: company?.name || 'Empresa',
        bookingId: booking.id
      })
    } catch (notifError) {
      console.warn('⚠️ Erro ao criar notificações:', notifError)
    }

    return {
      success: true,
      booking: updatedBooking,
      transaction: transaction,
      distribution: {
        total: totalAmount,
        platformFee: platformFee,
        companyAmount: companyAmount,
        platformPercent: 10,
        companyPercent: 90
      },
      payment: paymentResult
    }

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error)
    return {
      success: false,
      error: error.message || 'Erro ao processar pagamento',
      code: error.code || 'PROCESSING_ERROR'
    }
  }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const processPaymentGateway = async ({ amount, currency, method, data }) => {
  console.log('🔌 Processando com gateway:', { amount, currency, method })
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() < 0.95
      
      if (success) {
        resolve({
          success: true,
          paymentId: `PAY-${Date.now()}`,
          transactionId: `TXN-${Date.now()}`,
          message: 'Pagamento processado com sucesso!',
          timestamp: new Date().toISOString()
        })
      } else {
        resolve({
          success: false,
          message: 'Erro ao processar pagamento. Tente novamente.',
          errorCode: 'PAYMENT_ERROR'
        })
      }
    }, 1500)
  })
}

const updateCompanyBalance = async (companyId, amount) => {
  try {
    console.log('💰 Atualizando saldo da empresa:', { companyId, amount })
    
    const { data: existing, error: checkError } = await supabase
      .from('company_balance')
      .select('id, balance, total_earned')
      .eq('company_id', companyId)
      .maybeSingle()
    
    if (checkError) {
      if (checkError.code === '42P01') {
        console.log('ℹ️ Tabela company_balance não existe, pulando atualização')
        return
      }
      console.warn('⚠️ Erro ao verificar saldo:', checkError)
      return
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('company_balance')
        .update({
          balance: parseFloat(existing.balance || 0) + amount,
          total_earned: parseFloat(existing.total_earned || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
      
      if (updateError) {
        console.warn('⚠️ Erro ao atualizar saldo:', updateError)
      } else {
        console.log('💰 Saldo da empresa atualizado:', {
          previous: existing.balance,
          added: amount,
          new: parseFloat(existing.balance || 0) + amount
        })
      }
    } else {
      const { error: insertError } = await supabase
        .from('company_balance')
        .insert([{
          company_id: companyId,
          balance: amount,
          total_earned: amount,
          pending_balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      
      if (insertError) {
        console.warn('⚠️ Erro ao criar saldo:', insertError)
      } else {
        console.log('💰 Saldo da empresa criado:', amount)
      }
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar saldo:', error)
  }
}

// ============================================
// NOTIFICAÇÕES - CORRIGIDAS COM LINKS CORRETOS
// ============================================

const createPaymentNotifications = async (booking, distribution) => {
  try {
    const { platformFee, companyAmount, totalAmount, paymentMethod, companyName, bookingId } = distribution
    
    // Buscar o user_id da empresa
    let companyUser = null
    if (booking.company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('user_id, name')
        .eq('id', booking.company_id)
        .maybeSingle()
      
      if (!companyError && companyData) {
        companyUser = companyData.user_id
      }
    }

    // 1. NOTIFICAÇO PARA O USUÁRIO
    // Link: /minhas-reservas/{bookingId}
    const { error: userNotifError } = await supabase
      .from('notifications')
      .insert([{
        user_id: booking.user_id,
        type: 'payment_received',
        title: 'Pagamento Confirmado! ✅',
        message: `Seu pagamento de ${totalAmount} ${booking.currency || 'Kz'} foi confirmado via ${paymentMethod}. Sua reserva está garantida!`,
        link: `/minhas-reservas/${bookingId || booking.id}`,
        icon: 'DollarSign',
        created_at: new Date().toISOString()
      }])
    
    if (userNotifError) {
      console.warn('⚠️ Erro ao criar notificação para usuário:', userNotifError)
    }

    // 2. NOTIFICAÇO PARA A EMPRESA
    // Link: /empresa/reservas/{bookingId}
    if (companyUser) {
      const { error: companyNotifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: companyUser,
          type: 'payment_received',
          title: 'Pagamento Recebido! 💰',
          message: `Recebeu ${companyAmount} ${booking.currency || 'Kz'} (90% da reserva) de ${booking.customer_name || 'cliente'} para o serviço ${booking.service_name || ''}.`,
          link: `/empresa/reservas/${bookingId || booking.id}`,
          icon: 'DollarSign',
          created_at: new Date().toISOString()
        }])
      
      if (companyNotifError) {
        console.warn('⚠️ Erro ao criar notificação para empresa:', companyNotifError)
      }
    }

    // 3. NOTIFICAÇO PARA O ADMIN
    // Link: /admin/transacoes
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (!adminError && adminUsers && adminUsers.length > 0) {
      const { error: adminNotifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: adminUsers[0].id,
          type: 'payment_received',
          title: 'Taxa da Plataforma Recebida! 📊',
          message: `Taxa de ${platformFee} ${booking.currency || 'Kz'} (10%) recebida da reserva #${(bookingId || booking.id).slice(0, 8)}.`,
          link: `/admin/transacoes`,
          icon: 'DollarSign',
          created_at: new Date().toISOString()
        }])
      
      if (adminNotifError) {
        console.warn('⚠️ Erro ao criar notificação para admin:', adminNotifError)
      }
    }

    console.log('📬 Notificações criadas com sucesso')
  } catch (error) {
    console.error('❌ Erro ao criar notificações:', error)
  }
}

// ============================================
// MÉTODOS DE PAGAMENTO DISPONÍVEIS
// ============================================

export const PAYMENT_METHODS = [
  {
    id: 'multicaixa',
    name: 'Multicaixa Express',
    icon: '🏦',
    description: 'Pagamento via Multicaixa Express (código enviado por SMS)',
    fields: [
      { name: 'phone', label: 'Número de Telefone', type: 'tel', placeholder: '+244 923 456 789', required: true },
      { name: 'provider', label: 'Operadora', type: 'select', options: [
        { value: 'unitel', label: 'Unitel' },
        { value: 'movicel', label: 'Movicel' },
        { value: 'africell', label: 'Africell' }
      ], required: true },
    ],
  },
  {
    id: 'referencia',
    name: 'Referência Multicaixa',
    icon: '📄',
    description: 'Pagamento por referência Multicaixa (gerada automaticamente)',
    fields: [
      { name: 'phone', label: 'Número de Telefone', type: 'tel', placeholder: '+244 923 456 789', required: true },
    ],
  },
  {
    id: 'visa',
    name: 'Cartão de Crédito/Débito',
    icon: '💳',
    description: 'Visa/Mastercard (processado com segurança)',
    fields: [
      { name: 'cardNumber', label: 'Número do Cartão', type: 'text', placeholder: '**** **** **** ****', required: true },
      { name: 'expiry', label: 'Validade', type: 'text', placeholder: 'MM/AA', required: true },
      { name: 'cvv', label: 'CVV', type: 'password', placeholder: '***', required: true },
      { name: 'name', label: 'Nome no Cartão', type: 'text', placeholder: 'Como está no cartão', required: true },
    ],
  },
  {
    id: 'transfer',
    name: 'Transferência Bancária',
    icon: '🏛️',
    description: 'Transferência bancária (dados enviados por email)',
    fields: [
      { name: 'bank', label: 'Banco', type: 'text', placeholder: 'Nome do banco', required: true },
      { name: 'account', label: 'Número da Conta', type: 'text', placeholder: 'Conta bancária', required: true },
      { name: 'holder', label: 'Titular da Conta', type: 'text', placeholder: 'Nome do titular', required: true },
    ],
  },
  {
    id: 'cash',
    name: 'Pagamento em Dinheiro',
    icon: '💰',
    description: 'Pagamento em dinheiro no local do serviço',
    fields: [],
  },
]

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  getPaymentMethods,
  getCompanyPaymentMethods,
  savePaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  createTransaction,
  updateTransactionStatus,
  getCompanyTransactions,
  getUserTransactions,
  getTransactionStats,
  processPayment,
  PAYMENT_METHODS
}