import { createContext, useContext, useState, useEffect } from 'react'

// ============================================
// TRADUÇÕES COMPLETAS
// ============================================
const translations = {
  pt: {
    // Navegação
    home: 'Início',
    destinations: 'Destinos',
    hotels: 'Hotéis',
    restaurants: 'Restaurantes',
    experiences: 'Experiências',
    events: 'Eventos',
    services: 'Outros Serviços',
    blog: 'Blog',
    about: 'Sobre',
    contact: 'Contacto',
    
    // Autenticação
    login: 'Entrar',
    register: 'Registar',
    logout: 'Sair',
    email: 'Email',
    password: 'Palavra-passe',
    confirmPassword: 'Confirmar Palavra-passe',
    forgotPassword: 'Esqueceu a palavra-passe?',
    resetPassword: 'Redefinir Palavra-passe',
    rememberMe: 'Lembrar-me',
    createAccount: 'Criar Conta',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    signIn: 'Entrar',
    signUp: 'Registar-se',
    
    // Dashboard
    dashboard: 'Painel',
    profile: 'Perfil',
    favorites: 'Favoritos',
    bookings: 'Reservas',
    settings: 'Configurações',
    notifications: 'Notificações',
    
    // Empresa
    companyDashboard: 'Painel Empresa',
    companyProfile: 'Perfil Empresa',
    companyServices: 'Serviços',
    companyBookings: 'Reservas',
    companyReviews: 'Avaliações',
    companySettings: 'Configurações',
    companyPayment: 'Pagamentos',
    
    // Admin
    adminDashboard: 'Admin',
    adminUsers: 'Utilizadores',
    adminCompanies: 'Empresas',
    adminDestinations: 'Destinos',
    adminBookings: 'Reservas',
    
    // Ações
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
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
    emailAddress: 'Endereço de Email',
    website: 'Website',
    hours: 'Horário',
    search: 'Buscar...',
    noResults: 'Nenhum resultado encontrado',
    loading: 'Carregando...',
    error: 'Erro ao carregar',
    retry: 'Tentar novamente',
    
    // Perfil
    myProfile: 'Meu Perfil',
    personalData: 'Dados Pessoais',
    fullName: 'Nome Completo',
    phoneNumber: 'Número de Telefone',
    locationCity: 'Localização',
    avatar: 'Avatar',
    changeAvatar: 'Alterar Avatar',
    updateProfile: 'Atualizar Perfil',
    profileUpdated: 'Perfil atualizado com sucesso!',
    
    // Banner
    bannerTitle: '🌍 Descubra Angola',
    bannerSubtitle: 'Os melhores destinos, hotéis, restaurantes e experiências num só lugar',
    bannerCta: 'Explorar',
    bannerBadge: 'Turismo Premium',
    
    // Footer
    footerAbout: 'A sua plataforma de turismo em Angola. Descubra os melhores destinos, hotéis, restaurantes e experiências.',
    footerQuickLinks: 'Links Rápidos',
    footerHelp: 'Ajuda',
    footerContact: 'Contacto',
    footerRights: 'Todos os direitos reservados.',
    footerMadeWith: 'Feito com',
    footerIn: 'em Angola',
    
    // Páginas
    destinationsPage: 'Destinos em Angola',
    hotelsPage: 'Hotéis em Angola',
    restaurantsPage: 'Restaurantes em Angola',
    experiencesPage: 'Experiências em Angola',
    eventsPage: 'Eventos em Angola',
    servicesPage: 'Outros Serviços em Angola',
    blogPage: 'Blog de Viagens',
    
    // Mensagens
    welcome: 'Bem-vindo',
    welcomeBack: 'Bem-vindo de volta',
    explore: 'Explore Angola',
    discover: 'Descubra',
    bookNow: 'Reservar Agora',
    learnMore: 'Saber Mais',
    seeDetails: 'Ver Detalhes',
    noItems: 'Nenhum item encontrado',
    addToFavorites: 'Adicionar aos Favoritos',
    removeFromFavorites: 'Remover dos Favoritos',
  },
  en: {
    // Navigation
    home: 'Home',
    destinations: 'Destinations',
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    experiences: 'Experiences',
    events: 'Events',
    services: 'Other Services',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    
    // Authentication
    login: 'Sign In',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset Password',
    rememberMe: 'Remember me',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',
    
    // Dashboard
    dashboard: 'Dashboard',
    profile: 'Profile',
    favorites: 'Favorites',
    bookings: 'Bookings',
    settings: 'Settings',
    notifications: 'Notifications',
    
    // Company
    companyDashboard: 'Company Dashboard',
    companyProfile: 'Company Profile',
    companyServices: 'Services',
    companyBookings: 'Bookings',
    companyReviews: 'Reviews',
    companySettings: 'Settings',
    companyPayment: 'Payments',
    
    // Admin
    adminDashboard: 'Admin',
    adminUsers: 'Users',
    adminCompanies: 'Companies',
    adminDestinations: 'Destinations',
    adminBookings: 'Bookings',
    
    // Actions
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
    emailAddress: 'Email Address',
    website: 'Website',
    hours: 'Hours',
    search: 'Search...',
    noResults: 'No results found',
    loading: 'Loading...',
    error: 'Error loading',
    retry: 'Try again',
    
    // Profile
    myProfile: 'My Profile',
    personalData: 'Personal Data',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    locationCity: 'Location',
    avatar: 'Avatar',
    changeAvatar: 'Change Avatar',
    updateProfile: 'Update Profile',
    profileUpdated: 'Profile updated successfully!',
    
    // Banner
    bannerTitle: '🌍 Discover Angola',
    bannerSubtitle: 'The best destinations, hotels, restaurants and experiences in one place',
    bannerCta: 'Explore',
    bannerBadge: 'Premium Tourism',
    
    // Footer
    footerAbout: 'Your tourism platform in Angola. Discover the best destinations, hotels, restaurants and experiences.',
    footerQuickLinks: 'Quick Links',
    footerHelp: 'Help',
    footerContact: 'Contact',
    footerRights: 'All rights reserved.',
    footerMadeWith: 'Made with',
    footerIn: 'in Angola',
    
    // Pages
    destinationsPage: 'Destinations in Angola',
    hotelsPage: 'Hotels in Angola',
    restaurantsPage: 'Restaurants in Angola',
    experiencesPage: 'Experiences in Angola',
    eventsPage: 'Events in Angola',
    servicesPage: 'Other Services in Angola',
    blogPage: 'Travel Blog',
    
    // Messages
    welcome: 'Welcome',
    welcomeBack: 'Welcome back',
    explore: 'Explore Angola',
    discover: 'Discover',
    bookNow: 'Book Now',
    learnMore: 'Learn More',
    seeDetails: 'See Details',
    noItems: 'No items found',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
  }
}

// ============================================
// CONTEXT
// ============================================
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'pt'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt')
  }

  const t = (key) => {
    return translations[language]?.[key] || translations.pt[key] || key
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isPortuguese: language === 'pt',
    isEnglish: language === 'en',
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de LanguageProvider')
  }
  return context
}

export default LanguageContext