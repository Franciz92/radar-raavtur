// src/services/adminService.js
// ============================================
// SERVICO DE ADMINISTRACAO - CORRIGIDO
// - Usa 'businesses' (onde estao as empresas)
// - Usa 'is_verified' (nao 'status')
// - Usa 'is_active' quando necessario
// ============================================

import { supabase } from './supabase'

// ============================================
// DASHBOARD STATS - CORRIGIDO
// ============================================

export const getAdminStats = async () => {
  try {
    console.log('🔄 Buscando estatísticas do admin...')

    // Total de utilizadores
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Total de empresas (BUSINESSES, nao companies)
    const { count: totalCompanies } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })

    // Total de reservas
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    // Total de servicos
    const { count: totalServices } = await supabase
      .from('company_services')
      .select('*', { count: 'exact', head: true })

    // Total de destinos
    const { count: totalDestinations } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true })

    // Receita total
    let totalRevenue = 0

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('payment_status', 'paid')

    if (bookingsData && bookingsData.length > 0) {
      totalRevenue = bookingsData.reduce((sum, b) => sum + (b.total_price || 0), 0)
    } else {
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .in('status', ['confirmed', 'completed'])

      if (allBookings && allBookings.length > 0) {
        totalRevenue = allBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
      }
    }

    // Avaliacao media
    let avgRating = 0
    const { data: destinationsRating } = await supabase
      .from('destinations')
      .select('rating')

    if (destinationsRating && destinationsRating.length > 0) {
      const validRatings = destinationsRating.filter(d => d.rating > 0)
      if (validRatings.length > 0) {
        avgRating = validRatings.reduce((sum, d) => sum + (d.rating || 0), 0) / validRatings.length
      }
    }

    const result = {
      totalUsers: totalUsers || 0,
      totalCompanies: totalCompanies || 0,  // ✅ businesses
      totalBookings: totalBookings || 0,
      totalServices: totalServices || 0,
      totalDestinations: totalDestinations || 0,
      totalRevenue: totalRevenue || 0,
      avgRating: avgRating || 0,
    }

    console.log('✅ Estatísticas carregadas:', result)
    return result

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    return {
      totalUsers: 0,
      totalCompanies: 0,
      totalBookings: 0,
      totalServices: 0,
      totalDestinations: 0,
      totalRevenue: 0,
      avgRating: 0,
    }
  }
}

// ============================================
// GRAFICOS
// ============================================

export const getRevenueChartData = async (period = 'month') => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('total_price, created_at')
      .or('payment_status.eq.paid,status.eq.confirmed,status.eq.completed')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return []

    const grouped = {}
    data.forEach(item => {
      const date = new Date(item.created_at)
      const value = item.total_price || 0
      let key
      if (period === 'day') key = date.toISOString().split('T')[0]
      else if (period === 'week') key = `Semana ${getWeekNumber(date)}`
      else if (period === 'year') key = date.getFullYear().toString()
      else key = date.toLocaleString('pt-PT', { month: 'short', year: 'numeric' })
      grouped[key] = (grouped[key] || 0) + value
    })

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  } catch (error) {
    console.error('❌ Erro receita:', error)
    return []
  }
}

export const getBookingsChartData = async () => {
  try {
    const { data, error } = await supabase.from('bookings').select('status')

    if (error || !data || data.length === 0) return getDefaultBookingChartData()

    const grouped = {}
    data.forEach(item => {
      const status = item.status || 'pending'
      grouped[status] = (grouped[status] || 0) + 1
    })

    const labels = {
      pending: 'Pendentes',
      confirmed: 'Confirmadas',
      completed: 'Concluídas',
      cancelled: 'Canceladas',
    }

    const result = Object.entries(grouped).map(([key, value]) => ({
      name: labels[key] || key,
      value,
    }))

    const defaultCategories = ['Pendentes', 'Confirmadas', 'Concluídas', 'Canceladas']
    defaultCategories.forEach(cat => {
      if (!result.find(r => r.name === cat)) result.push({ name: cat, value: 0 })
    })

    return result
  } catch (error) {
    console.error('❌ Erro reservas:', error)
    return getDefaultBookingChartData()
  }
}

