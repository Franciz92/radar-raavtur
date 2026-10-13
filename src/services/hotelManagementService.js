// src/services/hotelManagementService.js

import { supabase } from './supabase';

export const hotelManagementService = {
  // ============================================
  // SERVIÇOS
  // ============================================
  
  // Criar serviço
  async createService(data) {
    try {
      const { data: service, error } = await supabase
        .from('company_services')
        .insert([{
          company_id: data.company_id,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          currency: data.currency || 'Kz',
          duration: data.duration,
          capacity: data.capacity,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: service, success: true };
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  // Buscar serviços da empresa
  async getServicesByCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from('company_services')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error);
      return { data: [], error: error.message, success: false };
    }
  },

  // Atualizar serviço
  async updateService(id, data) {
    try {
      const { data: service, error } = await supabase
        .from('company_services')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: service, success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  // Deletar serviço
  async deleteService(id) {
    try {
      const { error } = await supabase
        .from('company_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // GALERIA
  // ============================================

  // Adicionar imagem à galeria
  async addGalleryImage(data) {
    try {
      const { data: image, error } = await supabase
        .from('company_gallery')
        .insert([{
          company_id: data.company_id,
          image_url: data.image_url,
          title: data.title,
          description: data.description,
          category: data.category,
          is_cover: data.is_cover || false,
          sort_order: data.sort_order || 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: image, success: true };
    } catch (error) {
      console.error('❌ Erro ao adicionar imagem:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  // Buscar galeria da empresa
  async getGalleryByCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from('company_gallery')
        .select('*')
        .eq('company_id', companyId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      console.error('❌ Erro ao buscar galeria:', error);
      return { data: [], error: error.message, success: false };
    }
  },

  // Remover imagem da galeria
  async removeGalleryImage(id) {
    try {
      const { error } = await supabase
        .from('company_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao remover imagem:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // CONTATOS
  // ============================================

  // Adicionar contato
  async addContact(data) {
    try {
      // Se for primário, remover primário anterior
      if (data.is_primary) {
        await supabase
          .from('company_contacts')
          .update({ is_primary: false })
          .eq('company_id', data.company_id)
          .eq('type', data.type);
      }

      const { data: contact, error } = await supabase
        .from('company_contacts')
        .insert([{
          company_id: data.company_id,
          type: data.type,
          value: data.value,
          label: data.label,
          is_primary: data.is_primary || false,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: contact, success: true };
    } catch (error) {
      console.error('❌ Erro ao adicionar contato:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  // Buscar contatos da empresa
  async getContactsByCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      console.error('❌ Erro ao buscar contatos:', error);
      return { data: [], error: error.message, success: false };
    }
  },

  // Remover contato
  async removeContact(id) {
    try {
      const { error } = await supabase
        .from('company_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao remover contato:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // MÉTODOS DE PAGAMENTO
  // ============================================

  // Adicionar método de pagamento
  async addPaymentMethod(data) {
    try {
      // Se for padrão, remover padrão anterior
      if (data.is_default) {
        await supabase
          .from('company_payment_methods')
          .update({ is_default: false })
          .eq('company_id', data.company_id);
      }

      const { data: method, error } = await supabase
        .from('company_payment_methods')
        .insert([{
          company_id: data.company_id,
          type: data.type,
          name: data.name,
          description: data.description,
          config: data.config || {},
          is_active: true,
          is_default: data.is_default || false,
        }])
        .select()
        .single();

      if (error) throw error;
      return { data: method, success: true };
    } catch (error) {
      console.error('❌ Erro ao adicionar método de pagamento:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  // Buscar métodos de pagamento da empresa
  async getPaymentMethodsByCompany(companyId) {
    try {
      const { data, error } = await supabase
        .from('company_payment_methods')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return { data: data || [], success: true };
    } catch (error) {
      console.error('❌ Erro ao buscar métodos de pagamento:', error);
      return { data: [], error: error.message, success: false };
    }
  },

  // Atualizar método de pagamento
  async updatePaymentMethod(id, data) {
    try {
      const { data: method, error } = await supabase
        .from('company_payment_methods')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: method, success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar método de pagamento:', error);
      return { data: null, error: error.message, success: false };
    }
  },

  // Remover método de pagamento
  async removePaymentMethod(id) {
    try {
      const { error } = await supabase
        .from('company_payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao remover método de pagamento:', error);
      return { success: false, error: error.message };
    }
  },
};