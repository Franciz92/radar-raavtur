// src/pages/public/PublicProfilePage.jsx
// ============================================
// PERFIL PÚBLICO DO UTILIZADOR
// ✅ Traduções centralizadas + sincronizadas com Header
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Globe, Loader2, AlertCircle,
  ChevronLeft, CheckCircle, Building2, Compass, Star,
  ExternalLink, Sparkles, Calendar, Users, Share2, Copy, Check,
  MessageCircle, MapPinned, Briefcase, Eye, Heart,
  ChevronDown, ChevronUp, Trash2, PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getPublicProfile,
  getUserBusinesses,
  getFollowers,
  getFollowing,
  getUserReviews,
  checkIfFollowing,
} from '../../services/profileService';
import { getUserExperiences, deleteExperience } from '../../services/experienceService';
import FollowButton from '../../components/profile/FollowButton';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

// ============================================
// ✅ TRADUÇÕES CENTRALIZADAS
// ============================================
const translations = {
  pt: {
    // Loading / Error / Not found
    loadingProfile: 'A carregar perfil...',
    userNotFound: 'Utilizador não encontrado',
    backToHome: 'Voltar ao início',

    // Header / banner
    noBanner: 'Sem banner',
    joined: 'Membro desde ',
    editProfile: 'Editar Perfil',
    copyLink: 'Copiar link',

    // User types
    business: 'Empresa',
    guide: 'Guia',
    traveler: 'Viajante',

    // Stats
    followers: 'Seguidores',
    following: 'Seguindo',
    posts: 'Posts',
    views: 'Views',
    likes: 'Gostos',
    comments: 'Coments',

    // Tabs
    tabAbout: 'Sobre',
    tabExperiences: 'Publicações',
    tabBusinesses: 'Empresas',
    tabReviews: 'Avaliações',

    // About tab
    location: 'Localização',
    nationality: 'Nacionalidade',
    memberSince: 'Membro desde',
    interests: 'Interesses',
    tourGuideInfo: 'Informações do Guia',
    specialty: 'Especialidade',
    experience: 'Experiência',
    languages: 'Idiomas',

    // Experiences tab
    noPosts: 'Ainda sem publicações',
    createFirstPost: 'Crie a sua primeira publicação',

    // Experience card (details)
    seeWhoInteracted: 'Ver quem interagiu',
    hideDetails: 'Ocultar detalhes',
    noLikes: 'Sem gostos ainda',
    noComments: 'Sem comentários ainda',
    noViews: 'Sem visualizações ainda',
    noShares: 'Sem partilhas ainda',
    deletePostConfirm: 'Eliminar esta publicação?',
    delete: 'Eliminar',
    view: 'Ver',
    share: 'Partilha',
    comms: 'Coments',

    // User row
    unknownUser: 'Utilizador desconhecido',
    justNow: 'Agora',

    // Businesses tab
    noBusinesses: 'Sem empresas',
    services: 'serviços',

    // Reviews tab
    noReviews: 'Sem avaliações',

    // Toasts
    linkCopied: 'Link copiado!',
    errorCopying: 'Erro ao copiar',
    deleted: 'Eliminada!',
  },
  en: {
    loadingProfile: 'Loading profile...',
    userNotFound: 'User not found',
    backToHome: 'Back to home',

    noBanner: 'No banner',
    joined: 'Joined ',
    editProfile: 'Edit Profile',
    copyLink: 'Copy link',

    business: 'Business',
    guide: 'Guide',
    traveler: 'Traveler',

    followers: 'Followers',
    following: 'Following',
    posts: 'Posts',
    views: 'Views',
    likes: 'Likes',
    comments: 'Comms',

    tabAbout: 'About',
    tabExperiences: 'Posts',
    tabBusinesses: 'Businesses',
    tabReviews: 'Reviews',

    location: 'Location',
    nationality: 'Nationality',
    memberSince: 'Member since',
    interests: 'Interests',
    tourGuideInfo: 'Tour Guide Info',
    specialty: 'Specialty',
    experience: 'Experience',
    languages: 'Languages',

    noPosts: 'No posts yet',
    createFirstPost: 'Create your first post',

    seeWhoInteracted: 'See who interacted',
    hideDetails: 'Hide details',
    noLikes: 'No likes yet',
    noComments: 'No comments yet',
    noViews: 'No views yet',
    noShares: 'No shares yet',
    deletePostConfirm: 'Delete this post?',
    delete: 'Delete',
    view: 'View',
    share: 'Shares',
    comms: 'Comms',

    unknownUser: 'Unknown user',
    justNow: 'Just now',

    noBusinesses: 'No businesses',
    services: 'services',

    noReviews: 'No reviews yet',

    linkCopied: 'Link copied!',
    errorCopying: 'Error copying',
    deleted: 'Deleted!',
  },
};

