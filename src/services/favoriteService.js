// src/services/favoriteService.js
// ============================================
// SERVIÇO DE FAVORITOS
// ✅ Compatível com tabela `favorites` (id, user_id, item_id, item_type, created_at)
// ✅ Faz JOIN em runtime com `businesses` e `destinations`
// ✅ Devolve dados enriquecidos para o FavoritesPage
// ============================================

import { supabase } from './supabase'

// ============================================
// Adicionar favorito
// ============================================
export const addFavorite = async (userId, itemId, itemType = 'business') => {
  try {
    console.log('❤️ [favoriteService] Adicionando favorito:', { userId, itemId, itemType })

    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: userId,
          item_id: itemId,
          item_type: itemType,
        },
      ])
      .select()
      .maybeSingle()

    if (error) {
      // Se já existe (UNIQUE constraint), ignorar silenciosamente
      if (error.code === '23505') {
        console.log('ℹ️ [favoriteService] Já estava nos favoritos')
        return { data: null, alreadyExists: true }
      }
      throw error
    }

    console.log('✅ [favoriteService] Favorito adicionado')
    return { data }
  } catch (error) {
    console.error('❌ [favoriteService] Erro ao adicionar favorito:', error)
    throw error
  }
}

// ============================================
// Remover favorito
// ============================================
export const removeFavorite = async (userId, itemId, itemType = 'business') => {
  try {
    console.log('💔 [favoriteService] Removendo favorito:', { userId, itemId, itemType })

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)

    if (error) throw error

    console.log('✅ [favoriteService] Favorito removido')
    return { success: true }
  } catch (error) {
    console.error('❌ [favoriteService] Erro ao remover favorito:', error)
    throw error
  }
}

// ============================================
// ✅ Buscar favoritos do utilizador (COM JOIN)
// ============================================
export const getUserFavorites = async (userId) => {
  try {
    console.log('🔍 [favoriteService] Buscando favoritos do user:', userId)

    // 1. Buscar todos os favoritos
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!favorites || favorites.length === 0) {
      console.log('ℹ️ [favoriteService] Nenhum favorito encontrado')
      return { data: [] }
    }

    console.log(`📦 [favoriteService] ${favorites.length} favoritos encontrados`)

    // 2. Separar por tipo
    const businessIds = favorites
      .filter((f) => {
        const t = (f.item_type || '').toLowerCase()
        return (
          t === 'business' ||
          t === 'hotel' ||
          t === 'restaurant' ||
          t === 'agency' ||
          t === 'guide' ||
          t === 'experience' ||
          t === 'event' ||
          t === 'shop' ||
          t === 'other'
        )
      })
      .map((f) => f.item_id)

    const destinationIds = favorites
      .filter((f) => (f.item_type || '').toLowerCase() === 'destination')
      .map((f) => f.item_id)

    const experienceIds = favorites
      .filter((f) => (f.item_type || '').toLowerCase() === 'user_experience')
      .map((f) => f.item_id)

    // 3. Buscar em paralelo
    const [businessesRes, destinationsRes, experiencesRes] = await Promise.all([
      businessIds.length > 0
        ? supabase
            .from('businesses')
            .select(
              'id, name, cover_image, logo_url, category, province, rating, description, is_verified'
            )
            .in('id', businessIds)
        : Promise.resolve({ data: [] }),

      destinationIds.length > 0
        ? supabase
            .from('destinations')
            .select('id, name, image, province, rating, description')
            .in('id', destinationIds)
        : Promise.resolve({ data: [] }),

      experienceIds.length > 0
        ? supabase
            .from('experiences')
            .select('id, title, images, location, rating, content')
            .in('id', experienceIds)
        : Promise.resolve({ data: [] }),
    ])

    const businesses = businessesRes.data || []
    const destinations = destinationsRes.data || []
    const experiences = experiencesRes.data || []

    console.log('📊 [favoriteService] Dados carregados:', {
      businesses: businesses.length,
      destinations: destinations.length,
      experiences: experiences.length,
    })

    // 4. Combinar tudo num objeto enriquecido
    const enriched = favorites.map((fav) => {
      const originalType = (fav.item_type || '').toLowerCase()

      // Procurar o item nas tabelas
      let item = businesses.find((b) => b.id === fav.item_id)
      let resolvedType = originalType

      if (!item) {
        item = destinations.find((d) => d.id === fav.item_id)
        if (item) resolvedType = 'destination'
      }

      if (!item) {
        item = experiences.find((e) => e.id === fav.item_id)
        if (item) resolvedType = 'user_experience'
      }

      // Se não encontrou em nenhuma tabela → item órfão
      const itemExists = !!item

      // Extrair dados conforme o tipo
      let itemName = null
      let itemImage = null
      let itemProvince = null
      let itemRating = 0
      let itemDescription = null

      if (item) {
        if (resolvedType === 'destination') {
          itemName = item.name
          itemImage = item.image
          itemProvince = item.province
          itemRating = item.rating || 0
          itemDescription = item.description
        } else if (resolvedType === 'user_experience') {
          itemName = item.title
          itemImage = Array.isArray(item.images) ? item.images[0] : item.images
          itemProvince = item.location
          itemRating = item.rating || 0
          itemDescription = item.content
        } else {
          // business / hotel / restaurant / etc.
          itemName = item.name
          itemImage = item.cover_image || item.logo_url || null
          itemProvince = item.province
          itemRating = item.rating || 0
          itemDescription = item.description
        }
      }

      return {
        // Dados originais do favorite
        id: fav.id,
        user_id: fav.user_id,
        item_id: fav.item_id,
        item_type: resolvedType,
        created_at: fav.created_at,

        // ✅ Dados enriquecidos (o que o FavoritesPage espera)
        item_name: itemName,
        item_image: itemImage,
        item_province: itemProvince,
        item_rating: itemRating,
        item_description: itemDescription,
        item_exists: itemExists,

        // Útil para links e categorização
        item_category: item?.category || null,
        item_verified: item?.is_verified || false,
      }
    })

    console.log('✅ [favoriteService] Favoritos enriquecidos:', enriched.length)
    return { data: enriched }
  } catch (error) {
    console.error('❌ [favoriteService] Erro ao buscar favoritos:', error)
    return { data: [] }
  }
}

// ============================================
// Verificar se é favorito
// ============================================
export const isFavorite = async (userId, itemId, itemType = 'business') => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle()

    if (error) {
      if (error.code === '42P01') return false
      throw error
    }
    return !!data
  } catch (error) {
    console.error('❌ [favoriteService] Erro ao verificar favorito:', error)
    return false
  }
}

// ============================================
// Alternar favorito (toggle)
// ============================================
export const toggleFavorite = async (userId, itemId, itemType = 'business') => {
  try {
    const isFav = await isFavorite(userId, itemId, itemType)

    if (isFav) {
      await removeFavorite(userId, itemId, itemType)
      return { data: null, action: 'removed' }
    } else {
      const result = await addFavorite(userId, itemId, itemType)
      return { data: result.data, action: 'added' }
    }
  } catch (error) {
    console.error('❌ [favoriteService] Erro ao alternar favorito:', error)
    throw error
  }
}

// ============================================
// Contar favoritos do utilizador
// ============================================
export const countUserFavorites = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      if (error.code === '42P01') return 0
      throw error
    }
    return count || 0
  } catch (error) {
    console.error('❌ [favoriteService] Erro ao contar favoritos:', error)
    return 0
  }
}