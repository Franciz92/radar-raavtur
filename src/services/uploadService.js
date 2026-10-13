// src/services/uploadService.js

import { supabase } from './supabase';
import toast from 'react-hot-toast';

/**
 * Upload de imagem para o storage do Supabase
 */
export async function uploadImage(file, path, bucket = 'company-images') {
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
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log('📤 [UploadService] Iniciando upload:', fileName);

    // Upload para o storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ [UploadService] Erro no upload:', uploadError);
      throw uploadError;
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('✅ [UploadService] Upload concluído:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: fileName,
      data
    };

  } catch (error) {
    console.error('❌ [UploadService] Erro:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload'
    };
  }
}

/**
 * Remover imagem do storage
 */
export async function deleteImage(filePath, bucket = 'company-images') {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('❌ [UploadService] Erro ao remover:', error);
    return {
      success: false,
      error: error.message || 'Erro ao remover imagem'
    };
  }
}