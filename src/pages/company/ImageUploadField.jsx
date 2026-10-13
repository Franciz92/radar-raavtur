// src/components/company/ImageUploadField.jsx

import { useState, useRef } from 'react';
import { Camera, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { uploadCompanyImage } from '../../services/companyService';
import toast from 'react-hot-toast';

export default function ImageUploadField({
  companyId,
  currentImage,
  folder,
  label,
  onSuccess,
  onRemove,
  aspectRatio = '16:9',
  maxSize = 5
}) {
  const { isEn } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar
    if (!file.type.startsWith('image/')) {
      toast.error(isEn ? 'Select an image' : 'Selecione uma imagem');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(
        isEn 
          ? `Image must be less than ${maxSize}MB` 
          : `A imagem deve ter menos de ${maxSize}MB`
      );
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);

    try {
      const result = await uploadCompanyImage(file, companyId, folder);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        isEn 
          ? `${label} updated successfully!` 
          : `${label} atualizado com sucesso!`
      );

      if (onSuccess) {
        onSuccess(result.url);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(error.message || (isEn ? 'Upload failed' : 'Falha no upload'));
      setPreview(currentImage || null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!confirm(
      isEn 
        ? `Remove ${label}?` 
        : `Remover ${label}?`
    )) return;

    setLoading(true);

    try {
      if (onRemove) {
        await onRemove();
      }
      setPreview(null);
      toast.success(
        isEn 
          ? `${label} removed` 
          : `${label} removido`
      );
    } catch (error) {
      console.error('Erro ao remover:', error);
      toast.error(error.message || (isEn ? 'Remove failed' : 'Falha ao remover'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div className={`relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ${
        folder === 'logo' ? 'w-32 h-32' : 'w-full h-48'
      }`}>
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {folder === 'logo' ? (
              <Building2 size={48} className="text-gray-400" />
            ) : (
              <ImageIcon size={48} className="text-gray-400" />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Camera size={24} />
            )}
          </button>
          {preview && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="p-3 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-600 transition text-white disabled:opacity-50"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        {isEn 
          ? `Click camera to change ${label} (max ${maxSize}MB)` 
          : `Clique na câmera para alterar ${label} (max ${maxSize}MB)`}
      </p>
    </div>
  );
}