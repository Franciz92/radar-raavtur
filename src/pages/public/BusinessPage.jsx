// src/pages/public/BusinessPage.jsx
// ✅ Alinhado com as colunas reais da tabela `bookings`
// ✅ Botão de favorito funcional
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePublicBusiness } from '../../context/PublicBusinessContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import businessService from '../../services/businessService';
import { getServiceAction, isFoodCategory } from '../../utils/serviceActions';
import {
  Building2, MapPin, Phone, Mail, Globe, Star, Heart, Share2,
  Calendar, Users, Clock, CheckCircle, ArrowLeft, Image, Plus, Minus,
  ShoppingCart, CreditCard, ExternalLink, ChevronRight,
  MessageCircle, Package, X, Copy, Check, Pencil, Lock,
  Ticket, PenTool, Wrench, Handshake,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

// ============================================
// ÍCONES DAS AÇÕES
// ============================================
const ACTION_ICONS = {
  Calendar,
  ShoppingCart,
  Ticket,
  PenTool,
  Wrench,
  Handshake,
};

// ============================================
// TRADUÇÕES
// ============================================
const translations = {
  pt: {
    verified: 'Verificado',
    contact: 'Contactar',
    viewOnMap: 'Ver no mapa',
    tabServices: 'Serviços',
    tabGallery: 'Galeria',
    tabAbout: 'Sobre',
    noServices: 'Nenhum serviço disponível',
    noServicesDesc: 'Esta empresa ainda não adicionou serviços.',
    addService: 'Adicionar Serviço',
    featured: 'Destaque',
    owner: 'Dono',
    editService: 'Editar serviço',
    noPhotos: 'Nenhuma foto ainda',
    about: 'Sobre',
    location: 'Localização',
    paymentMethods: 'Métodos de Pagamento',
    noDescription: 'Sem descrição disponível',
    contactInfo: 'Informações de Contacto',
    phone: 'Telefone',
    email: 'Email',
    website: 'Website',
    sendWhatsApp: 'Enviar Mensagem WhatsApp',
    close: 'Fechar',
    copied: 'Copiado!',
    buyService: 'Comprar Serviço',
    bookService: 'Reservar Serviço',
    markService: 'Marcar Serviço',
    enrollService: 'Inscrever no Serviço',
    hireService: 'Contratar Serviço',
    requestService: 'Solicitar Serviço',
    quantity: 'Quantidade',
    date: 'Data',
    time: 'Hora',
    total: 'Total',
    cancel: 'Cancelar',
    confirmBooking: 'Confirmar Reserva',
    confirmPurchase: 'Confirmar Compra',
    confirmSchedule: 'Confirmar Marcação',
    confirmEnroll: 'Confirmar Inscrição',
    confirmHire: 'Confirmar Contratação',
    confirmRequest: 'Confirmar Solicitação',
    loginToBuy: 'Faça login para comprar',
    loginToBook: 'Faça login para reservar',
    loginToMark: 'Faça login para marcar',
    selectService: 'Selecione um serviço',
    selectDate: 'Selecione uma data',
    purchaseSuccess: 'Compra criada com sucesso!',
    bookingSuccess: 'Reserva criada com sucesso!',
    scheduleSuccess: 'Marcação criada com sucesso!',
    errorCreating: 'Erro ao criar',
    notFound: 'Empresa não encontrada',
    notFoundDesc: 'A empresa que você está procurando não existe ou pode ter sido removida.',
    goHome: 'Voltar ao Início',
    browseBusinesses: 'Ver Empresas',
    ownerOnlyEdit: 'Apenas o proprietário pode editar serviços',
    loadingError: 'Erro ao carregar empresa',
    // ✅ Favoritos
    addToFavorites: 'Adicionar aos favoritos',
    removeFromFavorites: 'Remover dos favoritos',
    addedToFavorites: 'Adicionado aos favoritos!',
    removedFromFavorites: 'Removido dos favoritos!',
    loginToFavorite: 'Faça login para adicionar favoritos',
    favoriteError: 'Erro ao atualizar favorito',
  },
  en: {
    verified: 'Verified',
    contact: 'Contact',
    viewOnMap: 'View on map',
    tabServices: 'Services',
    tabGallery: 'Gallery',
    tabAbout: 'About',
    noServices: 'No services available',
    noServicesDesc: 'This business has not added any services yet.',
    addService: 'Add Service',
    featured: 'Featured',
    owner: 'Owner',
    editService: 'Edit service',
    noPhotos: 'No photos yet',
    about: 'About',
    location: 'Location',
    paymentMethods: 'Payment Methods',
    noDescription: 'No description available',
    contactInfo: 'Contact Information',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    sendWhatsApp: 'Send WhatsApp Message',
    close: 'Close',
    copied: 'Copied!',
    buyService: 'Buy Service',
    bookService: 'Book Service',
    markService: 'Schedule Service',
    enrollService: 'Enroll in Service',
    hireService: 'Hire Service',
    requestService: 'Request Service',
    quantity: 'Quantity',
    date: 'Date',
    time: 'Time',
    total: 'Total',
    cancel: 'Cancel',
    confirmBooking: 'Confirm Booking',
    confirmPurchase: 'Confirm Purchase',
    confirmSchedule: 'Confirm Schedule',
    confirmEnroll: 'Confirm Enrollment',
    confirmHire: 'Confirm Hire',
    confirmRequest: 'Confirm Request',
    loginToBuy: 'Please login to buy',
    loginToBook: 'Please login to book',
    loginToMark: 'Please login to schedule',
    selectService: 'Select a service',
    selectDate: 'Select a date',
    purchaseSuccess: 'Purchase created successfully!',
    bookingSuccess: 'Booking created successfully!',
    scheduleSuccess: 'Schedule created successfully!',
    errorCreating: 'Error creating',
    notFound: 'Business not found',
    notFoundDesc: 'The business you are looking for does not exist or may have been removed.',
    goHome: 'Go Home',
    browseBusinesses: 'Browse Businesses',
    ownerOnlyEdit: 'Only the owner can edit services',
    loadingError: 'Error loading business',
    // ✅ Favorites
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    addedToFavorites: 'Added to favorites!',
    removedFromFavorites: 'Removed from favorites!',
    loginToFavorite: 'Please login to add favorites',
    favoriteError: 'Error updating favorite',
  },
};

// ============================================
// HELPER — contexto da ação
// ============================================
function getActionContext(category, language, t) {
  const action = getServiceAction(category, language);

  let modalTitle, confirmLabel, successMsg;

  switch (action.icon) {
    case 'ShoppingCart':
      modalTitle = t.buyService;
      confirmLabel = t.confirmPurchase;
      successMsg = t.purchaseSuccess;
      break;
    case 'Ticket':
      modalTitle = language === 'en' ? 'Buy Ticket' : 'Comprar Bilhete';
      confirmLabel = language === 'en' ? 'Confirm Ticket' : 'Confirmar Bilhete';
      successMsg = language === 'en' ? 'Ticket purchased!' : 'Bilhete comprado!';
      break;
    case 'PenTool':
      modalTitle = t.enrollService;
      confirmLabel = t.confirmEnroll;
      successMsg = language === 'en' ? 'Enrollment confirmed!' : 'Inscrição confirmada!';
      break;
    case 'Wrench':
      modalTitle = t.requestService;
      confirmLabel = t.confirmRequest;
      successMsg = language === 'en' ? 'Request sent!' : 'Solicitação enviada!';
      break;
    case 'Handshake':
      modalTitle = t.hireService;
      confirmLabel = t.confirmHire;
      successMsg = language === 'en' ? 'Hire confirmed!' : 'Contratação confirmada!';
      break;
    case 'Calendar':
    default:
      modalTitle = t.bookService;
      confirmLabel = t.confirmBooking;
      successMsg = t.bookingSuccess;
      break;
  }

  return {
    label: action.label,
    icon: action.icon,
    modalTitle,
    confirmLabel,
    successMsg,
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function BusinessPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { language, isEn } = useLanguage();
  const navigate = useNavigate();
  const { getBusinessById } = usePublicBusiness();

  const t = translations[language === 'en' ? 'en' : 'pt'];

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ✅ ESTADOS DE FAVORITOS
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // ============================================
  // Carregar empresa
  // ============================================
  useEffect(() => {
    const loadBusiness = async () => {
      setIsLoading(true);
      setNotFound(false);

      try {
        console.log('🔍 [BusinessPage] Carregando empresa ID:', id);

        let data = getBusinessById(id);

        if (!data) {
          console.log('🔄 [BusinessPage] Buscando diretamente do banco...');
          data = await businessService.getBusinessById(id);
        }

        if (!data) {
          console.log('❌ [BusinessPage] Empresa não encontrada');
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        console.log('✅ [BusinessPage] Empresa encontrada:', data.name);
        console.log('📂 [BusinessPage] Categoria da empresa:', data.category);
        setBusiness(data);

        if (user?.id) {
          const ownerCheck = await businessService.isBusinessOwner(id, user.id);
          setIsOwner(ownerCheck);
        }

        const servicesData = await businessService.getBusinessServices(id);
        setServices(servicesData);

        const galleryData = await businessService.getBusinessGallery(id);
        setGallery(galleryData);

        const paymentData = await businessService.getBusinessPaymentMethods(id);
        setPaymentMethods(paymentData);
      } catch (error) {
        console.error('❌ Erro ao carregar empresa:', error);
        toast.error(t.loadingError);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadBusiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  // ============================================
  // ✅ Carregar estado do favorito
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !id) {
      setIsFavorite(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'business')
          .maybeSingle();

        if (error) {
          // Se a tabela não existe, não falhar
          if (error.code === '42P01') {
            console.warn('⚠️ [BusinessPage] Tabela favorites não existe');
            return;
          }
          throw error;
        }

        setIsFavorite(!!data);
        console.log('❤️ [BusinessPage] É favorito?', !!data);
      } catch (error) {
        console.error('❌ [BusinessPage] Erro ao verificar favorito:', error);
      }
    };

    checkFavorite();
  }, [id, isAuthenticated, user?.id]);

  // ============================================
  // Ação contextual da empresa
  // ============================================
  const businessActionCtx = getActionContext(business?.category, language, t);
  const BusinessActionIcon = ACTION_ICONS[businessActionCtx.icon] || Calendar;
  const isFood = isFoodCategory(business?.category);

  // ============================================
  // ✅ Toggle favorito (com estado otimista)
  // ============================================
  const handleToggleFavorite = async () => {
    console.log('❤️ [BusinessPage] Toggle favorito clicado');

    // 1. Verificar login
    if (!isAuthenticated || !user?.id) {
      toast.error(t.loginToFavorite);
      navigate('/login');
      return;
    }

    // 2. Evitar clicks duplos
    if (favoriteLoading) {
      console.log('⏳ [BusinessPage] Pedido já em curso');
      return;
    }

    const wasFavorite = isFavorite;

    // 3. Estado otimista (UI muda ANTES da BD responder)
    setFavoriteLoading(true);
    setIsFavorite(!wasFavorite);

    try {
      if (wasFavorite) {
        // REMOVER
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', id)
          .eq('item_type', 'business');

        if (error) throw error;
        toast.success(t.removedFromFavorites);
        console.log('✅ [BusinessPage] Removido dos favoritos');
      } else {
        // ADICIONAR
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              item_id: id,
              item_type: 'business',
            },
          ]);

        if (error) {
          // Se já existe (race condition), ignorar
          if (error.code === '23505') {
            console.log('ℹ️ [BusinessPage] Já estava nos favoritos');
          } else {
            throw error;
          }
        }
        toast.success(t.addedToFavorites);
        console.log('✅ [BusinessPage] Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('❌ [BusinessPage] Erro ao favoritar:', error);

      // Reverter estado otimista em caso de erro
      setIsFavorite(wasFavorite);

      // Mensagens específicas
      if (error.code === '42P01') {
        toast.error(
          isEn ? 'Favorites system not available' : 'Sistema de favoritos indisponível'
        );
      } else if (error.code === '23503') {
        toast.error(isEn ? 'Business not found' : 'Empresa não encontrada');
      } else {
        toast.error(t.favoriteError);
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ============================================
  // Editar serviço
  // ============================================
  const handleEditService = (service) => {
    if (!isOwner) {
      toast.error(t.ownerOnlyEdit);
      return;
    }
    navigate(`/empresa/servicos/editar/${service.id}`);
  };

  // ============================================
  // Copiar
  // ============================================
  const handleCopy = (text, field) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    toast.success(t.copied);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleWhatsApp = () => {
    if (!business?.phone) return;
    const phone = business.phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      isEn
        ? `Hello! I found your business on Radar RAVTUR and would like more information.`
        : `Olá! Encontrei o seu negócio no Radar RAVTUR e gostaria de mais informações.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleOpenMaps = () => {
    if (!business?.address && !business?.province) return;
    const query = encodeURIComponent(
      `${business.address || ''} ${business.province || ''}`.trim()
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setQuantity(1);
    setReservationDate('');
    setReservationTime('');
    setShowBookingModal(true);
  };

  // ============================================
  // Criar reserva/compra
  // ============================================
  const handleCreateReservation = async () => {
    if (!user) {
      toast.error(isFood ? t.loginToBuy : t.loginToBook);
      navigate('/login');
      return;
    }

    if (!selectedService) {
      toast.error(t.selectService);
      return;
    }

    if (!reservationDate) {
      toast.error(t.selectDate);
      return;
    }

    setBookingLoading(true);

    try {
      const totalPrice = selectedService.price * quantity;

      const payload = {
        user_id: user.id,
        service_id: selectedService.id,
        company_id: business.id,
        business_id: business.id,
        item_type: 'service',
        item_name: selectedService.name,
        item_image:
          selectedService.image_url ||
          selectedService.logo_url ||
          null,
        date: reservationDate,
        time: reservationTime || null,
        guests: quantity || 1,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
        notes: '',
        reviewed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📤 [BusinessPage] Inserindo em bookings:', payload);

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([payload])
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('❌ [BusinessPage] Erro ao criar booking:', error);
        throw error;
      }

      if (!booking?.id) {
        throw new Error('Não foi possível criar a reserva');
      }

      const serviceActionCtx = getActionContext(
        selectedService.category || business.category,
        language,
        t
      );

      console.log('✅ [BusinessPage] Booking criado:', booking.id);
      toast.success(serviceActionCtx.successMsg);
      setShowBookingModal(false);
      navigate(`/pagamento/${booking.id}`);
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      toast.error(`${t.errorCreating}: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  // ============================================
  // Loading / Not found
  // ============================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <div className="inline-flex p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
          <Building2 className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.notFound}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{t.notFoundDesc}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.goHome}
          </Link>
          <Link
            to="/empresas"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition"
          >
            <Building2 className="w-4 h-4" />
            {t.browseBusinesses}
          </Link>
        </div>
      </div>
    );
  }

  // ============================================
  // Helpers por serviço
  // ============================================
  const getServiceButtonLabel = (service) => {
    const ctx = getActionContext(
      service.category || business.category,
      language,
      t
    );
    return ctx.label;
  };

  const getServiceButtonIcon = (service) => {
    const ctx = getActionContext(
      service.category || business.category,
      language,
      t
    );
    return ACTION_ICONS[ctx.icon] || Calendar;
  };

  const selectedServiceCtx = selectedService
    ? getActionContext(
        selectedService.category || business.category,
        language,
        t
      )
    : businessActionCtx;

  const SelectedServiceIcon = ACTION_ICONS[selectedServiceCtx.icon] || Calendar;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* COVER */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r from-primary-500/30 to-primary-600/30">
        {business.cover_image ? (
          <img
            src={business.cover_image}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-24 h-24 text-primary-500/40" />
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {business.is_verified && (
            <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {t.verified}
            </span>
          )}
          <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white rounded-full text-sm font-bold flex items-center gap-1.5">
            <BusinessActionIcon className="w-3.5 h-3.5" />
            {businessActionCtx.label}
          </span>
        </div>

        {business.logo_url && (
          <div className="absolute -bottom-8 left-8 w-24 h-24 rounded-xl bg-white dark:bg-gray-800 shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden">
            <img
              src={business.logo_url}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* PERFIL */}
      <div className="mt-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {business.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {business.province && (
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {business.province}
                  {business.address && `, ${business.address}`}
                </p>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              {business.full_description || business.description}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowContactModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg"
            >
              <Phone className="w-4 h-4" />
              {t.contact}
            </button>

            {business.phone && (
              <button
                onClick={handleWhatsApp}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            )}

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success(t.copied);
              }}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              title={isEn ? 'Share' : 'Partilhar'}
            >
              <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* ✅ BOTO DE FAVORITO FUNCIONAL */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              aria-label={isFavorite ? t.removeFromFavorites : t.addToFavorites}
              title={isFavorite ? t.removeFromFavorites : t.addToFavorites}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                isFavorite
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-500'
              } ${favoriteLoading ? 'opacity-60 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
            >
              <Heart
                className={`w-5 h-5 transition-all ${isFavorite ? 'fill-current' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Contato rápido */}
        <div className="mt-6 flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition"
            >
              <Phone className="w-4 h-4" />
              {business.phone}
            </a>
          )}
          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition"
            >
              <Mail className="w-4 h-4" />
              {business.email}
            </a>
          )}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition"
            >
              <Globe className="w-4 h-4" />
              {business.website}
            </a>
          )}
          {(business.address || business.province) && (
            <button
              onClick={handleOpenMaps}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 transition"
            >
              <MapPin className="w-4 h-4" />
              {t.viewOnMap}
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-1">
          {['services', 'gallery', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'services'
                ? t.tabServices
                : tab === 'gallery'
                ? t.tabGallery
                : t.tabAbout}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {/* TAB: SERVIÇOS */}
        {activeTab === 'services' && (
          <>
            {services.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t.noServices}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {t.noServicesDesc}
                </p>
                {isOwner && (
                  <button
                    onClick={() => navigate('/empresa/servicos/novo')}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addService}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                  const ActionIcon = getServiceButtonIcon(service);
                  const buttonLabel = getServiceButtonLabel(service);

                  return (
                    <div
                      key={service.id}
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 group relative"
                    >
                      <div className="h-48 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        {service.logo_url ? (
                          <img
                            src={service.logo_url}
                            alt={service.name}
                            className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="p-6 bg-white dark:bg-gray-700 rounded-full shadow-lg">
                            <Package className="w-16 h-16 text-primary-500" />
                          </div>
                        )}

                        {service.featured && (
                          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {t.featured}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {service.price} Kz
                        </div>

                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditService(service);
                            }}
                            className="absolute bottom-3 right-3 p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title={t.editService}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                            {service.name}
                          </h3>
                          {isOwner && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                              <Lock className="w-3 h-3" />
                              {t.owner}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                          {service.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {service.duration} min
                            </span>
                          )}
                          {service.max_people && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {service.max_people}{' '}
                              {isEn ? 'people' : 'pessoas'}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleSelectService(service)}
                          className="mt-4 w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                        >
                          <ActionIcon className="w-4 h-4" />
                          {buttonLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB: GALERIA */}
        {activeTab === 'gallery' && (
          <>
            {gallery.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t.noPhotos}
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(image.image_url, '_blank')}
                  >
                    <img
                      src={image.image_url}
                      alt={image.title || 'Gallery'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB: SOBRE */}
        {activeTab === 'about' && (
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.about} {business.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {business.full_description ||
                business.description ||
                t.noDescription}
            </p>

            {business.address && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.location}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {business.address}
                  {business.province && `, ${business.province}`}
                </p>
              </div>
            )}

            {paymentMethods.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.paymentMethods}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {paymentMethods.map((method) => (
                    <span
                      key={method.id}
                      className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm"
                    >
                      {method.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CONTACTO */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {business.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.contactInfo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {business.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.phone}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {business.phone}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(business.phone, 'phone')}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`tel:${business.phone}`}
                      className="p-2 text-blue-500 hover:text-blue-600 rounded-lg transition"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {business.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.email}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {business.email}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(business.email, 'email')}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`mailto:${business.email}`}
                      className="p-2 text-purple-500 hover:text-purple-600 rounded-lg transition"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {business.phone && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                >
                  <div className="p-2.5 bg-green-500 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      {t.sendWhatsApp}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-green-500" />
                </button>
              )}

              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.website}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {business.website.replace(/^https?:\/\//, '')}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              )}

              {(business.address || business.province) && (
                <button
                  onClick={handleOpenMaps}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.location}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {business.address || business.province}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESERVA / COMPRA */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <SelectedServiceIcon className="w-5 h-5 text-primary-500" />
                {selectedServiceCtx.modalTitle}
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {selectedService.logo_url && (
                  <img
                    src={selectedService.logo_url}
                    alt={selectedService.name}
                    className="w-16 h-16 rounded-xl object-contain bg-gray-50 dark:bg-gray-800 p-1"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedService.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedService.description}
                  </p>
                  <p className="text-lg font-bold text-primary-500 mt-1">
                    {selectedService.price} Kz
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.quantity}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.date}
                </label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t.time}
                </label>
                <input
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.total}
                  </span>
                  <span className="text-2xl font-bold text-primary-500">
                    {selectedService.price * quantity} Kz
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreateReservation}
                  disabled={bookingLoading}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SelectedServiceIcon className="w-4 h-4" />
                  )}
                  {selectedServiceCtx.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}