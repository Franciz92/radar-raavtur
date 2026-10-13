// src/components/ui/AvatarCropper.jsx

import { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const AvatarCropper = ({
  imageFile,
  onCropComplete,
  onClose,
  aspect = 1,
  circularCrop = true,
  cropShape = 'round',
  maxSize = 2 * 1024 * 1024, // 2MB padrão
}) => {
  const { isEn } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);

  // Estado para a imagem preview
  const [imageSrc, setImageSrc] = useState(null);

  // Carregar imagem quando o arquivo mudar
  useState(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => {
        setImageSrc(reader.result);
      };
      reader.onerror = () => {
        setError(isEn ? 'Error loading image' : 'Erro ao carregar imagem');
      };
    }
  }, [imageFile]);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(Math.min(Math.max(zoom, 1), 3));
  };

  const onRotationChange = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const onCropCompleteHandler = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setError(isEn ? 'Please adjust the image first' : 'Por favor, ajuste a imagem primeiro');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Tamanho final da imagem (avatar)
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Calcular área de recorte
      const { x, y, width, height } = croppedAreaPixels;
      const imageAspect = image.naturalWidth / image.naturalHeight;

      // Desenhar a imagem recortada
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-size / 2, -size / 2);

      // Calcular escala para preencher o canvas
      const scaleX = size / width;
      const scaleY = size / height;
      const scale = Math.max(scaleX, scaleY);

      const sourceX = x;
      const sourceY = y;
      const sourceWidth = width;
      const sourceHeight = height;

      // Desenhar imagem recortada e redimensionada
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        size,
        size
      );

      ctx.restore();

      // Se for circular, criar máscara
      if (circularCrop) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
      }

      // Converter para blob
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }

            // Verificar tamanho
            if (blob.size > maxSize) {
              setError(
                isEn
                  ? `Image too large. Maximum ${maxSize / 1024 / 1024}MB`
                  : `Imagem muito grande. Máximo ${maxSize / 1024 / 1024}MB`
              );
              resolve(null);
              return;
            }

            const fileName = imageFile.name.replace(/\.[^.]+$/, '.jpg');
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            resolve(file);
          },
          'image/jpeg',
          0.9
        );
      });
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setError(isEn ? 'Error processing image' : 'Erro ao processar imagem');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const createImage = (url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  };

  const handleSave = async () => {
    const croppedFile = await getCroppedImage();
    if (croppedFile) {
      onCropComplete(croppedFile);
    }
  };

  // Estilos
  const bgColor = isDark ? '#1a1a2e' : '#ffffff';
  const textColor = isDark ? '#f0ece4' : '#1a1815';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 size={40} className="animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            {isEn ? 'Loading image...' : 'Carregando imagem...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEn ? 'Adjust Profile Photo' : 'Ajustar Foto de Perfil'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Área do Cropper */}
        <div className="relative w-full aspect-square bg-black/5 dark:bg-white/5">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
            objectFit="cover"
            classes={{
              containerClassName: 'w-full h-full',
              mediaClassName: 'w-full h-full object-cover',
            }}
          />
        </div>

        {/* Controles */}
        <div className="p-4 space-y-4">
          {/* Controles de Zoom e Rotação */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onZoomChange(zoom - 0.1)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isEn ? 'Zoom Out' : 'Diminuir Zoom'}
            >
              <ZoomOut size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex-1 max-w-xs">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <button
              onClick={() => onZoomChange(zoom + 0.1)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isEn ? 'Zoom In' : 'Aumentar Zoom'}
            >
              <ZoomIn size={20} className="text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={onRotationChange}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isEn ? 'Rotate' : 'Rotacionar'}
            >
              <RotateCw size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Informações */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {isEn ? 'Drag to reposition' : 'Arraste para reposicionar'}
            </span>
            <span>
              {isEn ? 'Zoom: ' : 'Zoom: '}{Math.round(zoom * 100)}%
            </span>
            <span>
              {isEn ? 'Rotation: ' : 'Rotação: '}{rotation}°
            </span>
          </div>

          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isProcessing 
                ? (isEn ? 'Processing...' : 'Processando...') 
                : (isEn ? 'Save Photo' : 'Salvar Foto')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropper;