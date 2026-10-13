// src/components/maps/DestinationMap.jsx - Versão Simplificada (apenas iframe)

import { MapPin } from 'lucide-react'

export default function DestinationMap({ destination, className = '' }) {
  const hasCoordinates = destination?.latitude && destination?.longitude

  if (!hasCoordinates) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Localização não disponível</p>
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
            {destination?.location || destination?.province || 'Angola'}
          </p>
          {destination?.address && (
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
              📍 {destination.address}
            </p>
          )}
        </div>
      </div>
    )
  }

  const lat = parseFloat(destination.latitude)
  const lng = parseFloat(destination.longitude)

  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Coordenadas inválidas</p>
        </div>
      </div>
    )
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lng}`

  return (
    <div className={`${className}`}>
      <div className="rounded-xl overflow-hidden" style={{ height: '300px', minHeight: '300px' }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${destination.name}`}
        />
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        📍 {destination.name} - {destination.location || destination.province || 'Angola'}
        {destination.address && ` - ${destination.address}`}
      </div>
    </div>
  )
}