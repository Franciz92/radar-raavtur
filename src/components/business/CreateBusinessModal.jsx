// src/components/business/CreateBusinessModal.jsx
// ============================================
// CRIAR EMPRESA - COM SUBCATEGORIA PARA "OUTROS"
// ============================================

import { useState, useRef } from 'react';
import { 
  X, Building2, MapPin, Mail, Phone, Globe, Loader2, AlertCircle,
  Camera, Image as ImageIcon, Trash2, Upload,
  Truck, Utensils, Palette, Heart, ShoppingBag, Gamepad2, Briefcase
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const BUSINESS_CATEGORIES = {
  pt: [
    { value: 'hotel', label: 'Hotel' },
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'agency', label: 'Agência de Viagens' },
    { value: 'rent_a_car', label: 'Rent-a-Car' },
    { value: 'guide', label: 'Guia Turístico' },
    { value: 'transport', label: 'Transporte' },
    { value: 'tour', label: 'Passeio / Atividade' },
    { value: 'event', label: 'Evento' },
    { value: 'other', label: 'Outro Serviço' }
  ],
  en: [
    { value: 'hotel', label: 'Hotel' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'agency', label: 'Travel Agency' },
    { value: 'rent_a_car', label: 'Rent-a-Car' },
    { value: 'guide', label: 'Tour Guide' },
    { value: 'transport', label: 'Transport' },
    { value: 'tour', label: 'Tour / Activity' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other Service' }
  ]
};

// ✅ Subcategorias para "Outro Serviço"
const OTHER_SUBCATEGORIES = {
  pt: [
    { value: 'transport', label: 'Transporte', icon: Truck },
    { value: 'food', label: 'Alimentação', icon: Utensils },
    { value: 'culture', label: 'Cultura', icon: Palette },
    { value: 'health', label: 'Saúde', icon: Heart },
    { value: 'shopping', label: 'Compras', icon: ShoppingBag },
    { value: 'leisure', label: 'Lazer', icon: Gamepad2 },
    { value: 'business', label: 'Negócios', icon: Briefcase }
  ],
  en: [
    { value: 'transport', label: 'Transport', icon: Truck },
    { value: 'food', label: 'Food', icon: Utensils },
    { value: 'culture', label: 'Culture', icon: Palette },
    { value: 'health', label: 'Health', icon: Heart },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'leisure', label: 'Leisure', icon: Gamepad2 },
    { value: 'business', label: 'Business', icon: Briefcase }
  ]
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export default function CreateBusinessModal({ isOpen, onClose, onSuccess }) {
  const { language } = useLanguage();
  const { createBusiness } = useBusiness();
  const isEn = language === 'en';
  
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    province: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const categories = isEn ? BUSINESS_CATEGORIES.en : BUSINESS_CATEGORIES.pt;
  const otherSubcategories = isEn ? OTHER_SUBCATEGORIES.en : OTHER_SUBCATEGORIES.pt;
  
  const showSubcategory = formData.category === 'other';

  const validateFile = (file) => {
    if (!file) return false;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(isEn ? 'Invalid file type.' : 'Tipo de ficheiro inválido.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(isEn ? 'File too large (max 5MB).' : 'Ficheiro demasiado grande (máx 5MB).');
      return false;
    }
    return true;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
    if (error) setError(null);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
    if (error) setError(null);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'category' && value !== 'other') {
        updated.subcategory = '';
      }
      return updated;
    });
    if (error) setError(null);
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', subcategory: '', description: '',
      email: '', phone: '', website: '', address: '', province: ''
    });
    removeLogo();
    removeCover();
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      toast.error(isEn ? 'Company name is required' : 'Nome da empresa é obrigatório');
      return;
    }
    if (!formData.category) {
      toast.error(isEn ? 'Please select a category' : 'Selecione uma categoria');
      return;
    }
    if (formData.category === 'other' && !formData.subcategory) {
      toast.error(isEn ? 'Please select a subcategory' : 'Selecione uma subcategoria');
      return;
    }
    if (!formData.description.trim()) {
      toast.error(isEn ? 'Description is required' : 'Descrição é obrigatória');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        name: formData.name.trim(),
        category: formData.category,
        subcategory: formData.subcategory || null,  // ✅ Garantir que vai
        description: formData.description,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        address: formData.address || null,
        province: formData.province || null,
        logoFile: logoFile,
        coverFile: coverFile
      };

      console.log('📤 [CreateBusinessModal] Enviando para createBusiness:');
      console.log('  - Nome:', dataToSend.name);
      console.log('  - Categoria:', dataToSend.category);
      console.log('  - Subcategoria:', dataToSend.subcategory);  // ✅ Log crítico
      console.log('  - Logotipo:', logoFile?.name || 'Não');
      console.log('  - Capa:', coverFile?.name || 'Não');

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 60000);
      });

      const createPromise = createBusiness(dataToSend);
      const result = await Promise.race([createPromise, timeoutPromise]);

      if (result) {
        toast.success(
          isEn 
            ? `"${result.name}" created successfully!` 
            : `"${result.name}" criada com sucesso!`
        );
        onSuccess?.(result);
        onClose();
        resetForm();
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      const errorMessage = err.message || (isEn ? 'Error creating company' : 'Erro ao criar empresa');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <Building2 className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEn ? 'Create Company' : 'Criar Empresa'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEn ? 'Register your business on Radar RAVTUR' : 'Registe seu negócio no Radar RAVTUR'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm bg-red-50 border border-red-200 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* FOTO DE CAPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <ImageIcon className="inline w-4 h-4 mr-1.5" />
                {isEn ? 'Cover Photo' : 'Foto de Capa'}
                <span className="text-xs text-gray-400 ml-2">({isEn ? 'optional' : 'opcional'})</span>
              </label>
              {coverPreview ? (
                <div className="relative group">
                  <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover rounded-xl border-2 border-gray-200" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <button type="button" onClick={removeCover} disabled={loading} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-primary-50 rounded-full mb-3">
                      <Upload className="w-8 h-8 text-primary-500" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {isEn ? 'Click to upload cover' : 'Clique para carregar a capa'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isEn ? 'JPG, PNG or WebP (max 5MB)' : 'JPG, PNG ou WebP (máx 5MB)'}
                    </p>
                  </div>
                  <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} disabled={loading} className="hidden" />
                </label>
              )}
            </div>

            {/* LOGOTIPO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Camera className="inline w-4 h-4 mr-1.5" />
                {isEn ? 'Company Logo' : 'Logotipo da Empresa'}
                <span className="text-xs text-gray-400 ml-2">({isEn ? 'optional' : 'opcional'})</span>
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative group">
                    <img src={logoPreview} alt="Logo" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
                    <button type="button" onClick={removeLogo} disabled={loading} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition flex-shrink-0">
                    <Camera className="w-8 h-8 text-gray-400" />
                    <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} disabled={loading} className="hidden" />
                  </label>
                )}
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {isEn ? 'Upload your company logo.' : 'Carregue o logotipo da sua empresa.'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEn ? 'JPG, PNG or WebP (max 5MB)' : 'JPG, PNG ou WebP (máx 5MB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* NOME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Company Name *' : 'Nome da Empresa *'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                placeholder="Ex: Hotel Kalandula"
                required
              />
            </div>

            {/* CATEGORIA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Category *' : 'Categoria *'}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                required
              >
                <option value="">{isEn ? 'Select a category...' : 'Selecione uma categoria...'}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* ✅ SUBCATEGORIA */}
            {showSubcategory && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <label className="block text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {isEn ? 'Subcategory *' : 'Subcategoria *'}
                </label>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                  {isEn 
                    ? 'Since you selected "Other Service", please specify the subcategory:' 
                    : 'Como selecionou "Outro Serviço", especifique a subcategoria:'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {otherSubcategories.map(sub => {
                    const Icon = sub.icon
                    const isSelected = formData.subcategory === sub.value
                    return (
                      <button
                        key={sub.value}
                        type="button"
                        onClick={() => {
                          console.log('✅ [CreateBusinessModal] Subcategoria selecionada:', sub.value)
                          setFormData(prev => ({ ...prev, subcategory: sub.value }))
                        }}
                        disabled={loading}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition text-sm font-medium ${
                          isSelected
                            ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-amber-300'
                        }`}
                      >
                        <Icon size={16} />
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* DESCRIÇO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Description *' : 'Descrição *'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 resize-y"
                placeholder={isEn ? 'Describe your business...' : 'Descreva seu negócio...'}
                required
              />
            </div>

            {/* CONTATO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Mail className="inline w-4 h-4 mr-1.5" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  placeholder="empresa@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Phone className="inline w-4 h-4 mr-1.5" />
                  {isEn ? 'Phone' : 'Telefone'}
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  placeholder="923 000 000"
                />
              </div>
            </div>

            {/* ENDEREÇO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin className="inline w-4 h-4 mr-1.5" />
                {isEn ? 'Address' : 'Endereço'}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                placeholder="Ex: Av. 4 de Fevereiro, Luanda"
              />
            </div>

            {/* PROVÍNCIA E WEBSITE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isEn ? 'Province' : 'Província'}
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  placeholder="Ex: Luanda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Globe className="inline w-4 h-4 mr-1.5" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  placeholder="https://empresa.com"
                />
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isEn ? 'Creating...' : 'Criando...'}
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    {isEn ? 'Create Company' : 'Criar Empresa'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}