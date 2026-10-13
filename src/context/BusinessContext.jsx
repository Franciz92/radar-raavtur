// src/context/BusinessContext.jsx
// ============================================
// BUSINESS CONTEXT - COMPLETO E CORRIGIDO
// - Passa TODOS os campos (incluindo subcategory)
// - Logs detalhados para diagnóstico
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import businessService from '../services/businessService';
import toast from 'react-hot-toast';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // CARREGAR EMPRESAS DO USUÁRIO
  // ============================================
  const loadBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await businessService.getUserBusinesses(user.id);
      setBusinesses(data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CRIAR NOVA EMPRESA - CORRIGIDO
  // ============================================
  const createBusiness = async (data) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      throw new Error('Usuário não autenticado');
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🏢 [BusinessContext.createBusiness] Dados recebidos:');
      console.log('  - name:', data.name);
      console.log('  - category:', data.category);
      console.log('  - subcategory:', data.subcategory);  // ✅ Log crítico
      console.log('  - logoFile:', data.logoFile?.name || 'Não');
      console.log('  - coverFile:', data.coverFile?.name || 'Não');

      // ✅ Passar TODOS os campos explicitamente
      const payload = {
        user_id: user.id,
        name: data.name,
        category: data.category,
        subcategory: data.subcategory || null,  // ✅ GARANTIR
        description: data.description || '',
        full_description: data.full_description || data.description || '',
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        province: data.province || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        logo_url: data.logo_url || null,
        cover_image: data.cover_image || null,
        gallery: data.gallery || [],
        // Ficheiros para upload
        logoFile: data.logoFile || null,
        coverFile: data.coverFile || null,
        galleryFiles: data.galleryFiles || null,
      };

      console.log('🏢 [BusinessContext.createBusiness] Payload final:', {
        ...payload,
        logoFile: payload.logoFile?.name || 'Não',
        coverFile: payload.coverFile?.name || 'Não'
      });

      const newBusiness = await businessService.createBusiness(payload);
      
      if (newBusiness) {
        console.log('✅ [BusinessContext.createBusiness] Empresa criada:', {
          id: newBusiness.id,
          name: newBusiness.name,
          category: newBusiness.category,
          subcategory: newBusiness.subcategory  // ✅ Confirmar
        });
        setBusinesses(prev => [newBusiness, ...prev]);
        return newBusiness;
      }
      return null;
    } catch (err) {
      console.error('❌ [BusinessContext.createBusiness] Erro:', err);
      setError(err.message);
      
      if (err.message && err.message.includes('approval_status')) {
        toast.error('Erro de configuração do banco de dados. Contate o suporte.');
      } else {
        toast.error(err.message || 'Erro ao criar empresa');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ATUALIZAR EMPRESA
  // ============================================
  const updateBusiness = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await businessService.updateBusiness(id, data);
      
      if (updated) {
        setBusinesses(prev => 
          prev.map(b => b.id === id ? updated : b)
        );
        if (currentBusiness?.id === id) {
          setCurrentBusiness(updated);
        }
        return updated;
      }
      return null;
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      setError(err.message);
      toast.error(err.message || 'Erro ao atualizar empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DELETAR EMPRESA
  // ============================================
  const deleteBusiness = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const success = await businessService.deleteBusiness(id);
      
      if (success) {
        setBusinesses(prev => prev.filter(b => b.id !== id));
        if (currentBusiness?.id === id) {
          setCurrentBusiness(null);
        }
        toast.success('Empresa eliminada com sucesso');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao deletar empresa:', err);
      setError(err.message);
      toast.error(err.message || 'Erro ao eliminar empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // BUSCAR EMPRESA POR ID
  // ============================================
  const getBusinessById = async (id) => {
    try {
      const business = await businessService.getBusinessById(id);
      if (business) {
        setCurrentBusiness(business);
      }
      return business;
    } catch (err) {
      console.error('Erro ao buscar empresa:', err);
      return null;
    }
  };

  // ============================================
  // BUSCAR EMPRESA POR SLUG
  // ============================================
  const getBusinessBySlug = async (slug) => {
    try {
      return await businessService.getBusinessBySlug(slug);
    } catch (err) {
      console.error('Erro ao buscar empresa por slug:', err);
      return null;
    }
  };

  // ============================================
  // CONTAR EMPRESAS DO USUÁRIO
  // ============================================
  const countUserBusinesses = async () => {
    if (!user) return 0;
    try {
      return await businessService.countUserBusinesses(user.id);
    } catch (err) {
      console.error('Erro ao contar empresas:', err);
      return 0;
    }
  };

  // ============================================
  // CARREGAR EMPRESAS AO INICIAR (se user autenticado)
  // ============================================
  useEffect(() => {
    if (user) {
      loadBusinesses();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
    }
  }, [user?.id]);

  // ============================================
  // VALUE DO CONTEXTO
  // ============================================
  const value = {
    // Estado
    businesses,
    currentBusiness,
    loading,
    error,
    
    // Métodos
    loadBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessById,
    getBusinessBySlug,
    countUserBusinesses,
    
    // Utilitário
    setCurrentBusiness,
    setBusinesses,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export default BusinessContext;