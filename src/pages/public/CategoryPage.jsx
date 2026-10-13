// src/pages/public/CategoryPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Clock,
  Filter,
  Search,
  Grid3x3,
  List,
  ChevronDown,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  Heart,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-xl text-sm font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {Icon && <Icon size={18} className="flex-shrink-0" />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variants[variant] || variants.default}
    `}>
      {children}
    </span>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    province: '',
    minRating: 0,
  });
  const [categoryInfo, setCategoryInfo] = useState(null);

  // ============================================
  // MAPEAMENTO DE CATEGORIAS
  // ============================================
  const categoryMap = {
    'hoteis': 'Hotel',
    'agencias': 'Agência de viagens',
    'guias': 'Guia turístico',
    'restaurantes': 'Restaurante',
    'pousadas': 'Pousada',
    'atracoes': 'Atração turística',
    'transporte': 'Empresa de transporte turístico',
    'eventos': 'Agência de eventos',
    'outros-servicos': 'Outro',
  };

  const categoryLabels = {
    'hoteis': 'Hotéis',
    'agencias': 'Agências de Viagens',
    'guias': 'Guias Turísticos',
    'restaurantes': 'Restaurantes',
    'pousadas': 'Pousadas',
    'atracoes': 'Atrações Turísticas',
    'transporte': 'Transporte Turístico',
    'eventos': 'Eventos',
    'outros-servicos': 'Outros Serviços',
  };

  // ============================================
  // CARREGAR EMPRESAS
  // ============================================
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      
      const categoryName = categoryMap[categorySlug];
      
      if (!categoryName) {
        toast.error('Categoria não encontrada');
        navigate('/');
        return;
      }

      setCategoryInfo({
        name: categoryLabels[categorySlug] || categorySlug,
        slug: categorySlug,
        description: `Encontre os melhores ${categoryLabels[categorySlug]?.toLowerCase() || 'serviços'} em Angola`,
      });

      let query = supabase
        .from('companies')
        .select('*')
        .eq('category', categoryName)
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, navigate]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // ============================================
  // FILTROS E ORDENAÇO
  // ============================================
  const filteredCompanies = companies
    .filter(company => {
      // Busca por texto
      const search = searchTerm.toLowerCase();
      if (search) {
        const match = 
          company.name?.toLowerCase().includes(search) ||
          company.description?.toLowerCase().includes(search) ||
          company.email?.toLowerCase().includes(search) ||
          company.address?.city?.toLowerCase().includes(search) ||
          company.address?.province?.toLowerCase().includes(search);
        if (!match) return false;
      }

      // Filtro por província
      if (filters.province && company.address?.province !== filters.province) {
        return false;
      }

      // Filtro por rating mínimo
      if (filters.minRating > 0 && (company.rating || 0) < filters.minRating) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

  // ============================================
  // ESTATÍSTICAS
  // ============================================
  const stats = {
    total: companies.length,
    avgRating: companies.reduce((acc, c) => acc + (c.rating || 0), 0) / (companies.length || 1),
    totalReviews: companies.reduce((acc, c) => acc + (c.total_reviews || 0), 0),
  };

  // ============================================
  // RENDER LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center h-64 flex-col">
            <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Carregando empresas...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Building2 size={32} className="text-blue-600" />
                {categoryInfo?.name || 'Categoria'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {categoryInfo?.description || `Encontre os melhores serviços em Angola`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="primary">
                <Users size={14} /> {stats.total} empresas
              </Badge>
              <Badge variant="success">
                <Star size={14} /> {stats.avgRating.toFixed(1)} ★ média
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Empresas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Avaliação Média</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.avgRating.toFixed(1)} ★</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Total Avaliações</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, cidade, descrição..."
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="rating">⭐ Mais bem avaliados</option>
                <option value="name">📝 Ordem alfabética</option>
                <option value="newest">🆕 Mais recentes</option>
                <option value="oldest">📅 Mais antigos</option>
              </select>
              <Button
                variant="outline"
                icon={SlidersHorizontal}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtros
              </Button>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Província
                  </label>
                  <select
                    value={filters.province}
                    onChange={(e) => setFilters(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Todas as províncias</option>
                    {['Luanda', 'Benguela', 'Huíla', 'Huambo', 'Bié', 'Malanje', 'Uíge', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Lunda Norte', 'Lunda Sul', 'Moxico', 'Namibe', 'Zaire'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avaliação Mínima
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value={0}>Todas</option>
                    <option value={4}>4★ ou mais</option>
                    <option value={3}>3★ ou mais</option>
                    <option value={2}>2★ ou mais</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilters({ province: '', minRating: 0 });
                      setSearchTerm('');
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma empresa encontrada
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.province ? 'Tente ajustar os filtros de busca' : 'Nenhuma empresa cadastrada nesta categoria ainda'}
            </p>
            {(searchTerm || filters.province) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ province: '', minRating: 0 });
                }}
                className="mt-4"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className={`
            grid gap-6
            ${viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
            }
          `}>
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className={`
                  bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                  hover:shadow-lg transition-all duration-200 overflow-hidden
                  ${viewMode === 'grid' ? '' : 'flex flex-col sm:flex-row'}
                `}
              >
                {/* Imagem ou Logo */}
                <div className={`
                  ${viewMode === 'grid' ? 'w-full h-48' : 'w-full sm:w-48 h-48 sm:h-auto'}
                  bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30
                  flex items-center justify-center relative
                `}>
                  {company.cover_image ? (
                    <img src={company.cover_image} alt={company.name} className="w-full h-full object-cover" />
                  ) : company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-20 h-20 object-contain" />
                  ) : (
                    <Building2 size={48} className="text-gray-400" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} className="text-yellow-400" />
                    {company.rating?.toFixed(1) || '0.0'}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <Link to={`/empresa/${company.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                        {company.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="primary">{company.category}</Badge>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {company.address?.city || company.address?.province || 'Angola'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {company.description}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link to={`/empresa/${company.id}`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        <Eye size={16} />
                        Ver Detalhes
                      </Button>
                    </Link>
                    {company.phone && (
                      <a href={`tel:${company.phone}`}>
                        <Button variant="outline" icon={Phone} />
                      </a>
                    )}
                    {company.email && (
                      <a href={`mailto:${company.email}`}>
                        <Button variant="outline" icon={Mail} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Mostrando {filteredCompanies.length} de {companies.length} empresas
          {searchTerm && ` (filtrado por "${searchTerm}")`}
          {filters.province && ` em ${filters.province}`}
          {filters.minRating > 0 && ` com ${filters.minRating}★ ou mais`}
        </div>
      </div>
    </div>
  );
}