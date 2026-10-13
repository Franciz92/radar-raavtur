import { supabase } from './supabase'

// Buscar todas as agências (empresas aprovadas)
export const getAgencies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        services:company_services(
          id,
          name,
          price,
          status
        )
      `)
      .eq('status', 'approved')
      .eq('category', 'Agência de viagens')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao buscar agências:', error)
    return { data: [] }
  }
}

// Buscar agência por ID
export const getAgencyById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        services:company_services(*),
        reviews:company_reviews(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Erro ao buscar agência:', error)
    throw error
  }
}