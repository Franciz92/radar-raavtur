// src/pages/user/ProfilePage.jsx
// ============================================
// PERFIL DO UTILIZADOR - COM ABA PUBLICAÇÕES
// ✅ Traduções centralizadas + sincronizadas com Header
// ============================================

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import AvatarCropper from '../../components/ui/AvatarCropper'
import ExperienceCard from '../../components/experience/ExperienceCard'
import CreateExperienceModal from '../../components/experience/CreateExperienceModal'
import { getUserExperiences, deleteExperience } from '../../services/experienceService'
import {
  Camera, User, Mail, Phone, MapPin, Save, Loader2,
  AlertCircle, Image as ImageIcon, Trash2, Sparkle,
  Globe, Calendar, Building2, Compass,
  Link2, CheckCircle, Edit3, Users, Star,
  MessageCircle, Eye, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// ✅ TRADUÇÕES CENTRALIZADAS
// ============================================
const translations = {
  pt: {
    // Loading / Not found
    userNotFound: 'Utilizador Não Encontrado',

    // Botões topo
    publicProfile: 'Perfil Público',
    copyLink: 'Copiar Link',
    editProfile: 'Editar Perfil',
    cancel: 'Cancelar',
    save: 'Salvar',
    saving: 'Salvando...',

    // Perfil banner
    profileBanner: 'Banner de Perfil',
    changeBanner: 'Alterar Banner',

    // User types
    business: 'Empresa',
    guide: 'Guia',
    traveler: 'Viajante',

    // Stats
    followers: 'Seguidores',
    following: 'Seguindo',
    reviews: 'Avaliações',
    posts: 'Publicações',

    // Tabs
    profile: 'Perfil',
    myPosts: 'Publicações',
    myPostsFull: 'As Minhas Experiências',
    bookings: 'Reservas',

    // Form
    fullName: 'Nome Completo',
    email: 'Email',
    phone: 'Telefone',
    location: 'Localização',
    website: 'Website',
    bio: 'Bio',

    // Experiences tab
    shareStories: 'Partilhe as suas histórias com a comunidade',
    newPost: 'Nova Publicação',
    noPosts: 'Nenhuma publicação ainda',
    noPostsDesc: 'Partilhe a sua primeira experiência!',
    createPost: 'Criar Publicação',
    deleteExperienceConfirm: 'Eliminar esta experiência?',
    experienceDeleted: 'Experiência eliminada!',

    // Bookings
    bookingsWillAppear: 'As reservas aparecerão aqui',

    // Company tab
    companyName: 'Nome',
    category: 'Categoria',

    // Toasts
    linkCopied: 'Link do perfil copiado!',
    errorCopyLink: 'Erro ao copiar link',
    maxSize: 'Máximo 5MB',
    formatNotSupported: 'Formato não suportado',
    imageCropped: 'Imagem recortada!',
    fixFormErrors: 'Corrija os erros',
    profileUpdated: 'Perfil atualizado!',
    nameRequired: 'O nome é obrigatório',
    invalidPhone: 'Formato de telefone inválido',
    invalidURL: 'Formato de URL inválido',
    userNotAuth: 'Usuário não autenticado',
  },
  en: {
    userNotFound: 'User Not Found',

    publicProfile: 'Public Profile',
    copyLink: 'Copy Link',
    editProfile: 'Edit Profile',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',

    profileBanner: 'Profile Banner',
    changeBanner: 'Change Banner',

    business: 'Business',
    guide: 'Guide',
    traveler: 'Traveler',

    followers: 'Followers',
    following: 'Following',
    reviews: 'Reviews',
    posts: 'Posts',

    profile: 'Profile',
    myPosts: 'Posts',
    myPostsFull: 'My Experiences',
    bookings: 'Bookings',

    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    website: 'Website',
    bio: 'Bio',

    shareStories: 'Share your travel stories with the community',
    newPost: 'New Post',
    noPosts: 'No posts yet',
    noPostsDesc: 'Share your first travel experience!',
    createPost: 'Create Post',
    deleteExperienceConfirm: 'Delete this experience?',
    experienceDeleted: 'Experience deleted!',

    bookingsWillAppear: 'Bookings will appear here',

    companyName: 'Name',
    category: 'Category',

    linkCopied: 'Profile link copied!',
    errorCopyLink: 'Error copying link',
    maxSize: 'Max 5MB',
    formatNotSupported: 'Format not supported',
    imageCropped: 'Image cropped!',
    fixFormErrors: 'Fix form errors',
    profileUpdated: 'Profile updated!',
    nameRequired: 'Name is required',
    invalidPhone: 'Invalid phone format',
    invalidURL: 'Invalid URL format',
    userNotAuth: 'User not authenticated',
  },
}

// ============================================
// ÍCONES DE REDES SOCIAIS
// ============================================
const InstagramIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitterIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
)

const YoutubeIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const LinkedinIcon = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const SocialIcon = ({ platform }) => {
  const icons = {
    instagram: InstagramIcon,
    facebook: FacebookIcon,
    twitter: TwitterIcon,
    youtube: YoutubeIcon,
    linkedin: LinkedinIcon,
    website: Globe,
  }
  const Icon = icons[platform?.toLowerCase()]
  return Icon ? <Icon size={18} /> : null
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ProfilePage() {
  const { user, profile, business, updateUser, refreshUser, isAuthenticated } = useAuth()

  // ✅ Language global
  const { language, isEn } = useLanguage()
  const currentLang = language === 'en' ? 'en' : 'pt'
  const t = translations[currentLang]

  const { theme } = useTheme()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState(null)
  const fileInputRef = useRef(null)

  const [showCropper, setShowCropper] = useState(false)
  const [cropperFile, setCropperFile] = useState(null)

  // Banner
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(user?.banner_url || '')
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [bannerError, setBannerError] = useState(null)
  const bannerInputRef = useRef(null)

  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.website || '',
    nationality: user?.nationality || 'AO',
    social_links: user?.social_links || {},
  })

  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    reviews: 0,
    bookings: 0,
  })

  // ✅ Publicações
  const [myExperiences, setMyExperiences] = useState([])
  const [loadingExperiences, setLoadingExperiences] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExperience, setEditingExperience] = useState(null)

  // ============================================
  // COPIAR LINK DO PERFIL
  // ============================================
  const copyProfileLink = async () => {
    const url = `${window.location.origin}/perfil/${user?.id}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t.linkCopied)
    } catch (error) {
      toast.error(t.errorCopyLink)
    }
  }

  // ============================================
  // CARREGAR STATS
  // ============================================
  useEffect(() => {
    if (user?.id) {
      loadStats()
      loadMyExperiences()
    }
  }, [user])

  const loadStats = async () => {
    try {
      let followersCount = 0,
        followingCount = 0,
        reviewsCount = 0,
        bookingsCount = 0

      try {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', user.id)
        followersCount = count || 0
      } catch (e) {}

      try {
        const { count } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', user.id)
        followingCount = count || 0
      } catch (e) {}

      try {
        const { count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        reviewsCount = count || 0
      } catch (e) {}

      try {
        const { count } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        bookingsCount = count || 0
      } catch (e) {}

      setStats({
        followers: followersCount,
        following: followingCount,
        reviews: reviewsCount,
        bookings: bookingsCount,
      })
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  // ============================================
  // CARREGAR PUBLICAÇÕES
  // ============================================
  const loadMyExperiences = async () => {
    if (!user?.id) return
    setLoadingExperiences(true)
    try {
      const result = await getUserExperiences(user.id, 50)
      if (result.success) {
        setMyExperiences(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar publicações:', error)
    } finally {
      setLoadingExperiences(false)
    }
  }

  const handleDeleteExperience = async (id) => {
    if (!confirm(t.deleteExperienceConfirm)) return
    const result = await deleteExperience(id, user.id)
    if (result.success) {
      setMyExperiences((prev) => prev.filter((e) => e.id !== id))
      toast.success(t.experienceDeleted)
    } else {
      toast.error(result.error)
    }
  }

  const handleEditExperience = (experience) => {
    setEditingExperience(experience)
    setShowCreateModal(true)
  }

  const handleCreateSuccess = (newExp) => {
    if (editingExperience) {
      setMyExperiences((prev) => prev.map((e) => (e.id === newExp.id ? newExp : e)))
      setEditingExperience(null)
    } else {
      loadMyExperiences()
    }
  }

  // ============================================
  // ATUALIZAR FORMULÁRIO
  // ============================================
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        nationality: user.nationality || 'AO',
        social_links: user.social_links || {},
      })
      setAvatarPreview(user.avatar_url || '')
      setBannerPreview(user.banner_url || '')
    }
  }, [user])

  // ============================================
  // VALIDAR
  // ============================================
  const validateForm = () => {
    const errors = {}
    if (!form.name || form.name.trim() === '') {
      errors.name = t.nameRequired
    }
    if (form.phone && !/^[\d\s+()-]{9,15}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = t.invalidPhone
    }
    if (form.website && !/^https?:\/\/[^\s]+$/.test(form.website)) {
      errors.website = t.invalidURL
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSocialChange = (platform, value) => {
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }))
  }

  // ============================================
  // AVATAR / BANNER
  // ============================================
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.maxSize)
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(t.formatNotSupported)
      return
    }
    setCropperFile(file)
    setShowCropper(true)
    setAvatarError(null)
    e.target.value = ''
  }

  const handleCropComplete = (croppedFile) => {
    setShowCropper(false)
    if (croppedFile) {
      setAvatarFile(croppedFile)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result)
      reader.readAsDataURL(croppedFile)
      toast.success(t.imageCropped)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setCropperFile(null)
  }

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click()
  }
  const handleBannerClick = () => {
    if (isEditing) bannerInputRef.current?.click()
  }

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.maxSize)
      return
    }
    setBannerFile(file)
    setBannerError(null)
    const reader = new FileReader()
    reader.onloadend = () => setBannerPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeBanner = () => {
    setBannerFile(null)
    setBannerPreview('')
    setBannerError(null)
  }

  // ============================================
  // UPLOAD
  // ============================================
  const uploadImage = async (userId, file, folder) => {
    try {
      if (!userId) throw new Error(t.userNotAuth)

      let fileToUpload = file
      if (folder === 'banners') {
        fileToUpload = await compressImage(file, 1200)
      }

      const fileExt = fileToUpload.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      let uploadError = null
      try {
        const { error } = await supabase.storage
          .from(folder)
          .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: true })
        uploadError = error
      } catch (err) {
        uploadError = err
      }

      if (uploadError?.message?.includes('bucket not found')) {
        const { error: createError } = await supabase.storage.createBucket(folder, {
          public: true,
        })
        if (createError) throw new Error(createError.message)
        const { error: retryError } = await supabase.storage
          .from(folder)
          .upload(fileName, fileToUpload, { upsert: true })
        if (retryError) throw new Error(retryError.message)
      } else if (uploadError) {
        throw new Error(uploadError.message)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(folder).getPublicUrl(fileName)
      return publicUrl
    } catch (error) {
      console.error('[Upload] ERRO:', error)
      throw error
    }
  }

  const compressImage = (file, maxSize = 1200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width,
            height = img.height
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob)
                resolve(
                  new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                  })
                )
              else reject(new Error('Erro'))
            },
            'image/jpeg',
            0.85
          )
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validateForm()) {
      toast.error(t.fixFormErrors)
      return
    }
    setLoading(true)

    try {
      let avatarUrl = user?.avatar_url
      let bannerUrl = user?.banner_url

      if (avatarFile) {
        try {
          setUploadingAvatar(true)
          avatarUrl = await uploadImage(user.id, avatarFile, 'avatars')
        } catch (error) {
          setAvatarError(error.message)
        } finally {
          setUploadingAvatar(false)
        }
      }

      if (bannerFile) {
        try {
          setUploadingBanner(true)
          bannerUrl = await uploadImage(user.id, bannerFile, 'banners')
        } catch (error) {
          setBannerError(error.message)
        } finally {
          setUploadingBanner(false)
        }
      }

      if (!bannerFile && !bannerPreview && user?.banner_url) bannerUrl = null

      const updateData = {
        name: form.name.trim(),
        phone: form.phone || '',
        location: form.location || '',
        bio: form.bio || '',
        website: form.website || '',
        nationality: form.nationality || 'AO',
        social_links: form.social_links || {},
      }
      if (avatarUrl) updateData.avatar_url = avatarUrl
      if (bannerUrl !== undefined) updateData.banner_url = bannerUrl

      const result = await updateUser(updateData)

      if (result) {
        await refreshUser()
        setIsEditing(false)
        setAvatarFile(null)
        setBannerFile(null)
        toast.success(t.profileUpdated)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setBannerFile(null)
    setAvatarError(null)
    setBannerError(null)
    setFormErrors({})
    setAvatarPreview(user?.avatar_url || '')
    setBannerPreview(user?.banner_url || '')
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
      website: user?.website || '',
      nationality: user?.nationality || 'AO',
      social_links: user?.social_links || {},
    })
  }

  const userType = user?.userType || user?.role || 'user'
  const isBusiness = userType === 'business' || userType === 'company'
  const isGuide = userType === 'guide'

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <User size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            {t.userNotFound}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {showCropper && (
        <AvatarCropper
          imageFile={cropperFile}
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
          aspect={1}
          circularCrop={true}
          cropShape="round"
          maxSize={2 * 1024 * 1024}
        />
      )}

      <CreateExperienceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingExperience(null)
        }}
        onSuccess={handleCreateSuccess}
        experience={editingExperience}
      />

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">

        {/* BANNER */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 overflow-hidden">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white/30">
                <ImageIcon size={56} className="mx-auto mb-2" />
                <p className="text-sm font-medium">{t.profileBanner}</p>
              </div>
            </div>
          )}

          {isEditing && (
            <>
              <div
                className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleBannerClick}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white flex items-center gap-2">
                  <Camera size={20} />
                  <span className="text-sm font-medium">{t.changeBanner}</span>
                </div>
              </div>

              {bannerPreview && (
                <button
                  onClick={removeBanner}
                  className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
            disabled={!isEditing}
          />
        </div>

        {/* AVATAR E CABEÇALHO */}
        <div className="relative px-6 -mt-16">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative">
              <div
                className={`relative ${isEditing ? 'cursor-pointer' : ''} group`}
                onClick={handleAvatarClick}
              >
                <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={form.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                      <User size={56} className="text-amber-500/60" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={28} className="text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={!isEditing}
              />
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                  {form.name || (currentLang === 'en' ? 'User' : 'Utilizador')}
                </h1>
                {profile?.is_verified && <CheckCircle size={20} className="text-blue-500" />}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                    isBusiness
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : isGuide
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {isBusiness ? (
                    <Building2 size={12} />
                  ) : isGuide ? (
                    <Compass size={12} />
                  ) : (
                    <User size={12} />
                  )}
                  {isBusiness ? t.business : isGuide ? t.guide : t.traveler}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Mail size={14} /> {form.email}
                </p>
                {form.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin size={14} /> {form.location}
                  </p>
                )}
                {form.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Phone size={14} /> {form.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-2">
              <Link
                to={`/perfil/${user?.id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">{t.publicProfile}</span>
              </Link>

              <button
                onClick={copyProfileLink}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                <Link2 size={16} />
                <span className="hidden sm:inline">{t.copyLink}</span>
              </button>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl hover:from-amber-700 hover:to-amber-600 transition shadow-lg"
                >
                  <Edit3 size={16} />
                  {t.editProfile}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 rounded-xl"
                    disabled={loading}
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {loading ? t.saving : t.save}
                  </button>
                </>
              )}
            </div>
          </div>

          {form.bio && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {form.bio}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.followers}
              </span>
              <span className="text-gray-500">{t.followers}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.following}
              </span>
              <span className="text-gray-500">{t.following}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.reviews}
              </span>
              <span className="text-gray-500">{t.reviews}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkle size={16} className="text-amber-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {myExperiences.length}
              </span>
              <span className="text-gray-500">{t.posts}</span>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 overflow-x-auto -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={16} className="inline mr-2" />
              {t.profile}
            </button>

            <button
              onClick={() => setActiveTab('experiences')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'experiences'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkle size={16} className="inline mr-2" />
              {t.myPosts} ({myExperiences.length})
            </button>

            {isBusiness && (
              <button
                onClick={() => setActiveTab('business')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'business'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <Building2 size={16} className="inline mr-2" />
                {t.business}
              </button>
            )}

            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <Calendar size={16} className="inline mr-2" />
              {t.bookings}
            </button>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="px-6 pb-6 pt-4">
          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <User size={16} className="inline mr-1.5" />
                    {t.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 focus:ring-2 focus:ring-amber-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Mail size={16} className="inline mr-1.5" /> {t.email}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Phone size={16} className="inline mr-1.5" /> {t.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 disabled:bg-gray-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <MapPin size={16} className="inline mr-1.5" /> {t.location}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 disabled:bg-gray-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Globe size={16} className="inline mr-1.5" /> {t.website}
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 disabled:bg-gray-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <MessageCircle size={16} className="inline mr-1.5" /> {t.bio}
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={form.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 disabled:bg-gray-100 focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: PUBLICAÇÕES */}
          {activeTab === 'experiences' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t.myPostsFull}
                  </h3>
                  <p className="text-sm text-gray-500">{t.shareStories}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingExperience(null)
                    setShowCreateModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition"
                >
                  <Plus size={16} />
                  {t.newPost}
                </button>
              </div>

              {loadingExperiences ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-amber-500" />
                </div>
              ) : myExperiences.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <Sparkle size={48} className="mx-auto text-gray-400 mb-3" />
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t.noPosts}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">{t.noPostsDesc}</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition"
                  >
                    <Plus size={18} />
                    {t.createPost}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myExperiences.map((exp) => (
                    <ExperienceCard
                      key={exp.id}
                      experience={exp}
                      isEn={isEn}
                      showActions={true}
                      onDelete={handleDeleteExperience}
                      onEdit={handleEditExperience}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BUSINESS */}
          {activeTab === 'business' && isBusiness && business && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <p className="text-sm text-gray-500">{t.companyName}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {business.name}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                <p className="text-sm text-gray-500">{t.category}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {business.category}
                </p>
              </div>
            </div>
          )}

          {/* TAB: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500">{t.bookingsWillAppear}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}