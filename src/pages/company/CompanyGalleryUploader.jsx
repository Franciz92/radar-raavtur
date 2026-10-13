// src/components/company/CompanyGalleryUploader.jsx

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { uploadCompanyImage, addGalleryPhoto } from '../../services/companyService';
import toast from 'react-hot-toast';

export default function CompanyGalleryUploader({ companyId, onUpload }) {
  const { isEn } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validar cada arquivo
    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} - ${isEn ? 'is not an image' : 'não é uma imagem'}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} - ${isEn ? 'must be less than 5MB' : 'deve ter menos de 5MB'}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Criar previews
    const previews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFiles(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const fileData of files) {
      try {
        // Upload para storage
        const { data: imageUrl, error: uploadError } = await uploadCompanyImage(
          companyId,
          fileData.file,
          'gallery'
        );

        if (uploadError) throw uploadError;

        // Salvar no banco
        const { error: addError } = await addGalleryPhoto(companyId, imageUrl);

        if (addError) throw addError;

        successCount++;
      } catch (error) {
        console.error('Erro ao enviar foto:', error);
        errorCount++;
      }
    }

    setUploading(false);
    setFiles([]);

    if (successCount > 0) {
      toast.success(
        isEn 
          ? `${successCount} photos uploaded successfully!`
          : `${successCount} fotos enviadas com sucesso!`
      );
      if (onUpload) onUpload();
    }

    if (errorCount > 0) {
      toast.error(
        isEn 
          ? `${errorCount} photos failed to upload`
          : `${errorCount} fotos falharam ao enviar`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          {isEn ? 'Click or drag photos here' : 'Clique ou arraste fotos aqui'}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {isEn ? 'PNG, JPG, WebP up to 5MB' : 'PNG, JPG, WebP até 5MB'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {files.length} {isEn ? 'files ready' : 'arquivos prontos'}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setFiles([])}
                className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                {isEn ? 'Clear all' : 'Limpar tudo'}
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
                    {isEn ? 'Upload all' : 'Enviar todos'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {files.map((fileData) => (
              <div key={fileData.id} className="relative group">
                <img
                  src={fileData.preview}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveFile(fileData.id)}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
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