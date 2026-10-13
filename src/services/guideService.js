import { supabase } from './supabase'

// Buscar todos os guias (empresas aprovadas)
export const getGuides = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        services:company_services(
          id,
          name,
          price,
          duration,
          status
        )
      `)
      .eq('status', 'approved')
      .eq('category', 'Guia turístico')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao buscar guias:', error)
    return { data: [] }
  }
}

// Buscar guia por ID
export const getGuideById = async (id) => {
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
    console.error('Erro ao buscar guia:', error)
    throw error
  }
}