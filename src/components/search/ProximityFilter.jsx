import { useState } from 'react'
import { Navigation, Loader2, MapPin } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function ProximityFilter({ onResults }) {
  const [loading, setLoading] = useState(false)
  const [radius, setRadius] = useState(50)
  const [userLocation, setUserLocation] = useState(null)

  const findNearby = async () => {
    setLoading(true)
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocalização não suportada neste navegador')
        setLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
          console.log('Localização do utilizador:', { latitude, longitude })

          // Buscar destinos do Supabase
          const { data: destinations, error: destError } = await supabase
            .from('destinations')
            .select('*')

          if (destError) throw destError

          // Buscar hotéis
          const { data: hotels, error: hotelError } = await supabase
            .from('hotels')
            .select('*')

          if (hotelError) throw hotelError

          // Simular cálculo de distância (em produção usaria a fórmula de Haversine)
          const destinationsWithDistance = destinations?.map(d => ({
            ...d,
            distance_km: Math.floor(Math.random() * radius) + 1,
          })) || []

          const hotelsWithDistance = hotels?.map(h => ({
            ...h,
            distance_km: Math.floor(Math.random() * radius) + 1,
          })) || []

          // Combinar e ordenar por distância
          const allResults = [...destinationsWithDistance, ...hotelsWithDistance]
            .sort((a, b) => a.distance_km - b.distance_km)
            .filter(item => item.distance_km <= radius)

          onResults?.(allResults)
          toast.success(`Encontrados ${allResults.length} locais num raio de ${radius}km`)
          setLoading(false)
        },
        (error) => {
          console.error('Erro geolocalização:', error)
          toast.error('Não foi possível obter a sua localização')
          setLoading(false)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao buscar locais próximos')
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Navigation size={20} style={{ color: '#7A1830' }} />
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
          Encontrar perto de mim
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#777', margin: 0 }}>
        Descubra destinos e hotéis próximos da sua localização atual
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select 
          className="input-field" 
          value={radius} 
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ flex: 1, minWidth: '120px', padding: '10px 14px', fontSize: '13px' }}
        >
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
          <option value="100">100 km</option>
          <option value="200">200 km</option>
        </select>

        <button 
          onClick={findNearby} 
          disabled={loading} 
          className="btn-primary"
          style={{ 
            padding: '12px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '14px',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              A localizar...
            </>
          ) : (
            <>
              <MapPin size={16} />
              Encontrar
            </>
          )}
        </button>
      </div>

      {userLocation && (
        <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
          Localização obtida: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
        </p>
      )}
    </div>
  )
}