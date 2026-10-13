// src/pages/public/ProfilePage.jsx
// ============================================
// PERFIL PÚBLICO DO UTILIZADOR (por :id)
// - Mostra informações do utilizador
// - Lista as publicações/experiências
// - Cada card mostra métricas + lista de quem interagiu
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import { getUserExperiences } from '../../services/experienceService';
import {
  User, MapPin, Calendar, Mail, Phone, Loader2, AlertCircle,
  ArrowLeft, BookOpen, Heart, MessageCircle, Eye, Share2,
  Building2, Globe, Link as LinkIcon, Camera, Edit, Users,
  Star, PlusCircle, ChevronDown, ChevronUp, ExternalLink,
  Trash2, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE: CARD DE EXPERIÊNCIA COM DETALHES
// ============================================
const ExperienceCardWithDetails = ({ 
  experience, 
  isEn, 
  isOwner, 
  onView, 
  onDelete 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('likers');
  const [details, setDetails] = useState({
    likers: [],
    commenters: [],
    viewers: [],
    sharers: [],
  });
  const [deleting, setDeleting] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isEn ? 'Just now' : 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ============================================
  // CARREGAR DETALHES (viewers, likers, commenters, sharers)
  // ============================================
  const loadDetails = async () => {
    if (details.likers.length > 0 || loadingDetails) return;
    
    setLoadingDetails(true);
    try {
      console.log('🔍 [ExperienceCard] Carregando detalhes:', experience.id);

      // 1. Viewers
      const { data: views } = await supabase
        .from('experience_views')
        .select('user_id, created_at')
        .eq('experience_id', experience.id)
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      // 2. Likers
      const { data: likes } = await supabase
        .from('experience_likes')
        .select('user_id, created_at')
        .eq('experience_id', experience.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // 3. Commenters
      const { data: comments } = await supabase
        .from('experience_comments')
        .select('user_id, content, created_at')
        .eq('experience_id', experience.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // 4. Sharers
      const { data: shares } = await supabase
        .from('experience_shares')
        .select('user_id, platform, created_at')
        .eq('experience_id', experience.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // 5. Perfis únicos
      const allUserIds = [
        ...new Set([
          ...(views || []).map(v => v.user_id),
          ...(likes || []).map(l => l.user_id),
          ...(comments || []).map(c => c.user_id),
          ...(shares || []).map(s => s.user_id),
        ].filter(Boolean))
      ];

      let userMap = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role')
          .in('id', allUserIds);

        userMap = (profiles || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});
      }

      setDetails({
        viewers: (views || []).map(v => ({ ...v, user: userMap[v.user_id] || null })),
        likers: (likes || []).map(l => ({ ...l, user: userMap[l.user_id] || null })),
        commenters: (comments || []).map(c => ({ ...c, user: userMap[c.user_id] || null })),
        sharers: (shares || []).map(s => ({ ...s, user: userMap[s.user_id] || null })),
      });

      console.log('✅ [ExperienceCard] Detalhes carregados');
    } catch (error) {
      console.error('❌ [ExperienceCard] Erro:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleExpand = () => {
    if (!expanded) loadDetails();
    setExpanded(!expanded);
  };

  const handleDelete = async () => {
    if (!confirm(isEn ? 'Delete this post?' : 'Eliminar esta publicação?')) return;
    setDeleting(true);
    try {
      await onDelete(experience.id);
    } finally {
      setDeleting(false);
    }
  };

  const counts = {
    views: experience.views_count || 0,
    likes: experience.likes_count || 0,
    comments: experience.comments_count || 0,
    shares: experience.shares_count || 0,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
      
      {/* Imagem */}
      {experience.images && experience.images.length > 0 && (
        <div 
          className="relative h-40 overflow-hidden cursor-pointer group"
          onClick={() => onView(experience.id)}
        >
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          {experience.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              +{experience.images.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Título */}
        <h3 
          onClick={() => onView(experience.id)}
          className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-500 transition line-clamp-1 cursor-pointer"
        >
          {experience.title}
        </h3>

        {/* Localização e data */}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {experience.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {experience.location}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Calendar size={12} />
            {formatDate(experience.created_at)}
          </span>
        </div>

        {/* Conteúdo */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {experience.content}
        </p>

        {/* ============================================ */}
        {/* MÉTRICAS */}
        {/* ============================================ */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <Eye size={14} className="mx-auto text-blue-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.views}</p>
            <p className="text-[10px] text-gray-500 uppercase">Views</p>
          </div>
          <div className="text-center">
            <Heart size={14} className="mx-auto text-red-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.likes}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Likes' : 'Gostos'}</p>
          </div>
          <div className="text-center">
            <MessageCircle size={14} className="mx-auto text-amber-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.comments}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Comms' : 'Coments'}</p>
          </div>
          <div className="text-center">
            <Share2 size={14} className="mx-auto text-green-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.shares}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Shares' : 'Part.'}</p>
          </div>
        </div>

        {/* ============================================ */}
        {/* BOTO EXPANDIR (só para o dono) */}
        {/* ============================================ */}
        {isOwner && (
          <button
            onClick={handleToggleExpand}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium transition"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded 
              ? (isEn ? 'Hide details' : 'Ocultar detalhes')
              : (isEn ? 'See who interacted' : 'Ver quem interagiu')}
          </button>
        )}

        {/* ============================================ */}
        {/* DETALHES EXPANDIDOS */}
        {/* ============================================ */}
        {expanded && isOwner && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {loadingDetails ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-amber-500" />
              </div>
            ) : (
              <>
                {/* Sub-abas */}
                <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                  {[
                    { id: 'likers', icon: Heart, count: details.likers.length, color: 'text-red-500' },
                    { id: 'commenters', icon: MessageCircle, count: details.commenters.length, color: 'text-amber-500' },
                    { id: 'viewers', icon: Eye, count: details.viewers.length, color: 'text-blue-500' },
                    { id: 'sharers', icon: Share2, count: details.sharers.length, color: 'text-green-500' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-1 py-1.5 rounded-md text-xs font-medium transition ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-gray-800 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon size={12} className={activeTab === tab.id ? tab.color : ''} />
                      <span className="hidden sm:inline">({tab.count})</span>
                      <span className="sm:hidden">{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* Conteúdo */}
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {activeTab === 'likers' && (
                    details.likers.length === 0 ? (
                      <EmptyState icon={Heart} text={isEn ? 'No likes yet' : 'Sem gostos ainda'} />
                    ) : (
                      details.likers.map((item) => (
                        <UserRow key={item.user_id} user={item.user} date={item.created_at} isEn={isEn} />
                      ))
                    )
                  )}

                  {activeTab === 'commenters' && (
                    details.commenters.length === 0 ? (
                      <EmptyState icon={MessageCircle} text={isEn ? 'No comments yet' : 'Sem comentários ainda'} />
                    ) : (
                      details.commenters.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                          <UserRow user={item.user} date={item.created_at} isEn={isEn} />
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 pl-9 line-clamp-2 italic">
                            "{item.content}"
                          </p>
                        </div>
                      ))
                    )
                  )}

                  {activeTab === 'viewers' && (
                    details.viewers.length === 0 ? (
                      <EmptyState icon={Eye} text={isEn ? 'No views yet' : 'Sem visualizações ainda'} />
                    ) : (
                      details.viewers.map((item) => (
                        <UserRow key={item.user_id} user={item.user} date={item.created_at} isEn={isEn} />
                      ))
                    )
                  )}

                  {activeTab === 'sharers' && (
                    details.sharers.length === 0 ? (
                      <EmptyState icon={Share2} text={isEn ? 'No shares yet' : 'Sem partilhas ainda'} />
                    ) : (
                      details.sharers.map((item, idx) => (
                        <UserRow 
                          key={idx} 
                          user={item.user} 
                          date={item.created_at} 
                          isEn={isEn}
                          badge={item.platform}
                        />
                      ))
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* AÇÕES (só para o dono) */}
        {/* ============================================ */}
        {isOwner && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => onView(experience.id)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ExternalLink size={12} />
              {isEn ? 'View' : 'Ver'}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              {isEn ? 'Delete' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE: LINHA DE UTILIZADOR
// ============================================
const UserRow = ({ user, date, isEn, badge }) => {
  const formatDate = (d) => {
    if (!d) return '';
    const now = new Date();
    const diff = now - new Date(d);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isEn ? 'Now' : 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(d).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-gray-400">
        <User size={14} />
        <span>{isEn ? 'Unknown user' : 'Utilizador desconhecido'}</span>
      </div>
    );
  }

  return (
    <Link
      to={`/perfil/${user.id}`}
      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition"
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
          <User size={12} className="text-purple-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
          {user.name}
        </p>
        <p className="text-[10px] text-gray-400">{formatDate(date)}</p>
      </div>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
          {badge}
        </span>
      )}
    </Link>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="text-center py-4">
    <Icon size={20} className="mx-auto text-gray-300 dark:text-gray-600 mb-1" />
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isEn } = useLanguage();

  const [profileUser, setProfileUser] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    totalShares: 0,
  });

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError(isEn ? 'Invalid user profile' : 'Perfil de usuário inválido');
      setLoading(false);
      return;
    }
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [ProfilePage] Buscando perfil:', id);

      // Validar UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error(isEn ? 'Invalid user ID' : 'ID de utilizador inválido');
      }

      // Buscar utilizador
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) throw userError;
      if (!userData) {
        setError(isEn ? 'User not found' : 'Utilizador não encontrado');
        setLoading(false);
        return;
      }

      console.log('✅ [ProfilePage] Utilizador:', userData.name);
      setProfileUser(userData);

      // Buscar experiências
      const result = await getUserExperiences(id);
      if (result.success) {
        const data = result.data || [];
        setExperiences(data);
        setStats({
          total: data.length,
          totalLikes: data.reduce((acc, e) => acc + (e.likes_count || 0), 0),
          totalComments: data.reduce((acc, e) => acc + (e.comments_count || 0), 0),
          totalViews: data.reduce((acc, e) => acc + (e.views_count || 0), 0),
          totalShares: data.reduce((acc, e) => acc + (e.shares_count || 0), 0),
        });
      }
    } catch (error) {
      console.error('❌ [ProfilePage] Erro:', error);
      setError(error.message || (isEn ? 'Error loading profile' : 'Erro ao carregar perfil'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewExperience = (experienceId) => {
    navigate(`/experiencia/${experienceId}`);
  };

  const handleDeleteExperience = async (experienceId) => {
    const { deleteExperience } = await import('../../services/experienceService');
    const result = await deleteExperience(experienceId, currentUser.id);
    if (result.success) {
      setExperiences(prev => prev.filter(e => e.id !== experienceId));
      toast.success(isEn ? 'Deleted!' : 'Eliminada!');
      // Recalcular stats
      loadProfileData();
    } else {
      toast.error(result.error);
    }
  };

  if (!id || id === 'undefined' || id === 'null') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-yellow-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
            {isEn ? 'Invalid User' : 'Usuário Inválido'}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
          >
            <ArrowLeft size={18} />
            {isEn ? 'Go back' : 'Voltar'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-purple-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading profile...' : 'Carregando perfil...'}
        </p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'User not found' : 'Usuário não encontrado'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
          >
            <ArrowLeft size={18} />
            {isEn ? 'Go back' : 'Voltar'}
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      {/* ============================================ */}
      {/* CABEÇALHO DO PERFIL */}
      {/* ============================================ */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="relative">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            {(profileUser.banner_url || profileUser.cover_image) && (
              <img
                src={profileUser.banner_url || profileUser.cover_image}
                alt={profileUser.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Avatar e Informações */}
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex-shrink-0">
                {profileUser.avatar_url ? (
                  <img
                    src={profileUser.avatar_url}
                    alt={profileUser.name}
                    className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <User size={48} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileUser.name}
                  </h1>
                  {isOwnProfile && (
                    <Link
                      to="/perfil"
                      className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-200 transition"
                    >
                      <Edit size={14} />
                      {isEn ? 'Edit Profile' : 'Editar Perfil'}
                    </Link>
                  )}
                </div>

                {profileUser.location && (
                  <p className="text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={16} />
                    {profileUser.location}
                  </p>
                )}

                {profileUser.bio && (
                  <p className="text-gray-600 dark:text-gray-300 mt-3 max-w-2xl">
                    {profileUser.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {isEn ? 'Joined' : 'Membro desde'}{' '}
                    {new Date(profileUser.created_at).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {profileUser.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {profileUser.email}
                    </span>
                  )}
                  {profileUser.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} />
                      {profileUser.phone}
                    </span>
                  )}
                  {profileUser.website && (
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                    >
                      <Globe size={14} />
                      {profileUser.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* ESTATÍSTICAS */}
            {/* ============================================ */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <BookOpen size={18} className="mx-auto text-purple-500 mb-1" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isEn ? 'Stories' : 'Histórias'}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <Eye size={18} className="mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-500">
                  {stats.totalViews}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isEn ? 'Views' : 'Views'}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <Heart size={18} className="mx-auto text-red-500 mb-1" />
                <p className="text-xl font-bold text-red-500">
                  {stats.totalLikes}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isEn ? 'Likes' : 'Gostos'}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <MessageCircle size={18} className="mx-auto text-amber-500 mb-1" />
                <p className="text-xl font-bold text-amber-500">
                  {stats.totalComments}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isEn ? 'Comments' : 'Coments'}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <Share2 size={18} className="mx-auto text-green-500 mb-1" />
                <p className="text-xl font-bold text-green-500">
                  {stats.totalShares}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isEn ? 'Shares' : 'Partilhas'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* EXPERIÊNCIAS DO UTILIZADOR */}
      {/* ============================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-purple-500" />
            {isEn ? 'Stories' : 'Histórias'} ({stats.total})
          </h2>
          {isOwnProfile && (
            <Link
              to="/minhas-experiencias"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <PlusCircle size={16} />
              {isEn ? 'New Story' : 'Nova História'}
            </Link>
          )}
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              {isEn ? 'No stories shared yet' : 'Nenhuma história partilhada ainda'}
            </p>
            {isOwnProfile && (
              <Link
                to="/minhas-experiencias"
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                <PlusCircle size={18} />
                {isEn ? 'Share Your Story' : 'Partilhe sua História'}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map((experience) => (
              <ExperienceCardWithDetails
                key={experience.id}
                experience={experience}
                isEn={isEn}
                isOwner={isOwnProfile}
                onView={handleViewExperience}
                onDelete={handleDeleteExperience}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}