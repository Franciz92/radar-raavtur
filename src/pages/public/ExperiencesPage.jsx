// src/pages/public/ExperiencesPage.jsx
// ============================================
// PÁGINA DE EXPERIÊNCIAS - PUBLICAÇÕES DOS USERS
// - Lista todas as publicações dos utilizadores
// - Likes, comentários, views, shares
// - Botão para criar nova publicação
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ExperienceCard from '../../components/experience/ExperienceCard';
import CreateExperienceModal from '../../components/experience/CreateExperienceModal';
import { getExperiences } from '../../services/experienceService';
import {
  Compass, Loader2, Search, Grid3x3, List, AlertCircle,
  RefreshCw, PlusCircle, Sparkles, User, TrendingUp, Clock,
  MessageCircle, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExperiencesPage() {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ============================================
  // CARREGAR EXPERIÊNCIAS
  // ============================================
  useEffect(() => {
    console.log('🚀 [ExperiencesPage] Componente montado');
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    console.log('🔄 [ExperiencesPage] Iniciando carregamento...');
    setLoading(true);
    setError(null);
    
    try {
      const result = await getExperiences(50);
      
      console.log('📊 [ExperiencesPage] Resultado:', {
        success: result.success,
        count: result.data?.length,
        error: result.error
      });

      if (result.success) {
        setExperiences(result.data || []);
        console.log(`✅ [ExperiencesPage] ${result.data?.length || 0} experiências carregadas`);
      } else {
        setError(result.error || 'Erro desconhecido');
        console.error('❌ [ExperiencesPage] Erro:', result.error);
      }
    } catch (error) {
      console.error('❌ [ExperiencesPage] Exceção:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('🏁 [ExperiencesPage] Carregamento concluído');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExperiences();
    setRefreshing(false);
    toast.success(isEn ? 'Updated!' : 'Atualizado!');
  };

  const handleCreateSuccess = () => {
    console.log('✅ [ExperiencesPage] Nova publicação criada, recarregando...');
    loadExperiences();
  };

  // ============================================
  // FILTRAR E ORDENAR
  // ============================================
  let filtered = experiences.filter(exp => {
    const matchesSearch = 
      exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (filter === 'popular') {
    filtered = [...filtered].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  } else if (filter === 'views') {
    filtered = [...filtered].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  } else if (filter === 'comments') {
    filtered = [...filtered].sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
  }

  // ============================================
  // STATS
  // ============================================
  const totalLikes = experiences.reduce((acc, e) => acc + (e.likes_count || 0), 0);
  const totalViews = experiences.reduce((acc, e) => acc + (e.views_count || 0), 0);
  const totalComments = experiences.reduce((acc, e) => acc + (e.comments_count || 0), 0);

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading experiences...' : 'A carregar experiências...'}
        </p>
      </div>
    );
  }

  // ============================================
  // ERRO
  // ============================================
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Error loading experiences' : 'Erro ao carregar experiências'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="px-6 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition inline-flex items-center gap-2"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Try again' : 'Tentar novamente'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* ============================================ */}
      {/* MODAL DE CRIAÇO */}
      {/* ============================================ */}
      <CreateExperienceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                <Sparkles size={32} />
                {isEn ? 'Experiences' : 'Experiências'}
              </h1>
              <p className="text-white/90 text-lg mt-1 max-w-2xl">
                {isEn 
                  ? 'Discover real travel stories shared by our community' 
                  : 'Descubra histórias reais de viagem partilhadas pela nossa comunidade'}
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition flex items-center gap-2 font-semibold shadow-lg"
              >
                <PlusCircle size={20} />
                {isEn ? 'Share Experience' : 'Partilhar Experiência'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Compass size={14} /> {experiences.length} {isEn ? 'stories' : 'histórias'}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Heart size={14} /> {totalLikes} {isEn ? 'likes' : 'gostos'}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              👁️ {totalViews} {isEn ? 'views' : 'visualizações'}
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <MessageCircle size={14} /> {totalComments} {isEn ? 'comments' : 'comentários'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTROS */}
      {/* ============================================ */}
      <div className="container mx-auto px-4 -mt-6 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={isEn ? 'Search experiences...' : 'Pesquisar experiências...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilter('recent')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'recent' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Clock size={14} className="inline mr-1" />
                {isEn ? 'Recent' : 'Recentes'}
              </button>
              <button
                onClick={() => setFilter('popular')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'popular' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingUp size={14} className="inline mr-1" />
                {isEn ? 'Popular' : 'Populares'}
              </button>
              <button
                onClick={() => setFilter('views')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'views' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                👁️ {isEn ? 'Views' : 'Vistas'}
              </button>
              <button
                onClick={() => setFilter('comments')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'comments' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                💬 {isEn ? 'Comments' : 'Comentários'}
              </button>

              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
                  title="Grid"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-amber-100 text-amber-600' : 'text-gray-400'}`}
                  title="List"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* GRID DE EXPERIÊNCIAS */}
      {/* ============================================ */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Sparkles size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isEn ? 'No experiences found' : 'Nenhuma experiência encontrada'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? (isEn ? 'Try a different search term' : 'Tente outro termo de pesquisa')
                : isEn 
                  ? 'Be the first to share your travel story!' 
                  : 'Seja o primeiro a partilhar a sua história de viagem!'}
            </p>
            {!searchTerm && isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold inline-flex items-center gap-2"
              >
                <PlusCircle size={20} />
                {isEn ? 'Share Your Experience' : 'Partilhe a sua Experiência'}
              </button>
            )}
            {!searchTerm && !isAuthenticated && (
              <Link
                to="/login"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold inline-flex items-center gap-2"
              >
                <User size={20} />
                {isEn ? 'Login to share' : 'Faça login para partilhar'}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Info de resultados */}
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {isEn 
                ? `Showing ${filtered.length} of ${experiences.length} experiences`
                : `Mostrando ${filtered.length} de ${experiences.length} experiências`}
            </div>

            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 max-w-3xl mx-auto'
            }`}>
              {filtered.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  isEn={isEn}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}