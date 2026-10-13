// src/components/chat/ChatConversationList.jsx

// Remover import do date-fns
// import { formatDistanceToNow } from 'date-fns'

// Substituir a função formatLastMessageDate por esta:
const formatLastMessageDate = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const messageDate = new Date(date)
  const diffInSeconds = (now - messageDate) / 1000
  
  if (diffInSeconds < 60) {
    return isEn ? 'Just now' : 'Agora mesmo'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${isEn ? 'min' : 'min'}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${isEn ? 'h' : 'h'}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${isEn ? 'd' : 'd'}`
  }
  
  // Formatação manual
  const day = String(messageDate.getDate()).padStart(2, '0')
  const month = String(messageDate.getMonth() + 1).padStart(2, '0')
  const year = messageDate.getFullYear()
  
  return `${day}/${month}/${year}`
}