const getDefaultBookingChartData = () => [
  { name: 'Pendentes', value: 0 },
  { name: 'Confirmadas', value: 0 },
  { name: 'Concluídas', value: 0 },
  { name: 'Canceladas', value: 0 },
]

export const getUsersChartData = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return []

    const grouped = {}
    data.forEach(item => {
      const date = new Date(item.created_at)
      const key = date.toLocaleString('pt-PT', { month: 'short', year: 'numeric' })
      grouped[key] = (grouped[key] || 0) + 1
    })

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  } catch (error) {
    console.error('❌ Erro utilizadores:', error)
    return []
  }
}

// ============================================
// UTILITARIOS
// ============================================

function getWeekNumber(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

// ============================================
// RESERVAS RECENTES
// ============================================

export const getRecentBookings = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    if (data.length > 0) {
      const userIds = [...new Set(data.map(b => b.user_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', userIds)

        if (users) {
          const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc }, {})
          return data.map(booking => ({
            ...booking,
            profiles: userMap[booking.user_id] || null
          }))
        }
      }
    }

    return data
  } catch (error) {
    console.error('❌ Erro reservas recentes:', error)
    return []
  }
}

// ============================================
// DESTAQUES DO ADMIN - CORRIGIDO
// ============================================

export const getAdminHighlights = async () => {
  try {
    // ✅ Empresas pendentes (businesses, is_verified = false)
    const { count: pendingCompanies } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false)

    // Serviços pendentes
    const { count: pendingServices } = await supabase
      .from('company_services')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Novos utilizadores (7 dias)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: newUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    // Novas reservas (7 dias)
    const { count: newBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    const result = {
      pendingCompanies: pendingCompanies || 0,
      pendingServices: pendingServices || 0,
      newUsers: newUsers || 0,
      newBookings: newBookings || 0,
    }

    console.log('✅ Destaques carregados:', result)
    return result
  } catch (error) {
    console.error('❌ Erro destaques:', error)
    return { pendingCompanies: 0, pendingServices: 0, newUsers: 0, newBookings: 0 }
  }
}

// ============================================
// TOP DESTINOS
// ============================================

export const getTopDestinations = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, image_url, rating, province, description')
      .order('rating', { ascending: false, nullsLast: true })
      .limit(limit)

    if (error) return []
    return data || []
  } catch (error) {
    console.error('❌ Erro top destinos:', error)
    return []
  }
}

// ============================================
// EMPRESAS RECENTES - CORRIGIDO (businesses)
// ============================================

export const getRecentCompanies = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('businesses')  // ✅ businesses, nao companies
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return data || []
  } catch (error) {
    console.error('❌ Erro empresas recentes:', error)
    return []
  }
}

// ============================================
// RESERVAS POR MES
// ============================================

export const getBookingsByMonth = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('created_at')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) return []

    const grouped = {}
    data.forEach(item => {
      const date = new Date(item.created_at)
      const key = date.toLocaleString('pt-PT', { month: 'short', year: 'numeric' })
      grouped[key] = (grouped[key] || 0) + 1
    })

    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  } catch (error) {
    console.error('❌ Erro reservas por mês:', error)
    return []
  }
}

// ============================================
// UTILIZADORES
// ============================================

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('❌ Erro utilizadores:', error)
    return []
  }
}

export const updateUserRole = async (userId, role) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Erro atualizar role:', error)
    throw error
  }
}

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('❌ Erro deletar utilizador:', error)
    throw error
  }
}

// ============================================
// EMPRESAS (BUSINESSES) - CORRIGIDO
// ============================================

