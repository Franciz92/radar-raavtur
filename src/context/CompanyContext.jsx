// src/context/CompanyContext.jsx
// ============================================
// COMPANY CONTEXT - CORRIGIDO
// - Usa business_services (não services)
// - Usa reservations (não bookings)
// - Adiciona deleteService, refreshData
// - Garante user_id na empresa
// ============================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import businessService from '../services/businessService';
import toast from 'react-hot-toast';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const loadingRef = useRef(false);

  // ============================================
  // CARREGAR DADOS DA EMPRESA
  // ============================================
  const loadCompanyData = useCallback(async () => {
    if (!user?.id || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      console.log('🔄 [CompanyContext] Carregando dados da empresa para:', user.id);

      // ✅ Buscar de 'businesses' (tabela principal)
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (businessesError) {
        console.error('❌ [CompanyContext] Erro ao buscar empresas:', businessesError);
        setCompany(null);
        setLoading(false);
        setInitialized(true);
        loadingRef.current = false;
        return;
      }

      if (!businessesData || businessesData.length === 0) {
        console.log('📝 [CompanyContext] Nenhuma empresa encontrada para o usuário');
        setCompany(null);
        setServices([]);
        setBookings([]);
        setLoading(false);
        setInitialized(true);
        loadingRef.current = false;
        return;
      }

      // Priorizar empresa verificada
      let selectedCompany = businessesData.find(c => c.is_verified === true);
      
      if (!selectedCompany) {
        selectedCompany = businessesData[0];
      }

      // ✅ GARANTIR que o user_id está presente
      selectedCompany = {
        ...selectedCompany,
        user_id: selectedCompany.user_id || user.id
      };

      console.log('✅ [CompanyContext] Empresa selecionada:', {
        id: selectedCompany.id,
        name: selectedCompany.name,
        user_id: selectedCompany.user_id,
        is_verified: selectedCompany.is_verified
      });

      setCompany(selectedCompany);

      // ✅ Buscar serviços de 'business_services' (não 'services')
      const { data: servicesData, error: servicesError } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('❌ [CompanyContext] Erro ao buscar serviços:', servicesError);
        setServices([]);
      } else {
        console.log(`📊 [CompanyContext] Serviços encontrados: ${servicesData?.length || 0}`);
        setServices(servicesData || []);
      }

      // ✅ Buscar reservas de 'reservations' (não 'bookings')
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('business_id', selectedCompany.id)
        .order('created_at', { ascending: false });

      if (reservationsError) {
        console.error('❌ [CompanyContext] Erro ao buscar reservas:', reservationsError);
        setBookings([]);
      } else {
        console.log(`📊 [CompanyContext] Reservas encontradas: ${reservationsData?.length || 0}`);
        setBookings(reservationsData || []);
      }

    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
      loadingRef.current = false;
    }
  }, [user]);

  // ============================================
  // ✅ REFRESH DATA (usado pelo CompanyServices)
  // ============================================
  const refreshData = useCallback(async () => {
    console.log('🔄 [CompanyContext] refreshData chamado');
    loadingRef.current = false; // Reset para forçar reload
    await loadCompanyData();
  }, [loadCompanyData]);

  // Alias para compatibilidade
  const refreshCompanyData = refreshData;

  // ============================================
  // ATUALIZAR EMPRESA
  // ============================================
  const updateCompany = useCallback(async (companyData) => {
    if (!company?.id) {
      toast.error('Empresa não encontrada');
      return null;
    }

    console.log('📝 [CompanyContext] Atualizando empresa:', company.id);

    try {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          ...companyData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;

      setCompany({ ...data, user_id: data.user_id || user.id });
      toast.success('Empresa atualizada com sucesso!');
      return data;
    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao atualizar empresa:', error);
      toast.error(error.message || 'Erro ao atualizar empresa');
      return null;
    }
  }, [company, user]);

  // ============================================
  // CRIAR EMPRESA
  // ============================================
  const createCompany = useCallback(async (companyData) => {
    if (!user?.id) {
      toast.error('Faça login para criar uma empresa');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          user_id: user.id,
          name: companyData.name,
          slug: companyData.slug || companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: companyData.category,
          subcategory: companyData.subcategory || null,
          description: companyData.description || '',
          full_description: companyData.full_description || '',
          email: companyData.email || user.email,
          phone: companyData.phone || '',
          address: companyData.address || '',
          province: companyData.province || '',
          website: companyData.website || '',
          logo_url: companyData.logo_url || null,
          cover_image: companyData.cover_image || null,
          gallery: companyData.gallery || [],
          latitude: companyData.latitude || null,
          longitude: companyData.longitude || null,
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      setCompany(data);
      toast.success('Empresa criada com sucesso!');
      return data;
    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao criar empresa:', error);
      toast.error(error.message || 'Erro ao criar empresa');
      return null;
    }
  }, [user]);

  // ============================================
  // ✅ ADICIONAR SERVIÇO - USA business_services
  // ============================================
  const addService = useCallback(async (serviceData) => {
    if (!company?.id) {
      toast.error('Empresa não encontrada');
      return null;
    }

    try {
      console.log('📝 [CompanyContext] Adicionando serviço:', serviceData);

      // Usar businessService para consistência
      const result = await businessService.createService({
        business_id: company.id,
        name: serviceData.name,
        description: serviceData.description || '',
        price: serviceData.price || 0,
        category: serviceData.category || null,
        duration: serviceData.duration || null,
        max_people: serviceData.max_people || null,
        is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
        featured: serviceData.featured || false,
        logoFile: serviceData.logoFile || null,
        imageFile: serviceData.imageFile || null,
        logo_url: serviceData.logo_url || null,
        image_url: serviceData.image_url || null,
      });

      if (result) {
        console.log('✅ [CompanyContext] Serviço adicionado:', result);
        setServices(prev => [result, ...prev]);
        return result;
      }
      return null;
    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao adicionar serviço:', error);
      toast.error(error.message || 'Erro ao adicionar serviço');
      throw error;
    }
  }, [company]);

  // ============================================
  // ✅ ATUALIZAR SERVIÇO - USA business_services
  // ============================================
  const updateService = useCallback(async (serviceId, serviceData) => {
    try {
      console.log('📝 [CompanyContext] Atualizando serviço:', serviceId);

      const result = await businessService.updateService(serviceId, {
        name: serviceData.name,
        description: serviceData.description || '',
        price: serviceData.price || 0,
        category: serviceData.category || null,
        duration: serviceData.duration || null,
        max_people: serviceData.max_people || null,
        is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
        featured: serviceData.featured || false,
        logoFile: serviceData.logoFile || null,
        oldLogoUrl: serviceData.oldLogoUrl || null,
        imageFile: serviceData.imageFile || null,
        oldImageUrl: serviceData.oldImageUrl || null,
        logo_url: serviceData.logo_url !== undefined ? serviceData.logo_url : undefined,
        image_url: serviceData.image_url !== undefined ? serviceData.image_url : undefined,
      });

      if (result) {
        setServices(prev => prev.map(s => s.id === serviceId ? result : s));
        return result;
      }
      return null;
    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao atualizar serviço:', error);
      toast.error(error.message || 'Erro ao atualizar serviço');
      throw error;
    }
  }, []);

  // ============================================
  // ✅ DELETE SERVICE (usado pelo CompanyServices)
  // ============================================
  const deleteService = useCallback(async (serviceId) => {
    try {
      console.log('🗑️ [CompanyContext] Eliminando serviço:', serviceId);

      const success = await businessService.deleteService(serviceId);

      if (success) {
        setServices(prev => prev.filter(s => s.id !== serviceId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao eliminar serviço:', error);
      throw error;
    }
  }, []);

  // ============================================
  // ✅ REMOVE SERVICE (compatibilidade)
  // ============================================
  const removeService = useCallback(async (serviceId) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return false;

    try {
      const success = await deleteService(serviceId);
      if (success) {
        toast.success('Serviço removido com sucesso!');
      }
      return success;
    } catch (error) {
      toast.error(error.message || 'Erro ao remover serviço');
      return false;
    }
  }, [deleteService]);

  // ============================================
  // LIMPAR EMPRESAS DUPLICADAS
  // ============================================
  const cleanupDuplicateCompanies = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🧹 [CompanyContext] Verificando empresas duplicadas...');

      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, name, is_verified, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !businesses || businesses.length <= 1) return;

      console.log(`📊 [CompanyContext] Encontradas ${businesses.length} empresas`);

      // Manter a verificada ou a mais recente
      const keepCompany = businesses.find(c => c.is_verified === true) || businesses[0];
      const toDelete = businesses.filter(c => c.id !== keepCompany.id);
      
      // ⚠️ DESATIVADO: Não eliminar automaticamente
      // Apenas log para não perder dados do utilizador
      toDelete.forEach(c => {
        console.log(`ℹ️ [CompanyContext] Empresa duplicada encontrada: ${c.name} (${c.id})`);
      });

      console.log('✅ [CompanyContext] Verificação de duplicatas concluída');
    } catch (error) {
      console.error('❌ [CompanyContext] Erro ao verificar duplicatas:', error);
    }
  }, [user]);

  // ============================================
  // EFFECT - CARREGAR DADOS INICIAIS
  // ============================================
  useEffect(() => {
    if (user) {
      loadCompanyData();
    } else {
      setCompany(null);
      setServices([]);
      setBookings([]);
      setLoading(false);
      setInitialized(true);
    }
  }, [user, loadCompanyData]);

  // ============================================
  // VALUE
  // ============================================
  const value = {
    // Estado
    company,
    services,
    bookings,
    loading,
    initialized,
    
    // Métodos
    loadCompanyData,
    refreshData,           // ✅ Usado pelo CompanyServices
    refreshCompanyData,    // ✅ Alias
    updateCompany,
    createCompany,
    addService,
    updateService,
    deleteService,         // ✅ Usado pelo CompanyServices
    removeService,         // ✅ Compatibilidade
    cleanupDuplicateCompanies,
    
    // Computed
    isCompanyOwner: !!company,
    isVerified: company?.is_verified === true,
    isActive: company?.is_active === true,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany deve ser usado dentro de CompanyProvider');
  }
  return context;
}

export default CompanyContext;