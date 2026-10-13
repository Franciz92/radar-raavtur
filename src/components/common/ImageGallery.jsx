import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn, Grid, Maximize2 } from 'lucide-react'

export default function ImageGallery({ images = [], alt = 'Imagem', showThumbnails = true }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const defaultImages = [
    'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  ]

  const galleryImages = images.length > 0 ? images : defaultImages

  const nextImage = () => setCurrentIndex(prev => (prev + 1) % galleryImages.length)
  const prevImage = () => setCurrentIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) {
        if (e.key === 'Escape') setLightboxOpen(false)
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen])

  return (
    <div>
      {/* Imagem principal */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        height: '420px',
        background: '#f0ebe3',
      }}>
        <img
          src={galleryImages[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s',
          }}
          onLoad={() => setLoading(false)}
        />

        {/* Badge de contagem */}
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(0,0,0,0.6)', color: 'white',
          padding: '6px 12px', borderRadius: '100px',
          fontSize: '11px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <Grid size={12} /> {currentIndex + 1} / {galleryImages.length}
        </div>

        {/* Botão expandir */}
        <button
          onClick={() => setLightboxOpen(true)}
          style={{
            position: 'absolute', bottom: '14px', right: '14px',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', color: 'white',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Maximize2 size={16} />
        </button>

        {/* Setas */}
        {galleryImages.length > 1 && (
          <>
            <button onClick={prevImage}
              style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}>
              <ChevronLeft size={20} />
            </button>

            <button onClick={nextImage}
              style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {showThumbnails && galleryImages.length > 1 && (
        <div style={{
          display: 'flex', gap: '8px', marginTop: '10px',
          overflow: 'auto', paddingBottom: '4px',
        }}>
          {galleryImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '70px', height: '50px', borderRadius: '10px',
                overflow: 'hidden', flexShrink: 0,
                border: index === currentIndex ? '3px solid #D4A72C' : '2px solid transparent',
                cursor: 'pointer', padding: 0,
                transition: 'all 0.2s',
              }}>
              <img src={img} alt={`Thumbnail ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.9)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s',
        }} onClick={() => setLightboxOpen(false)}>
          
          {/* Fechar */}
          <button onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', color: 'white',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <X size={22} />
          </button>

          {/* Imagem */}
          <img
            src={galleryImages[currentIndex]}
            alt={`${alt} lightbox`}
            style={{
              maxWidth: '90%', maxHeight: '85vh',
              borderRadius: '12px', objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Setas do lightbox */}
          {galleryImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage() }}
                style={{
                  position: 'absolute', left: '20px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage() }}
                style={{
                  position: 'absolute', right: '20px', top: '50%',
                  transform: 'translateY(-50%)',
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Contador */}
          <div style={{
            position: 'absolute', bottom: '20px', left: '50%',
            transform: 'translateX(-50%)',
            color: 'white', fontSize: '13px', fontWeight: 600,
          }}>
            {currentIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}