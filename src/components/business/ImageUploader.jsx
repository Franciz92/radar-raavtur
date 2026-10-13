// src/components/business/ImageUploader.jsx
import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import businessService from '../../services/businessService';
import toast from 'react-hot-toast';

export default function ImageUploader({ 
  businessId, 
  images = [], 
  onImagesChange,
  maxImages = 20,
  title = null,
  description = null
}) {
  const { isEn } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Verificar limite
    if (images.length + files.length > maxImages) {
      toast.error(isEn 
        ? `Maximum ${maxImages} images allowed` 
        : `Máximo de ${maxImages} imagens permitido`);
      return;
    }

    // Validar tipos de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      toast.error(isEn 
        ? 'Only JPG, PNG, WEBP and GIF images are allowed' 
        : 'Apenas imagens JPG, PNG, WEBP e GIF são permitidas');
      return;
    }

    // Validar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error(isEn 
        ? 'Images must be less than 5MB' 
        : 'Imagens devem ter menos de 5MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages = [];
      const folder = `businesses/${businessId}/gallery`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload para o storage
        const imageUrl = await businessService.uploadImage(file, folder);
        
        // Salvar referência no banco
        const result = await businessService.addBusinessImage(
          businessId,
          imageUrl,
          file.name.replace(/\.[^/.]+$/, '')
        );
        
        uploadedImages.push(result);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Atualizar lista
      if (onImagesChange) {
        onImagesChange([...images, ...uploadedImages]);
      }

      toast.success(isEn 
        ? `${uploadedImages.length} image(s) uploaded successfully!` 
        : `${uploadedImages.length} imagem(ns) enviada(s) com sucesso!`);

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(error.message || (isEn 
        ? 'Error uploading images' 
        : 'Erro ao enviar imagens'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (imageId, imageUrl) => {
    if (!window.confirm(isEn 
      ? 'Are you sure you want to delete this image?' 
      : 'Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    try {
      // Remover do banco
      await businessService.removeBusinessImage(imageId);
      
      // Tentar remover do storage (opcional)
      try {
        const path = imageUrl.split('/business-media/')[1];
        if (path) {
          await businessService.deleteImage(path);
        }
      } catch (storageError) {
        console.warn('Não foi possível remover do storage:', storageError);
      }

      // Atualizar lista
      if (onImagesChange) {
        onImagesChange(images.filter(img => img.id !== imageId));
      }

      toast.success(isEn ? 'Image removed!' : 'Imagem removida!');
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error(error.message || (isEn 
        ? 'Error removing image' 
        : 'Erro ao remover imagem'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Input de arquivo escondido */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Área de Upload */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          uploading 
            ? 'border-gray-300 bg-gray-50 dark:bg-gray-800/50 cursor-wait'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
        }`}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 mx-auto text-primary-500 animate-spin" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isEn ? 'Uploading...' : 'Enviando...'} {uploadProgress}%
            </p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full">
              <Upload className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {isEn ? 'Click to upload images' : 'Clique para enviar imagens'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEn 
                  ? 'JPG, PNG, WEBP, GIF • Max 5MB each • Up to 20 images'
                  : 'JPG, PNG, WEBP, GIF • Máx 5MB cada • Até 20 imagens'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Plus className="w-3 h-3" />
              {images.length} / {maxImages} {isEn ? 'uploaded' : 'enviadas'}
            </div>
          </div>
        )}
      </div>

      {/* Grid de Imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 group"
            >
              <img
                src={image.image_url || image}
                alt={image.title || `Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=Error';
                }}
              />
              
              {/* Overlay com botão de remover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(image.id || index, image.image_url || image);
                  }}
                  className="p-3 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
                  title={isEn ? 'Delete' : 'Excluir'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Título */}
              {image.title && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-white truncate">{image.title}</p>
                </div>
              )}

              {/* Badge de índice */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-full text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {isEn ? 'No images yet' : 'Nenhuma imagem ainda'}
          </p>
        </div>
      )}
    </div>
  );
}