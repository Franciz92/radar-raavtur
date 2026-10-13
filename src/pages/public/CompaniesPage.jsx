// src/pages/public/CompaniesPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, X, Building2, MapPin, Star,
  Loader2, ChevronDown, ChevronUp, Grid3x3, List,
  AlertCircle, Briefcase, Users, Plus
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import CompanyCard from '../../components/company/CompanyCard';
import toast from 'react-hot-toast';

// Categorias disponíveis
const CATEGORIES = {
  pt: [
    'Todos',
    'Agência de Viagens',
    'Operadora Turística',
    'Hotel / Resort',
    'Pousada / Alojamento',
    'Restaurante',
    'Transporte Turístico',
    'Rent-a-Car',
    'Guia Turístico',
    'Agência de Eventos',
    'Empresa de Excursões',
    'Turismo de Aventura',
    'Turismo Cultural',
    'Turismo Rural'
  ],
  en: [
    'All',
    'Travel Agency',
    'Tour Operator',
    'Hotel / Resort',
    'Guesthouse / Accommodation',
    'Restaurant',
    'Tourist Transport',
    'Rent-a-Car',
    'Tour Guide',
    'Event Agency',
    'Excursion Company',
    'Adventure Tourism',
    'Cultural Tourism',
    'Rural Tourism'
  ]
};

// Províncias de Angola
const PROVINCES = [
  'Todos',
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire'
];

export default function CompaniesPage() {
  const { isEn } = useLanguage();
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProvince, setSelectedProvince] = useState('Todos');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = isEn ? CATEGORIES.en : CATEGORIES.pt;
  const itemsPerPage = 12;

  // ============================================
  // CARREGAR EMPRESAS
  // ============================================
  const loadCompanies = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      setCompanies([]);
      setPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      console.log('🔄 [CompaniesPage] Carregando empresas...');

      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Filtro por categoria
      if (selectedCategory !== 'Todos') {
        query = query.eq('category', selectedCategory);
      }

      // Filtro por província
      if (selectedProvince !== 'Todos') {
        query = query.eq('province', selectedProvince);
      }

      // Busca por nome ou descrição
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Ordenação
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }

      // Paginação
      const from = reset ? 0 : companies.length;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      console.log(`✅ [CompaniesPage] ${data?.length || 0} empresas carregadas`);

      if (reset) {
        setCompanies(data || []);
      } else {
        setCompanies(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === itemsPerPage);
      setError(null);
    } catch (err) {
      console.error('❌ [CompaniesPage] Erro:', err);
      setError(err.message || (isEn ? 'Error loading companies' : 'Erro ao carregar empresas'));
      toast.error(isEn ? 'Error loading companies' : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory, selectedProvince, sortBy, companies.length, isEn]);

  // ============================================
  // CARREGAR MAIS (INFINITE SCROLL)
  // ============================================
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setPage(prev => prev + 1);
      loadCompanies(false);
    }
  }, [loadingMore, hasMore, loading, loadCompanies]);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCompanies(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedProvince, sortBy]);

  // ============================================
  // RESETAR FILTROS
  // ============================================
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setSelectedProvince('Todos');
    setSortBy('rating');
  };

  // ============================================
  // RENDER - LOADING
  // ============================================
  if (loading && companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading companies...' : 'Carregando empresas...'}
        </p>
      </div>
    );
  }

  // ============================================
  // RENDER - ERRO
  // ============================================
  if (error && companies.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Error loading companies' : 'Erro ao carregar empresas'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => loadCompanies(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
          >
            {isEn ? 'Try again' : 'Tentar novamente'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER - PRINCIPAL
  // ============================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ===== HEADER ===== */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Building2 size={32} className="text-amber-500" />
          {isEn ? 'Tourism Companies' : 'Empresas Turísticas'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEn
            ? `Discover the best tourism companies in Angola (${companies.length} companies)`
            : `Descubra as melhores empresas de turismo em Angola (${companies.length} empresas)`
          }
        </p>
      </div>

      {/* ===== BARRA DE BUSCA E FILTROS ===== */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Busca */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search companies...' : 'Buscar empresas...'}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-gray-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Botão Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
              showFilters || selectedCategory !== 'Todos' || selectedProvince !== 'Todos'
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={18} />
            <span className="font-medium">{isEn ? 'Filters' : 'Filtros'}</span>
            {(selectedCategory !== 'Todos' || selectedProvince !== 'Todos') && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {selectedCategory !== 'Todos' ? 1 : 0 + selectedProvince !== 'Todos' ? 1 : 0}
              </span>
            )}
          </button>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-gray-900 dark:text-white"
          >
            <option value="rating">{isEn ? 'Best Rating' : 'Melhor Avaliação'}</option>
            <option value="newest">{isEn ? 'Newest' : 'Mais Recentes'}</option>
            <option value="oldest">{isEn ? 'Oldest' : 'Mais Antigas'}</option>
            <option value="name">{isEn ? 'Name' : 'Nome'}</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              title={isEn ? 'Grid view' : 'Visualização em grade'}
            >
              <Grid3x3 size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              title={isEn ? 'List view' : 'Visualização em lista'}
            >
              <List size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Category' : 'Categoria'}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-sm rounded-full transition ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Província */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Province' : 'Província'}
              </label>
              <div className="flex flex-wrap gap-2">
                {PROVINCES.map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setSelectedProvince(prov)}
                    className={`px-3 py-1.5 text-sm rounded-full transition ${
                      selectedProvince === prov
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão Limpar Filtros */}
            <div className="md:col-span-2">
              <button
                onClick={resetFilters}
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
              >
                <X size={16} />
                {isEn ? 'Clear all filters' : 'Limpar todos os filtros'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== LISTA DE EMPRESAS ===== */}
      {companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {isEn ? 'No companies found' : 'Nenhuma empresa encontrada'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isEn
              ? 'Try adjusting your search or filters'
              : 'Tente ajustar sua busca ou filtros'}
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            {isEn ? 'Clear filters' : 'Limpar filtros'}
          </button>
        </div>
      ) : (
        <>
          <div className={`grid ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          } gap-6`}>
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} isEn={isEn} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isEn ? 'Loading...' : 'Carregando...'}
                  </>
                ) : (
                  <>
                    {isEn ? 'Load more' : 'Carregar mais'}
                    <ChevronDown size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}