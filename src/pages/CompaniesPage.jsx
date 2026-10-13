// src/pages/public/CompaniesPage.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Star, Search, Filter, X,
  Loader2, ChevronDown, ChevronUp, Phone, Mail,
  CheckCircle, Briefcase, Users, Calendar,
  AlertCircle, Grid3X3, List, MapPinned
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE CARD DA EMPRESA
// ============================================
const CompanyCard = ({ company, isEn }) => {
  const averageRating = company.avg_rating || 0;
  const totalReviews = company.total_reviews || 0;

  return (
    <Link
      to={`/empresa/${company.id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Imagem de capa */}
      <div className="relative h-48 overflow-hidden">
        {company.cover_image ? (
          <img
            src={company.cover_image}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-700 to-orange-700 flex items-center justify-center">
            <Building2 size={64} className="text-white/30" />
          </div>
        )}
        
        {/* Badge de verificado */}
        {company.is_verified && (
          <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={14} />
            {isEn ? 'Verified' : 'Verificado'}
          </div>
        )}

        {/* Badge de categoria */}
        {company.category && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Briefcase size={14} />
            {company.category}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-md -mt-10">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 size={28} className="text-amber-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition truncate">
              {company.name}
            </h3>
            
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-sm">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({totalReviews})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Localização */}
        {(company.province || company.address) && (
          <div className="mt-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={14} />
            <span className="truncate">
              {company.province}{company.address ? `, ${company.address}` : ''}
            </span>
          </div>
        )}

        {/* Descrição */}
        {company.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Estatísticas */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {company.services_count || 0} {isEn ? 'services' : 'serviços'}
            </span>
          </div>
          
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1">
            {isEn ? 'View' : 'Ver'}
            <ChevronDown size={16} className="rotate-[-90deg]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ============================================
// COMPONENTE DE FILTRO
// ============================================
const FilterSection = ({ 
  title, 
  options, 
  selected, 
  onChange,
  isEn 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-medium text-gray-900 dark:text-white">
          {title}
        </span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      {isOpen && (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={title}
                value={option.value}
                checked={selected === option.value}
                onChange={() => onChange(option.value)}
                className="w-4 h-4 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CompaniesPage() {
  const { isEn } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 12;

  // Dados para os filtros
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);

  // ============================================
  // CARREGAR DADOS
  // ============================================
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [CompaniesPage] Carregando empresas...');

      // Construir a query
      let query = supabase
        .from('businesses')
        .select(`
          *,
          services_count:services(count),
          reviews_avg:reviews(avg(rating)),
          reviews_count:reviews(count)
        `, { count: 'exact' })
        .eq('is_active', true);

      // Aplicar filtros
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedProvince !== 'all') {
        query = query.eq('province', selectedProvince);
      }

      // Ordenação
      query = query.order('created_at', { ascending: false });

      // Paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Processar os dados
      const processedCompanies = data?.map(company => ({
        ...company,
        services_count: company.services_count?.[0]?.count || 0,
        avg_rating: company.reviews_avg?.[0]?.avg || 0,
        total_reviews: company.reviews_count?.[0]?.count || 0
      })) || [];

      setCompanies(processedCompanies);
      setTotalCompanies(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      console.log(`✅ [CompaniesPage] ${processedCompanies.length} empresas carregadas`);

    } catch (err) {
      console.error('❌ [CompaniesPage] Erro:', err);
      setError(err.message || (isEn ? 'Error loading companies' : 'Erro ao carregar empresas'));
      toast.error(isEn ? 'Error loading companies' : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedProvince, selectedRating, currentPage, isEn]);

  // Carregar opções de filtro
  const loadFilterOptions = useCallback(async () => {
    try {
      // Buscar categorias únicas
      const { data: categoriesData } = await supabase
        .from('businesses')
        .select('category')
        .eq('is_active', true)
        .not('category', 'is', null);

      const uniqueCategories = [...new Set(categoriesData?.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories.map(cat => ({ value: cat, label: cat })));

      // Buscar províncias únicas
      const { data: provincesData } = await supabase
        .from('businesses')
        .select('province')
        .eq('is_active', true)
        .not('province', 'is', null);

      const uniqueProvinces = [...new Set(provincesData?.map(item => item.province).filter(Boolean))];
      setProvinces(uniqueProvinces.map(prov => ({ value: prov, label: prov })));

    } catch (err) {
      console.error('❌ Erro ao carregar filtros:', err);
    }
  }, []);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Resetar página quando os filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedProvince, selectedRating]);

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedProvince('all');
    setSelectedRating('all');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ratingOptions = [
    { value: 'all', label: isEn ? 'All ratings' : 'Todas avaliações' },
    { value: '4.5', label: '⭐ 4.5+' },
    { value: '4', label: '⭐ 4.0+' },
    { value: '3', label: '⭐ 3.0+' },
  ];

  // ============================================
  // RENDER
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Building2 size={32} className="text-amber-500" />
          {isEn ? 'Companies' : 'Empresas'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEn 
            ? `Find the best companies and services` 
            : `Encontre as melhores empresas e serviços`}
        </p>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search companies...' : 'Buscar empresas...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Filtros - versão simplificada para mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{isEn ? 'All categories' : 'Todas categorias'}</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{isEn ? 'All provinces' : 'Todas províncias'}</option>
              {provinces.map(prov => (
                <option key={prov.value} value={prov.value}>{prov.label}</option>
              ))}
            </select>

            {(searchTerm || selectedCategory !== 'all' || selectedProvince !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition flex items-center gap-1"
              >
                <X size={18} />
                {isEn ? 'Clear' : 'Limpar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {error ? (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{error}</h3>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {isEn ? 'No companies found' : 'Nenhuma empresa encontrada'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEn 
              ? 'Try adjusting your filters or search terms' 
              : 'Tente ajustar seus filtros ou termos de busca'}
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
          >
            {isEn ? 'Clear filters' : 'Limpar filtros'}
          </button>
        </div>
      ) : (
        <>
          {/* Grid de empresas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} isEn={isEn} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {isEn ? 'Previous' : 'Anterior'}
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                {isEn ? 'Page' : 'Página'} {currentPage} {isEn ? 'of' : 'de'} {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {isEn ? 'Next' : 'Próxima'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}