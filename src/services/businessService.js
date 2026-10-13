// src/services/businessService.js
import { supabase } from './supabase';

class BusinessService {
  // ============================================
  // UTILITÁRIOS
  // ============================================

  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ============================================
  // UPLOAD DE IMAGENS
  // ============================================

  async uploadImage(file, folder = 'businesses') {
    if (!file) throw new Error('Nenhum ficheiro fornecido');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de ficheiro não permitido. Use JPG, PNG ou WebP.');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Ficheiro demasiado grande. Máximo 5MB.');
    }

    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('📤 [uploadImage] Fazendo upload:', filePath);

    const { data, error } = await supabase.storage
      .from('business-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('❌ [uploadImage] Erro:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('business-media')
      .getPublicUrl(filePath);

    console.log('✅ [uploadImage] URL pública:', urlData.publicUrl);
    return urlData.publicUrl;
  }

  async uploadMultipleImages(files, folder = 'businesses') {
    if (!files || files.length === 0) return [];

    const uploadPromises = Array.from(files).map((file) =>
      this.uploadImage(file, folder)
    );

    return await Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl) {
    try {
      if (!imageUrl) return true;

      const urlParts = imageUrl.split('/business-media/');
      if (urlParts.length < 2) return true;

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('business-media')
        .remove([filePath]);

      if (error) {
        console.warn('⚠️ Erro ao eliminar imagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  // ============================================
  // ✅ VERIFICAÇO DE PROPRIETÁRIO
  // ============================================

  async isBusinessOwner(businessId, userId) {
    try {
      if (!businessId || !userId) return false;

      const { data, error } = await supabase
        .from('businesses')
        .select('user_id')
        .eq('id', businessId)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Erro ao verificar proprietário:', error);
        return false;
      }

      return data?.user_id === userId;
    } catch (error) {
      console.error('Erro ao verificar proprietário:', error);
      return false;
    }
  }

  async canEditService(serviceId, userId) {
    try {
      if (!serviceId || !userId) return false;

      const { data, error } = await supabase
        .from('business_services')
        .select(`
          id,
          business:businesses (
            id,
            user_id
          )
        `)
        .eq('id', serviceId)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Erro ao verificar permissão:', error);
        return false;
      }

      return data?.business?.user_id === userId;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  // ============================================
  // MÉTODOS DO USUÁRIO
  // ============================================

  async getUserBusinesses(userId) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      return [];
    }
  }

  async getBusinessById(id) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return null;
    }
  }

  async getBusinessBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', slug)
        .eq('is_verified', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar empresa por slug:', error);
      return null;
    }
  }

  // ============================================
  // CRIAR EMPRESA
  // ============================================

  async createBusiness(data) {
    try {
      console.log('📝 [createBusiness] Iniciando criação...');

      if (!data.name || data.name.trim() === '') {
        throw new Error('Nome da empresa é obrigatório');
      }
      if (!data.user_id) {
        throw new Error('ID do utilizador é obrigatório');
      }

      if (data.category === 'other' && !data.subcategory) {
        throw new Error('Subcategoria é obrigatória para "Outro Serviço"');
      }

      const slug = this.generateSlug(data.name);

      const { data: existing } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      const finalSlug = existing
        ? `${slug}-${Date.now().toString().slice(-6)}`
        : slug;

      console.log('📝 [createBusiness] Slug gerado:', finalSlug);

      let logoUrl = data.logo_url || null;
      if (data.logoFile) {
        console.log('📤 [createBusiness] Upload do logotipo...');
        try {
          logoUrl = await this.uploadImage(data.logoFile, 'logos');
        } catch (err) {
          console.error('❌ Erro ao fazer upload do logotipo:', err);
          throw new Error(`Erro no logotipo: ${err.message}`);
        }
      }

      let coverUrl = data.cover_image || null;
      if (data.coverFile) {
        console.log('📤 [createBusiness] Upload da foto de capa...');
        try {
          coverUrl = await this.uploadImage(data.coverFile, 'covers');
        } catch (err) {
          console.error('❌ Erro ao fazer upload da capa:', err);
          throw new Error(`Erro na capa: ${err.message}`);
        }
      }

      let galleryUrls = data.gallery || [];
      if (data.galleryFiles && data.galleryFiles.length > 0) {
        try {
          galleryUrls = await this.uploadMultipleImages(data.galleryFiles, 'gallery');
        } catch (err) {
          console.error('⚠️ Erro ao fazer upload da galeria:', err);
        }
      }

      const businessData = {
        user_id: data.user_id,
        name: data.name.trim(),
        slug: finalSlug,
        category: data.category || 'other',
        subcategory: data.subcategory || null,
        description: data.description || '',
        full_description: data.full_description || data.description || '',
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        province: data.province || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        logo_url: logoUrl,
        cover_image: coverUrl,
        gallery: galleryUrls,
        is_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: business, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) {
        console.error('❌ [createBusiness] Erro Supabase:', error);
        throw error;
      }

      console.log('✅ [createBusiness] Empresa criada:', business.id);
      return business;
    } catch (error) {
      console.error('❌ [createBusiness] Erro:', error);
      throw error;
    }
  }

  // ============================================
  // ATUALIZAR EMPRESA
  // ============================================

  async updateBusiness(id, data) {
    try {
      console.log('📝 [updateBusiness] Atualizando empresa:', id);

      const updateData = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.category !== undefined) updateData.category = data.category;
      if (data.subcategory !== undefined) updateData.subcategory = data.subcategory || null;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.full_description !== undefined) updateData.full_description = data.full_description;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.phone !== undefined) updateData.phone = data.phone || null;
      if (data.website !== undefined) updateData.website = data.website || null;
      if (data.address !== undefined) updateData.address = data.address || null;
      if (data.province !== undefined) updateData.province = data.province || null;
      if (data.latitude !== undefined) updateData.latitude = data.latitude ? parseFloat(data.latitude) : null;
      if (data.longitude !== undefined) updateData.longitude = data.longitude ? parseFloat(data.longitude) : null;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      if (data.logoFile) {
        try {
          if (data.oldLogoUrl) await this.deleteImage(data.oldLogoUrl);
          updateData.logo_url = await this.uploadImage(data.logoFile, 'logos');
        } catch (err) {
          throw new Error(`Erro no logotipo: ${err.message}`);
        }
      } else if (data.logo_url !== undefined) {
        updateData.logo_url = data.logo_url;
      }

      if (data.coverFile) {
        try {
          if (data.oldCoverUrl) await this.deleteImage(data.oldCoverUrl);
          updateData.cover_image = await this.uploadImage(data.coverFile, 'covers');
        } catch (err) {
          throw new Error(`Erro na capa: ${err.message}`);
        }
      } else if (data.cover_image !== undefined) {
        updateData.cover_image = data.cover_image;
      }

      if (data.galleryFiles && data.galleryFiles.length > 0) {
        try {
          const newGallery = await this.uploadMultipleImages(data.galleryFiles, 'gallery');
          updateData.gallery = [...(data.gallery || []), ...newGallery];
        } catch (err) {
          console.error('⚠️ Erro no upload da galeria:', err);
        }
      } else if (data.gallery !== undefined) {
        updateData.gallery = data.gallery;
      }

      const { data: business, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [updateBusiness] Empresa atualizada:', business.id);
      return business;
    } catch (error) {
      console.error('❌ [updateBusiness] Erro:', error);
      throw error;
    }
  }

  async submitForApproval(id) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Erro ao enviar para aprovação:', error);
      throw error;
    }
  }

  async deleteBusiness(id) {
    try {
      const business = await this.getBusinessById(id);

      if (business) {
        if (business.logo_url) await this.deleteImage(business.logo_url);
        if (business.cover_image) await this.deleteImage(business.cover_image);
        if (business.gallery && business.gallery.length > 0) {
          for (const url of business.gallery) {
            await this.deleteImage(url);
          }
        }
      }

      const { error } = await supabase.from('businesses').delete().eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      throw error;
    }
  }

  async countUserBusinesses(userId) {
    try {
      const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar empresas:', error);
      return 0;
    }
  }

  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================

  async getBusinessesByCategory(category, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .ilike('category', category)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar empresas da categoria ${category}:`, error);
      return [];
    }
  }

  async getBusinessesBySubcategory(subcategory, limit = 50) {
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .eq('category', 'other');

      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar outros serviços:`, error);
      return [];
    }
  }

  async getVerifiedBusinesses(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar empresas verificadas:', error);
      return [];
    }
  }

  async getBusinessesByCategoryWithFilters(category, filters = {}) {
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .ilike('category', category);

      if (filters.province) query = query.eq('province', filters.province);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.minRating) query = query.gte('rating', filters.minRating);
      if (filters.limit) query = query.limit(filters.limit);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar empresas:`, error);
      return [];
    }
  }

  async getBusinessesByProvince(province, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('province', province)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar empresas na província ${province}:`, error);
      return [];
    }
  }

  async getFeaturedBusinesses(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar empresas em destaque:', error);
      return [];
    }
  }

  async searchBusinesses(searchTerm, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,full_description.ilike.%${searchTerm}%`
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      return [];
    }
  }

  async getBusinessesByCategoryAndProvince(category, province, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', true)
        .ilike('category', category)
        .eq('province', province)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar empresas:`, error);
      return [];
    }
  }

  // ============================================
  // MÉTODOS DE ESTATÍSTICAS
  // ============================================

  async countBusinessesByCategory() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('category', { count: 'exact' })
        .eq('is_verified', true);

      if (error) throw error;

      const counts = {};
      data.forEach((item) => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Erro ao contar empresas por categoria:', error);
      return {};
    }
  }

  async countBusinessesBySubcategory() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('subcategory')
        .eq('is_verified', true)
        .eq('category', 'other');

      if (error) throw error;

      const counts = {};
      data.forEach((item) => {
        if (item.subcategory) {
          counts[item.subcategory] = (counts[item.subcategory] || 0) + 1;
        }
      });

      return counts;
    } catch (error) {
      console.error('Erro ao contar empresas por subcategoria:', error);
      return {};
    }
  }

  async countBusinessesByProvince() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('province', { count: 'exact' })
        .eq('is_verified', true);

      if (error) throw error;

      const counts = {};
      data.forEach((item) => {
        if (item.province) {
          counts[item.province] = (counts[item.province] || 0) + 1;
        }
      });

      return counts;
    } catch (error) {
      console.error('Erro ao contar empresas por província:', error);
      return {};
    }
  }

  // ============================================
  // MÉTODOS DE ADMINISTRAÇO
  // ============================================

  async getPendingBusinesses() {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_verified', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar empresas pendentes:', error);
      return [];
    }
  }

  async countPendingBusinesses() {
    try {
      const { count, error } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Erro ao contar empresas pendentes:', error);
      return 0;
    }
  }

  async getAllBusinesses(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar todas as empresas:', error);
      return [];
    }
  }

  async approveBusiness(id) {
    try {
      if (!id) throw new Error('ID da empresa não fornecido');

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          is_verified: true,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      const { data: updated, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) return { id, is_verified: true };
      return updated;
    } catch (error) {
      console.error('❌ Erro ao aprovar empresa:', error);
      throw error;
    }
  }

  async rejectBusiness(id, reason = '') {
    try {
      if (!id) throw new Error('ID da empresa não fornecido');

      const { error } = await supabase
        .from('businesses')
        .update({
          is_verified: false,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw new Error(`Erro ao rejeitar: ${error.message}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao rejeitar empresa:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE AVALIAÇO
  // ============================================

  async updateBusinessRating(id, rating, reviewCount) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          rating: rating,
          review_count: reviewCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      throw error;
    }
  }

  async getBusinessReviews(businessId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return [];
    }
  }

  // ============================================
  // MÉTODOS DE SERVIÇOS DA EMPRESA
  // ============================================

  async getBusinessServices(businessId) {
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select(`*, gallery:service_gallery(*)`)
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar serviços:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  }

  async getServiceById(id) {
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select(`*, gallery:service_gallery(*), business:businesses(*)`)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      return null;
    }
  }

  async createService(data) {
    try {
      console.log('🔍 [createService] Dados recebidos:', data);

      if (!data.business_id) throw new Error('ID da empresa é obrigatório');
      if (!data.name || data.name.trim() === '')
        throw new Error('Nome do serviço é obrigatório');
      if (!data.price || data.price <= 0)
        throw new Error('Preço é obrigatório e deve ser maior que 0');

      const serviceData = {
        business_id: data.business_id,
        name: data.name.trim(),
        description: data.description || '',
        price: parseFloat(data.price),
        price_type: data.price_type || 'fixed',
        category: data.category || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        featured: data.featured || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (data.duration && data.duration > 0)
        serviceData.duration = parseInt(data.duration);
      if (data.max_people && data.max_people > 0)
        serviceData.max_people = parseInt(data.max_people);

      if (data.logoFile) {
        console.log('📤 [createService] Upload do logotipo do serviço...');
        serviceData.logo_url = await this.uploadImage(data.logoFile, 'services/logos');
      } else if (data.logo_url) {
        serviceData.logo_url = data.logo_url;
      }

      if (data.imageFile) {
        serviceData.image_url = await this.uploadImage(data.imageFile, 'services');
      } else if (data.image_url) {
        serviceData.image_url = data.image_url;
      }

      const { data: service, error } = await supabase
        .from('business_services')
        .insert(serviceData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Serviço criado:', service);
      return service;
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      throw error;
    }
  }

  async updateService(id, data) {
    try {
      console.log('🔍 [updateService] Atualizando serviço:', id);

      const updateData = {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        price_type: data.price_type || 'fixed',
        category: data.category || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
        featured: data.featured || false,
        updated_at: new Date().toISOString(),
      };

      if (data.duration && data.duration > 0)
        updateData.duration = parseInt(data.duration);
      if (data.max_people && data.max_people > 0)
        updateData.max_people = parseInt(data.max_people);

      if (data.logoFile) {
        console.log('📤 [updateService] Upload do novo logotipo...');
        if (data.oldLogoUrl) {
          await this.deleteImage(data.oldLogoUrl);
        }
        updateData.logo_url = await this.uploadImage(data.logoFile, 'services/logos');
      } else if (data.logo_url !== undefined) {
        updateData.logo_url = data.logo_url;
      }

      if (data.imageFile) {
        if (data.oldImageUrl) {
          await this.deleteImage(data.oldImageUrl);
        }
        updateData.image_url = await this.uploadImage(data.imageFile, 'services');
      } else if (data.image_url !== undefined) {
        updateData.image_url = data.image_url;
      }

      const { data: service, error } = await supabase
        .from('business_services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Serviço atualizado:', service);
      return service;
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error);
      throw error;
    }
  }

  async deleteService(id) {
    try {
      const service = await this.getServiceById(id);
      if (service) {
        if (service.logo_url) await this.deleteImage(service.logo_url);
        if (service.image_url) await this.deleteImage(service.image_url);
      }

      const { error } = await supabase
        .from('business_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE GALERIA DE SERVIÇOS
  // ============================================

  async addServiceImage(serviceId, imageUrl, title = '') {
    try {
      const { data, error } = await supabase
        .from('service_gallery')
        .insert({ service_id: serviceId, image_url: imageUrl, title: title })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      throw error;
    }
  }

  async removeServiceImage(imageId) {
    try {
      const { error } = await supabase
        .from('service_gallery')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE GALERIA DA EMPRESA
  // ============================================

  async addBusinessImage(businessId, imageUrl, title = '') {
    try {
      const { data, error } = await supabase
        .from('business_gallery')
        .insert({ business_id: businessId, image_url: imageUrl, title: title })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      throw error;
    }
  }

  async removeBusinessImage(imageId) {
    try {
      const { error } = await supabase
        .from('business_gallery')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  }

  async getBusinessGallery(businessId) {
    try {
      const { data, error } = await supabase
        .from('business_gallery')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar galeria:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar galeria:', error);
      return [];
    }
  }

  // ============================================
  // MÉTODOS DE PAGAMENTO
  // ============================================

  async getBusinessPaymentMethods(businessId) {
    try {
      const { data, error } = await supabase
        .from('business_payment_methods')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erro ao buscar métodos de pagamento:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return [];
    }
  }

  async addPaymentMethod(data) {
    try {
      if (!data.business_id) throw new Error('ID da empresa é obrigatório');
      if (!data.method_type) throw new Error('Tipo de método é obrigatório');
      if (!data.name || data.name.trim() === '')
        throw new Error('Nome do método é obrigatório');

      const paymentData = {
        business_id: data.business_id,
        method_type: data.method_type,
        name: data.name.trim(),
        description: data.description || '',
        details: data.details || {},
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: method, error } = await supabase
        .from('business_payment_methods')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return method;
    } catch (error) {
      console.error('❌ Erro ao adicionar método de pagamento:', error);
      throw error;
    }
  }

  async removePaymentMethod(id) {
    try {
      const { error } = await supabase
        .from('business_payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao remover método de pagamento:', error);
      throw error;
    }
  }

  // ============================================
  // ✅ MÉTODOS DE RESERVAS (tabela: bookings)
  // ============================================
  // A tabela correta é `bookings` (não `reservations`)
  // Mapeamento de colunas:
  //   total_amount      ↔ total_price
  //   reservation_date  ↔ booking_date_service
  //   reservation_time  ↔ booking_time
  //   quantity          ↔ guests
  // ============================================

  /**
   * Normalizar dados de reserva para o formato esperado pela app
   */
  _normalizeReservation(row) {
    if (!row) return null;
    return {
      id: row.id,
      user_id: row.user_id,
      business_id: row.business_id || row.company_id,
      service_id: row.service_id,
      status: row.status,
      payment_status: row.payment_status,
      total_amount: row.total_price ?? row.total_amount ?? row.subtotal ?? 0,
      subtotal: row.subtotal,
      platform_fee: row.platform_fee,
      reservation_date: row.booking_date_service || row.reservation_date,
      reservation_time: row.booking_time || row.reservation_time,
      quantity: row.guests || row.quantity || 1,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Preservar campos originais para compatibilidade
      ...row,
    };
  }

  /**
   * Normalizar dados de entrada para gravação
   */
  _denormalizeReservation(data) {
    const out = {};
    if (data.user_id !== undefined) out.user_id = data.user_id;
    if (data.business_id !== undefined) out.business_id = data.business_id;
    if (data.company_id !== undefined) out.company_id = data.company_id;
    if (data.service_id !== undefined) out.service_id = data.service_id;
    if (data.status !== undefined) out.status = data.status;
    if (data.payment_status !== undefined) out.payment_status = data.payment_status;
    if (data.notes !== undefined) out.notes = data.notes;

    // Mapear total_amount → total_price
    if (data.total_amount !== undefined) out.total_price = data.total_amount;
    if (data.total_price !== undefined) out.total_price = data.total_price;

    // Mapear reservation_date → booking_date_service
    if (data.reservation_date !== undefined)
      out.booking_date_service = data.reservation_date;
    if (data.booking_date_service !== undefined)
      out.booking_date_service = data.booking_date_service;

    // Mapear reservation_time → booking_time
    if (data.reservation_time !== undefined)
      out.booking_time = data.reservation_time;
    if (data.booking_time !== undefined) out.booking_time = data.booking_time;

    // Mapear quantity → guests
    if (data.quantity !== undefined) out.guests = data.quantity;
    if (data.guests !== undefined) out.guests = data.guests;

    return out;
  }

  async createReservation(data) {
    try {
      console.log('📝 [createReservation] Criando:', data);

      const payload = {
        user_id: data.user_id,
        business_id: data.business_id || data.company_id,
        company_id: data.business_id || data.company_id,
        service_id: data.service_id,
        total_price: data.total_amount ?? data.total_price,
        subtotal: data.subtotal ?? data.total_amount ?? data.total_price,
        platform_fee: data.platform_fee ?? 0,
        booking_date_service: data.reservation_date || data.booking_date_service,
        booking_time: data.reservation_time || data.booking_time || null,
        guests: data.quantity || data.guests || 1,
        customer_name: data.customer_name || null,
        customer_email: data.customer_email || null,
        customer_phone: data.customer_phone || null,
        notes: data.notes || '',
        payment_method: data.payment_method || 'pending',
        payment_status: data.payment_status || 'pending',
        status: data.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: row, error } = await supabase
        .from('bookings')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return this._normalizeReservation(row);
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      throw error;
    }
  }

  async getUserReservations(userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const enriched = await Promise.all(
        data.map(async (row) => {
          const item = this._normalizeReservation(row);

          if (row.service_id) {
            try {
              const { data: service } = await supabase
                .from('business_services')
                .select('id, name, description, price, category, logo_url, image_url')
                .eq('id', row.service_id)
                .maybeSingle();
              item.service = service;
            } catch (err) {
              console.warn('Erro ao buscar serviço:', err);
            }
          }

          const bizId = row.business_id || row.company_id;
          if (bizId) {
            try {
              const { data: business } = await supabase
                .from('businesses')
                .select('id, name, logo_url, address, phone, email, category, province')
                .eq('id', bizId)
                .maybeSingle();
              item.business = business;
            } catch (err) {
              console.warn('Erro ao buscar empresa:', err);
            }
          }

          return item;
        })
      );

      return enriched;
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }
  }

  async getBusinessReservations(businessId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`business_id.eq.${businessId},company_id.eq.${businessId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar reservas da empresa:', error);
        return [];
      }

      if (!data || data.length === 0) return [];

      const enriched = await Promise.all(
        data.map(async (row) => {
          const item = this._normalizeReservation(row);

          if (row.user_id) {
            try {
              const { data: user } = await supabase
                .from('profiles')
                .select('id, name, email, phone, avatar_url')
                .eq('id', row.user_id)
                .maybeSingle();
              item.user = user;
            } catch (err) {
              console.warn('Erro ao buscar usuário:', err);
            }
          }

          if (row.service_id) {
            try {
              const { data: service } = await supabase
                .from('business_services')
                .select('id, name, description, price, category, logo_url, image_url')
                .eq('id', row.service_id)
                .maybeSingle();
              item.service = service;
            } catch (err) {
              console.warn('Erro ao buscar serviço:', err);
            }
          }

          return item;
        })
      );

      return enriched;
    } catch (error) {
      console.error('Erro ao buscar reservas da empresa:', error);
      return [];
    }
  }

  async getReservationById(id) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar reserva:', error);
        return null;
      }
      if (!data) return null;

      const enriched = this._normalizeReservation(data);

      if (data.user_id) {
        const { data: user } = await supabase
          .from('profiles')
          .select('id, name, email, phone, avatar_url')
          .eq('id', data.user_id)
          .maybeSingle();
        enriched.user = user;
      }

      if (data.service_id) {
        const { data: service } = await supabase
          .from('business_services')
          .select(
            'id, name, description, price, category, logo_url, image_url, duration, max_people'
          )
          .eq('id', data.service_id)
          .maybeSingle();
        enriched.service = service;
      }

      const bizId = data.business_id || data.company_id;
      if (bizId) {
        const { data: business } = await supabase
          .from('businesses')
          .select('id, name, logo_url, address, phone, email, category, province')
          .eq('id', bizId)
          .maybeSingle();
        enriched.business = business;
      }

      if (data.payment_method_id) {
        const { data: paymentMethod } = await supabase
          .from('business_payment_methods')
          .select('id, name, method_type, description')
          .eq('id', data.payment_method_id)
          .maybeSingle();
        enriched.payment_method = paymentMethod;
      }

      return enriched;
    } catch (error) {
      console.error('❌ Erro ao buscar reserva:', error);
      return null;
    }
  }

  async updateReservationStatus(id, status) {
    try {
      console.log('🔄 [updateReservationStatus]', { id, status });

      const { data, error } = await supabase
        .from('bookings')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        console.warn('⚠️ Nenhuma linha atualizada para ID:', id);
        return null;
      }

      return this._normalizeReservation(data);
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  }

  async updateReservationPaymentStatus(id, paymentStatus, paymentMethodId = null) {
    try {
      console.log('🔄 [updateReservationPaymentStatus]', {
        id,
        paymentStatus,
        paymentMethodId,
      });

      const updateData = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (paymentMethodId) updateData.payment_method_id = paymentMethodId;

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        console.warn('⚠️ Nenhuma linha atualizada para ID:', id);
        return null;
      }

      return this._normalizeReservation(data);
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      throw error;
    }
  }

  async cancelReservation(id, reason = '') {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          notes: reason,
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        console.warn('⚠️ Nenhuma linha atualizada para ID:', id);
        return null;
      }

      return this._normalizeReservation(data);
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw error;
    }
  }
}

export default new BusinessService();