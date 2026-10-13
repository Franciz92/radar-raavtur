import { useState, useEffect } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'

export default function GoogleMapView({ 
  markers = [], 
  center = { lat: -8.8383, lng: 13.2344 }, 
  zoom = 6, 
  className = '' 
}) {
  const [loading, setLoading] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState(null)

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className={`relative rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden ${className}`}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-gray-400">Carregando mapa...</p>
          </div>
        </div>
      </div>
    )
  }

  // Se não houver marcadores, mostrar mensagem
  if (!markers || markers.length === 0) {
    return (
      <div className={`relative rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden ${className}`}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin size={48} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum ponto no mapa</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden ${className}`}>
      {/* Simulação de mapa com grade */}
      <div className="relative h-64 w-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20">
        {/* Grade do mapa */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-0.5 opacity-20">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-gray-400/30 dark:border-gray-600/30" />
          ))}
        </div>

        {/* Marcadores */}
        {markers.map((marker, index) => {
          // Calcular posição relativa no mapa
          const lngMin = center.lng - 2
          const lngMax = center.lng + 2
          const latMin = center.lat - 2
          const latMax = center.lat + 2
          
          const x = ((marker.lng || center.lng) - lngMin) / (lngMax - lngMin) * 100
          const y = ((marker.lat || center.lat) - latMin) / (latMax - latMin) * 100

          return (
            <div
              key={index}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${Math.min(Math.max(x, 5), 95)}%`,
                top: `${Math.min(Math.max(y, 5), 95)}%`,
              }}
              onClick={() => setSelectedMarker(marker)}
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-primary-500 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </div>
              {selectedMarker === marker && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 z-10">
                  <button
                    onClick={() => setSelectedMarker(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {marker.name || marker.title || 'Local'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {marker.address || marker.location || 'Angola'}
                  </p>
                  {marker.rating && (
                    <p className="text-xs text-yellow-500 mt-1">
                      ★ {marker.rating}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Centro do mapa */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary-500 rounded-full animate-ping opacity-50" />
          <div className="w-4 h-4 border-2 border-primary-500 rounded-full -mt-4" />
        </div>

        {/* Info */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg">
          <Navigation size={12} className="inline mr-1" />
          {markers.length} pontos • Centro: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-1">
          <button className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">+</span>
          </button>
          <button className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">−</span>
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="absolute bottom-3 right-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 shadow-lg">
        <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-1" />
        Destinos
      </div>
    </div>
  )
}