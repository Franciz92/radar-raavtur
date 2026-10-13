// src/services/profileService.js
// ============================================
// SERVIÇO DE PERFIL PÚBLICO
// - getPublicProfile (com fallback de colunas)
// - getUserBusinesses (com business_services)
// - getFollowers / getFollowing
// - checkIfFollowing / followUser / unfollowUser
// - getUserReviews
// - Aliases para compatibilidade
// ============================================

import { supabase } from './supabase';

// ============================================
// BUSCAR PERFIL PÚBLICO
// ============================================
export const getPublicProfile = async (userId) => {
  try {
    if (!userId) throw new Error('ID do utilizador é obrigatório');

    console.log('🔍 [ProfileService] Buscando perfil:', userId);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [ProfileService] Erro:', error);
      throw error;
    }

    if (!data) {
      console.log('📭 [ProfileService] Perfil não encontrado');
      return { data: null, error: null };
    }

    console.log('✅ [ProfileService] Perfil encontrado:', data.name);

    let followersCount = data.followers_count || 0;
    let followingCount = data.following_count || 0;

    if (!followersCount) {
      try {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);
        followersCount = count || 0;
      } catch (e) {
        console.warn('⚠️ Erro ao contar followers:', e);
      }
    }

    if (!followingCount) {
      try {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);
        followingCount = count || 0;
      } catch (e) {
        console.warn('⚠️ Erro ao contar following:', e);
      }
    }

    return {
      data: {
        ...data,
        followers_count: followersCount,
        following_count: followingCount,
      },
      error: null,
    };
  } catch (error) {
    console.error('❌ [ProfileService] Erro ao buscar perfil:', error);
    return { data: null, error };
  }
};

// ============================================
// BUSCAR EMPRESAS DO UTILIZADOR
// ============================================
export const getUserBusinesses = async (userId) => {
  try {
    if (!userId) return { data: [], error: null };

    console.log('🔍 [ProfileService] Buscando empresas de:', userId);

    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId);

    if (businessesError) throw businessesError;

    if (!businesses || businesses.length === 0) {
      return { data: [], error: null };
    }

    const businessesWithServices = await Promise.all(
      businesses.map(async (business) => {
        try {
          const { data: services } = await supabase
            .from('business_services')
            .select('id, name, price, logo_url, image_url, is_active')
            .eq('business_id', business.id);

          return { ...business, services: services || [] };
        } catch (err) {
          console.warn(`⚠️ Erro ao buscar serviços de ${business.id}:`, err);
          return { ...business, services: [] };
        }
      })
    );

    console.log(`✅ [ProfileService] ${businessesWithServices.length} empresas encontradas`);
    return { data: businessesWithServices, error: null };
  } catch (error) {
    console.error('❌ [ProfileService] Erro ao buscar empresas:', error);
    return { data: [], error };
  }
};

// ============================================
// BUSCAR SEGUIDORES
// ============================================
export const getFollowers = async (userId, limit = 50) => {
  try {
    if (!userId) return { data: [], error: null };

    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (followsError) throw followsError;
    if (!follows || follows.length === 0) return { data: [], error: null };

    const followerIds = follows.map(f => f.follower_id).filter(Boolean);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, role, is_verified')
      .in('id', followerIds);

    if (profilesError) throw profilesError;
    return { data: profiles || [], error: null };
  } catch (error) {
    console.error('[ProfileService] Erro ao buscar seguidores:', error);
    return { data: [], error };
  }
};

// ============================================
// BUSCAR SEGUINDO
// ============================================
export const getFollowing = async (userId, limit = 50) => {
  try {
    if (!userId) return { data: [], error: null };

    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (followsError) throw followsError;
    if (!follows || follows.length === 0) return { data: [], error: null };

    const followingIds = follows.map(f => f.following_id).filter(Boolean);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, role, is_verified')
      .in('id', followingIds);

    if (profilesError) throw profilesError;
    return { data: profiles || [], error: null };
  } catch (error) {
    console.error('[ProfileService] Erro ao buscar seguindo:', error);
    return { data: [], error };
  }
};

// ============================================
// VERIFICAR SE SEGUE
// ============================================
export const checkIfFollowing = async (currentUserId, targetUserId) => {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return { isFollowing: false, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (error) throw error;
    return { isFollowing: !!data, error: null };
  } catch (error) {
    console.error('[ProfileService] Erro ao verificar follow:', error);
    return { isFollowing: false, error };
  }
};

// ============================================
// SEGUIR
// ============================================
export const followUser = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId) throw new Error('Não autenticado');
    if (currentUserId === targetUserId) throw new Error('Não pode seguir-se a si mesmo');

    const { data, error } = await supabase
      .from('follows')
      .insert([{
        follower_id: currentUserId,
        following_id: targetUserId,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ [ProfileService] Seguindo:', targetUserId);
    return { data, error: null };
  } catch (error) {
    console.error('❌ [ProfileService] Erro ao seguir:', error);
    return { data: null, error };
  }
};

// ============================================
// DEIXAR DE SEGUIR
// ============================================
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    if (error) throw error;
    console.log('✅ [ProfileService] Deixou de seguir:', targetUserId);
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [ProfileService] Erro ao deixar de seguir:', error);
    return { success: false, error };
  }
};

// ============================================
// BUSCAR AVALIAÇÕES
// ============================================
export const getUserReviews = async (userId, limit = 20) => {
  try {
    if (!userId) return { data: [], error: null };

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (reviewsError) throw reviewsError;
    if (!reviews || reviews.length === 0) return { data: [], error: null };

    const reviewsWithBusiness = await Promise.all(
      reviews.map(async (review) => {
        if (review.business_id) {
          const { data: business } = await supabase
            .from('businesses')
            .select('id, name, logo_url')
            .eq('id', review.business_id)
            .maybeSingle();

          return { ...review, business: business || null };
        }
        return { ...review, business: null };
      })
    );

    return { data: reviewsWithBusiness, error: null };
  } catch (error) {
    console.error('[ProfileService] Erro ao buscar avaliações:', error);
    return { data: [], error };
  }
};

// ============================================
// ALIASES (compatibilidade com imports antigos)
// ============================================

// Aliases para checkIfFollowing
export const checkFollow = checkIfFollowing;
export const isFollowingUser = checkIfFollowing;

// Aliases para getPublicProfile
export const getProfile = getPublicProfile;
export const fetchProfile = getPublicProfile;

// Aliases para getUserBusinesses
export const getBusinesses = getUserBusinesses;
export const fetchBusinesses = getUserBusinesses;

// Aliases para getUserReviews
export const getReviews = getUserReviews;
export const fetchReviews = getUserReviews;

// Aliases para followUser
export const follow = followUser;

// Aliases para unfollowUser
export const unfollow = unfollowUser;

// ============================================
// EXPORT DEFAULT (para imports via default)
// ============================================
export default {
  // Perfil
  getPublicProfile,
  getProfile,
  fetchProfile,
  
  // Empresas
  getUserBusinesses,
  getBusinesses,
  fetchBusinesses,
  
  // Followers
  getFollowers,
  getFollowing,
  
  // Follow
  checkIfFollowing,
  checkFollow,
  isFollowingUser,
  followUser,
  follow,
  unfollowUser,
  unfollow,
  
  // Avaliações
  getUserReviews,
  getReviews,
  fetchReviews,
};