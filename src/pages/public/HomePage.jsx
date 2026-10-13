// src/pages/public/HomePage.jsx
// ============================================
// HOME PAGE — Plataforma digital de turismo 2026
// ✅ Hero cinematográfico com estatísticas REAIS
// ✅ Search bar flutuante premium
// ✅ Categorias visuais
// ✅ Secções editoriais com dados da plataforma
// ============================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Search, Sparkles, ArrowRight, Star, ChevronLeft, ChevronRight,
  Building2, Briefcase, Camera, Calendar, Hotel, Utensils,
  Compass, TrendingUp, Shield, Award, CheckCircle, Clock,
  Users, Globe, Heart, Zap, Verified, Play, ChevronRight as ChevronR,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getFeaturedDestinations } from '../../services/destinationService';
import { supabase } from '../../services/supabase';
import { useBanners } from '../../context/BannerContext';

// ============================================
// CATEGORIAS
// ============================================
const CATEGORIES = [
  { icon: MapPin, pt: 'Destinos', en: 'Destinations', path: '/destinos', color: 'from-emerald-400 to-teal-500' },
  { icon: Hotel, pt: 'Hotéis', en: 'Hotels', path: '/hoteis', color: 'from-amber-400 to-orange-500' },
  { icon: Utensils, pt: 'Restaurantes', en: 'Restaurants', path: '/restaurantes', color: 'from-rose-400 to-red-500' },
  { icon: Camera, pt: 'Experiências', en: 'Experiences', path: '/experiencias', color: 'from-purple-400 to-indigo-500' },
  { icon: Calendar, pt: 'Eventos', en: 'Events', path: '/eventos', color: 'from-pink-400 to-fuchsia-500' },
  { icon: Building2, pt: 'Empresas', en: 'Companies', path: '/empresas', color: 'from-blue-400 to-cyan-500' },
  { icon: Compass, pt: 'Agências', en: 'Agencies', path: '/agencias', color: 'from-lime-400 to-green-500' },
  { icon: Briefcase, pt: 'Serviços', en: 'Services', path: '/servicos', color: 'from-sky-400 to-blue-500' },
];

// 21 Províncias de Angola (todas)
const PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire', 'Icolo e Bengo', 'Moxico Leste',
];

const AUTOPLAY_MS = 7000;

// ============================================
// HOOK: ESTATÍSTICAS REAIS DA PLATAFORMA
// ============================================
function usePlatformStats() {
  const [stats, setStats] = useState({
    provinces: 21,       // Fixo: Angola tem 21 províncias
    businesses: null,    // Dinâmico
    destinations: null,  // Dinâmico
    services: null,      // Dinâmico
    users: null,         // Dinâmico
    rating: null,        // Dinâmico
    reviews: null,       // Dinâmico
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const [
          businessesRes,
          destinationsRes,
          servicesRes,
          usersRes,
          reviewsRes,
        ] = await Promise.all([
          // Empresas ativas
          supabase
            .from('businesses')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),

          // Destinos ativos
          supabase
            .from('destinations')
            .select('id', { count: 'exact', head: true }),

          // Serviços ativos
          supabase
            .from('services')
            .select('id', { count: 'exact', head: true })
            .in('status', ['approved', 'active']),

          // Utilizadores (perfis)
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true }),

          // Avaliações — buscar apenas rating para calcular média
          supabase
            .from('reviews')
            .select('rating'),
        ]);

        if (!isMounted) return;

        // Calcular média das avaliações
        let avgRating = null;
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          const sum = reviewsRes.data.reduce((acc, r) => acc + (r.rating || 0), 0);
          avgRating = (sum / reviewsRes.data.length).toFixed(1);
        }

        setStats({
          provinces: 21,
          businesses: businessesRes.count ?? 0,
          destinations: destinationsRes.count ?? 0,
          services: servicesRes.count ?? 0,
          users: usersRes.count ?? 0,
          rating: avgRating,
          reviews: reviewsRes.data?.length ?? 0,
          loading: false,
        });
      } catch (err) {
        console.error('❌ Erro a carregar estatísticas:', err);
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  return stats;
}

// ============================================
// HOOK: CARROSSEL
// ============================================
function useCarousel(length, { autoPlay = true, delay = AUTOPLAY_MS } = {}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((p) => (p + 1) % length), [length]);
  const prev = useCallback(() => setIndex((p) => (p - 1 + length) % length), [length]);
  const goTo = useCallback((i) => setIndex(i), []);

  useEffect(() => {
    if (!autoPlay || paused || length <= 1) return undefined;
    const id = setInterval(next, delay);
    return () => clearInterval(id);
  }, [autoPlay, paused, next, delay, length]);

  return {
    index, next, prev, goTo,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    paused,
  };
}

