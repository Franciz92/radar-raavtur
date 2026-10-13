import { useState, useEffect } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { supabase } from '../../services/supabase'

// Coordenadas aproximadas das províncias (percentagem no mapa)
const provinceCoordinates = {
  'Luanda': { x: 25, y: 30 },
  'Benguela': { x: 30, y: 55 },
  'Huíla': { x: 35, y: 68 },
  'Namibe': { x: 25, y: 75 },
  'Malanje': { x: 55, y: 35 },
  'Cabinda': { x: 45, y: 8 },
  'Huambo': { x: 40, y: 52 },
  'Bié': { x: 48, y: 50 },
  'Cuanza Sul': { x: 35, y: 42 },
  'Cuanza Norte': { x: 45, y: 30 },
  'Zaire': { x: 35, y: 15 },
  'Bengo': { x: 30, y: 22 },
  'Cunene': { x: 30, y: 82 },
  'Lunda Norte': { x: 65, y: 25 },
  'Lunda Sul': { x: 60, y: 40 },
  'Moxico': { x: 65, y: 48 },
  'Cuando Cubango': { x: 55, y: 78 },
  'Icolo e Bengo': { x: 28, y: 25 },
}

export default function InteractiveMap({ onSelectDestination }) {
  const [destinations, setDestinations] = useState([])
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const { data, error } = await supabase.from('destinations').select('*')
        if (error) throw error
        if (data) setDestinations(data)
      } catch (err) {
        console.error('Erro ao carregar destinos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDestinations()
  }, [])

  const handleSelect = (dest) => {
    setSelectedDestination(dest)
    onSelectDestination?.(dest)
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
      marginBottom: '32px',
      border: '1px solid rgba(0,0,0,0.03)',
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(122,24,48,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MapPin size={18} style={{ color: '#7A1830' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111315' }}>
              Mapa Interativo de Angola
            </h3>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
              Clique num marcador para ver detalhes
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: '#10b981',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          {destinations.length} destinos
        </span>
      </div>

      {/* Mapa */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '420px',
        background: 'linear-gradient(135deg, #fdfaf4 0%, #f0ebe3 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e0d8cc',
      }}>
        {/* Textura de fundo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, #d0c8b8 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.3,
        }} />

        {/* Contorno de Angola */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100"
          style={{ position: 'absolute', inset: 0 }}
        >
          <path 
            d="M22,18 L30,8 L42,5 L50,10 L58,8 L65,12 L72,20 L75,30 L72,42 L68,55 L60,70 L50,82 L40,85 L32,78 L25,68 L20,55 L18,40 L20,28 Z"
            fill="rgba(122, 24, 48, 0.04)"
            stroke="#7A1830"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          {/* Cabinda (enclave) */}
          <path 
            d="M50,3 L56,3 L58,10 L52,14 L46,10 Z"
            fill="rgba(122, 24, 48, 0.04)"
            stroke="#7A1830"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
        </svg>

        {/* Rótulo do Oceano */}
        <span style={{
          position: 'absolute', left: '12%', top: '45%',
          fontSize: '11px', color: '#b0a590', fontStyle: 'italic',
          transform: 'rotate(-90deg)',
        }}>
          Oceano Atlântico
        </span>

        {/* Marcadores */}
        {destinations.map((dest) => {
          const coord = provinceCoordinates[dest.province] || { x: 40, y: 45 }
          const isSelected = selectedDestination?.id === dest.id

          return (
            <button
              key={dest.id}
              onClick={() => handleSelect(dest)}
              style={{
                position: 'absolute',
                left: `${coord.x}%`,
                top: `${coord.y}%`,
                transform: 'translate(-50%, -50%)',
                width: isSelected ? '28px' : '20px',
                height: isSelected ? '28px' : '20px',
                borderRadius: '50%',
                background: isSelected ? '#D4A72C' : '#7A1830',
                border: '3px solid white',
                cursor: 'pointer',
                boxShadow: isSelected 
                  ? '0 0 0 8px rgba(212, 167, 44, 0.25), 0 4px 15px rgba(0,0,0,0.2)' 
                  : '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isSelected ? 10 : 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.target.style.transform = 'translate(-50%, -50%) scale(1.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.transform = 'translate(-50%, -50%) scale(1)'
                }
              }}
              title={dest.name}
            >
              {isSelected && <MapPin size={14} style={{ color: 'white' }} />}
            </button>
          )
        })}

        {/* Tooltip do destino selecionado */}
        {selectedDestination && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 20,
            animation: 'slideUp 0.3s ease-out',
            maxWidth: '90%',
            minWidth: '280px',
          }}>
            <img 
              src={selectedDestination.image} 
              alt={selectedDestination.name}
              style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} 
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '15px', color: '#111315' }}>
                {selectedDestination.name}
              </p>
              <p style={{ fontSize: '12px', color: '#777', margin: '2px 0 0' }}>
                {selectedDestination.province} • {selectedDestination.attractions} atrações
              </p>
            </div>
            <button 
              onClick={() => setSelectedDestination(null)}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                border: 'none', background: '#f5f0eb', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#555',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Legendas */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px',
          background: 'white', borderRadius: '10px',
          padding: '10px 14px', fontSize: '11px', color: '#555',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7A1830' }} />
            Destinos
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D4A72C' }} />
            Selecionado
          </div>
        </div>

        {/* Overlay de loading */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.6)',
          }}>
            <div style={{
              width: '32px', height: '32px',
              border: '3px solid rgba(122,24,48,0.2)',
              borderTopColor: '#7A1830', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}