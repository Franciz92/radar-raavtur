import { createContext, useContext, useState, useEffect } from 'react'

// ============================================
// TRADUÇÕES
// ============================================
const translations = {
  pt: {
    home: 'Início',
    destinations: 'Destinos',
    hotels: 'Hotéis',
    restaurants: 'Restaurantes',
    experiences: 'Experiências',
    events: 'Eventos',
    about: 'Sobre',
    contact: 'Contacto',
    login: 'Entrar',
    register: 'Registar',
    logout: 'Sair',
    dashboard: 'Painel',
    profile: 'Perfil',
    favorites: 'Favoritos',
    bookings: 'Reservas',
    settings: 'Configurações',
    language: 'Idioma',
    theme: 'Tema',
    dark: 'Escuro',
    light: 'Claro',
    search: 'Buscar...',
    noResults: 'Nenhum resultado encontrado',
    loading: 'Carregando...',
    error: 'Erro ao carregar',
    retry: 'Tentar novamente',
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    confirm: 'Confirmar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    viewAll: 'Ver todos',
    readMore: 'Ler mais',
    share: 'Compartilhar',
    like: 'Curtir',
    comment: 'Comentar',
    views: 'Visualizações',
    rating: 'Avaliação',
    price: 'Preço',
    location: 'Localização',
    phone: 'Telefone',
    email: 'Email',
    website: 'Website',
    hours: 'Horário',
    services: 'Serviços',
    blog: 'Blog',
    otherServices: 'Outros Serviços',
  },
  en: {
    home: 'Home',
    destinations: 'Destinations',
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    experiences: 'Experiences',
    events: 'Events',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    profile: 'Profile',
    favorites: 'Favorites',
    bookings: 'Bookings',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    search: 'Search...',
    noResults: 'No results found',
    loading: 'Loading...',
    error: 'Error loading',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    viewAll: 'View all',
    readMore: 'Read more',
    share: 'Share',
    like: 'Like',
    comment: 'Comment',
    views: 'Views',
    rating: 'Rating',
    price: 'Price',
    location: 'Location',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    hours: 'Hours',
    services: 'Services',
    blog: 'Blog',
    otherServices: 'Other Services',
  }
}

// ============================================
// CONTEXT
// ============================================
const TranslationContext = createContext()

export function TranslationProvider({ children }) {
  // Carregar idioma do localStorage ou usar 'pt' como padrão
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'pt'
  })

  // Salvar idioma no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  // Função para traduzir
  const t = (key) => {
    return translations[language]?.[key] || translations.pt[key] || key
  }

  // Alternar idioma
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt')
  }

  const value = {
    language,
    setLanguage,
    t,
    toggleLanguage,
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation deve ser usado dentro de TranslationProvider')
  }
  return context
}

export default TranslationContext