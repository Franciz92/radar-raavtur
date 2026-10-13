import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react'
import { X, ChevronLeft, ChevronRight, ArrowRight, Sparkles, MapPin } from 'lucide-react'

// Array de anúncios com temática africana de alto padrão (Imagens HD Unsplash + Gradientes Warm Luxe)
const adSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1600&q=85', // Savana / Sunset VIP
    location: 'Luanda, Angola',
    title: 'Experiência Exclusiva no Hotel Talatona',
    subtitle: 'Desconto de 20% para reservas antecipadas com serviço de concierge VIP e vista panorâmica.',
    badge: 'OFERTA VIP',
    link: '/hoteis/h1',
    bgColor: 'linear-gradient(135deg, rgba(61,16,24,0.95) 0%, rgba(15,5,8,0.98) 100%)',
    accentColor: '#E63946',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=85', // Costa Tropical Benguela
    location: 'Benguela, Angola',
    title: 'Pacote Costa de Benguela Premium',
    subtitle: '3 noites inesquecíveis em resort à beira-mar com passeio privativo de iate e gastronomia local.',
    badge: 'LUXO EXCLUSIVO',
    link: '/destinos/2',
    bgColor: 'linear-gradient(135deg, rgba(13,43,35,0.95) 0%, rgba(3,15,11,0.98) 100%)',
    accentColor: '#2A9D8F',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600&q=85', // Safári / Paisagem Africana
    location: 'Huíla, Angola',
    title: 'Aventura Dourada na Serra da Leba',
    subtitle: 'Expedição guiada em 4x4, fotografia profissional e jantar exclusivo no miradouro.',
    badge: 'DESTAQUE AFRICANO',
    link: '/experiencias/exp1',
    bgColor: 'linear-gradient(135deg, rgba(74,48,9,0.95) 0%, rgba(20,13,2,0.98) 100%)',
    accentColor: '#E9C46A',
  },
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const [key, setKey] = useState(0)

  let navigate
  try {
    navigate = useNavigate()
  } catch {
    navigate = null
  }

  const handleNext = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % adSlides.length)
    setKey(prev => prev + 1)
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + adSlides.length) % adSlides.length)
    setKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      handleNext()
    }, 7000)
    return () => clearInterval(interval)
  }, [paused, handleNext])

  if (!visible) return null

  const slide = adSlides[currentSlide]

  const handleNavigate = (path) => {
    if (navigate) {
      navigate(path)
    } else {
      window.location.href = path
    }
  }

  return (
    <div
      role="region"
      aria-label="Destaques e Anúncios Promocionais de Luxo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="hero-banner-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '280px',
        overflow: 'hidden',
        background: '#0B0C10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Imagem de Fundo Animada (Ken Burns Premium) */}
      <div
        key={`bg-${slide.id}-${key}`}
        className="hero-kenburns"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65) contrast(1.15) saturate(1.25)',
        }}
      />

      {/* Camada Overlay de Cor Gradiente Estilo Africano */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(90deg, #0B0C10 0%, ${slide.bgColor} 45%, rgba(11, 12, 16, 0.4) 100%)`,
          zIndex: 1,
        }}
      />

      {/* Padronagem Africana Geométrica Sutil (Sama/Kente Pattern Overlay) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(${slide.accentColor} 1px, transparent 1px), linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.2) 50%, transparent 51%)`,
          backgroundSize: '30px 30px, 60px 60px',
        }}
      />

      {/* Conteúdo Central Estruturado */}
      <div
        key={`content-${key}`}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          color: '#FFFFFF',
          padding: '24px 80px',
          maxWidth: '1280px',
          width: '100%',
        }}
      >
        {/* Localização e Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span
            className="stagger-1 shimmer-badge"
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0D0E11',
              background: 'linear-gradient(135deg, #F3A83B 0%, #E63946 100%)',
              padding: '5px 14px',
              borderRadius: '50px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              boxShadow: `0 4px 15px ${slide.accentColor}66`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={12} style={{ color: '#0D0E11' }} />
            {slide.badge}
          </span>

          <span
            className="stagger-1"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#E0E0E0',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.12)',
              padding: '4px 12px',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <MapPin size={13} style={{ color: slide.accentColor }} />
            {slide.location}
          </span>
        </div>

        {/* Título Principal */}
        <h2
          className="stagger-2"
          style={{
            margin: '0 0 10px 0',
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            textShadow: '0 4px 12px rgba(0,0,0,0.7)',
            maxWidth: '750px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {slide.title}
        </h2>

        {/* Subtítulo Detalhado */}
        <p
          className="stagger-3"
          style={{
            margin: '0 0 20px 0',
            fontSize: 'clamp(13px, 1.5vw, 16px)',
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: '620px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {slide.subtitle}
        </p>

        {/* Botão de Ação CTA */}
        <button
          type="button"
          onClick={() => handleNavigate(slide.link)}
          className="stagger-4 cta-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(90deg, #FFFFFF 0%, #F0F0F0 100%)',
            border: 'none',
            padding: '12px 26px',
            borderRadius: '50px',
            color: '#0D0E11',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span>RESERVAR AGORA</span>
          <ArrowRight size={16} style={{ color: slide.accentColor }} />
        </button>
      </div>

      {/* Controles de Navegação Flutuantes */}
      <button
        type="button"
        aria-label="Slide anterior"
        onClick={handlePrev}
        className="nav-btn-hero"
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(15, 15, 20, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          transition: 'all 0.3s ease',
        }}
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        aria-label="Próximo slide"
        onClick={handleNext}
        className="nav-btn-hero"
        style={{
          position: 'absolute',
          right: '65px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(15, 15, 20, 0.5)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          transition: 'all 0.3s ease',
        }}
      >
        <ChevronRight size={22} />
      </button>

      {/* Botão Fechar */}
      <button
        type="button"
        aria-label="Fechar banner"
        onClick={() => setVisible(false)}
        className="close-btn-hero"
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          transition: 'all 0.3s ease',
        }}
      >
        <X size={16} />
      </button>

      {/* Barra de Progresso do Auto-Play */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(255, 255, 255, 0.15)',
          zIndex: 5,
        }}
      >
        <div
          key={`bar-${key}-${paused}`}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${slide.accentColor}, #F3A83B)`,
            boxShadow: `0 0 12px ${slide.accentColor}`,
            animation: paused ? 'none' : 'heroProgress 7s linear forwards',
            width: paused ? '100%' : '0%',
          }}
        />
      </div>

      {/* Estilos CSS Integrados */}
      <style>{`
        /* Ken Burns Effect Contínuo */
        .hero-kenburns {
          animation: kenBurnsSmooth 7.5s ease-out forwards;
        }

        @keyframes kenBurnsSmooth {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.12) translate(-10px, -5px);
          }
        }

        /* Animações Escalonadas */
        .stagger-1 { animation: heroStagger 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards; opacity: 0; }
        .stagger-2 { animation: heroStagger 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
        .stagger-3 { animation: heroStagger 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .stagger-4 { animation: heroStagger 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }

        @keyframes heroStagger {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        /* Barra de Progresso */
        @keyframes heroProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        /* Interações Hover */
        .cta-button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 30px rgba(255,255,255,0.25);
          background: #FFFFFF !important;
        }

        .nav-btn-hero:hover {
          background: #FFFFFF !important;
          color: #0D0E11 !important;
          transform: translateY(-50%) scale(1.08) !important;
        }

        .close-btn-hero:hover {
          background: #E63946 !important;
          color: #FFFFFF !important;
          transform: rotate(90deg) !important;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .hero-banner-wrapper {
            min-height: 320px !important;
          }
          .nav-btn-hero {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}