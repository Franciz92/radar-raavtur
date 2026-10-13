// src/services/companyService.js

import { supabase } from './supabase';

/**
 * Buscar dados completos da empresa
 */
export async function getCompanyFullData(companyId) {
  try {
    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    // Buscar galeria
    const { data: gallery, error: galleryError } = await supabase
      .from('company_gallery')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (galleryError && galleryError.code !== '42P01') {
      console.error('Erro ao buscar galeria:', galleryError);
    }

    return {
      success: true,
      data: {
        ...company,
        gallery: gallery || []
      }
    };
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Atualizar dados da empresa
 */
export async function updateCompany(companyId, updates) {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload de imagem para o storage
 */
export async function uploadCompanyImage(file, companyId, folder) {
  try {
    // Validar arquivo
    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('O arquivo deve ser uma imagem');
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem deve ter menos de 5MB');
    }

    // Gerar nome único
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${companyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('📤 Uploading:', fileName);

    // Upload para o storage
    const { data, error: uploadError } = await supabase.storage
      .from('company-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('company-images')
      .getPublicUrl(fileName);

    console.log('✅ Upload concluído:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: fileName
    };

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload'
    };
  }
}

/**
 * Adicionar foto à galeria
 */
export async function addGalleryPhoto(companyId, imageUrl) {
  try {
    const { data, error } = await supabase
      .from('company_gallery')
      .insert({
        company_id: companyId,
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Erro ao adicionar foto:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remover foto da galeria
 */
export async function removeGalleryPhoto(photoId) {
  try {
    const { error } = await supabase
      .from('company_gallery')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    return {
      success: true
    };
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    return {
      success: false,
      error: error.message
    };
  }
}