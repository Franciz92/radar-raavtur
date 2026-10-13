// src/pages/company/CompanyServiceForm.jsx
// ============================================
// FORMULÁRIO DE SERVIÇO - COM UPLOAD DE LOGOTIPO
// - Criar / Editar
// - Upload de logotipo com preview
// - Verificação de proprietário
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import businessService from '../../services/businessService';
import {
  Package,
  Loader2,
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  DollarSign,
  Clock,
  Users,
  Tag,
  Briefcase,
  Camera,
  AlertCircle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Input = ({ label, icon: Icon, value, onChange, placeholder, required, name, type = 'text', helper }) => (
  <div className="w-full">
    {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <div className="relative">
      {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
      <input
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${Icon ? 'pl-10' : ''}`}
      />
    </div>
    {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, required, rows = 4, name }) => (
  <div className="w-full">
    {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 resize-y min-h-[100px]"
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, required, name }) => (
  <div className="w-full">
    {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 appearance-none"
    >
      <option value="">{placeholder || 'Selecione...'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ============================================
// CONFIGURAÇÕES DE UPLOAD
// ============================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CompanyServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { company } = useCompany();
  const { isEn } = useLanguage();
  
  const logoInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados do formulário
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    duration: '',
    max_people: '',
    is_active: true,
    featured: false,
  });

  // Estados do logotipo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [oldLogoUrl, setOldLogoUrl] = useState(null);

  const isEditing = !!id;

  const categories = [
    { value: 'quarto', label: isEn ? 'Room' : 'Quarto' },
    { value: 'suite', label: isEn ? 'Suite' : 'Suíte' },
    { value: 'restaurante', label: isEn ? 'Restaurant' : 'Restaurante' },
    { value: 'lazer', label: isEn ? 'Leisure' : 'Lazer' },
    { value: 'evento', label: isEn ? 'Event' : 'Evento' },
    { value: 'transporte', label: isEn ? 'Transport' : 'Transporte' },
    { value: 'outro', label: isEn ? 'Other' : 'Outro' },
  ];

  // ============================================
  // CARREGAR SERVIÇO (modo edição)
  // ============================================
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setLoadingService(true);
      try {
        console.log('🔍 [ServiceForm] Carregando serviço:', id);

        // 1. Buscar serviço
        const service = await businessService.getServiceById(id);
        
        if (!service) {
          toast.error(isEn ? 'Service not found' : 'Serviço não encontrado');
          navigate('/empresa/servicos');
          return;
        }

        console.log('✅ [ServiceForm] Serviço encontrado:', service.name);

        // 2. Verificar se o utilizador é o proprietário
        if (user?.id) {
          const ownerCheck = await businessService.isBusinessOwner(service.business_id, user.id);
          console.log('🔐 [ServiceForm] É proprietário?', ownerCheck);
          
          if (!ownerCheck) {
            toast.error(
              isEn 
                ? 'Only the owner can edit this service' 
                : 'Apenas o proprietário pode editar este serviço'
            );
            navigate(`/empresa/${service.business_id}`);
            return;
          }
          setIsOwner(ownerCheck);
        }

        // 3. Preencher formulário
        setForm({
          name: service.name || '',
          description: service.description || '',
          price: service.price?.toString() || '',
          category: service.category || '',
          duration: service.duration?.toString() || '',
          max_people: service.max_people?.toString() || '',
          is_active: service.is_active !== false,
          featured: service.featured || false,
        });

        // 4. Carregar logotipo existente
        if (service.logo_url) {
          setLogoPreview(service.logo_url);
          setOldLogoUrl(service.logo_url);
        }
      } catch (err) {
        console.error('❌ [ServiceForm] Erro:', err);
        toast.error(isEn ? 'Error loading service' : 'Erro ao carregar serviço');
        navigate('/empresa/servicos');
      } finally {
        setLoadingService(false);
      }
    };

    loadData();
  }, [id, user?.id, isEn, navigate]);

  // ============================================
  // VALIDAR FICHEIRO
  // ============================================
  const validateFile = (file) => {
    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        isEn 
          ? 'Invalid file type. Use JPG, PNG or WebP.' 
          : 'Tipo de ficheiro inválido. Use JPG, PNG ou WebP.'
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        isEn 
          ? 'File too large. Maximum 5MB.' 
          : 'Ficheiro demasiado grande. Máximo 5MB.'
      );
      return false;
    }

    return true;
  };

  // ============================================
  // HANDLE LOGO CHANGE
  // ============================================
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setLogoFile(file);
    
    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);

    if (error) setError(null);
  };

  // ============================================
  // REMOVER LOGO
  // ============================================
  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setOldLogoUrl(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // ============================================
  // HANDLE CHANGE
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!form.name.trim()) {
      toast.error(isEn ? 'Service name is required' : 'Nome do serviço é obrigatório');
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error(isEn ? 'Price must be greater than 0' : 'Preço deve ser maior que 0');
      return;
    }

    // Verificar business_id
    const businessId = company?.id;
    if (!businessId) {
      toast.error(isEn ? 'Business not found' : 'Empresa não encontrada');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 [ServiceForm] Enviando dados...');
      console.log('  - Nome:', form.name);
      console.log('  - Preço:', form.price);
      console.log('  - Logotipo:', logoFile ? logoFile.name : (oldLogoUrl ? 'existente' : 'nenhum'));

      const serviceData = {
        business_id: businessId,
        name: form.name.trim(),
        description: form.description || '',
        price: parseFloat(form.price),
        category: form.category || null,
        duration: form.duration ? parseInt(form.duration) : null,
        max_people: form.max_people ? parseInt(form.max_people) : null,
        is_active: form.is_active,
        featured: form.featured,
        // ✅ Logotipo
        logoFile: logoFile,
        oldLogoUrl: oldLogoUrl,
        logo_url: logoFile ? null : (oldLogoUrl || null),
      };

      let result;
      if (isEditing) {
        result = await businessService.updateService(id, serviceData);
      } else {
        result = await businessService.createService(serviceData);
      }

      if (result) {
        toast.success(
          isEn 
            ? (isEditing ? 'Service updated!' : 'Service created!')
            : (isEditing ? 'Serviço atualizado!' : 'Serviço criado!')
        );
        navigate('/empresa/servicos');
      }
    } catch (err) {
      console.error('❌ [ServiceForm] Erro:', err);
      const errorMessage = err.message || (isEn ? 'Error saving service' : 'Erro ao salvar serviço');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOADING
  // ============================================
  if (loadingService) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/empresa/servicos')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            {isEditing 
              ? (isEn ? 'Edit Service' : 'Editar Serviço')
              : (isEn ? 'New Service' : 'Novo Serviço')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditing 
              ? (isEn ? 'Update service information' : 'Atualize as informações do serviço')
              : (isEn ? 'Add a new service to your business' : 'Adicione um novo serviço à sua empresa')}
          </p>
        </div>
      </div>

      {/* Banner de proprietário */}
      {isEditing && isOwner && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {isEn ? 'You are the owner' : 'Você é o proprietário'}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {isEn 
                ? 'Only you can edit this service' 
                : 'Apenas você pode editar este serviço'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        
        {/* Erro */}
        {error && (
          <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================ */}
        {/* UPLOAD DE LOGOTIPO */}
        {/* ============================================ */}
        <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {isEn ? 'Service Logo' : 'Logotipo do Serviço'}
            <span className="text-xs font-normal text-gray-500 ml-2">
              ({isEn ? 'optional' : 'opcional'})
            </span>
          </label>

          <div className="flex items-center gap-5">
            {/* Preview */}
            {logoPreview ? (
              <div className="relative group flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-white dark:bg-gray-800 p-2 shadow-md border-2 border-blue-500 overflow-hidden flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Logo';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  disabled={loading}
                  className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition disabled:opacity-50"
                  title={isEn ? 'Remove' : 'Remover'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="w-28 h-28 rounded-2xl border-2 border-dashed border-blue-400 bg-white dark:bg-gray-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex flex-col items-center justify-center flex-shrink-0 group">
                <Camera className="w-10 h-10 text-blue-400 group-hover:text-blue-600 transition" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  {isEn ? 'Upload' : 'Carregar'}
                </span>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleLogoChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            )}

            {/* Info */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {isEn 
                  ? 'Upload a logo for this service' 
                  : 'Carregue um logotipo para este serviço'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {isEn 
                  ? 'The logo will appear on the service card and details page'
                  : 'O logotipo aparecerá no cartão do serviço e na página de detalhes'}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  📷 JPG, PNG, WebP
                </span>
                <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  📦 {isEn ? 'Max 5MB' : 'Máx 5MB'}
                </span>
                <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  ⭐ {isEn ? 'Recommended: 512x512' : 'Recomendado: 512x512'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CAMPOS DO FORMULÁRIO */}
        {/* ============================================ */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label={isEn ? 'Service Name *' : 'Nome do Serviço *'}
                icon={Package}
                value={form.name}
                onChange={handleChange}
                placeholder={isEn ? 'Ex: Standard Room, Breakfast...' : 'Ex: Quarto Standard, Café da Manhã...'}
                required
                name="name"
              />
            </div>

            <div className="md:col-span-2">
              <TextArea
                label={isEn ? 'Description' : 'Descrição'}
                value={form.description}
                onChange={handleChange}
                placeholder={isEn ? 'Describe the service in detail...' : 'Descreva o serviço em detalhes...'}
                rows={4}
                name="description"
              />
            </div>

            <Input
              label={isEn ? 'Price (Kz) *' : 'Preço (Kz) *'}
              icon={DollarSign}
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              name="price"
              required
            />

            <Select
              label={isEn ? 'Category' : 'Categoria'}
              value={form.category}
              onChange={handleChange}
              options={categories}
              placeholder={isEn ? 'Select category' : 'Selecione a categoria'}
              name="category"
            />

            <Input
              label={isEn ? 'Duration (minutes)' : 'Duração (minutos)'}
              icon={Clock}
              type="number"
              value={form.duration}
              onChange={handleChange}
              placeholder="Ex: 60"
              name="duration"
              helper={isEn ? 'Estimated time in minutes' : 'Tempo estimado em minutos'}
            />

            <Input
              label={isEn ? 'Max People' : 'Capacidade Máxima'}
              icon={Users}
              type="number"
              value={form.max_people}
              onChange={handleChange}
              placeholder={isEn ? 'Number of people' : 'Número de pessoas'}
              name="max_people"
              helper={isEn ? 'Maximum capacity' : 'Capacidade máxima'}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Active' : 'Ativo'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Featured' : 'Destaque'}
              </span>
            </label>
          </div>
        </div>

        {/* ============================================ */}
        {/* BOTÕES */}
        {/* ============================================ */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-medium shadow-md"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isEn ? 'Saving...' : 'Salvando...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing 
                  ? (isEn ? 'Update Service' : 'Atualizar Serviço')
                  : (isEn ? 'Add Service' : 'Adicionar Serviço')}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/empresa/servicos')}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium disabled:opacity-50"
          >
            {isEn ? 'Cancel' : 'Cancelar'}
          </button>
        </div>
      </form>
    </div>
  );
}