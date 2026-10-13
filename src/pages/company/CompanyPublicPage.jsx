// src/pages/public/CompanyPublicPage.jsx

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Star, Phone, Mail, Globe,
  Clock, Calendar, Users, Package, CreditCard,
  Image as ImageIcon, Loader2, ArrowLeft, Share2,
  Heart, CheckCircle, Award, Shield, ExternalLink,
  CalendarDays, User, DollarSign, AlarmClock,
  MapPinned, BookOpen, ChevronRight, X, ChevronLeft,
  Info, Briefcase, MessageCircle, Sparkles, Zap, Sun,
  Moon, Cloud, Waves, Mountain, TreePine, Wifi,
  Coffee, Home, ChevronUp, AlertCircle, ChevronDown,
  Camera, Images, Play, Maximize2
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import BookingModal from '../../components/booking/BookingModal';
import { getCompanyGallery } from '../../services/companyService';
import toast from 'react-hot-toast';

// ============================================
//  ÍCONES DE REDES SOCIAIS - SVG DIRETO
// ============================================
const InstagramIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const YoutubeIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const LinkedinIcon = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ============================================
// COMPONENTE DE ÍCONE SOCIAL
// ============================================
const SocialIcon = ({ platform }) => {
  const icons = {
    instagram: InstagramIcon,
    facebook: FacebookIcon,
    twitter: TwitterIcon,
    youtube: YoutubeIcon,
    linkedin: LinkedinIcon
  };
  const Icon = icons[platform?.toLowerCase()];
  return Icon ? <Icon size={18} /> : null;
};

