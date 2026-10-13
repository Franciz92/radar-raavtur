// src/pages/user/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserBookings } from '../../services/bookingService';
import { getUserExperiences } from '../../services/experienceService';
import CreateBusinessModal from '../../components/business/CreateBusinessModal';
import {
  Calendar,
  Clock,
  Users,
  Building2,
  ChevronRight,
  Loader2,
  Eye,
  Package,
  CreditCard,
  MapPin,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  BookOpen,
  PlusCircle,
  Heart,
  MessageCircle,
  Compass,
  User,
  Award,
  TrendingUp,
  Briefcase,
  Star,
  Sparkles,
  ArrowRight,
  Home,
  ShoppingBag,
  Settings,
  Bell,
  Gift,
  Wallet,
  BarChart3,
  Shield,
  Globe,
  Phone,
  Mail,
  Share2,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  MoreHorizontal,
  Image,
  Package as PackageIcon,
  CreditCard as CreditCardIcon,
  Hotel,
  Utensils,
  Plane,
  Car,
  Compass as CompassIcon,
  Bus,
  Mountain,
  Calendar as CalendarIcon,
  MoreHorizontal as MoreIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE STATUS
// ============================================
const StatusBadge = ({ status, isEn }) => {
  const statusMap = {
    pending: {
      label: isEn ? 'Pending' : 'Pendente',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: ClockIcon,
    },
    confirmed: {
      label: isEn ? 'Confirmed' : 'Confirmada',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
    },
    completed: {
      label: isEn ? 'Completed' : 'Concluída',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: CheckCircle,
    },
    cancelled: {
      label: isEn ? 'Cancelled' : 'Cancelada',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: XCircle,
    },
  };

  const statusInfo = statusMap[status] || statusMap.pending;
  const Icon = statusInfo.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
      <Icon className="w-3 h-3" />
      {statusInfo.label}
    </span>
  );
};

