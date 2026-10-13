// src/pages/owner/OwnerDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import businessService from '../../services/businessService';
import {
  Building2, Plus, Edit, Trash2, Image, Package,
  CreditCard, Calendar, Users, Star, Settings,
  Loader2, CheckCircle, XCircle, Clock,
  Upload, MapPin, Phone, Mail, Globe,
  ChevronRight, AlertCircle, Eye, Copy, X,
  ImagePlus, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { businesses, loading, loadUserBusinesses } = useBusiness();
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessIdFromUrl = searchParams.get('business');

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Selecionar empresa da URL ou a primeira
  useEffect(() => {
    if (businesses.length > 0) {
      if (businessIdFromUrl) {
        const biz = businesses.find(b => b.id === businessIdFromUrl);
        if (biz) {
          setSelectedBusiness(biz);
          return;
        }
      }
      if (!selectedBusiness) {
        setSelectedBusiness(businesses[0]);
      }
    }
  }, [businesses, businessIdFromUrl]);

  // Carregar dados da empresa selecionada
  useEffect(() => {
    if (selectedBusiness) {
      loadBusinessData(selectedBusiness.id);
    }
  }, [selectedBusiness]);

  const loadBusinessData = async (businessId) => {
    setLoadingData(true);
    try {
      const [servicesData, galleryData, paymentData, reservationsData] = await Promise.all([
        businessService.getBusinessServices(businessId),
        businessService.getBusinessGallery(businessId),
        businessService.getBusinessPaymentMethods(businessId),
        businessService.getBusinessReservations(businessId)
      ]);
      setServices(servicesData);
      setGallery(galleryData);
      setPaymentMethods(paymentData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading data' : 'Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  // Se não tiver empresas, mostrar página para criar
  if (!loading && businesses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <div className="inline-flex p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
          <Building2 className="w-16 h-16 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? "You don't have any business yet" : 'Você ainda não tem nenhuma empresa'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isEn 
            ? 'Register your business and start receiving customers on Radar RAVTUR'
            : 'Registre sua empresa e comece a receber clientes no Radar RAVTUR'}
        </p>
        <Link
          to="/cadastrar-empresa"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition"
        >
          <Plus className="w-5 h-5" />
          {isEn ? 'Register Business' : 'Registrar Empresa'}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-500" />
            {isEn ? 'My Business Dashboard' : 'Painel da Minha Empresa'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEn 
              ? `Manage your business: ${selectedBusiness?.name || 'Select a business'}`
              : `Gerencie sua empresa: ${selectedBusiness?.name || 'Selecione uma empresa'}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {businesses.length > 1 && (
            <select
              value={selectedBusiness?.id || ''}
              onChange={(e) => {
                const biz = businesses.find(b => b.id === e.target.value);
                setSelectedBusiness(biz);
              }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <Link
            to={`/negocio/${selectedBusiness?.id}`}
            target="_blank"
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isEn ? 'View Public Page' : 'Ver Página Pública'}
          </Link>
        </div>
      </div>

      {selectedBusiness ? (
        <>
          {/* Status da Empresa */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {selectedBusiness.logo_url ? (
                <img src={selectedBusiness.logo_url} alt={selectedBusiness.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{selectedBusiness.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBusiness.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                selectedBusiness.is_verified 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {selectedBusiness.is_verified ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                {selectedBusiness.is_verified 
                  ? (isEn ? 'Verified' : 'Verificado')
                  : (isEn ? 'Pending Approval' : 'Aguardando Aprovação')}
              </span>
              <Link
                to={`/empresa/configuracoes`}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition flex items-center gap-2 text-sm"
              >
                <Settings className="w-4 h-4" />
                {isEn ? 'Edit Profile' : 'Editar Perfil'}
              </Link>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-wrap gap-1">
              {['overview', 'services', 'gallery', 'payments', 'reservations'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {isEn 
                    ? tab === 'overview' ? 'Overview' 
                      : tab === 'services' ? 'Services' 
                      : tab === 'gallery' ? 'Gallery' 
                      : tab === 'payments' ? 'Payments' 
                      : 'Reservations'
                    : tab === 'overview' ? 'Visão Geral' 
                      : tab === 'services' ? 'Serviços' 
                      : tab === 'gallery' ? 'Galeria' 
                      : tab === 'payments' ? 'Pagamentos' 
                      : 'Reservas'}
                </button>
              ))}
            </div>
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* TAB: VISO GERAL */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{services.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Services' : 'Serviços'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{gallery.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Photos' : 'Fotos'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{reservations.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Reservations' : 'Reservas'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{paymentMethods.length}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Payment Methods' : 'Métodos de Pagamento'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('services')}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition flex items-center gap-4"
                    >
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Package className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{isEn ? 'Add Service' : 'Adicionar Serviço'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Create new service' : 'Criar novo serviço'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </button>

                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition flex items-center gap-4"
                    >
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <Image className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{isEn ? 'Add Photos' : 'Adicionar Fotos'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Upload gallery images' : 'Enviar imagens para galeria'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </button>

                    <button
                      onClick={() => setActiveTab('payments')}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition flex items-center gap-4"
                    >
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <CreditCard className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-white">{isEn ? 'Payment Methods' : 'Métodos de Pagamento'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Configure payment options' : 'Configurar opções de pagamento'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: SERVIÇOS */}
              {activeTab === 'services' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isEn ? 'Services' : 'Serviços'} ({services.length})
                    </h3>
                    <button
                      onClick={() => {
                        setEditingService(null);
                        setShowServiceModal(true);
                      }}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {isEn ? 'Add Service' : 'Adicionar Serviço'}
                    </button>
                  </div>

                  {services.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEn ? 'No services yet' : 'Nenhum serviço ainda'}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {isEn 
                          ? 'Add your first service to attract customers'
                          : 'Adicione seu primeiro serviço para atrair clientes'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingService(null);
                          setShowServiceModal(true);
                        }}
                        className="mt-4 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {isEn ? 'Add Service' : 'Adicionar Serviço'}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
                        >
                          {/* Imagem do serviço */}
                          <div className="h-40 relative overflow-hidden bg-gray-200 dark:bg-gray-700">
                            {service.gallery && service.gallery.length > 0 ? (
                              <img
                                src={service.gallery[0].image_url}
                                alt={service.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                                <Package className="w-16 h-16 text-primary-500/40" />
                              </div>
                            )}
                            {service.featured && (
                              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                                {isEn ? 'Featured' : 'Destaque'}
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              {service.price} Kz
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{service.description}</p>
                            
                            {service.category && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                {service.category}
                              </span>
                            )}
                            
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setEditingService(service);
                                  setShowServiceModal(true);
                                }}
                                className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm transition flex items-center justify-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                {isEn ? 'Edit' : 'Editar'}
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(isEn ? 'Delete this service?' : 'Deletar este serviço?')) {
                                    await businessService.deleteService(service.id);
                                    loadBusinessData(selectedBusiness.id);
                                    toast.success(isEn ? 'Service deleted' : 'Serviço deletado');
                                  }
                                }}
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm text-red-500 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GALERIA */}
              {activeTab === 'gallery' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isEn ? 'Gallery' : 'Galeria'} ({gallery.length})
                    </h3>
                    <button
                      onClick={() => setShowGalleryModal(true)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition flex items-center gap-2 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {isEn ? 'Add Photos' : 'Adicionar Fotos'}
                    </button>
                  </div>

                  {gallery.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEn ? 'No photos yet' : 'Nenhuma foto ainda'}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {isEn 
                          ? 'Upload photos to showcase your business'
                          : 'Envie fotos para mostrar sua empresa'}
                      </p>
                      <button
                        onClick={() => setShowGalleryModal(true)}
                        className="mt-4 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition inline-flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isEn ? 'Upload Photos' : 'Enviar Fotos'}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {gallery.map((image) => (
                        <div
                          key={image.id}
                          className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 group"
                        >
                          <img
                            src={image.image_url}
                            alt={image.title || 'Gallery'}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={async () => {
                              if (window.confirm(isEn ? 'Delete this photo?' : 'Deletar esta foto?')) {
                                await businessService.removeBusinessImage(image.id);
                                setGallery(prev => prev.filter(g => g.id !== image.id));
                                toast.success(isEn ? 'Photo deleted' : 'Foto deletada');
                              }
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: MÉTODOS DE PAGAMENTO */}
              {activeTab === 'payments' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isEn ? 'Payment Methods' : 'Métodos de Pagamento'}
                    </h3>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {isEn ? 'Add Method' : 'Adicionar Método'}
                    </button>
                  </div>

                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <CreditCard className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEn ? 'No payment methods' : 'Nenhum método de pagamento'}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {isEn 
                          ? 'Add payment methods to receive payments'
                          : 'Adicione métodos de pagamento para receber pagamentos'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{method.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{method.method_type}</p>
                          </div>
                          <button
                            onClick={async () => {
                              if (window.confirm(isEn ? 'Remove this payment method?' : 'Remover este método de pagamento?')) {
                                await businessService.removePaymentMethod(method.id);
                                loadBusinessData(selectedBusiness.id);
                                toast.success(isEn ? 'Payment method removed' : 'Método de pagamento removido');
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: RESERVAS */}
              {activeTab === 'reservations' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {isEn ? 'Reservations' : 'Reservas'}
                  </h3>
                  {reservations.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isEn ? 'No reservations yet' : 'Nenhuma reserva ainda'}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {isEn 
                          ? 'When customers book your services, they will appear here'
                          : 'Quando clientes reservarem seus serviços, aparecerão aqui'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {reservation.user?.name || 'Cliente'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {reservation.service?.name} • {reservation.quantity}x
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(reservation.reservation_date).toLocaleDateString()}
                              {reservation.reservation_time && ` às ${reservation.reservation_time}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-500">{reservation.total_amount} Kz</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              reservation.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              reservation.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {reservation.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Select a business to manage' : 'Selecione uma empresa para gerenciar'}
          </p>
        </div>
      )}

      {/* MODAL DE SERVIÇO */}
      {showServiceModal && (
        <ServiceModal
          businessId={selectedBusiness?.id}
          service={editingService}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
          onSave={() => {
            loadBusinessData(selectedBusiness.id);
            setShowServiceModal(false);
            setEditingService(null);
          }}
          isEn={isEn}
        />
      )}

      {/* MODAL DE PAGAMENTO */}
      {showPaymentModal && (
        <PaymentModal
          businessId={selectedBusiness?.id}
          onClose={() => setShowPaymentModal(false)}
          onSave={() => {
            loadBusinessData(selectedBusiness.id);
            setShowPaymentModal(false);
          }}
          isEn={isEn}
        />
      )}

      {/* MODAL DE GALERIA */}
      {showGalleryModal && (
        <GalleryUploadModal
          businessId={selectedBusiness?.id}
          onClose={() => setShowGalleryModal(false)}
          onUpload={(newImages) => {
            setGallery(prev => [...prev, ...newImages]);
          }}
          isEn={isEn}
        />
      )}
    </div>
  );
}

// ============================================
// MODAL DE SERVIÇO - COM UPLOAD DE IMAGEM
// ============================================
function ServiceModal({ businessId, service, onClose, onSave, isEn }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState(service?.gallery?.[0]?.image_url || null);
  const [coverFile, setCoverFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    duration: service?.duration || '',
    max_people: service?.max_people || '',
    category: service?.category || '',
    is_active: service?.is_active !== undefined ? service.is_active : true,
    featured: service?.featured || false
  });

  // Upload da imagem de capa
  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error(isEn 
        ? 'Only JPG, PNG, WEBP and GIF images are allowed' 
        : 'Apenas imagens JPG, PNG, WEBP e GIF são permitidas');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isEn 
        ? 'Image must be less than 5MB' 
        : 'Imagem deve ter menos de 5MB');
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImage(e.target.result);
    };
    reader.readAsDataURL(file);
    
    setCoverFile(file);
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(isEn ? 'Service name is required' : 'Nome do serviço é obrigatório');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error(isEn ? 'Price must be greater than 0' : 'Preço deve ser maior que 0');
      return;
    }

    setLoading(true);
    try {
      let savedService = service;

      const data = {
        business_id: businessId,
        name: formData.name.trim(),
        description: formData.description || '',
        price: parseFloat(formData.price),
        category: formData.category || null,
        is_active: formData.is_active,
        featured: formData.featured
      };

      if (formData.duration && parseInt(formData.duration) > 0) {
        data.duration = parseInt(formData.duration);
      }
      if (formData.max_people && parseInt(formData.max_people) > 0) {
        data.max_people = parseInt(formData.max_people);
      }

      // 1. Criar ou atualizar o serviço
      if (service) {
        savedService = await businessService.updateService(service.id, data);
        toast.success(isEn ? 'Service updated!' : 'Serviço atualizado!');
      } else {
        savedService = await businessService.createService(data);
        toast.success(isEn ? 'Service created!' : 'Serviço criado!');
      }

      // 2. Fazer upload da imagem de capa (se selecionada)
      if (coverFile && savedService) {
        setUploading(true);
        try {
          const folder = `services/${savedService.id}/gallery`;
          const imageUrl = await businessService.uploadImage(coverFile, folder);
          
          // Remover imagens antigas do serviço (se estiver editando)
          if (service?.gallery && service.gallery.length > 0) {
            for (const oldImage of service.gallery) {
              try {
                await businessService.removeServiceImage(oldImage.id);
              } catch (err) {
                console.warn('Erro ao remover imagem antiga:', err);
              }
            }
          }
          
          // Adicionar nova imagem
          await businessService.addServiceImage(
            savedService.id,
            imageUrl,
            formData.name
          );
          
          toast.success(isEn ? 'Image uploaded!' : 'Imagem enviada!');
        } catch (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          toast.error(isEn 
            ? 'Service saved but image upload failed' 
            : 'Serviço salvo mas a imagem falhou');
        } finally {
          setUploading(false);
        }
      }

      onSave();
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.message || (isEn ? 'Error saving service' : 'Erro ao salvar serviço'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {service ? (isEn ? 'Edit Service' : 'Editar Serviço') : (isEn ? 'New Service' : 'Novo Serviço')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IMAGEM DE CAPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isEn ? 'Cover Image' : 'Imagem de Capa'}
            </label>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleCoverSelect}
              className="hidden"
              disabled={loading || uploading}
            />

            {coverImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 group">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/90 hover:bg-white rounded-full text-gray-900 transition"
                    title={isEn ? 'Change image' : 'Trocar imagem'}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="p-3 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
                    title={isEn ? 'Remove image' : 'Remover imagem'}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !loading && !uploading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition"
              >
                <div className="inline-flex p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-3">
                  <ImagePlus className="w-8 h-8 text-primary-500" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {isEn ? 'Click to add cover image' : 'Clique para adicionar imagem de capa'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isEn 
                    ? 'JPG, PNG, WEBP, GIF • Max 5MB'
                    : 'JPG, PNG, WEBP, GIF • Máx 5MB'}
                </p>
              </div>
            )}
          </div>

          {/* NOME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Service Name *' : 'Nome do Serviço *'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder={isEn ? 'e.g. Grilled Chicken' : 'ex: Frango Grelhado'}
              required
            />
          </div>

          {/* DESCRIÇO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Description' : 'Descrição'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder={isEn ? 'Describe this service...' : 'Descreva este serviço...'}
            />
          </div>

          {/* PREÇO E DURAÇO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Price (Kz) *' : 'Preço (Kz) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Duration (min)' : 'Duração (min)'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={isEn ? 'Optional' : 'Opcional'}
              />
            </div>
          </div>

          {/* MAX PESSOAS E CATEGORIA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Max People' : 'Máx. Pessoas'}
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_people}
                onChange={(e) => setFormData({ ...formData, max_people: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={isEn ? 'Optional' : 'Opcional'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Category' : 'Categoria'}
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={isEn ? 'e.g. Main Course' : 'ex: Prato Principal'}
              />
            </div>
          </div>

          {/* CHECKBOXES */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              {isEn ? 'Active' : 'Ativo'}
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              {isEn ? 'Featured' : 'Destaque'}
            </label>
          </div>

          {/* BOTÕES */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="flex-1 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium disabled:opacity-50"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploading ? (isEn ? 'Uploading...' : 'Enviando...') : (isEn ? 'Saving...' : 'Salvando...')}
                </>
              ) : (
                isEn ? 'Save' : 'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MODAL DE UPLOAD DE GALERIA
// ============================================
function GalleryUploadModal({ businessId, onClose, onUpload, isEn }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error(isEn ? 'Select at least one image' : 'Selecione pelo menos uma imagem');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadedImages = [];
      const folder = `businesses/${businessId}/gallery`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await businessService.uploadImage(file, folder);
        const result = await businessService.addBusinessImage(
          businessId,
          imageUrl,
          file.name.replace(/\.[^/.]+$/, '')
        );
        uploadedImages.push(result);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      toast.success(isEn 
        ? `${uploadedImages.length} image(s) uploaded!` 
        : `${uploadedImages.length} imagem(ns) enviada(s)!`);

      onUpload(uploadedImages);
      onClose();
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.message || (isEn ? 'Error uploading' : 'Erro ao enviar'));
    } finally {
      setUploading(false);
      setProgress(0);
      setFiles([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Upload Photos' : 'Enviar Fotos'}
          </h2>
          <button onClick={onClose} disabled={uploading} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition disabled:opacity-50">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition mb-4"
        >
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="w-12 h-12 mx-auto text-primary-500 animate-spin" />
              <p className="text-sm font-medium">{progress}%</p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                <ImagePlus className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {isEn ? 'Click to select images' : 'Clique para selecionar imagens'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEn ? 'JPG, PNG, WEBP, GIF • Max 5MB each' : 'JPG, PNG, WEBP, GIF • Máx 5MB cada'}
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && !uploading && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">{files.length} {isEn ? 'files selected' : 'arquivos selecionados'}</p>
            <div className="grid grid-cols-4 gap-2">
              {files.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium disabled:opacity-50"
          >
            {isEn ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="flex-1 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Upload className="w-5 h-5" />
                {isEn ? `Upload (${files.length})` : `Enviar (${files.length})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MODAL DE PAGAMENTO
// ============================================
function PaymentModal({ businessId, onClose, onSave, isEn }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    method_type: 'cash',
    name: '',
    description: '',
    details: {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(isEn ? 'Payment method name is required' : 'Nome do método de pagamento é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await businessService.addPaymentMethod({
        business_id: businessId,
        method_type: formData.method_type,
        name: formData.name.trim(),
        description: formData.description || '',
        details: formData.details || {}
      });
      toast.success(isEn ? 'Payment method added!' : 'Método de pagamento adicionado!');
      onSave();
    } catch (error) {
      console.error('Erro:', error);
      toast.error(error.message || (isEn ? 'Error adding payment method' : 'Erro ao adicionar método de pagamento'));
    } finally {
      setLoading(false);
    }
  };

  const methodTypes = [
    { value: 'cash', label: isEn ? 'Cash' : 'Dinheiro' },
    { value: 'bank_transfer', label: isEn ? 'Bank Transfer' : 'Transferência Bancária' },
    { value: 'mobile_money', label: isEn ? 'Mobile Money' : 'Dinheiro Móvel' },
    { value: 'card', label: isEn ? 'Credit/Debit Card' : 'Cartão de Crédito/Débito' },
    { value: 'crypto', label: isEn ? 'Cryptocurrency' : 'Criptomoeda' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Add Payment Method' : 'Adicionar Método de Pagamento'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Method Type *' : 'Tipo de Método *'}
            </label>
            <select
              value={formData.method_type}
              onChange={(e) => setFormData({ ...formData, method_type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            >
              {methodTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Display Name *' : 'Nome de Exibição *'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder={isEn ? 'e.g. Bank Transfer - BAI' : 'ex: Transferência Bancária - BAI'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Description' : 'Descrição'}
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder={isEn ? 'Optional details' : 'Detalhes opcionais'}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEn ? 'Add' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}