// ============================================
// COMPONENTE DE ESTRELAS
// ============================================
const StarRating = ({ rating, totalReviews, size = 18 }) => {
  const fullStars = Math.floor(rating || 0);
  const hasHalfStar = (rating || 0) - fullStars >= 0.5;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <Star key={star} size={size} className="fill-yellow-400 text-yellow-400" />;
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <div key={star} className="relative">
                <Star size={size} className="text-yellow-400" />
                <div className="absolute inset-0 w-1/2 overflow-hidden">
                  <Star size={size} className="fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            );
          } else {
            return <Star key={star} size={size} className="text-gray-300 dark:text-gray-600" />;
          }
        })}
      </div>
      {totalReviews > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE DE SERVIÇO
// ============================================
const ServiceCard = ({ service, onBook, isEn }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price || 0);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {service.main_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={service.main_image}
            alt={service.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          {service.is_featured && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {isEn ? 'Featured' : 'Destaque'}
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
              {service.title}
            </h4>
            {service.category && (
              <span className="inline-block mt-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                {service.category}
              </span>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(service.price)}
            </p>
            {service.duration && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                <Clock size={12} />
                {service.duration}
              </p>
            )}
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {service.description}
          </p>
        )}

        {service.highlights && service.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {service.highlights.slice(0, 3).map((highlight, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
              >
                {highlight}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {service.max_people && (
              <span className="flex items-center gap-1">
                <Users size={14} />
                {service.max_people}
              </span>
            )}
            {service.is_available ? (
              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle size={14} />
                {isEn ? 'Available' : 'Disponível'}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                <X size={14} />
                {isEn ? 'Unavailable' : 'Indisponível'}
              </span>
            )}
          </div>
          <button
            onClick={() => onBook(service)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-medium rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all hover:scale-105 shadow-lg shadow-amber-500/25 flex items-center gap-2"
          >
            <Calendar size={16} />
            {isEn ? 'Book Now' : 'Reservar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE AVALIAÇO
// ============================================
const ReviewCard = ({ review, isEn }) => {
  const profile = review.profiles || {};
  const profileName = profile.name || review.user_name || (isEn ? 'Anonymous' : 'Anônimo');
  const profileAvatar = profile.avatar_url || review.user_avatar || null;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {profileAvatar ? (
          <img
            src={profileAvatar}
            alt={profileName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <User size={20} className="text-amber-500" />
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {profileName}
          </p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(review.created_at).toLocaleDateString('pt-AO')}
            </span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
          {review.comment}
        </p>
      )}
    </div>
  );
};

// ============================================
// 🆕 COMPONENTE DE GALERIA - MODAL LIGHTBOX
// ============================================
const GalleryLightbox = ({ images, initialIndex, onClose, isEn }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition p-2"
      >
        <X size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="absolute left-4 text-white/70 hover:text-white transition p-2"
      >
        <ChevronLeft size={48} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 text-white/70 hover:text-white transition p-2"
      >
        <ChevronRight size={48} />
      </button>

      <div 
        className="max-w-5xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.image_url}
          alt={currentImage.caption || 'Foto da galeria'}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        {currentImage.caption && (
          <p className="text-white/80 text-center mt-4 text-sm">
            {currentImage.caption}
          </p>
        )}
        <p className="text-white/50 text-center text-xs mt-2">
          {currentIndex + 1} {isEn ? 'of' : 'de'} {images.length}
        </p>
      </div>
    </div>
  );
};

// ============================================
// 🆕 COMPONENTE DE GALERIA - GRID
// ============================================
const GalleryGrid = ({ images, isEn }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <Images size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {isEn ? 'No photos available' : 'Nenhuma foto disponível'}
        </p>
      </div>
    );
  }

  const openLightbox = (index) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  // Mostrar até 6 fotos, sendo a primeira em destaque
  const displayImages = images.slice(0, 7);
  const hasMore = images.length > 7;

  return (
    <>
      <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
        {/* Primeira foto - maior */}
        <div 
          className="col-span-2 row-span-2 aspect-square cursor-pointer relative group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={displayImages[0]?.image_url}
            alt={displayImages[0]?.caption || 'Foto principal'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {displayImages[0]?.is_featured && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              {isEn ? 'Featured' : 'Destaque'}
            </div>
          )}
        </div>

        {/* Demais fotos */}
        {displayImages.slice(1, 7).map((image, index) => (
          <div 
            key={image.id} 
            className="aspect-square cursor-pointer relative group"
            onClick={() => openLightbox(index + 1)}
          >
            <img
              src={image.image_url}
              alt={image.caption || 'Foto da galeria'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}

        {/* Botão "Ver mais" */}
        {hasMore && (
          <div 
            className="aspect-square cursor-pointer relative bg-gray-900 flex items-center justify-center group"
            onClick={() => openLightbox(0)}
          >
            <div className="text-center">
              <Camera size={32} className="text-white/70 mx-auto mb-2" />
              <span className="text-white font-bold text-lg">
                +{images.length - 6}
              </span>
              <p className="text-white/50 text-xs">
                {isEn ? 'View all' : 'Ver todas'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <GalleryLightbox
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
          isEn={isEn}
        />
      )}
    </>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CompanyPublicPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [showAllServices, setShowAllServices] = useState(false);
  
  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Prevenir múltiplas chamadas
  const loadingRef = useRef(false);
  const loadedIdRef = useRef(null);

  // ============================================
  // ✅ CARREGAR DADOS DA EMPRESA
  // ============================================
  const loadCompanyData = useCallback(async () => {
    if (loadingRef.current && loadedIdRef.current === id) {
      console.log('⏳ [CompanyPublicPage] Carregamento já em andamento para:', id);
      return;
    }

    if (!id || id === ':id') {
      setError(isEn ? 'Invalid company ID' : 'ID da empresa inválido');
      setLoading(false);
      return;
    }

    loadingRef.current = true;
    loadedIdRef.current = id;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [CompanyPublicPage] Carregando empresa:', id);

      // 1. Buscar dados da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (companyError) {
        if (companyError.code === 'PGRST116') {
          setError(isEn ? 'Company not found' : 'Empresa não encontrada');
        } else {
          throw companyError;
        }
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      if (!companyData) {
        setError(isEn ? 'Company not found' : 'Empresa não encontrada');
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      setCompany(companyData);
      console.log('✅ [CompanyPublicPage] Empresa carregada:', companyData.name);

      // 2. Buscar serviços
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', id)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('❌ Erro ao buscar serviços:', servicesError);
      } else {
        console.log(`📊 [CompanyPublicPage] Serviços encontrados: ${servicesData?.length || 0}`);
        setServices(servicesData || []);
      }

      // 3. Buscar avaliações
      try {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, user_id, business_id')
          .eq('business_id', id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (reviewsError) {
          if (reviewsError.code === '42P01') {
            console.log('📊 [CompanyPublicPage] Tabela reviews não existe');
          } else if (reviewsError.code === '42703') {
            console.log('📊 [CompanyPublicPage] Coluna business_id não existe');
          } else {
            console.error('❌ Erro ao buscar avaliações:', reviewsError);
          }
          setReviews([]);
        } else {
          console.log(`📊 [CompanyPublicPage] Avaliações encontradas: ${reviewsData?.length || 0}`);
          
          if (reviewsData && reviewsData.length > 0) {
            const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))];
            
            if (userIds.length > 0) {
              try {
                const { data: profilesData, error: profilesError } = await supabase
                  .from('profiles')
                  .select('id, name, avatar_url')
                  .in('id', userIds);

                if (!profilesError && profilesData) {
                  const reviewsWithProfiles = reviewsData.map(review => ({
                    ...review,
                    profiles: profilesData.find(p => p.id === review.user_id) || null
                  }));
                  setReviews(reviewsWithProfiles);
                } else {
                  setReviews(reviewsData);
                }
              } catch (profileErr) {
                console.log('📊 [CompanyPublicPage] Erro ao buscar perfis:', profileErr.message);
                setReviews(reviewsData);
              }
            } else {
              setReviews(reviewsData);
            }
          } else {
            setReviews([]);
          }
        }
      } catch (reviewErr) {
        console.log('📊 [CompanyPublicPage] Erro ao buscar avaliações:', reviewErr.message);
        setReviews([]);
      }

      // 4.  Buscar galeria de fotos
      try {
        const { data: galleryData, error: galleryError } = await supabase
          .from('company_gallery')
          .select('*')
          .eq('company_id', id)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (galleryError) {
          if (galleryError.code === '42P01') {
            console.log('📊 [CompanyPublicPage] Tabela company_gallery não existe');
          } else {
            console.error('❌ Erro ao buscar galeria:', galleryError);
          }
          setGallery([]);
        } else {
          console.log(`📊 [CompanyPublicPage] Fotos na galeria: ${galleryData?.length || 0}`);
          setGallery(galleryData || []);
        }
      } catch (galleryErr) {
        console.log('📊 [CompanyPublicPage] Erro ao buscar galeria:', galleryErr.message);
        setGallery([]);
      }

    } catch (err) {
      console.error('❌ [CompanyPublicPage] Erro:', err);
      setError(err.message || (isEn ? 'Error loading company' : 'Erro ao carregar empresa'));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [id, isEn]);

  useEffect(() => {
    loadCompanyData();
    return () => {
      loadingRef.current = false;
    };
  }, [loadCompanyData]);

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: company?.name,
          text: `Conheça a empresa ${company?.name} no RAVTUR!`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(isEn ? 'Link copied!' : 'Link copiado!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  const handleBookService = (service) => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to book' : 'Faça login para reservar');
      navigate('/login');
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-AO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const total = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const displayedServices = useMemo(() => {
    return showAllServices ? services : services.slice(0, 6);
  }, [services, showAllServices]);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'Loading company...' : 'Carregando empresa...'}
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Company not found' : 'Empresa não encontrada'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error || (isEn ? 'The company you are looking for does not exist' : 'A empresa que procura não existe')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
          >
            <ChevronLeft size={18} />
            {isEn ? 'Back to home' : 'Voltar ao início'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 rounded-2xl overflow-hidden">
        {company.cover_image ? (
          <img
            src={company.cover_image}
            alt={company.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-amber-700 via-amber-600 to-orange-700 flex items-center justify-center">
            <Building2 size={80} className="text-white/30" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {company.is_verified && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
            <CheckCircle size={14} />
            {isEn ? 'Verified' : 'Verificado'}
          </div>
        )}

        <button
          onClick={handleShare}
          className="absolute top-4 right-20 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition text-white"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="relative px-6 -mt-12">
        <div className="flex flex-wrap items-end gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <Building2 size={56} className="text-amber-500/60" />
                </div>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {company.name}
              </h1>
              {company.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Briefcase size={12} />
                  {company.category}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              {company.province && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {company.province}
                </p>
              )}
              {company.address && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {company.address}
                </p>
              )}
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
                >
                  <Phone size={14} />
                  {company.phone}
                </a>
              )}
              {company.email && (
                <a
                  href={`mailto:${company.email}`}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
                >
                  <Mail size={14} />
                  {company.email}
                </a>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 pb-2 flex-shrink-0">
            {company.phone && (
              <a
                href={`https://wa.me/${company.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all hover:scale-105"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            )}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error(isEn ? 'Please login to book' : 'Faça login para reservar');
                  navigate('/login');
                  return;
                }
                if (services.length > 0) {
                  handleBookService(services[0]);
                } else {
                  toast.error(isEn ? 'No services available' : 'Nenhum serviço disponível');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all hover:scale-105 shadow-lg shadow-amber-500/25"
            >
              <Calendar size={16} />
              {isEn ? 'Book Now' : 'Reservar'}
            </button>
          </div>
        </div>

        {/* Descrição curta */}
        {company.description && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {company.description}
            </p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-4 flex flex-wrap gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Star size={16} className="text-yellow-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{averageRating}</span>
            <span className="text-gray-500 dark:text-gray-400">
              ({reviews.length} {isEn ? 'reviews' : 'avaliações'})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{services.length}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {isEn ? 'services' : 'serviços'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Images size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{gallery.length}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {isEn ? 'photos' : 'fotos'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">
              {isEn ? 'Member since ' : 'Membro desde '}
              {formatDate(company.created_at)}
            </span>
          </div>
        </div>

        {/* Redes Sociais */}
        {company.social_links && Object.values(company.social_links).some(v => v) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(company.social_links).map(([platform, url]) => {
              if (!url) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={platform}
                >
                  <SocialIcon platform={platform} />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* GALERIA DE FOTOS */}
      {gallery.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Images size={22} className="text-amber-500" />
              {isEn ? 'Photo Gallery' : 'Galeria de Fotos'}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({gallery.length} {isEn ? 'photos' : 'fotos'})
              </span>
            </h2>
          </div>
          <GalleryGrid images={gallery} isEn={isEn} />
        </div>
      )}

      {/* TABS */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
          <button
            onClick={() => setActiveTab('about')}
            className={`
              px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
              ${activeTab === 'about'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            <Info size={16} className="inline mr-2" />
            {isEn ? 'About' : 'Sobre'}
          </button>
          
          <button
            onClick={() => setActiveTab('services')}
            className={`
              px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
              ${activeTab === 'services'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            <Briefcase size={16} className="inline mr-2" />
            {isEn ? 'Services' : 'Serviços'}
            {services.length > 0 && (
              <span className="ml-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {services.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('reviews')}
            className={`
              px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
              ${activeTab === 'reviews'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            <Star size={16} className="inline mr-2" />
            {isEn ? 'Reviews' : 'Avaliações'}
            {reviews.length > 0 && (
              <span className="ml-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {reviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`
              px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
              ${activeTab === 'contact'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            <Phone size={16} className="inline mr-2" />
            {isEn ? 'Contact' : 'Contato'}
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS TABS */}
      <div className="mt-6">
        {/* TAB: About */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {company.full_description && (
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info size={20} className="text-amber-500" />
                  {isEn ? 'About the Company' : 'Sobre a Empresa'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {company.full_description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.province && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Province' : 'Província'}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">{company.province}</p>
                </div>
              )}
              {company.address && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Address' : 'Endereço'}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">{company.address}</p>
                </div>
              )}
              {company.email && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a href={`mailto:${company.email}`} className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Phone' : 'Telefone'}
                  </p>
                  <a href={`tel:${company.phone}`} className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                    {company.phone}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 hover:underline font-medium flex items-center gap-1"
                  >
                    {company.website}
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Services */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {services.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onBook={handleBookService}
                      isEn={isEn}
                    />
                  ))}
                </div>
                {services.length > 6 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllServices(!showAllServices)}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                    >
                      {showAllServices ? (
                        <>
                          <ChevronUp size={18} />
                          {isEn ? 'Show less' : 'Mostrar menos'}
                        </>
                      ) : (
                        <>
                          <ChevronDown size={18} />
                          {isEn ? 'View all services' : 'Ver todos os serviços'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {isEn ? 'No Services Available' : 'Nenhum Serviço Disponível'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isEn
                    ? 'This company has no services available yet'
                    : 'Esta empresa ainda não tem serviços disponíveis'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {reviews.length > 0 ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{averageRating}</span>
                      <div className="flex items-center justify-center mt-1">
                        <StarRating rating={Number(averageRating)} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {reviews.length} {isEn ? 'reviews' : 'avaliações'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} isEn={isEn} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Star size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {isEn ? 'No Reviews' : 'Sem Avaliações'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isEn
                    ? 'Be the first to review this company!'
                    : 'Seja o primeiro a avaliar esta empresa!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.phone && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Phone size={18} className="text-amber-500" />
                    {isEn ? 'Phone' : 'Telefone'}
                  </p>
                  <a
                    href={`tel:${company.phone}`}
                    className="text-xl font-semibold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition"
                  >
                    {company.phone}
                  </a>
                  <a
                    href={`https://wa.me/${company.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    <MessageCircle size={16} />
                    {isEn ? 'Chat on WhatsApp' : 'Chat no WhatsApp'}
                  </a>
                </div>
              )}

              {company.email && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Mail size={18} className="text-amber-500" />
                    Email
                  </p>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-xl font-semibold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition"
                  >
                    {company.email}
                  </a>
                  <a
                    href={`mailto:${company.email}`}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm"
                  >
                    <Mail size={16} />
                    {isEn ? 'Send Email' : 'Enviar Email'}
                  </a>
                </div>
              )}

              {company.address && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <MapPin size={18} className="text-amber-500" />
                    {isEn ? 'Address' : 'Endereço'}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {company.address}
                  </p>
                  {company.latitude && company.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${company.latitude},${company.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition text-sm"
                    >
                      <ExternalLink size={14} />
                      {isEn ? 'View on map' : 'Ver no mapa'}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          service={selectedService}
          business={company}
          onSuccess={(booking) => {
            console.log('✅ Reserva criada:', booking);
            toast.success(isEn ? 'Booking confirmed!' : 'Reserva confirmada!');
          }}
        />
      )}
    </div>
  );
}