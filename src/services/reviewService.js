import { supabase } from './supabase'

// ============================================
// BUSCAR AVALIAÇÕES
// ============================================

// Buscar avaliações de um item
export const getReviewsByItem = async (itemId, itemType, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error)
    return []
  }
}

// Buscar avaliações do usuário
export const getUserReviews = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar avaliações do usuário:', error)
    return []
  }
}

// Buscar média de avaliações
export const getAverageRating = async (itemId, itemType) => {
  try {
    const { data, error } = await supabase
      .rpc('get_average_rating', {
        item_id: itemId,
        item_type: itemType
      })
    
    if (error) throw error
    return data || 0
  } catch (error) {
    console.error('Erro ao buscar média:', error)
    return 0
  }
}

// Buscar estatísticas de avaliações
export const getReviewStats = async (itemId, itemType) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('item_id', itemId)
      .eq('item_type', itemType)
    
    if (error) throw error
    
    const total = data?.length || 0
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    data?.forEach(r => {
      ratings[r.rating] = (ratings[r.rating] || 0) + 1
    })
    
    const average = total > 0 
      ? data.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0
    
    return {
      total,
      average: parseFloat(average.toFixed(1)),
      distribution: ratings,
      percentage: total > 0 
        ? Object.fromEntries(
            Object.entries(ratings).map(([key, value]) => [
              key, 
              Math.round((value / total) * 100)
            ])
          )
        : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentage: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    }
  }
}

// ============================================
// CRIAR/ATUALIZAR AVALIAÇO
// ============================================

// Criar avaliação
export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: reviewData.userId,
        item_id: reviewData.itemId,
        item_type: reviewData.itemType,
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        images: reviewData.images || [],
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    throw error
  }
}

// Atualizar avaliação
export const updateReview = async (reviewId, updates) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error)
    throw error
  }
}

// Deletar avaliação
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error)
    throw error
  }
}

// ============================================
// MARCAR COMO ÚTIL
// ============================================

export const markReviewHelpful = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        helpful_count: supabase.raw('helpful_count + 1'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao marcar como útil:', error)
    throw error
  }
}

// Verificar se o usuário já avaliou
export const hasUserReviewed = async (userId, itemId, itemType) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle()
    
    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Erro ao verificar avaliação:', error)
    return false
  }
}

// Buscar avaliação do usuário para um item
export const getUserReview = async (userId, itemId, itemType) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error)
    return null
  }
}