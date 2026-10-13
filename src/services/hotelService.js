// src/services/hotelService.js

import { supabase } from './supabase'

// ============================================
// FUNÇÕES DE HOTEL
// ============================================

/**
 * Buscar todos os hotéis aprovados
 */
export const getHotels = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .eq('category', 'Hotel')
      .order('rating', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error)
    return { data: [], error }
  }
}

/**
 * Buscar hotel por ID com serviços
 */
export const getHotelById = async (id) => {
  try {
    // Buscar hotel
    const { data: hotel, error: hotelError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .maybeSingle()

    if (hotelError) throw hotelError
    if (!hotel) return { data: null, error: null }

    // Buscar serviços do hotel
    const { data: services, error: servicesError } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', id)
      .eq('status', 'active')
      .in('category', ['Hotel', 'Pacote'])
      .order('price', { ascending: true })

    if (servicesError) throw servicesError

    return {
      data: { ...hotel, services: services || [] },
      error: null
    }
  } catch (error) {
    console.error('Erro ao buscar hotel:', error)
    return { data: null, error }
  }
}

/**
 * Buscar hotéis por cidade
 */
export const getHotelsByCity = async (city) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .eq('category', 'Hotel')
      .eq('address->>city', city)
      .order('rating', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar hotéis por cidade:', error)
    return { data: [], error }
  }
}

/**
 * Buscar hotéis por estrelas
 */
export const getHotelsByStars = async (stars) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .eq('category', 'Hotel')
      .eq('stars', stars)
      .order('rating', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar hotéis por estrelas:', error)
    return { data: [], error }
  }
}

/**
 * Buscar serviços de um hotel
 */
export const getHotelServices = async (hotelId) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', hotelId)
      .eq('status', 'active')
      .in('category', ['Hotel', 'Pacote'])
      .order('price', { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar serviços do hotel:', error)
    return { data: [], error }
  }
}

/**
 * Buscar hotéis em destaque
 */
export const getFeaturedHotels = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .eq('category', 'Hotel')
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar hotéis em destaque:', error)
    return { data: [], error }
  }
}

/**
 * Buscar cidades com hotéis
 */
export const getHotelCities = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('address')
      .eq('status', 'approved')
      .eq('category', 'Hotel')

    if (error) throw error

    const cities = [...new Set(
      (data || [])
        .map(h => h.address?.city)
        .filter(Boolean)
    )]

    return { data: cities, error: null }
  } catch (error) {
    console.error('Erro ao buscar cidades:', error)
    return { data: [], error }
  }
}

/**
 * Buscar hotéis com filtros
 */
export const searchHotels = async (filters) => {
  try {
    let query = supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .eq('category', 'Hotel')

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,` +
        `description.ilike.%${filters.search}%,` +
        `address->>city.ilike.%${filters.search}%,` +
        `address->>province.ilike.%${filters.search}%`
      )
    }

    if (filters.city) {
      query = query.eq('address->>city', filters.city)
    }

    if (filters.stars) {
      query = query.eq('stars', filters.stars)
    }

    if (filters.minPrice) {
      query = query.gte('min_price', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('max_price', filters.maxPrice)
    }

    const { data, error } = await query.order('rating', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error)
    return { data: [], error }
  }
}