// src/hooks/useDownloadPermission.js

import { useAuth } from '../context/AuthContext'

export function useDownloadPermission() {
  const { user, isAuthenticated } = useAuth()

  const canDownload = () => {
    return isAuthenticated && !!user
  }

  const getDownloadMessage = () => {
    if (!isAuthenticated) {
      return 'Faça login para baixar este arquivo'
    }
    return 'Baixar arquivo'
  }

  return {
    canDownload: canDownload(),
    isAuthenticated,
    user,
    getDownloadMessage
  }
}