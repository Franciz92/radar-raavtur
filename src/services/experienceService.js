// src/services/experienceService.js
// ============================================
// SERVIÇO DE EXPERIÊNCIAS DOS UTILIZADORES
// - CRUD de user_experiences
// - Likes, Comentários, Views, Shares
// ============================================

import { supabase } from './supabase';

// ============================================
// LISTAR EXPERIÊNCIAS (PÚBLICO)
// ============================================
export const getExperiences = async (limit = 50, filters = {}) => {
  try {
    console.log('🔍 [experienceService] Buscando experiências...');

    let query = supabase
      .from('user_experiences')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.province) query = query.eq('province', filters.province);
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const userIds = [...new Set(data.map(e => e.user_id).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role, is_verified')
        .in('id', userIds);
      if (users) {
        userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
      }
    }

    const enriched = data.map(exp => ({
      ...exp,
      user: userMap[exp.user_id] || null,
      user_id: exp.user_id,
    }));

    console.log(`✅ [experienceService] ${enriched.length} experiências encontradas`);
    return { success: true, data: enriched };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================
// BUSCAR EXPERIÊNCIA POR ID
// ============================================
export const getExperienceById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('user_experiences')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { success: true, data: null };

    if (data.user_id) {
      const { data: user } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role, is_verified, bio')
        .eq('id', data.user_id)
        .maybeSingle();
      data.user = user;
    }

    const { data: comments } = await supabase
      .from('experience_comments')
      .select('*')
      .eq('experience_id', id)
      .order('created_at', { ascending: false });

    if (comments && comments.length > 0) {
      const commentUserIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))];
      const { data: commentUsers } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', commentUserIds);
      
      const commentUserMap = (commentUsers || []).reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
      
      data.comments = comments.map(c => ({
        ...c,
        user: commentUserMap[c.user_id] || null,
      }));
    } else {
      data.comments = [];
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message, data: null };
  }
};

