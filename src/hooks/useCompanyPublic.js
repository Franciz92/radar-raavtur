// src/hooks/useCompanyPublic.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useCompanyPublic = (companyId) => {
  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCompanyData = useCallback(async () => {
    if (!companyId) {
      setError('ID da empresa não fornecido');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [useCompanyPublic] Carregando empresa:', companyId);

      // 1. Buscar dados da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', companyId)
        .eq('is_active', true)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          setError('Empresa não encontrada');
        } else {
          throw companyError;
        }
        setLoading(false);
        return;
      }

      if (!companyData) {
        setError('Empresa não encontrada');
        setLoading(false);
        return;
      }

      setCompany(companyData);

      // 2. Buscar serviços da empresa (apenas aprovados)
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', companyId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('Erro ao buscar serviços:', servicesError);
      } else {
        setServices(servicesData || []);
      }

      // 3. Buscar avaliações da empresa
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('business_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) {
        console.error('Erro ao buscar avaliações:', reviewsError);
      } else {
        setReviews(reviewsData || []);
      }

      console.log('✅ [useCompanyPublic] Dados carregados com sucesso');

    } catch (err) {
      console.error('❌ [useCompanyPublic] Erro:', err);
      setError(err.message || 'Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  // Calcular média de avaliações
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return {
    company,
    services,
    reviews,
    loading,
    error,
    averageRating,
    reload: loadCompanyData,
  };
};