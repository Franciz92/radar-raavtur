// src/components/company/CompanyGalleryGrid.jsx

import { useState } from 'react';
import { Star, StarOff, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { removeGalleryPhoto, setFeaturedPhoto } from '../../services/companyService';
import toast from 'react-hot-toast';

export default function CompanyGalleryGrid({ photos, onUpdate, isOwner = false }) {
  const { isEn } = useLanguage();
  const [loading, setLoading] = useState({});

  const handleSetFeatured = async (photoId) => {
    setLoading(prev => ({ ...prev, [photoId]: 'featured' }));
    try {
      const { error } = await setFeaturedPhoto(photos[0]?.company_id, photoId);
      if (error) throw error;
      toast.success(isEn ? 'Featured photo updated!' : 'Foto destaque atualizada!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao definir destaque:', error);
      toast.error(isEn ? 'Error updating featured' : 'Erro ao atualizar destaque');
    } finally {
      setLoading(prev => ({ ...prev, [photoId]: false }));
    }
  };

  const handleRemove = async (photoId) => {
    if (!confirm(isEn ? 'Remove this photo?' : 'Remover esta foto?')) return;

    setLoading(prev => ({ ...prev, [photoId]: 'remove' }));
    try {
      const { error } = await removeGalleryPhoto(photoId);
      if (error) throw error;
      toast.success(isEn ? 'Photo removed' : 'Foto removida');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast.error(isEn ? 'Error removing photo' : 'Erro ao remover foto');
    } finally {
      setLoading(prev => ({ ...prev, [photoId]: false }));
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          {isEn ? 'No photos yet' : 'Nenhuma foto ainda'}
        </p>
        {isOwner && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isEn ? 'Upload your first photo above' : 'Envie sua primeira foto acima'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group aspect-square">
          <img
            src={photo.image_url}
            alt={photo.caption || 'Foto da empresa'}
            className="w-full h-full object-cover rounded-xl"
          />
          
          {/* Badge de destaque */}
          {photo.is_featured && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              {isEn ? 'Featured' : 'Destaque'}
            </div>
          )}

          {/* Ações (apenas para dono) */}
          {isOwner && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 rounded-xl">
              {!photo.is_featured && (
                <button
                  onClick={() => handleSetFeatured(photo.id)}
                  disabled={loading[photo.id] === 'featured'}
                  className="p-2 bg-amber-500/80 hover:bg-amber-600 rounded-full text-white transition"
                >
                  {loading[photo.id] === 'featured' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Star size={18} />
                  )}
                </button>
              )}
              <button
                onClick={() => handleRemove(photo.id)}
                disabled={loading[photo.id] === 'remove'}
                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition"
              >
                {loading[photo.id] === 'remove' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}