// ============================================
// CRIAR EXPERIÊNCIA
// ============================================
export const createExperience = async (data, userId) => {
  try {
    console.log('📝 [experienceService] Criando experiência...');

    if (!userId) throw new Error('Utilizador não autenticado');
    if (!data.title?.trim()) throw new Error('Título é obrigatório');
    if (!data.content?.trim()) throw new Error('Conteúdo é obrigatório');

    const insertData = {
      user_id: userId,
      title: data.title.trim(),
      content: data.content.trim(),
      location: data.location || null,
      province: data.province || null,
      images: data.images || [],
      rating: data.rating || 5,
      category: data.category || 'other',
      is_published: true,
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: experience, error } = await supabase
      .from('user_experiences')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ [experienceService] Experiência criada:', experience.id);
    return { success: true, data: experience };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ATUALIZAR EXPERIÊNCIA
// ============================================
export const updateExperience = async (id, data, userId) => {
  try {
    const updateData = {
      title: data.title?.trim(),
      content: data.content?.trim(),
      location: data.location || null,
      province: data.province || null,
      images: data.images || [],
      rating: data.rating || 5,
      category: data.category || 'other',
      updated_at: new Date().toISOString(),
    };

    const { data: experience, error } = await supabase
      .from('user_experiences')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: experience };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ELIMINAR EXPERIÊNCIA
// ============================================
export const deleteExperience = async (id, userId) => {
  try {
    const { error } = await supabase
      .from('user_experiences')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// LIKES
// ============================================
export const toggleLike = async (experienceId, userId) => {
  try {
    if (!userId) throw new Error('Não autenticado');

    const { data: existing } = await supabase
      .from('experience_likes')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('experience_likes').delete().eq('id', existing.id);
      
      const { data: exp } = await supabase
        .from('user_experiences')
        .select('likes_count')
        .eq('id', experienceId)
        .maybeSingle();
      
      const newCount = Math.max(0, (exp?.likes_count || 1) - 1);
      
      await supabase
        .from('user_experiences')
        .update({ likes_count: newCount })
        .eq('id', experienceId);

      return { success: true, liked: false, likesCount: newCount };
    } else {
      await supabase.from('experience_likes').insert([{
        experience_id: experienceId,
        user_id: userId,
      }]);

      const { data: exp } = await supabase
        .from('user_experiences')
        .select('likes_count')
        .eq('id', experienceId)
        .maybeSingle();
      
      const newCount = (exp?.likes_count || 0) + 1;
      
      await supabase
        .from('user_experiences')
        .update({ likes_count: newCount })
        .eq('id', experienceId);

      return { success: true, liked: true, likesCount: newCount };
    }
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ✅ ALIAS: checkUserLike (compatibilidade)
export const checkUserLiked = async (experienceId, userId) => {
  try {
    if (!userId) return { success: true, liked: false };
    
    const { data } = await supabase
      .from('experience_likes')
      .select('id')
      .eq('experience_id', experienceId)
      .eq('user_id', userId)
      .maybeSingle();

    return { success: true, liked: !!data };
  } catch (error) {
    return { success: false, liked: false };
  }
};

// ✅ ALIAS: checkUserLike (para o ficheiro atual)
export const checkUserLike = checkUserLiked;

// ============================================
// COMENTÁRIOS
// ============================================
export const addComment = async (experienceId, userId, content) => {
  try {
    if (!userId) throw new Error('Não autenticado');
    if (!content?.trim()) throw new Error('Comentário vazio');

    const { data: comment, error } = await supabase
      .from('experience_comments')
      .insert([{
        experience_id: experienceId,
        user_id: userId,
        content: content.trim(),
      }])
      .select()
      .single();

    if (error) throw error;

    const { data: exp } = await supabase
      .from('user_experiences')
      .select('comments_count')
      .eq('id', experienceId)
      .maybeSingle();

    await supabase
      .from('user_experiences')
      .update({ comments_count: (exp?.comments_count || 0) + 1 })
      .eq('id', experienceId);

    const { data: user } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    return { success: true, data: { ...comment, user } };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ✅ NOVO: getComments
export const getComments = async (experienceId) => {
  try {
    const { data, error } = await supabase
      .from('experience_comments')
      .select('*')
      .eq('experience_id', experienceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id).filter(Boolean))];
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds);
      
      const userMap = (users || []).reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
      
      return {
        success: true,
        data: data.map(c => ({
          ...c,
          user: userMap[c.user_id] || null,
        })),
      };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ✅ CORRIGIDO: deleteComment com ASSINATURA FLEXÍVEL
// Aceita: deleteComment(commentId, experienceId, userId) OU deleteComment(commentId, userId)
export const deleteComment = async (commentId, arg2, arg3) => {
  try {
    // Detetar se arg2 é userId ou experienceId
    let userId = arg3 || null;
    let experienceId = arg2;
    
    // Se só vier um argumento extra, tentar como userId
    if (!arg3) {
      userId = arg2;
      // Buscar o experience_id do comentário
      const { data: comment } = await supabase
        .from('experience_comments')
        .select('experience_id')
        .eq('id', commentId)
        .maybeSingle();
      experienceId = comment?.experience_id;
    }

    let query = supabase.from('experience_comments').delete().eq('id', commentId);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;

    if (experienceId) {
      const { data: exp } = await supabase
        .from('user_experiences')
        .select('comments_count')
        .eq('id', experienceId)
        .maybeSingle();

      await supabase
        .from('user_experiences')
        .update({ comments_count: Math.max(0, (exp?.comments_count || 1) - 1) })
        .eq('id', experienceId);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// VIEWS
// ============================================
export const registerView = async (experienceId, userId = null) => {
  try {
    if (userId) {
      const { data: existing } = await supabase
        .from('experience_views')
        .select('id')
        .eq('experience_id', experienceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) return { success: true, alreadyViewed: true };
    }

    await supabase.from('experience_views').insert([{
      experience_id: experienceId,
      user_id: userId,
    }]);

    const { data: exp } = await supabase
      .from('user_experiences')
      .select('views_count')
      .eq('id', experienceId)
      .maybeSingle();

    const newCount = (exp?.views_count || 0) + 1;

    await supabase
      .from('user_experiences')
      .update({ views_count: newCount })
      .eq('id', experienceId);

    return { success: true, viewsCount: newCount };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// SHARES
// ============================================
export const registerShare = async (experienceId, userId = null, platform = 'link') => {
  try {
    await supabase.from('experience_shares').insert([{
      experience_id: experienceId,
      user_id: userId,
      platform: platform,
    }]);

    const { data: exp } = await supabase
      .from('user_experiences')
      .select('shares_count')
      .eq('id', experienceId)
      .maybeSingle();

    const newCount = (exp?.shares_count || 0) + 1;

    await supabase
      .from('user_experiences')
      .update({ shares_count: newCount })
      .eq('id', experienceId);

    return { success: true, sharesCount: newCount };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// BUSCAR EXPERIÊNCIAS DE UM UTILIZADOR
// ============================================
export const getUserExperiences = async (userId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('user_experiences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ============================================
// UPLOAD DE IMAGENS
// ============================================
export const uploadExperienceImage = async (file, userId) => {
  try {
    if (!file) throw new Error('Nenhum ficheiro');

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) throw new Error('Tipo de ficheiro inválido');
    if (file.size > 5 * 1024 * 1024) throw new Error('Ficheiro demasiado grande (máx 5MB)');

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `user-experiences/${fileName}`;

    const { error } = await supabase.storage
      .from('business-media')
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('business-media')
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('❌ [experienceService] Erro:', error);
    return { success: false, error: error.message };
  }
};

// Export default (compatibilidade)
export default {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleLike,
  checkUserLiked,
  checkUserLike,
  addComment,
  getComments,
  deleteComment,
  registerView,
  registerShare,
  getUserExperiences,
  uploadExperienceImage,
};