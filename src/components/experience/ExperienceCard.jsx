// src/components/experience/MyExperienceCard.jsx
// ============================================
// CARD DE EXPERIÊNCIA DO PROPRIETÁRIO
// - Mostra métricas (views, likes, comments, shares)
// - Expande para ver QUEM viu, gostou, comentou, partilhou
// - Botões Editar/Eliminar
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Heart, MessageCircle, Share2, Eye, MapPin, Calendar,
  User, Trash2, Edit3, Loader2, ChevronDown, ChevronUp,
  Users, Star, ExternalLink
} from 'lucide-react';
import { deleteExperience } from '../../services/experienceService';
import toast from 'react-hot-toast';

export default function MyExperienceCard({
  experience,
  isEn = false,
  onDelete = null,
  onEdit = null,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [details, setDetails] = useState({
    viewers: [],
    likers: [],
    commenters: [],
    sharers: [],
  });
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('likers');

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
    });
  };

  // ============================================
  // CARREGAR DETALHES (viewers, likers, commenters, sharers)
  // ============================================
  const loadDetails = async () => {
    if (details.viewers.length > 0 || details.likers.length > 0) return; // já carregado

    setLoadingDetails(true);
    try {
      console.log('🔍 [MyExperienceCard] Carregando detalhes:', experience.id);

      // 1. Viewers (com perfil)
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

      // 5. Buscar perfis de todos os user_ids únicos
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
        viewers: (views || []).map(v => ({
          ...v,
          user: userMap[v.user_id] || null,
        })),
        likers: (likes || []).map(l => ({
          ...l,
          user: userMap[l.user_id] || null,
        })),
        commenters: (comments || []).map(c => ({
          ...c,
          user: userMap[c.user_id] || null,
        })),
        sharers: (shares || []).map(s => ({
          ...s,
          user: userMap[s.user_id] || null,
        })),
      });

      console.log('✅ [MyExperienceCard] Detalhes carregados');
    } catch (error) {
      console.error('❌ [MyExperienceCard] Erro:', error);
      toast.error(isEn ? 'Error loading details' : 'Erro ao carregar detalhes');
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
      if (onDelete) {
        await onDelete(experience.id);
      } else {
        const result = await deleteExperience(experience.id, user.id);
        if (result.success) {
          toast.success(isEn ? 'Deleted!' : 'Eliminada!');
        } else {
          toast.error(result.error);
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(experience);
    } else {
      navigate(`/perfil`);
    }
  };

  const counts = {
    views: experience.views_count || 0,
    likes: experience.likes_count || 0,
    comments: experience.comments_count || 0,
    shares: experience.shares_count || 0,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
      
      {/* Imagem */}
      {experience.images && experience.images.length > 0 && (
        <Link to={`/experiencia/${experience.id}`} className="block relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover hover:scale-105 transition duration-500"
          />
          {experience.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              +{experience.images.length - 1}
            </div>
          )}
        </Link>
      )}

      <div className="p-4">
        
        {/* Título e data */}
        <Link to={`/experiencia/${experience.id}`}>
          <h3 className="font-bold text-gray-900 dark:text-white hover:text-amber-600 transition line-clamp-2">
            {experience.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <Calendar size={12} />
          {formatDate(experience.created_at)}
          {experience.location && (
            <>
              <span>•</span>
              <MapPin size={12} />
              {experience.location}
            </>
          )}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 text-center">
            <Eye size={14} className="mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.views}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Views' : 'Views'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 text-center">
            <Heart size={14} className="mx-auto text-red-500 mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.likes}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Likes' : 'Gostos'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 text-center">
            <MessageCircle size={14} className="mx-auto text-amber-500 mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.comments}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Comments' : 'Coments'}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2 text-center">
            <Share2 size={14} className="mx-auto text-green-500 mb-1" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.shares}</p>
            <p className="text-[10px] text-gray-500 uppercase">{isEn ? 'Shares' : 'Partilhas'}</p>
          </div>
        </div>

        {/* Botão expandir */}
        <button
          onClick={handleToggleExpand}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium transition"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded 
            ? (isEn ? 'Hide details' : 'Ocultar detalhes')
            : (isEn ? 'See who interacted' : 'Ver quem interagiu')}
        </button>

        {/* Detalhes expandidos */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {loadingDetails ? (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="animate-spin text-amber-500" />
              </div>
            ) : (
              <>
                {/* Sub-tabs */}
                <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                  {[
                    { id: 'likers', icon: Heart, label: isEn ? 'Likes' : 'Gostos', count: details.likers.length },
                    { id: 'commenters', icon: MessageCircle, label: isEn ? 'Comments' : 'Coments', count: details.commenters.length },
                    { id: 'viewers', icon: Eye, label: isEn ? 'Views' : 'Views', count: details.viewers.length },
                    { id: 'sharers', icon: Share2, label: isEn ? 'Shares' : 'Partilhas', count: details.sharers.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <tab.icon size={12} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span>({tab.count})</span>
                    </button>
                  ))}
                </div>

                {/* Conteúdo da sub-tab */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  
                  {/* LIKERS */}
                  {activeTab === 'likers' && (
                    details.likers.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">
                        {isEn ? 'No likes yet' : 'Sem gostos ainda'}
                      </p>
                    ) : (
                      details.likers.map((item) => (
                        <UserRow key={item.user_id} user={item.user} date={item.created_at} isEn={isEn} />
                      ))
                    )
                  )}

                  {/* COMMENTERS */}
                  {activeTab === 'commenters' && (
                    details.commenters.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">
                        {isEn ? 'No comments yet' : 'Sem comentários ainda'}
                      </p>
                    ) : (
                      details.commenters.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                          <UserRow user={item.user} date={item.created_at} isEn={isEn} />
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 pl-9 line-clamp-2">
                            "{item.content}"
                          </p>
                        </div>
                      ))
                    )
                  )}

                  {/* VIEWERS */}
                  {activeTab === 'viewers' && (
                    details.viewers.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">
                        {isEn ? 'No views yet' : 'Sem visualizações ainda'}
                      </p>
                    ) : (
                      details.viewers.map((item) => (
                        <UserRow key={item.user_id} user={item.user} date={item.created_at} isEn={isEn} />
                      ))
                    )
                  )}

                  {/* SHARERS */}
                  {activeTab === 'sharers' && (
                    details.sharers.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">
                        {isEn ? 'No shares yet' : 'Sem partilhas ainda'}
                      </p>
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

        {/* Botões de ação */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
          >
            <Edit3 size={14} />
            {isEn ? 'Edit' : 'Editar'}
          </button>
          <Link
            to={`/experiencia/${experience.id}`}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ExternalLink size={14} />
            {isEn ? 'View' : 'Ver'}
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {isEn ? 'Delete' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: LINHA DE UTILIZADOR
// ============================================
function UserRow({ user, date, isEn, badge }) {
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
        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <User size={12} className="text-amber-600" />
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
}