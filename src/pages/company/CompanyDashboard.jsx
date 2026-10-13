// src/pages/company/CompanyDashboard.jsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Package,
  CalendarCheck,
  Star,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  Edit,
  Eye,
  Bell,
  Settings,
  Shield,
  Activity,
  Briefcase,
  Loader2,
  CreditCard,
  Image as ImageIcon,
  ExternalLink,
  Utensils,
  BarChart3,
  DollarSign,
  ArrowUp,
  ArrowDown,
  PieChart,
  TrendingDown,
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { hotelManagementService } from '../../services/hotelManagementService';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    restaurant: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ============================================
// COMPONENTE DE GRÁFICO/CARD
// ============================================
const StatCard = ({ title, value, icon: Icon, color, bg, subtitle, change, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className={`inline-flex rounded-xl p-3 ${bg}`}>
          <Icon size={22} className={color} />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {trend === 'up' ? <ArrowUp size={12} /> : trend === 'down' ? <ArrowDown size={12} /> : null}
            {change || '0%'}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function CompanyDashboard() {
  const { user } = useAuth();
  const { company, loading: companyLoading, initialized, refreshCompany } = useCompany();
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  
  // Estados locais
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingBookings: 0,
    activeServices: 0,
    totalReviews: 0,
    monthlyGrowth: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // ============================================
  // CARREGAR DADOS DA EMPRESA
  // ============================================
  const loadCompanyData = useCallback(async () => {
    if (!company?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Carregando dados da empresa:', company.id);

      const servicesResult = await hotelManagementService.getServicesByCompany(company.id);
      if (servicesResult.success) {
        setServices(servicesResult.data || []);
      }

      const galleryResult = await hotelManagementService.getGalleryByCompany(company.id);
      if (galleryResult.success) {
        setGallery(galleryResult.data || []);
      }

      const paymentResult = await hotelManagementService.getPaymentMethodsByCompany(company.id);
      if (paymentResult.success) {
        setPaymentMethods(paymentResult.data || []);
      }

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (!bookingsError) {
        setBookings(bookingsData || []);
        
        const total = bookingsData?.length || 0;
        const pending = bookingsData?.filter(b => b.status === 'pending').length || 0;
        const revenue = bookingsData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
        
        setStats(prev => ({
          ...prev,
          totalBookings: total,
          pendingBookings: pending,
          totalRevenue: revenue,
          activeServices: servicesResult.data?.filter(s => s.status === 'active' || s.status === 'approved').length || 0,
        }));
      }

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('company_id', company.id);

      if (!reviewsError) {
        setReviews(reviewsData || []);
        
        if (reviewsData && reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length;
          setStats(prev => ({
            ...prev,
            averageRating: avg,
            totalReviews: reviewsData.length,
          }));
        }
      }

      console.log('✅ Dados carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading data' : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [company?.id, isEn]);

  useEffect(() => {
    if (company?.id) {
      loadCompanyData();
    } else {
      setLoading(false);
    }
  }, [company?.id, loadCompanyData]);

  useEffect(() => {
    const activities = [];

    bookings.slice(0, 5).forEach(b => {
      const statusMap = {
        pending: isEn ? 'Pending' : 'Pendente',
        confirmed: isEn ? 'Confirmed' : 'Confirmada',
        completed: isEn ? 'Completed' : 'Concluída',
        cancelled: isEn ? 'Cancelled' : 'Cancelada',
      };
      activities.push({
        id: `act_book_${b.id}`,
        type: 'booking',
        message: `${isEn ? 'Booking' : 'Reserva'} #${b.id.slice(0, 8)}`,
        subtitle: `${b.total_price?.toLocaleString() || 0} Kz - ${statusMap[b.status] || b.status}`,
        date: b.created_at || new Date().toISOString(),
        status: b.status,
        link: '/empresa/reservas',
      });
    });

    reviews.slice(0, 3).forEach(r => {
      activities.push({
        id: `act_rev_${r.id}`,
        type: 'review',
        message: `${isEn ? 'New review' : 'Nova avaliação'}: ${r.rating} ⭐`,
        subtitle: r.comment?.slice(0, 80) + (r.comment?.length > 80 ? '...' : ''),
        date: r.created_at || new Date().toISOString(),
        status: r.reply ? 'replied' : 'pending',
        link: '/empresa/avaliacoes',
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    setRecentActivity(activities.slice(0, 8));
  }, [bookings, reviews, isEn]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(isEn ? 'en-US' : 'pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }, [isEn]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const isRestaurant = company?.category?.toLowerCase() === 'restaurant';

  if (companyLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Loading dashboard...' : 'Carregando dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <Building2 size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isEn ? 'You need to register a company' : 'Precisa registar uma empresa'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            {isEn 
              ? 'To access the dashboard and start receiving bookings, you need to register your company on RAVTUR.'
              : 'Para aceder ao dashboard e começar a receber reservas, precisa registar a sua empresa no RAVTUR.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/empresa/registar">
              <Button icon={PlusCircle} className="text-lg px-8 py-3">
                {isEn ? 'Register Company' : 'Registar Empresa'}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary">
                {isEn ? 'Go to User Dashboard' : 'Ir para Dashboard do Utilizador'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={32} className="text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </h1>
              <Badge variant="success">✓ {isEn ? 'Active' : 'Ativa'}</Badge>
              {isRestaurant && <Badge variant="restaurant">🍽️ {isEn ? 'Restaurant' : 'Restaurante'}</Badge>}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{company.category}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'} ({stats.totalReviews} {isEn ? 'reviews' : 'avaliações'})
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {stats.activeServices} {isEn ? 'active services' : 'serviços ativos'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarCheck size={14} />
                {stats.totalBookings} {isEn ? 'bookings' : 'reservas'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/empresa/${company.id}`} target="_blank">
            <Button variant="secondary" icon={Eye}>
              {isEn ? 'View Public' : 'Ver Página'}
            </Button>
          </Link>
          
          {/*  BOTO EDITAR PERFIL */}
          <Link to="/empresa/editar">
            <Button variant="outline" icon={Edit}>
              {isEn ? 'Edit Profile' : 'Editar Perfil'}
            </Button>
          </Link>
          
          <Link to="/empresa/perfil">
            <Button variant="primary" icon={Edit}>
              {isEn ? 'Edit' : 'Editar'}
            </Button>
          </Link>
          <Link to="/empresa/servicos/novo">
            <Button variant="success" icon={PlusCircle}>
              {isEn ? 'New Service' : 'Novo Serviço'}
            </Button>
          </Link>
        </div>
      </div>

      {/*  GRÁFICOS / ESTATÍSTICAS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title={isEn ? 'Total Bookings' : 'Total de Reservas'}
          value={stats.totalBookings}
          icon={CalendarCheck}
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-900/20"
          trend={stats.totalBookings > 0 ? 'up' : 'down'}
          change={stats.totalBookings > 0 ? '+12%' : '0%'}
        />
        <StatCard
          title={isEn ? 'Revenue' : 'Receita Total'}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="text-green-500"
          bg="bg-green-50 dark:bg-green-900/20"
          trend={stats.totalRevenue > 0 ? 'up' : 'down'}
          change={stats.totalRevenue > 0 ? '+8%' : '0%'}
        />
        <StatCard
          title={isEn ? 'Average Rating' : 'Avaliação Média'}
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
          icon={Star}
          color="text-yellow-500"
          bg="bg-yellow-50 dark:bg-yellow-900/20"
          subtitle={`${stats.totalReviews} ${isEn ? 'reviews' : 'avaliações'}`}
        />
        <StatCard
          title={isEn ? 'Pending Bookings' : 'Reservas Pendentes'}
          value={stats.pendingBookings}
          icon={Clock}
          color="text-orange-500"
          bg="bg-orange-50 dark:bg-orange-900/20"
          trend={stats.pendingBookings > 0 ? 'up' : 'down'}
          change={stats.pendingBookings > 0 ? `${stats.pendingBookings} ${isEn ? 'pending' : 'pendentes'}` : '0'}
        />
      </div>

      {/* GRÁFICO DE ATIVIDADES E LINKS RÁPIDOS */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Atividades Recentes */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-gray-400" />
              {isEn ? 'Recent Activity' : 'Atividades Recentes'}
            </h3>
            <Link to="/empresa/reservas" className="text-sm text-blue-500 hover:text-blue-600">
              {isEn ? 'View all' : 'Ver todas'}
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">{isEn ? 'No recent activity' : 'Nenhuma atividade recente'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <Link 
                  key={activity.id} 
                  to={activity.link || '#'}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group"
                >
                  <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                    activity.type === 'review' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                    activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                    activity.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30' : 
                    'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    {activity.type === 'review' ? (
                      <Star size={14} className="text-yellow-500" />
                    ) : activity.type === 'booking' ? (
                      <CalendarCheck size={14} className={activity.status === 'pending' ? 'text-yellow-500' : 'text-green-500'} />
                    ) : (
                      <Package size={14} className={activity.status === 'pending' ? 'text-yellow-500' : 'text-green-500'} />
                    
                    )}

                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 break-words">
                      {activity.message}
                    </p>
                    {activity.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {activity.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Links Rápidos */}

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4">
              {isEn ? 'Quick Links' : 'Links Rápidos'}
            </h3>
            <div className="space-y-1">

              {/* EDITAR PERFIL - DESTAQUE */}

              <Link to="/empresa/editar" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition group">
                <Edit size={18} className="text-blue-600 group-hover:text-blue-700" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {isEn ? 'Edit Profile' : 'Editar Perfil'}
                </span>
                <Badge variant="primary" className="ml-auto">✨ {isEn ? 'Update' : 'Atualizar'}</Badge>
              </Link>
              
              <Link to="/empresa/servicos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <Package size={18} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Manage Services' : 'Gerir Serviços'}
                </span>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{services.length}</span>
              </Link>
              
              <Link to="/empresa/reservas" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <CalendarCheck size={18} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Bookings' : 'Reservas'}
                </span>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalBookings}</span>
                {stats.pendingBookings > 0 && (
                  <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded-full">{stats.pendingBookings}</span>
                )}
              </Link>
              
              <Link to="/empresa/avaliacoes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <Star size={18} className="text-gray-400 group-hover:text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Reviews' : 'Avaliações'}
                </span>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalReviews}</span>
              </Link>
              
              <Link to="/empresa/pagamentos/metodos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <CreditCard size={18} className="text-gray-400 group-hover:text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Payment Methods' : 'Métodos de Pagamento'}
                </span>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{paymentMethods.length}</span>
              </Link>
              
              {isRestaurant && (
                <Link to="/empresa/menu" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                  <Utensils size={18} className="text-gray-400 group-hover:text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isEn ? 'Manage Menu' : 'Gerir Menu'}
                  </span>
                  <Badge variant="restaurant" className="ml-auto">
                    {isEn ? 'Restaurant' : 'Restaurante'}
                  </Badge>
                </Link>
              )}
              
              <Link to="/empresa/perfil" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <Building2 size={18} className="text-gray-400 group-hover:text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Company Profile' : 'Perfil da Empresa'}
                </span>
              </Link>
              
              <Link to="/empresa/configuracoes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                <Settings size={18} className="text-gray-400 group-hover:text-gray-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEn ? 'Settings' : 'Configurações'}
                </span>
              </Link>
            </div>
          </div>

          {/* Dica de Analytics */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                <PieChart size={18} className="text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  {isEn ? 'Analytics' : 'Análises'}
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {isEn 
                    ? 'Track your performance and grow your business!'
                    : 'Acompanhe o desempenho e faça crescer o seu negócio!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}