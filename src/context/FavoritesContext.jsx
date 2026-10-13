import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from './ToastContext'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })
  const { success, info } = useToast()

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = useCallback((item) => {
    setFavorites(prev => {
      if (prev.some(fav => fav.id === item.id && fav.type === item.type)) {
        return prev
      }
      success('Adicionado aos favoritos!')
      return [...prev, { ...item, addedAt: new Date().toISOString() }]
    })
  }, [success])

  const removeFavorite = useCallback((id, type) => {
    setFavorites(prev => {
      const filtered = prev.filter(fav => !(fav.id === id && fav.type === type))
      if (filtered.length < prev.length) {
        info('Removido dos favoritos')
      }
      return filtered
    })
  }, [info])

  const isFavorite = useCallback((id, type) => {
    return favorites.some(fav => fav.id === id && fav.type === type)
  }, [favorites])

  const toggleFavorite = useCallback((item) => {
    if (isFavorite(item.id, item.type)) {
      removeFavorite(item.id, item.type)
    } else {
      addFavorite(item)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  const getFavoritesByType = useCallback((type) => {
    return favorites.filter(fav => fav.type === type)
  }, [favorites])

  const clearAllFavorites = useCallback(() => {
    setFavorites([])
    info('Todos os favoritos foram removidos')
  }, [info])

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    clearAllFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}