// ============================================
// ÍCONES SOCIAIS
// ============================================
const InstagramIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const YoutubeIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const LinkedinIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SocialIcon = ({ platform }) => {
  const icons = {
    instagram: InstagramIcon,
    facebook: FacebookIcon,
    twitter: TwitterIcon,
    youtube: YoutubeIcon,
    linkedin: LinkedinIcon,
  };
  const Icon = icons[platform?.toLowerCase()];
  return Icon ? <Icon size={18} /> : null;
};

// ============================================
// COMPONENTE: LINHA DE UTILIZADOR
// ============================================
const UserRow = ({ user, date, isEn, badge, t }) => {
  const formatDate = (d) => {
    if (!d) return '';
    const now = new Date();
    const diff = now - new Date(d);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.justNow;
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
        <span>{t.unknownUser}</span>
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

// ============================================
// COMPONENTE: EMPTY STATE
// ============================================
const EmptyState = ({ icon: Icon, text }) => (
  <div className="text-center py-4">
    <Icon size={20} className="mx-auto text-gray-300 dark:text-gray-600 mb-1" />
    <p className="text-xs text-gray-400">{text}</p>
  </div>
);

// ============================================
// COMPONENTE: CARD DE PUBLICAÇO DETALHADO
// ============================================
const ExperienceCardWithDetails = ({
  experience,
  isEn,
  isOwner,
  onView,
  onDelete,
  t,
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

    if (minutes < 1) return t.justNow;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const loadDetails = async () => {
    if (details.likers.length > 0 || loadingDetails) return;

    setLoadingDetails(true);
    try {
      const { data: views } = await supabase
        .from('experience_views')
        .select('user_id, created_at')
        .eq('experience_id', experience.id)
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: likes } = await supabase
        .from('experience_likes')
        .select('user_id, created_at')
        .eq('experience_id', experience.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: comments } = await supabase
        .from('experience_comments')
        .select('user_id, content, created_at')
        .eq('experience_id', experience.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: shares } = await supabase
        .from('experience_shares')
        .select('user_id, platform, created_at')
        .eq('experience_id', experience.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const allUserIds = [
        ...new Set(
          [
            ...(views || []).map((v) => v.user_id),
            ...(likes || []).map((l) => l.user_id),
            ...(comments || []).map((c) => c.user_id),
            ...(shares || []).map((s) => s.user_id),
          ].filter(Boolean)
        ),
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
        viewers: (views || []).map((v) => ({ ...v, user: userMap[v.user_id] || null })),
        likers: (likes || []).map((l) => ({ ...l, user: userMap[l.user_id] || null })),
        commenters: (comments || []).map((c) => ({ ...c, user: userMap[c.user_id] || null })),
        sharers: (shares || []).map((s) => ({ ...s, user: userMap[s.user_id] || null })),
      });
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleExpand = () => {
    if (!expanded) loadDetails();
    setExpanded(!expanded);
  };

  const handleDelete = async () => {
    if (!confirm(t.deletePostConfirm)) return;
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
        <h3
          onClick={() => onView(experience.id)}
          className="font-semibold text-gray-900 dark:text-white hover:text-purple-500 transition line-clamp-1 cursor-pointer"
        >
          {experience.title}
        </h3>

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

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {experience.content}
        </p>

        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <Eye size={14} className="mx-auto text-blue-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.views}</p>
            <p className="text-[10px] text-gray-500 uppercase">Views</p>
          </div>
          <div className="text-center">
            <Heart size={14} className="mx-auto text-red-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.likes}</p>
            <p className="text-[10px] text-gray-500 uppercase">{t.likes}</p>
          </div>
          <div className="text-center">
            <MessageCircle size={14} className="mx-auto text-amber-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.comments}</p>
            <p className="text-[10px] text-gray-500 uppercase">{t.comms}</p>
          </div>
          <div className="text-center">
            <Share2 size={14} className="mx-auto text-green-500 mb-0.5" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">{counts.shares}</p>
            <p className="text-[10px] text-gray-500 uppercase">{t.share}</p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleToggleExpand}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium transition"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? t.hideDetails : t.seeWhoInteracted}
          </button>
        )}

        {expanded && isOwner && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {loadingDetails ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-amber-500" />
              </div>
            ) : (
              <>
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
                      <span>({tab.count})</span>
                    </button>
                  ))}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {activeTab === 'likers' &&
                    (details.likers.length === 0 ? (
                      <EmptyState icon={Heart} text={t.noLikes} />
                    ) : (
                      details.likers.map((item) => (
                        <UserRow
                          key={item.user_id}
                          user={item.user}
                          date={item.created_at}
                          isEn={isEn}
                          t={t}
                        />
                      ))
                    ))}

                  {activeTab === 'commenters' &&
                    (details.commenters.length === 0 ? (
                      <EmptyState icon={MessageCircle} text={t.noComments} />
                    ) : (
                      details.commenters.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                          <UserRow user={item.user} date={item.created_at} isEn={isEn} t={t} />
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1 pl-9 line-clamp-2 italic">
                            "{item.content}"
                          </p>
                        </div>
                      ))
                    ))}

                  {activeTab === 'viewers' &&
                    (details.viewers.length === 0 ? (
                      <EmptyState icon={Eye} text={t.noViews} />
                    ) : (
                      details.viewers.map((item) => (
                        <UserRow
                          key={item.user_id}
                          user={item.user}
                          date={item.created_at}
                          isEn={isEn}
                          t={t}
                        />
                      ))
                    ))}

                  {activeTab === 'sharers' &&
                    (details.sharers.length === 0 ? (
                      <EmptyState icon={Share2} text={t.noShares} />
                    ) : (
                      details.sharers.map((item, idx) => (
                        <UserRow
                          key={idx}
                          user={item.user}
                          date={item.created_at}
                          isEn={isEn}
                          badge={item.platform}
                          t={t}
                        />
                      ))
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {isOwner && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => onView(experience.id)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ExternalLink size={12} />
              {t.view}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              {t.delete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function PublicProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  // ✅ Language global
  const { language, isEn } = useLanguage();
  const currentLang = language === 'en' ? 'en' : 'pt';
  const t = translations[currentLang];

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [copied, setCopied] = useState(false);

  const isOwnProfile = isAuthenticated && user?.id === id;

  // ============================================
  // CARREGAR DADOS
  // ============================================
  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setError(t.userNotFound);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 [PublicProfile] Carregando perfil:', id);

        const { data: profileData, error: profileError } = await getPublicProfile(id);
        if (profileError) throw profileError;
        if (!profileData) {
          setError(t.userNotFound);
          setLoading(false);
          return;
        }

        console.log('✅ [PublicProfile] Perfil:', profileData.name);
        setProfile(profileData);

        const { data: businessesData } = await getUserBusinesses(id);
        setBusinesses(businessesData || []);

        const { data: reviewsData } = await getUserReviews(id);
        setReviews(reviewsData || []);

        const { data: followersData } = await getFollowers(id);
        setFollowers(followersData || []);

        const { data: followingData } = await getFollowing(id);
        setFollowing(followingData || []);

        const expResult = await getUserExperiences(id, 50);
        if (expResult.success) {
          setExperiences(expResult.data || []);
        }

        if (isAuthenticated && user?.id && user.id !== id) {
          const { isFollowing: followingCheck } = await checkIfFollowing(user.id, id);
          setIsFollowing(followingCheck);
        }
      } catch (err) {
        console.error('❌ [PublicProfile] Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, user?.id]);

  // ============================================
  // COPIAR LINK
  // ============================================
  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t.linkCopied);
    } catch (err) {
      toast.error(t.errorCopying);
    }
  };

  // ============================================
  // ELIMINAR PUBLICAÇO
  // ============================================
  const handleDeleteExperience = async (experienceId) => {
    const result = await deleteExperience(experienceId, user.id);
    if (result.success) {
      setExperiences((prev) => prev.filter((e) => e.id !== experienceId));
      toast.success(t.deleted);
    } else {
      toast.error(result.error);
    }
  };

  const handleViewExperience = (experienceId) => {
    navigate(`/experiencia/${experienceId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'pt-AO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  // ============================================
  // ESTATÍSTICAS TOTAIS
  // ============================================
  const totalStats = {
    posts: experiences.length,
    views: experiences.reduce((acc, e) => acc + (e.views_count || 0), 0),
    likes: experiences.reduce((acc, e) => acc + (e.likes_count || 0), 0),
    comments: experiences.reduce((acc, e) => acc + (e.comments_count || 0), 0),
    shares: experiences.reduce((acc, e) => acc + (e.shares_count || 0), 0),
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="text-gray-500">{t.loadingProfile}</p>
      </div>
    );
  }

  // ============================================
  // ERRO
  // ============================================
  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {t.userNotFound}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
          >
            <ChevronLeft size={18} />
            {t.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  const userType = profile.user_type || profile.role || 'user';
  const isBusiness = userType === 'business' || userType === 'company';
  const isGuide = userType === 'guide';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

        {/* BANNER */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 overflow-hidden">
          {profile.banner_url || profile.cover_image ? (
            <img
              src={profile.banner_url || profile.cover_image}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white/30">
                <span className="text-6xl">🖼️</span>
                <p className="text-sm mt-2">{t.noBanner}</p>
              </div>
            </div>
          )}
        </div>

        {/* CABEÇALHO */}
        <div className="relative px-6 -mt-16">
          <div className="flex flex-wrap items-end gap-4">

            <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                  <User size={56} className="text-amber-500/60" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {profile.name || 'User'}
                </h1>
                {profile.is_verified && <CheckCircle size={20} className="text-blue-500" />}

                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                    isBusiness
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : isGuide
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {isBusiness ? (
                    <Building2 size={12} />
                  ) : isGuide ? (
                    <Compass size={12} />
                  ) : (
                    <User size={12} />
                  )}
                  {isBusiness ? t.business : isGuide ? t.guide : t.traveler}
                </span>

                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {t.joined}
                  {formatDate(profile.created_at)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                {profile.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Mail size={14} /> {profile.email}
                  </p>
                )}
                {profile.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone size={14} /> {profile.phone}
                  </p>
                )}
                {profile.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={14} /> {profile.location}
                  </p>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <Globe size={14} />
                    {profile.website.replace(/^https?:\/\//, '')}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2 pb-2 flex-wrap">
              <button
                onClick={copyProfileLink}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                title={t.copyLink}
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className="text-gray-500" />
                )}
              </button>

              {!isOwnProfile && (
                <FollowButton targetUserId={profile.id} onFollowChange={setIsFollowing} />
              )}

              {isOwnProfile && (
                <Link
                  to="/perfil"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl hover:from-amber-700 hover:to-amber-600 transition shadow-lg"
                >
                  {t.editProfile}
                </Link>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {profile.social_links && Object.values(profile.social_links).some((v) => v) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(profile.social_links).map(([platform, url]) => {
                if (!url) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    title={platform}
                  >
                    <SocialIcon platform={platform} />
                  </a>
                );
              })}
            </div>
          )}

          {/* ESTATÍSTICAS (6 cards) */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
              <Users size={16} className="mx-auto text-purple-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.followers_count || followers.length || 0}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                {t.followers}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
              <Users size={16} className="mx-auto text-blue-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.following_count || following.length || 0}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                {t.following}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
              <Sparkles size={16} className="mx-auto text-amber-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {totalStats.posts}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                {t.posts}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
              <Eye size={16} className="mx-auto text-blue-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {totalStats.views}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                {t.views}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
              <Heart size={16} className="mx-auto text-red-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {totalStats.likes}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                {t.likes}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center">
              <MessageCircle size={16} className="mx-auto text-amber-500 mb-1" />
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {totalStats.comments}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                {t.comments}
              </p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 overflow-x-auto -mb-px">
            {[
              { id: 'about', icon: User, label: t.tabAbout },
              { id: 'experiences', icon: Sparkles, label: t.tabExperiences, count: experiences.length },
              { id: 'businesses', icon: Building2, label: t.tabBusinesses, count: businesses.length },
              { id: 'reviews', icon: Star, label: t.tabReviews, count: reviews.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.count !== undefined && ` (${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="px-6 pb-6 pt-4">

          {/* TAB: SOBRE */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.location && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                      <MapPinned size={14} />
                      {t.location}
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.location}</p>
                  </div>
                )}
                {profile.nationality && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t.nationality}
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.nationality}</p>
                  </div>
                )}
                {profile.website && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Website</p>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                    >
                      {profile.website}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t.memberSince}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {t.interests}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isGuide && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
                  <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                    <Compass size={18} />
                    {t.tourGuideInfo}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.guide_specialty && (
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400/70">
                          {t.specialty}
                        </p>
                        <p className="text-green-900 dark:text-green-300 font-medium text-sm">
                          {profile.guide_specialty}
                        </p>
                      </div>
                    )}
                    {profile.guide_experience && (
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400/70">
                          {t.experience}
                        </p>
                        <p className="text-green-900 dark:text-green-300 font-medium text-sm">
                          {profile.guide_experience}
                        </p>
                      </div>
                    )}
                    {profile.guide_languages && profile.guide_languages.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-green-600 dark:text-green-400/70 mb-1">
                          {t.languages}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {profile.guide_languages.map((lang, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PUBLICAÇÕES */}
          {activeTab === 'experiences' && (
            <div>
              {experiences.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {experiences.map((exp) => (
                    <ExperienceCardWithDetails
                      key={exp.id}
                      experience={exp}
                      isEn={isEn}
                      isOwner={isOwnProfile}
                      onView={handleViewExperience}
                      onDelete={handleDeleteExperience}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <Sparkles size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t.noPosts}</p>
                  {isOwnProfile && (
                    <Link
                      to="/perfil"
                      className="mt-3 inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 font-medium"
                    >
                      <PlusCircle size={16} />
                      {t.createFirstPost}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: EMPRESAS */}
          {activeTab === 'businesses' && (
            <div>
              {businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businesses.map((b) => (
                    <Link
                      key={b.id}
                      to={`/empresa/${b.id}`}
                      className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 hover:shadow-md transition flex items-center gap-3"
                    >
                      {b.logo_url ? (
                        <img
                          src={b.logo_url}
                          alt={b.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Building2 size={24} className="text-purple-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {b.name}
                        </h4>
                        {b.category && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{b.category}</p>
                        )}
                        {b.services && b.services.length > 0 && (
                          <p className="text-xs text-amber-500 mt-1">
                            {b.services.length} {t.services}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t.noBusinesses}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: AVALIAÇÕES */}
          {activeTab === 'reviews' && (
            <div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={
                                s <= r.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {r.rating}/5
                        </span>
                      </div>
                      {r.business && (
                        <Link
                          to={`/empresa/${r.business.id}`}
                          className="text-sm text-amber-500 hover:text-amber-600 font-medium mb-2 flex items-center gap-1"
                        >
                          <Building2 size={14} />
                          {r.business.name}
                        </Link>
                      )}
                      {r.comment && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{r.comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{formatDate(r.created_at)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <Star size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t.noReviews}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}