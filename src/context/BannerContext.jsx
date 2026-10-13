// src/context/BannerContext.jsx
// ============================================
// CONTEXT: Banners (cache global + realtime)
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getBanners } from '../services/bannerService';

const BannerContext = createContext();

export function BannerProvider({ children }) {
  const [heroBanners, setHeroBanners] = useState([]);
  const [headerBanners, setHeaderBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [hero, header] = await Promise.all([
        getBanners('home_hero'),
        getBanners('header_top'),
      ]);
      setHeroBanners(hero);
      setHeaderBanners(header);
    } catch (err) {
      console.error('[BannerContext] loadAll:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('banners-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        () => {
          console.log('🔔 [BannerContext] Banners alterados, recarregando...');
          loadAll();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  const value = {
    heroBanners,
    headerBanners,
    loading,
    refresh: loadAll,
  };

  return <BannerContext.Provider value={value}>{children}</BannerContext.Provider>;
}

export function useBanners() {
  const ctx = useContext(BannerContext);
  if (!ctx) throw new Error('useBanners deve ser usado dentro de BannerProvider');
  return ctx;
}

export default BannerContext;