// src/components/experience/CreateExperienceModal.jsx
// ============================================
// MODAL PARA CRIAR/EDITAR EXPERIÊNCIA
// ============================================

import { useState, useRef } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, MapPin, Star, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createExperience, updateExperience, uploadExperienceImage } from '../../services/experienceService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'beach', labelPt: 'Praia', labelEn: 'Beach' },
  { value: 'mountain', labelPt: 'Montanha', labelEn: 'Mountain' },
  { value: 'city', labelPt: 'Cidade', labelEn: 'City' },
  { value: 'nature', labelPt: 'Natureza', labelEn: 'Nature' },
  { value: 'culture', labelPt: 'Cultura', labelEn: 'Culture' },
  { value: 'food', labelPt: 'Gastronomia', labelEn: 'Food' },
  { value: 'adventure', labelPt: 'Aventura', labelEn: 'Adventure' },
  { value: 'other', labelPt: 'Outro', labelEn: 'Other' },
];

export default function CreateExperienceModal({ isOpen, onClose, onSuccess, experience = null }) {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const fileInputRef = useRef(null);
  
  const isEditing = !!experience;
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    title: experience?.title || '',
    content: experience?.content || '',
    location: experience?.location || '',
    province: experience?.province || '',
    rating: experience?.rating || 5,
    category: experience?.category || 'other',
    images: experience?.images || [],
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    const newImages = [];

    for (const file of files) {
      const result = await uploadExperienceImage(file, user.id);
      if (result.success) {
        newImages.push(result.url);
      } else {
        toast.error(result.error || 'Erro no upload');
      }
    }

    setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      toast.error(isEn ? 'Title is required' : 'Título é obrigatório');
      return;
    }
    if (!form.content.trim()) {
      toast.error(isEn ? 'Content is required' : 'Conteúdo é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const result = isEditing
        ? await updateExperience(experience.id, form, user.id)
        : await createExperience(form, user.id);

      if (result.success) {
        toast.success(
          isEn 
            ? (isEditing ? 'Experience updated!' : 'Experience shared!')
            : (isEditing ? 'Experiência atualizada!' : 'Experiência partilhada!')
        );
        onSuccess?.(result.data);
        onClose();
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing 
                ? (isEn ? 'Edit Experience' : 'Editar Experiência')
                : (isEn ? 'Share Experience' : 'Partilhar Experiência')}
            </h2>
            <p className="text-sm text-gray-500">
              {isEn ? 'Share your travel story with the community' : 'Partilhe a sua história com a comunidade'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl flex items-start gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Title *' : 'Título *'}
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={isEn ? 'Ex: Amazing sunset at Mussulo' : 'Ex: Pôr do sol incrível no Mussulo'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              disabled={loading}
            />
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isEn ? 'Your Story *' : 'A sua História *'}
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              placeholder={isEn ? 'Tell us about your experience...' : 'Conte-nos sobre a sua experiência...'}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-y"
              disabled={loading}
            />
          </div>

          {/* Localização + Província */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <MapPin size={14} className="inline mr-1" />
                {isEn ? 'Location' : 'Localização'}
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder={isEn ? 'Ex: Mussulo Beach' : 'Ex: Praia do Mussulo'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Province' : 'Província'}
              </label>
              <input
                type="text"
                name="province"
                value={form.province}
                onChange={handleChange}
                placeholder="Ex: Luanda"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Categoria + Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Category' : 'Categoria'}
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                disabled={loading}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {isEn ? cat.labelEn : cat.labelPt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Star size={14} className="inline mr-1" />
                {isEn ? 'Rating' : 'Avaliação'}
              </label>
              <div className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none"
                  >
                    <Star
                      size={22}
                      className={star <= form.rating 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-gray-300 dark:text-gray-600'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Imagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ImageIcon size={14} className="inline mr-1" />
              {isEn ? 'Photos' : 'Fotografias'}
            </label>

            {/* Preview */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {form.images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div className="flex flex-col items-center">
                {uploadingImage ? (
                  <>
                    <Loader2 size={28} className="text-amber-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">
                      {isEn ? 'Uploading...' : 'A carregar...'}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-amber-500 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {isEn ? 'Click to upload photos' : 'Clique para carregar fotos'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP • {isEn ? 'Max 5MB each' : 'Máx 5MB cada'}
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImage || loading}
                className="hidden"
              />
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium disabled:opacity-50"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Star size={18} />
              )}
              {loading 
                ? (isEn ? 'Saving...' : 'A guardar...')
                : (isEditing ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Publish' : 'Publicar'))
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}