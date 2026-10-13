// src/components/DestinationImage.jsx
import { useState, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'

const DestinationImage = ({ 
    src, 
    alt, 
    className = '', 
    fallback = 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=400&q=80',
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(src || fallback)
    const [error, setError] = useState(false)

    useEffect(() => {
        // Atualizar quando src mudar
        if (src) {
            setImageSrc(src)
            setError(false)
        } else {
            setImageSrc(fallback)
        }
    }, [src, fallback])

    const handleError = () => {
        console.warn('❌ Erro ao carregar imagem:', imageSrc)
        setError(true)
        setImageSrc(fallback)
    }

    return (
        <img
            src={imageSrc}
            alt={alt || 'Imagem do destino'}
            className={`object-cover ${className}`}
            onError={handleError}
            loading="lazy"
            {...props}
        />
    )
}

export default DestinationImage