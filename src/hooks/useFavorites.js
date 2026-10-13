import { useState, useEffect, useCallback } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('ravtur-favorites')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('ravtur-favorites', JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = useCallback((id, type) => {
    return favorites.some((f) => f.id === id && f.type === type)
  }, [favorites])

  const toggleFavorite = useCallback((item) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id && f.type === item.type)
      if (exists) {
        return prev.filter((f) => !(f.id === item.id && f.type === item.type))
      }
      return [...prev, { ...item, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeFavorite = useCallback((id, type) => {
    setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)))
  }, [])

  return { favorites, isFavorite, toggleFavorite, removeFavorite, count: favorites.length }
}