// ============================================
// COMPONENTE DE STAT CARD
// ============================================
const StatCard = ({ icon: Icon, title, value, subtitle, color, onClick }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-lg transition-all hover:scale-105' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
          {subtitle && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE CARD DE EMPRESA
// ============================================
const BusinessCard = ({ business, isEn, onManage, onView }) => {
  const statusConfig = {
    draft: {
      label: isEn ? 'Draft' : 'Rascunho',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      icon: Edit,
    },
    pending: {
      label: isEn ? 'In Analysis' : 'Em Análise',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: ClockIcon,
    },
    approved: {
      label: isEn ? 'Approved' : 'Aprovado',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
    },
    published: {
      label: isEn ? 'Published' : 'Publicado',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      icon: CheckCircle,
    },
    rejected: {
      label: isEn ? 'Rejected' : 'Rejeitado',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: AlertCircle,
    },
  };

  const status = statusConfig[business.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  // ✅ Mapeamento de categorias para ícones do Lucide
  const categoryIcons = {
    hotel: Hotel,
    restaurant: Utensils,
    agency: Plane,
    rent_a_car: Car,
    guide: CompassIcon,
    transport: Bus,
    tour: Mountain,
    event: CalendarIcon,
    other: Briefcase
  };

  const IconComponent = categoryIcons[business.category] || Building2;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="relative h-32 bg-gradient-to-r from-primary-500/20 to-primary-600/20">
        {business.cover_image ? (
          <img src={business.cover_image} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconComponent className="w-12 h-12 text-primary-500/40" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <IconComponent className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{business.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {business.category || (isEn ? 'Uncategorized' : 'Sem categoria')}
            </p>
            {business.province && (
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {business.province}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {business.description || (isEn ? 'No description' : 'Sem descrição')}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onManage?.(business.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition"
          >
            <Edit className="w-4 h-4" />
            {isEn ? 'Manage' : 'Gerenciar'}
          </button>
          <button
            onClick={() => onView?.(business.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition"
          >
            <Eye className="w-4 h-4" />
            {isEn ? 'View' : 'Ver'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE CARD DE RESERVA
// ============================================
const BookingCard = ({ booking, isEn }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return `${Number(price).toLocaleString()} Kz`;
  };

  const serviceName = booking.item_name || 
                      booking.service_name || 
                      booking.service?.name || 
                      'Serviço';

  const companyName = booking.company_name || 
                      booking.company?.name || 
                      'Empresa';

  const serviceImage = booking.service?.images?.[0] || 
                       booking.item_image || 
                       null;

  const handleViewDetails = () => {
    if (booking.id) {
      navigate(`/minha-reserva/${booking.id}`);
    } else {
      toast.error(isEn ? 'Booking ID not found' : 'ID da reserva não encontrado');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {serviceImage ? (
            <img
              src={serviceImage}
              alt={serviceName}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {serviceName}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {companyName}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(booking.date)}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {booking.time || '10:00'}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {booking.guests || 1}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(booking.total_price)}
            </p>
            <StatusBadge status={booking.status} isEn={isEn} />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={handleViewDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
            {isEn ? 'View Details' : 'Ver Detalhes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE CARD DE EXPERIÊNCIA
// ============================================
const ExperienceCard = ({ experience, isEn, onNavigate }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isEn ? 'Just now' : 'Agora mesmo';
    if (minutes < 60) return `${minutes}m ${isEn ? 'ago' : 'atrás'}`;
    if (hours < 24) return `${hours}h ${isEn ? 'ago' : 'atrás'}`;
    if (days < 7) return `${days}d ${isEn ? 'ago' : 'atrás'}`;
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div 
      onClick={() => onNavigate(experience.id)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.01] group"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {experience.image_url ? (
            <img
              src={experience.image_url}
              alt={experience.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition truncate">
              {experience.title}
            </h4>
            {experience.location && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {experience.location}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {experience.content}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                {experience.likes_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-blue-400" />
                {experience.comments_count || 0}
              </span>
              <span className="text-gray-400">{formatDate(experience.created_at)}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { businesses, loading: businessLoading, loadBusinesses, deleteBusiness, submitForApproval } = useBusiness();
  const { isEn } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalExperiences: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  // Estatísticas das empresas
  const businessStats = {
    total: businesses.length,
    draft: businesses.filter(b => b.status === 'draft').length,
    pending: businesses.filter(b => b.status === 'pending').length,
    published: businesses.filter(b => b.status === 'approved' || b.status === 'published').length,
  };

  const hasBusiness = businesses.length > 0;

  // Função para navegar para o gerenciamento da empresa
  const handleManageBusiness = (businessId) => {
    navigate(`/proprietario/dashboard?business=${businessId}`);
  };

  // Função para ver a página pública da empresa
  const handleViewBusiness = (businessId) => {
    navigate(`/negocio/${businessId}`);
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadBusinesses();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🔄 Carregando dados do dashboard...');

      // Carregar reservas
      const bookingsResult = await getUserBookings(user.id);
      if (bookingsResult.success) {
        const data = bookingsResult.data || [];
        setBookings(data.slice(0, 3));

        const statsData = {
          totalBookings: data.length,
          pendingBookings: data.filter(b => b.status === 'pending').length,
          totalExperiences: 0,
          totalLikes: 0,
          totalComments: 0,
        };
        setStats(prev => ({ ...prev, ...statsData }));
      }

      // Carregar experiências do usuário
      const experiencesResult = await getUserExperiences(user.id);
      if (experiencesResult.success) {
        const data = experiencesResult.data || [];
        setExperiences(data.slice(0, 3));
        const totalLikes = data.reduce((acc, exp) => acc + (exp.likes_count || 0), 0);
        const totalComments = data.reduce((acc, exp) => acc + (exp.comments_count || 0), 0);
        setStats(prev => ({ 
          ...prev, 
          totalExperiences: data.length,
          totalLikes,
          totalComments,
        }));
      }

      console.log('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading data' : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToExperience = (id) => {
    navigate(`/experiencia/${id}`);
  };

  const handleDeleteBusiness = async (id, name) => {
    if (window.confirm(
      isEn 
        ? `Are you sure you want to delete "${name}"?`
        : `Tem certeza que deseja excluir "${name}"?`
    )) {
      await deleteBusiness(id);
    }
  };

  const handleSubmitBusiness = async (id) => {
    await submitForApproval(id);
  };

  const handleEditBusiness = (id) => {
    navigate(`/empresa/editar/${id}`);
  };

  const handleBusinessCreated = (business) => {
    toast.success(
      isEn 
        ? `"${business.name}" created successfully!`
        : `"${business.name}" criada com sucesso!`
    );
    loadBusinesses();
  };

  if (loading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ===== Cabeçalho ===== */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {isEn ? `Welcome back, ${profile?.name || user?.name || 'User'}!` : `Bem-vindo de volta, ${profile?.name || user?.name || 'Utilizador'}!`}
              </h1>
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {isEn ? 'Verified' : 'Verificado'}
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {isEn 
                ? `You have ${stats.totalBookings} booking(s), ${stats.totalExperiences} experience(s) and ${businessStats.total} business(es)`
                : `Você tem ${stats.totalBookings} reserva(s), ${stats.totalExperiences} experiência(s) e ${businessStats.total} empresa(s)`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="w-4 h-4" />
              {isEn ? 'New Business' : 'Nova Empresa'}
            </button>
            <Link
              to="/perfil"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <User className="w-4 h-4" />
              {isEn ? 'Profile' : 'Perfil'}
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Estatísticas ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard 
          icon={Calendar} 
          title={isEn ? 'Bookings' : 'Reservas'} 
          value={stats.totalBookings} 
          color="blue"
          onClick={() => navigate('/minhas-reservas')}
        />
        <StatCard 
          icon={ClockIcon} 
          title={isEn ? 'Pending' : 'Pendentes'} 
          value={stats.pendingBookings} 
          color="amber"
          onClick={() => navigate('/minhas-reservas')}
        />
        <StatCard 
          icon={BookOpen} 
          title={isEn ? 'Experiences' : 'Experiências'} 
          value={stats.totalExperiences} 
          color="purple"
          onClick={() => navigate('/minhas-experiencias')}
        />
        <StatCard 
          icon={Building2} 
          title={isEn ? 'Businesses' : 'Empresas'} 
          value={businessStats.total} 
          color="indigo"
          onClick={() => navigate('/meu-negocio')}
        />
        <StatCard 
          icon={Heart} 
          title={isEn ? 'Likes' : 'Curtidas'} 
          value={stats.totalLikes} 
          color="red"
        />
      </div>

      {/* ===== Seção de Empresas ===== */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            {isEn ? 'My Businesses' : 'Minhas Empresas'}
            {businessStats.total > 0 && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({businessStats.total})
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            {isEn ? 'New Business' : 'Nova Empresa'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEn ? 'No businesses yet' : 'Nenhuma empresa ainda'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              {isEn 
                ? 'Register your business on Radar RAVTUR and start receiving customers!' 
                : 'Registe sua empresa no Radar RAVTUR e comece a receber clientes!'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isEn ? 'Create Your Business' : 'Criar sua Empresa'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                isEn={isEn}
                onManage={handleManageBusiness}
                onView={handleViewBusiness}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== Ações Rápidas ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => navigate('/minhas-experiencias')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold">{isEn ? 'Share Experience' : 'Partilhar Experiência'}</p>
              <p className="text-sm text-white/70">
                {isEn ? 'Tell your travel story' : 'Conte a sua história'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Compass className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold">{isEn ? 'Explore More' : 'Explorar Mais'}</p>
              <p className="text-sm text-white/70">
                {isEn ? 'Discover new places' : 'Descubra novos lugares'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </button>

        <button
          onClick={() => navigate('/minhas-reservas')}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold">{isEn ? 'My Bookings' : 'Minhas Reservas'}</p>
              <p className="text-sm text-white/70">
                {isEn ? 'View all your bookings' : 'Veja todas as suas reservas'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* ===== Últimas Experiências ===== */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            {isEn ? 'My Recent Experiences' : 'Minhas Experiências Recentes'}
          </h2>
          <button
            onClick={() => navigate('/minhas-experiencias')}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
          >
            {isEn ? 'View all' : 'Ver todas'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEn ? 'No experiences yet' : 'Nenhuma experiência ainda'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              {isEn 
                ? 'Share your travel stories with the community and inspire others!' 
                : 'Partilhe as suas histórias de viagem com a comunidade e inspire outros!'}
            </p>
            <button
              onClick={() => navigate('/minhas-experiencias')}
              className="mt-4 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {isEn ? 'Share Your Experience' : 'Partilhe sua Experiência'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                isEn={isEn}
                onNavigate={handleNavigateToExperience}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== Últimas Reservas ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {isEn ? 'Recent Bookings' : 'Reservas Recentes'}
          </h2>
          <button
            onClick={() => navigate('/minhas-reservas')}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            {isEn ? 'View all' : 'Ver todas'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEn ? 'No bookings yet' : 'Nenhuma reserva ainda'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              {isEn 
                ? 'Start exploring and make your first booking!' 
                : 'Comece a explorar e faça sua primeira reserva!'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              {isEn ? 'Explore Services' : 'Explorar Serviços'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isEn={isEn} />
            ))}
          </div>
        )}
      </div>

      {/* ===== Modal de Criação de Empresa ===== */}
      <CreateBusinessModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleBusinessCreated}
      />
    </div>
  );
}