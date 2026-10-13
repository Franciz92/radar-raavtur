// src/context/PublicBusinessContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import businessService from '../services/businessService';

const PublicBusinessContext = createContext();

export const PublicBusinessProvider = ({ children }) => {
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [guides, setGuides] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [PublicBusinessContext] Carregando categorias...');
      
      const [hotelsData, restaurantsData, agenciesData, guidesData, allData] = await Promise.all([
        businessService.getBusinessesByCategory('hotel'),
        businessService.getBusinessesByCategory('restaurant'),
        businessService.getBusinessesByCategory('agency'),
        businessService.getBusinessesByCategory('guide'),
        businessService.getVerifiedBusinesses(200)
      ]);

      console.log('✅ [PublicBusinessContext] Hotéis carregados:', hotelsData.length);
      console.log('✅ [PublicBusinessContext] Restaurantes carregados:', restaurantsData.length);
      console.log('✅ [PublicBusinessContext] Agências carregadas:', agenciesData.length);
      console.log('✅ [PublicBusinessContext] Guias carregados:', guidesData.length);
      console.log('✅ [PublicBusinessContext] Total empresas:', allData.length);

      setHotels(hotelsData);
      setRestaurants(restaurantsData);
      setAgencies(agenciesData);
      setGuides(guidesData);
      setAllBusinesses(allData);
    } catch (err) {
      console.error('❌ Erro ao carregar categorias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBusinessById = (id) => {
    return allBusinesses.find(b => b.id === id) || null;
  };

  const getBusinessBySlug = async (slug) => {
    try {
      return await businessService.getBusinessBySlug(slug);
    } catch (error) {
      console.error('Erro ao buscar empresa por slug:', error);
      return null;
    }
  };

  const refreshCategory = async (category) => {
    try {
      console.log(`🔄 [PublicBusinessContext] Recarregando categoria: ${category}`);
      const data = await businessService.getBusinessesByCategory(category);
      console.log(`✅ [PublicBusinessContext] ${category} recarregado:`, data.length);
      
      const setters = {
        hotel: setHotels,
        restaurant: setRestaurants,
        agency: setAgencies,
        guide: setGuides
      };
      
      if (setters[category]) {
        setters[category](data);
      }
      
      // Também atualizar allBusinesses
      const allData = await businessService.getVerifiedBusinesses(200);
      setAllBusinesses(allData);
      
      return data;
    } catch (err) {
      console.error(`❌ Erro ao recarregar categoria ${category}:`, err);
      return [];
    }
  };

  // ✅ Função para recarregar tudo (chamada após aprovação)
  const reloadAll = async () => {
    console.log('🔄 [PublicBusinessContext] Recarregando todos os dados...');
    await loadAllCategories();
    console.log('✅ [PublicBusinessContext] Recarregamento concluído!');
  };

  // ✅ Função para forçar recarregamento (com log)
  const forceReload = async () => {
    console.log('🔄 [PublicBusinessContext] Forçando recarregamento...');
    setLoading(true);
    try {
      await loadAllCategories();
      console.log('✅ [PublicBusinessContext] Forçado recarregamento concluído!');
    } catch (error) {
      console.error('❌ Erro ao forçar recarregamento:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Função para buscar empresas por categoria específica
  const getBusinessesByCategory = (category) => {
    const map = {
      hotel: hotels,
      restaurant: restaurants,
      agency: agencies,
      guide: guides
    };
    return map[category] || [];
  };

  useEffect(() => {
    loadAllCategories();
  }, []);

  const value = {
    hotels,
    restaurants,
    agencies,
    guides,
    allBusinesses,
    loading,
    error,
    loadAllCategories,
    getBusinessById,
    getBusinessBySlug,
    getBusinessesByCategory,
    refreshCategory,
    reloadAll,
    forceReload // ✅ Adicionado
  };

  return (
    <PublicBusinessContext.Provider value={value}>
      {children}
    </PublicBusinessContext.Provider>
  );
};

export const usePublicBusiness = () => {
  const context = useContext(PublicBusinessContext);
  if (!context) {
    throw new Error('usePublicBusiness must be used within a PublicBusinessProvider');
  }
  return context;
};

export default PublicBusinessContext;