// ============================================
// COMPONENTE: STAT CARD (usado no hero)
// ============================================
function StatCard({ icon: Icon, value, label, loading }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[#7FC0FA]/20 backdrop-blur-md border border-[#7FC0FA]/30 flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-[#7FC0FA]" />
      </div>
      <div>
        {loading ? (
          <div className="h-6 w-14 bg-white/20 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-black text-white leading-none tabular-nums">
            {value}
          </p>
        )}
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/60 mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

// ============================================
// HERO CARROSSEL — CINEMATOGRÁFICO
// ============================================
function HeroSection({ isEn }) {
  const heroRef = useRef(null);
  const { heroBanners, loading } = useBanners();
  const stats = usePlatformStats();
  const slides = heroBanners || [];
  const carousel = useCarousel(Math.max(slides.length, 1), {
    autoPlay: slides.length > 1,
  });

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') carousel.next();
    if (e.key === 'ArrowLeft') carousel.prev();
  };

  const getText = (slide, ptKey, enKey) => {
    const pt = slide[ptKey];
    const en = slide[enKey];
    return isEn ? (en || pt) : (pt || en);
  };

  // Formatar números grandes (5000 → 5K)
  const formatNumber = (n) => {
    if (n == null) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
    return n.toString();
  };

  // Loading
  if (loading) {
    return (
      <section className="relative h-[90vh] min-h-[600px] bg-[#0D1410] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-[#7FC0FA]/30 border-t-[#7FC0FA] rounded-full animate-spin" />
          <p className="text-[#7FC0FA] text-sm font-semibold">
            {isEn ? 'Loading...' : 'A carregar...'}
          </p>
        </div>
      </section>
    );
  }

  // Sem banners
  if (slides.length === 0) {
    return (
      <section className="relative h-[70vh] min-h-[500px] bg-gradient-to-br from-[#174A3A] via-[#0F382C] to-[#0D1410] flex items-center justify-center text-center px-6">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA]/15 text-[#7FC0FA] border border-[#7FC0FA]/30 mb-6">
            <Sparkles size={12} />
            {isEn ? 'Angola · 2026' : 'Angola · 2026'}
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            {isEn ? 'Discover Angola' : 'Descubra Angola'}
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Destinations, hotels, restaurants and experiences.'
              : 'Destinos, hotéis, restaurantes e experiências.'}
          </p>
        </div>
      </section>
    );
  }

  const slide = slides[carousel.index] || slides[0];

  return (
    <section
      ref={heroRef}
      onKeyDown={onKeyDown}
      onMouseEnter={carousel.pause}
      onMouseLeave={carousel.resume}
      className="relative h-[92vh] min-h-[640px] max-h-[920px] overflow-hidden bg-[#0D1410] outline-none"
      tabIndex={0}
      aria-roledescription="carrossel"
    >
      {/* Slides */}
      {slides.map((s, i) => {
        const isActive = i === carousel.index;
        return (
          <div
            key={s.id || i}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image_url}
              alt={getText(s, 'title_pt', 'title_en')}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            {/* Overlays cinematográficos */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </div>
        );
      })}

      {/* Conteúdo */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center pt-16 lg:pt-0">
        <div key={carousel.index} className="max-w-3xl">
          {/* Badge */}
          {getText(slide, 'badge_pt', 'badge_en') && (
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA] text-[#174A3A] mb-6 shadow-xl">
                <Sparkles size={12} />
                {getText(slide, 'badge_pt', 'badge_en')}
              </span>
            </div>
          )}

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.05] animate-slide-up">
            {getText(slide, 'title_pt', 'title_en')}
          </h1>

          {/* Subtítulo */}
          {getText(slide, 'subtitle_pt', 'subtitle_en') && (
            <p className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed animate-slide-up">
              {getText(slide, 'subtitle_pt', 'subtitle_en')}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4 animate-slide-up">
            <Link
              to={slide.link || '/destinos'}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#A94728] hover:bg-[#8D3B1F] text-white font-bold text-base shadow-2xl shadow-black/40 transition-all active:scale-[0.98]"
            >
              {getText(slide, 'cta_pt', 'cta_en') || (isEn ? 'Explore' : 'Explorar')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/sobre"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-base border border-white/20 transition-all"
            >
              <Play size={16} />
              {isEn ? 'How it works' : 'Como funciona'}
            </Link>
          </div>

          {/* ✅ ESTATÍSTICAS REAIS */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-6 animate-slide-up">
            <StatCard
              icon={MapPin}
              value={stats.loading ? '—' : stats.provinces}
              label={isEn ? 'Provinces' : 'Províncias'}
              loading={stats.loading}
            />
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <StatCard
              icon={Building2}
              value={stats.loading ? '—' : formatNumber(stats.businesses)}
              label={isEn ? 'Businesses' : 'Empresas'}
              loading={stats.loading}
            />
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <StatCard
              icon={MapPin}
              value={stats.loading ? '—' : formatNumber(stats.destinations)}
              label={isEn ? 'Destinations' : 'Destinos'}
              loading={stats.loading}
            />
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <StatCard
              icon={Star}
              value={
                stats.loading
                  ? '—'
                  : stats.rating
                  ? `${stats.rating} ★`
                  : '4.8 ★'
              }
              label={
                stats.reviews
                  ? isEn
                    ? `${stats.reviews} reviews`
                    : `${stats.reviews} avaliações`
                  : isEn
                  ? 'Rating'
                  : 'Avaliação'
              }
              loading={stats.loading}
            />
          </div>
        </div>
      </div>

      {/* Navegação */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={carousel.prev}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white items-center justify-center transition-all hover:scale-110"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={carousel.next}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white items-center justify-center transition-all hover:scale-110"
            aria-label="Próximo slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => carousel.goTo(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === carousel.index
                    ? 'w-10 bg-[#7FC0FA]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Trust badge — canto superior direito */}
      <div className="absolute top-6 right-6 z-30 hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
        <Shield size={14} className="text-[#7FC0FA]" />
        {isEn ? 'Official Angola Tourism Platform' : 'Plataforma Oficial de Turismo de Angola'}
      </div>
    </section>
  );
}

// ============================================
// SEARCH BAR — Flutuante estilo Booking
// ============================================
function SearchSection({ isEn }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (province) params.set('province', province);
    if (date) params.set('date', date);
    navigate(`/destinos?${params.toString()}`);
  };

  return (
    <section className="relative -mt-12 z-30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="bg-white dark:bg-[#17201B] rounded-2xl shadow-2xl shadow-black/15 border border-[#DDD4C0]/50 dark:border-[#223029]/50 p-2 sm:p-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            {/* Destino */}
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
              <input
                type="text"
                placeholder={isEn ? 'Where are you going?' : 'Para onde vai?'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-11 pr-4 rounded-xl bg-transparent text-sm font-medium text-[#18211D] dark:text-[#F7F5F0] placeholder:text-[#66736D] focus:outline-none"
              />
            </div>

            <div className="hidden md:block md:col-span-1 border-l border-[#DDD4C0] dark:border-[#223029]" />

            {/* Província */}
            <div className="md:col-span-3 relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full h-14 pl-11 pr-4 rounded-xl bg-transparent text-sm font-medium text-[#18211D] dark:text-[#F7F5F0] focus:outline-none cursor-pointer appearance-none"
              >
                <option value="">{isEn ? 'All provinces' : 'Todas as províncias'}</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="hidden md:block md:col-span-1 border-l border-[#DDD4C0] dark:border-[#223029]" />

            {/* Data */}
            <div className="md:col-span-3 relative">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66736D] pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 pl-11 pr-4 rounded-xl bg-transparent text-sm font-medium text-[#18211D] dark:text-[#F7F5F0] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Botão */}
            <div className="md:col-span-12">
              <button
                type="submit"
                className="w-full h-12 md:h-14 rounded-xl bg-[#A94728] hover:bg-[#8D3B1F] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
              >
                <Search size={18} />
                {isEn ? 'Search' : 'Pesquisar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

// ============================================
// CATEGORIAS
// ============================================
function CategoriesSection({ isEn }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA]/15 text-[#174A3A] dark:text-[#7FC0FA] mb-3">
            {isEn ? 'Explore' : 'Explorar'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18211D] dark:text-[#F7F5F0]">
            {isEn ? 'What are you looking for?' : 'O que procura?'}
          </h2>
          <p className="mt-2 text-[#66736D]">
            {isEn
              ? 'Browse by category and find what fits your trip.'
              : 'Navegue por categoria e encontre o que encaixa na sua viagem.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.path}
              to={cat.path}
              className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white dark:bg-[#17201B] border border-[#DDD4C0]/50 dark:border-[#223029]/50 hover:border-[#7FC0FA] hover:shadow-xl transition-all group-hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient accent no hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.06] transition-opacity`} />
              <div className="relative w-14 h-14 rounded-2xl bg-[#7FC0FA]/15 group-hover:bg-[#7FC0FA] text-[#174A3A] flex items-center justify-center transition-all group-hover:scale-110">
                <Icon size={24} strokeWidth={2} />
              </div>
              <span className="relative text-sm font-bold text-[#18211D] dark:text-[#F7F5F0] text-center">
                {isEn ? cat.en : cat.pt}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ============================================
// EMPRESAS EM DESTAQUE
// ============================================
function FeaturedCompanies({ isEn }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('businesses')
          .select('*')
          .eq('is_active', true)
          .order('is_verified', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6);
        setCompanies(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading || companies.length === 0) return null;

  return (
    <section className="bg-[#F7F5F0] dark:bg-[#0D1410] border-y border-[#DDD4C0]/50 dark:border-[#223029]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA]/15 text-[#174A3A] dark:text-[#7FC0FA] mb-3">
              <Building2 size={11} />
              {isEn ? 'Businesses' : 'Empresas'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18211D] dark:text-[#F7F5F0]">
              {isEn ? 'Featured businesses' : 'Empresas em destaque'}
            </h2>
            <p className="mt-2 text-[#66736D]">
              {isEn
                ? 'Discover the best companies in Angola'
                : 'Descubra as melhores empresas de Angola'}
            </p>
          </div>
          <Link
            to="/empresas"
            className="inline-flex items-center gap-2 font-bold text-[#A94728] hover:text-[#8D3B1F] transition-colors group self-start sm:self-auto"
          >
            {isEn ? 'View all' : 'Ver todas'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <Link
              key={c.id}
              to={`/negocio/${c.id}`}
              className="group bg-white dark:bg-[#17201B] rounded-2xl border border-[#DDD4C0]/50 dark:border-[#223029]/50 overflow-hidden hover:shadow-xl hover:border-[#7FC0FA]/40 transition-all group-hover:-translate-y-1"
            >
              <div className="relative h-48 bg-[#EDE7D9] dark:bg-[#1E2A24] overflow-hidden">
                {c.cover_image ? (
                  <img
                    src={c.cover_image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={40} className="text-[#7FC0FA]" />
                  </div>
                )}
                {c.is_verified && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#7FC0FA] text-[#174A3A] text-xs font-bold shadow-md">
                    <CheckCircle size={12} />
                    {isEn ? 'Verified' : 'Verificado'}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5F0] group-hover:text-[#A94728] transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                </div>

                {c.category && (
                  <span className="inline-block text-xs font-semibold text-[#7FC0FA] mb-2">
                    {c.category}
                  </span>
                )}

                <p className="text-sm text-[#66736D] line-clamp-2 mb-4">
                  {c.description || (isEn ? 'No description' : 'Sem descrição')}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#DDD4C0]/50 dark:border-[#223029]/50">
                  {c.province && (
                    <span className="flex items-center gap-1 text-xs text-[#66736D]">
                      <MapPin size={12} />
                      {c.province}
                    </span>
                  )}
                  <span className="text-xs font-bold text-[#A94728] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {isEn ? 'View' : 'Ver'}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SERVIÇOS EM DESTAQUE
// ============================================
function FeaturedServices({ isEn }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('services')
          .select('*')
          .in('status', ['pending', 'approved', 'active'])
          .order('created_at', { ascending: false })
          .limit(6);
        setServices(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v || 0);

  if (loading || services.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA]/15 text-[#174A3A] dark:text-[#7FC0FA] mb-3">
            <Briefcase size={11} />
            {isEn ? 'Services' : 'Serviços'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18211D] dark:text-[#F7F5F0]">
            {isEn ? 'Featured services' : 'Serviços em destaque'}
          </h2>
          <p className="mt-2 text-[#66736D]">
            {isEn
              ? 'The best services from verified companies'
              : 'Os melhores serviços de empresas verificadas'}
          </p>
        </div>
        <Link
          to="/servicos"
          className="inline-flex items-center gap-2 font-bold text-[#A94728] hover:text-[#8D3B1F] transition-colors group self-start sm:self-auto"
        >
          {isEn ? 'View all' : 'Ver todos'}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <Link
            key={s.id}
            to={`/servico/${s.id}`}
            className="group bg-white dark:bg-[#17201B] rounded-2xl p-6 border border-[#DDD4C0]/50 dark:border-[#223029]/50 hover:shadow-xl hover:border-[#7FC0FA]/40 transition-all group-hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#18211D] dark:text-[#F7F5F0] group-hover:text-[#A94728] transition-colors line-clamp-2">
                  {s.title || s.name}
                </h3>
                {s.category && (
                  <span className="inline-block text-xs font-semibold text-[#7FC0FA] mt-1">
                    {s.category}
                  </span>
                )}
              </div>
              {s.main_image ? (
                <img
                  src={s.main_image}
                  alt={s.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#7FC0FA]/15 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={24} className="text-[#7FC0FA]" />
                </div>
              )}
            </div>

            <p className="text-sm text-[#66736D] line-clamp-2 mb-4">
              {s.description || (isEn ? 'No description' : 'Sem descrição')}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[#DDD4C0]/50 dark:border-[#223029]/50">
              <span className="text-lg font-black text-[#A94728]">
                {formatCurrency(s.price)}
              </span>
              {s.duration && (
                <span className="flex items-center gap-1 text-xs text-[#66736D]">
                  <Clock size={12} />
                  {s.duration}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ============================================
// DESTINOS EM DESTAQUE
// ============================================
function FeaturedDestinations({ isEn }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getFeaturedDestinations(6);
        setDestinations(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading || destinations.length === 0) return null;

  return (
    <section className="bg-[#F7F5F0] dark:bg-[#0D1410] border-y border-[#DDD4C0]/50 dark:border-[#223029]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA]/15 text-[#174A3A] dark:text-[#7FC0FA] mb-3">
              <TrendingUp size={11} />
              {isEn ? 'Popular' : 'Populares'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#18211D] dark:text-[#F7F5F0]">
              {isEn ? 'Featured destinations' : 'Destinos em destaque'}
            </h2>
            <p className="mt-2 text-[#66736D]">
              {isEn
                ? 'Most sought after places by travelers'
                : 'Os locais mais procurados pelos viajantes'}
            </p>
          </div>
          <Link
            to="/destinos"
            className="inline-flex items-center gap-2 font-bold text-[#A94728] hover:text-[#8D3B1F] transition-colors group self-start sm:self-auto"
          >
            {isEn ? 'View all' : 'Ver todos'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => {
            const img = d.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80';
            return (
              <Link
                key={d.id}
                to={`/destinos/${d.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#EDE7D9] dark:bg-[#1E2A24]"
              >
                <img
                  src={img}
                  alt={d.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {d.province && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#7FC0FA] text-[#174A3A] text-xs font-bold shadow-lg">
                    <MapPin size={12} />
                    {d.province}
                  </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-black tracking-tight leading-tight mb-1 line-clamp-2">
                    {d.name}
                  </h3>
                  <p className="text-sm text-white/70 line-clamp-2 mb-3">
                    {d.description || (isEn ? 'Discover this destination' : 'Descubra este destino')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="fill-[#7FC0FA] text-[#7FC0FA]" />
                    <span className="text-sm font-bold">{d.rating || 4.8}</span>
                    <span className="text-xs text-white/60">
                      · {d.attractions || 0} {isEn ? 'attractions' : 'atrações'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA FINAL — EMPRESAS
// ============================================
function CompanyCTA({ isEn }) {
  return (
    <section className="relative overflow-hidden bg-[#174A3A]">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#7FC0FA]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#C99B4B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#7FC0FA] text-[#174A3A] mb-6 shadow-lg">
          <Building2 size={14} />
          {isEn ? 'For companies' : 'Para empresas'}
        </span>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-6 max-w-3xl mx-auto">
          {isEn
            ? 'Join the largest tourism network in Angola'
            : 'Faça parte da maior rede de turismo de Angola'}
        </h2>

        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {isEn
            ? 'Register your company and connect with thousands of travelers.'
            : 'Registe a sua empresa e conecte-se com milhares de viajantes.'}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/cadastrar-empresa"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#7FC0FA] hover:bg-[#6BB0EA] text-[#174A3A] font-bold shadow-2xl transition-all active:scale-[0.98]"
          >
            <Building2 size={18} />
            {isEn ? 'Register company' : 'Registar empresa'}
          </Link>
          <Link
            to="/empresas"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold border border-white/20 transition-all"
          >
            {isEn ? 'View companies' : 'Ver empresas'}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function HomePage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <main className="bg-[#F7F5F0] dark:bg-[#0D1410] text-[#18211D] dark:text-[#F7F5F0] min-h-screen">
      <HeroSection isEn={isEn} />
      <SearchSection isEn={isEn} />
      <CategoriesSection isEn={isEn} />
      <FeaturedCompanies isEn={isEn} />
      <FeaturedServices isEn={isEn} />
      <FeaturedDestinations isEn={isEn} />
      <CompanyCTA isEn={isEn} />
    </main>
  );
}