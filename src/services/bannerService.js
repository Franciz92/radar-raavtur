// src/services/bannerService.js
// ============================================
// SERVIÇO DE BANNERS
// ============================================

import { supabase } from './supabase';

const TABLE = 'banners';
const BUCKET = 'banners';

// ============================================
// LISTAR (público)
// ============================================
export async function getBanners(placement) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (placement) {
    query = query.eq('placement', placement);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[bannerService] getBanners:', error);
    return [];
  }

  // Filtrar por data (starts_at / ends_at) no cliente
  const now = new Date();
  return (data || []).filter((b) => {
    if (b.starts_at && new Date(b.starts_at) > now) return false;
    if (b.ends_at && new Date(b.ends_at) < now) return false;
    return true;
  });
}

// ============================================
// LISTAR TODOS (admin — inclui inativos)
// ============================================
export async function getAllBanners() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('placement', { ascending: true })
    .order('position', { ascending: true });

  if (error) {
    console.error('[bannerService] getAllBanners:', error);
    return [];
  }
  return data || [];
}

// ============================================
// CRIAR
// ============================================
export async function createBanner(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[bannerService] createBanner:', error);
    throw error;
  }
  return data;
}

// ============================================
// ATUALIZAR
// ============================================
export async function updateBanner(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[bannerService] updateBanner:', error);
    throw error;
  }
  return data;
}

// ============================================
// ELIMINAR
// ============================================
export async function deleteBanner(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================
// REORDENAR
// ============================================
export async function reorderBanners(orderedIds) {
  const updates = orderedIds.map((id, index) =>
    supabase.from(TABLE).update({ position: index }).eq('id', id)
  );
  await Promise.all(updates);
  return true;
}

// ============================================
// UPLOAD DE IMAGEM
// ============================================
export async function uploadBannerImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// ============================================
// ELIMINAR IMAGEM DO STORAGE
// ============================================
export async function deleteBannerImage(publicUrl) {
  try {
    if (!publicUrl || !publicUrl.includes(`/${BUCKET}/`)) return;
    const path = publicUrl.split(`/${BUCKET}/`)[1];
    if (!path) return;
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (err) {
    console.warn('[bannerService] deleteBannerImage:', err);
  }
}