export const getAllCompanies = async () => {
  try {
    console.log('🔄 Buscando todas as empresas (businesses)...')

    const { data, error } = await supabase
      .from('businesses')  // ✅ businesses
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log('✅ Empresas carregadas:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ Erro empresas:', error)
    return []
  }
}

export const getPendingCompanies = async () => {
  try {
    console.log('🔄 Buscando empresas pendentes...')

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_verified', false)  // ✅ is_verified
      .order('created_at', { ascending: true })

    if (error) throw error
    console.log('✅ Empresas pendentes:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ Erro pendentes:', error)
    return []
  }
}

export const approveCompany = async (companyId) => {
  try {
    console.log('🔄 Aprovando empresa:', companyId)

    const { data, error } = await supabase
      .from('businesses')  // ✅ businesses
      .update({
        is_verified: true,  // ✅ is_verified, nao status
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .maybeSingle()

    if (error) throw error
    console.log('✅ Empresa aprovada:', data)
    return data
  } catch (error) {
    console.error('❌ Erro aprovar empresa:', error)
    throw error
  }
}

export const rejectCompany = async (companyId, reason) => {
  try {
    console.log('🔄 Rejeitando empresa:', companyId)

    // Soft delete: marcar como inativa e nao verificada
    const { data, error } = await supabase
      .from('businesses')
      .update({
        is_verified: false,
        is_active: false,  // ✅ is_active
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .maybeSingle()

    if (error) throw error
    console.log('✅ Empresa rejeitada:', data)
    return data
  } catch (error) {
    console.error('❌ Erro rejeitar empresa:', error)
    throw error
  }
}

// ============================================
// SERVICOS - CORRIGIDO
// ============================================

export const getAllServices = async () => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data && data.length > 0) {
      const companyIds = [...new Set(data.map(s => s.company_id).filter(Boolean))]
      if (companyIds.length > 0) {
        // Buscar em businesses
        const { data: businesses } = await supabase
          .from('businesses')
          .select('id, name, logo_url')
          .in('id', companyIds)

        if (businesses) {
          const businessMap = businesses.reduce((acc, c) => { acc[c.id] = c; return acc }, {})
          return data.map(service => ({
            ...service,
            businesses: businessMap[service.company_id] || null,
            companies: businessMap[service.company_id] || null
          }))
        }
      }
    }

    return data || []
  } catch (error) {
    console.error('❌ Erro serviços:', error)
    return []
  }
}

export const approveService = async (serviceId) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .update({
        status: 'approved',  // ✅ company_services TEM status
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Erro aprovar serviço:', error)
    throw error
  }
}

export const rejectService = async (serviceId, reason) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'Rejeitado pelo administrador',
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Erro rejeitar serviço:', error)
    throw error
  }
}

// ============================================
// BOOKINGS
// ============================================

export const getAdminBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    if (!data || data.length === 0) return []

    const userIds = [...new Set(data.map(b => b.user_id).filter(Boolean))]
    let userMap = {}
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .in('id', userIds)
      if (users) {
        userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc }, {})
      }
    }

    const companyIds = [...new Set(data.map(b => b.company_id || b.business_id).filter(Boolean))]
    let companyMap = {}
    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .from('businesses')
        .select('id, name, logo_url')
        .in('id', companyIds)
      if (companies) {
        companyMap = companies.reduce((acc, c) => { acc[c.id] = c; return acc }, {})
      }
    }

    return data.map(booking => ({
      ...booking,
      profiles: userMap[booking.user_id] || null,
      company: companyMap[booking.company_id || booking.business_id] || null
    }))
  } catch (error) {
    console.error('❌ Erro reservas admin:', error)
    return []
  }
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  getAdminStats,
  getRevenueChartData,
  getBookingsChartData,
  getUsersChartData,
  getRecentBookings,
  getAdminHighlights,
  getTopDestinations,
  getRecentCompanies,
  getBookingsByMonth,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCompanies,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getAllServices,
  approveService,
  rejectService,
  getAdminBookings,
}