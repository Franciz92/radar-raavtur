// src/pages/company/CompanySettings.jsx

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

// Ícones
import {
  Building2,
  Camera,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronLeft,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';

// ============================================
// COMPONENTE: UPLOAD DE IMAGEM (SIMPLIFICADO)
// ============================================
function ImageUploader({ companyId, type, currentImage, onUpdate, label }) {
  const { isEn } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    // Validar
    if (!file.type.startsWith('image/')) {
      toast.error(isEn ? 'Select an image' : 'Selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isEn ? 'Image max 5MB' : 'Imagem máx 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);

    try {
      // Upload para storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}/${companyId}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('company-images')
        .upload(fileName, file, { cacheControl: '3600' });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message);
      }

      // Obter URL
      const { data: urlData } = supabase.storage
        .from('company-images')
        .getPublicUrl(fileName);

      // Atualizar empresa
      const updateField = type === 'banner' ? 'cover_image' : 'logo_url';
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ [updateField]: urlData.publicUrl })
        .eq('id', companyId);

      if (updateError) throw updateError;

      toast.success(isEn ? 'Updated!' : 'Atualizado!');
      if (onUpdate) onUpdate();

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || (isEn ? 'Upload failed' : 'Falha no upload'));
      setPreview(currentImage || null);
    } finally {
      setLoading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!confirm(isEn ? 'Remove?' : 'Remover?')) return;

    setLoading(true);
    try {
      const updateField = type === 'banner' ? 'cover_image' : 'logo_url';
      const { error } = await supabase
        .from('businesses')
        .update({ [updateField]: null })
        .eq('id', companyId);

      if (error) throw error;

      setPreview(null);
      toast.success(isEn ? 'Removed!' : 'Removido!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error:', error);
      toast.error(isEn ? 'Remove failed' : 'Falha ao remover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className={`relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 ${
        type === 'logo' ? 'w-32 h-32' : 'w-full h-48'
      }`}>
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {type === 'logo' ? (
              <Building2 size={48} className="text-gray-400" />
            ) : (
              <ImageIcon size={48} className="text-gray-400" />
            )}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition text-white disabled:opacity-50"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
          </button>
          {preview && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="p-3 bg-red-500/80 rounded-full hover:bg-red-600 transition text-white disabled:opacity-50"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files?.[0])}
        className="hidden"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        {isEn ? `Click to change ${label}` : `Clique para alterar ${label}`}
      </p>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function CompanySettings() {
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const { user, company, loading: authLoading } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar galeria
  const loadGallery = async () => {
    if (!company?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_gallery')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') {
        console.error('Gallery error:', error);
      }
      setGallery(data || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remover foto da galeria
  const removeGalleryPhoto = async (photoId) => {
    if (!confirm(isEn ? 'Remove photo?' : 'Remover foto?')) return;

    try {
      const { error } = await supabase
        .from('company_gallery')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      toast.success(isEn ? 'Photo removed' : 'Foto removida');
      loadGallery();
    } catch (error) {
      console.error('Error:', error);
      toast.error(isEn ? 'Remove failed' : 'Falha ao remover');
    }
  };

  useEffect(() => {
    if (company?.id) {
      loadGallery();
    }
  }, [company?.id]);

  // Redirecionar se não for empresa
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
        return;
      }
      const role = user?.role || user?.user_metadata?.role;
      if (role !== 'company' && role !== 'admin') {
        navigate('/dashboard');
        toast.error(isEn ? 'Access denied' : 'Acesso negado');
      }
    }
  }, [user, authLoading, navigate, isEn]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEn ? 'Company not found' : 'Empresa não encontrada'}
        </h2>
        <button
          onClick={() => navigate('/empresa/registar')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          {isEn ? 'Register company' : 'Registar empresa'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Company Settings' : 'Configurações'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isEn ? 'Manage your company' : 'Gerencie sua empresa'}
          </p>
        </div>
        <button
          onClick={() => navigate('/empresa/dashboard')}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          {isEn ? 'Back' : 'Voltar'}
        </button>
      </div>

      {/* Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isEn ? 'Banner' : 'Banner'}
        </h2>
        <ImageUploader
          companyId={company.id}
          type="banner"
          currentImage={company.cover_image}
          label={isEn ? 'Banner' : 'Banner'}
          onUpdate={() => window.location.reload()}
        />
      </div>

      {/* Logo */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isEn ? 'Logo' : 'Logo'}
        </h2>
        <ImageUploader
          companyId={company.id}
          type="logo"
          currentImage={company.logo_url}
          label={isEn ? 'Logo' : 'Logo'}
          onUpdate={() => window.location.reload()}
        />
      </div>

      {/* Galeria */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isEn ? 'Photo Gallery' : 'Galeria'}
        </h2>

        {/* Upload de galeria - Simplificado */}
        <GalleryUploaderSimple companyId={company.id} onUpload={loadGallery} isEn={isEn} />

        {/* Lista de fotos */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                {isEn ? 'No photos yet' : 'Nenhuma foto ainda'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((photo) => (
                <div key={photo.id} className="relative group aspect-square">
                  <img
                    src={photo.image_url}
                    alt="Gallery"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeGalleryPhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: UPLOAD DE GALERIA (SIMPLIFICADO)
// ============================================
function GalleryUploaderSimple({ companyId, onUpload, isEn }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const valid = selected.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ${isEn ? 'is not an image' : 'não é imagem'}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ${isEn ? 'max 5MB' : 'máx 5MB'}`);
        return false;
      }
      return true;
    });

    if (valid.length === 0) return;

    const previews = valid.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFiles(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let success = 0;

    for (const fileData of files) {
      try {
        const fileExt = fileData.file.name.split('.').pop();
        const fileName = `gallery/${companyId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('company-images')
          .upload(fileName, fileData.file, { cacheControl: '3600' });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('company-images')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from('company_gallery')
          .insert({ company_id: companyId, image_url: urlData.publicUrl });

        if (insertError && insertError.code !== '42P01') {
          throw insertError;
        }

        success++;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error.message);
      }
    }

    setUploading(false);
    setFiles([]);

    if (success > 0) {
      toast.success(isEn ? `${success} photos uploaded!` : `${success} fotos enviadas!`);
      if (onUpload) onUpload();
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition"
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          {isEn ? 'Click to add photos' : 'Clique para adicionar fotos'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {files.length} {isEn ? 'files' : 'arquivos'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setFiles([])}
                className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                {isEn ? 'Clear' : 'Limpar'}
              </button>
              <button
                onClick={handleUploadAll}
                disabled={uploading}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isEn ? 'Uploading...' : 'Enviando...'}
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    {isEn ? 'Upload' : 'Enviar'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {files.map((fileData) => (
              <div key={fileData.id} className="relative">
                <img
                  src={fileData.preview}
                  alt="Preview"
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFiles(prev => prev.filter(f => f.id !== fileData.id))}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}