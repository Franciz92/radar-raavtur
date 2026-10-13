// src/pages/admin/AdminDestinations.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import {
  PlusCircle, Search, Edit, Trash2, Eye,
  Star, MapPin, ChevronDown, ChevronUp,
  X, Check, Save, Upload, Image as ImageIcon,
  Loader2, AlertCircle, CheckCircle, XCircle, Clock, Filter, RefreshCw,
  BookOpen, Camera, History
} from 'lucide-react'
import { 
  getDestinations, 
  createDestination, 
  updateDestination, 
  deleteDestination, 
  searchDestinations,
  uploadDestinationImage,
  VALIDATION
} from '../../services/destinationService'
import { provinces } from '../../constants/provinces'
import toast from 'react-hot-toast'

// ============================================
// CONSTANTES DE VALIDAÇO
// ============================================

const VALIDATION_RULES = {
  LATITUDE: {
    MIN: -90,
    MAX: 90,
    PATTERN: /^-?\d*\.?\d*$/,
    ERROR: 'Latitude deve estar entre -90 e 90 graus'
  },
  LONGITUDE: {
    MIN: -180,
    MAX: 180,
    PATTERN: /^-?\d*\.?\d*$/,
    ERROR: 'Longitude deve estar entre -180 e 180 graus'
  },
  RATING: {
    MIN: 0,
    MAX: 5,
    PATTERN: /^\d*\.?\d*$/,
    ERROR: 'Avaliação deve estar entre 0 e 5'
  },
  ATTRACTIONS: {
    MIN: 0,
    PATTERN: /^\d*$/,
    ERROR: 'Número de atrações deve ser positivo'
  }
}

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled, type = 'button', size = 'md' }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
    success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

const Input = ({ 
  label, 
  icon: Icon, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required, 
  disabled, 
  className = '',
  error,
  helper,
  min,
  max,
  step
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-xl border ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
          } bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${Icon ? 'pl-10' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-400">{helper}</p>
      )}
    </div>
  )
}

const TextArea = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className = '',
  error,
  helper,
  rows = 4,
  maxLength,
  showCount = false
}) => {
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(value?.length || 0)
  }, [value])

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3 top-3 text-gray-400" />}
        <textarea
          value={value || ''}
          onChange={(e) => {
            onChange(e)
            setCharCount(e.target.value.length)
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`w-full rounded-xl border ${
            error ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
          } bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${Icon ? 'pl-10' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} resize-y ${className}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-400">{helper}</p>
      )}
      {showCount && maxLength && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}
    </div>
  )
}

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

// ============================================
// STATUS BADGE
// ============================================
const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { label: 'Pendente', variant: 'warning', icon: Clock },
    approved: { label: 'Aprovado', variant: 'success', icon: CheckCircle },
    rejected: { label: 'Rejeitado', variant: 'danger', icon: XCircle },
  }
  
  const info = statusMap[status] || statusMap.pending
  const Icon = info.icon
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
      ${info.variant === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
      ${info.variant === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
      ${info.variant === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
    `}>
      <Icon size={12} />
      {info.label}
    </span>
  )
}

// ============================================
// COMPONENTE DE IMAGEM COM FALLBACK
// ============================================

const DestinationImage = ({ src, alt, className = '' }) => {
  const [error, setError] = useState(false)
  const fallbackImage = 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=100&q=80'

  const imageSrc = src || fallbackImage

  if (error) {
    return (
      <img
        src={fallbackImage}
        alt={alt || 'Destino'}
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt || 'Destino'}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminDestinations() {
  const { isEn } = useLanguage()
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [form, setForm] = useState({
    name: '',
    province: '',
    description: '',
    full_description: '',       // 🆕 História / Descrição completa
    attractions_description: '', // 🆕 O que fazer / Atrações
    image: '',
    image_url: '',
    cover_image: '',
    gallery: [],
    attractions: 0,
    rating: 0,
    highlights: [],
    best_time_to_visit: '',
    best_time: '',
    language: 'Português',
    currency: 'Kz',
    latitude: '',
    longitude: '',
    address: '',
  })
  const [newHighlight, setNewHighlight] = useState('')
  const [newGallery, setNewGallery] = useState('')

  useEffect(() => {
    loadDestinations()
    setupRealtime()
    
    return () => {
      // Cleanup realtime channel
    }
  }, [])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const { data } = await getDestinations()
      setDestinations(data || [])
    } catch (error) {
      console.error('Erro ao carregar destinos:', error)
      toast.error('Erro ao carregar destinos')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtime = () => {
    // O Realtime será configurado pelo Supabase automaticamente
  }

  // ============================================
  // APROVAR DESTINO
  // ============================================
  const handleApprove = async (id) => {
    setProcessingId(id)
    try {
      const { error } = await updateDestination(id, {
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success(isEn ? '✅ Destination approved!' : '✅ Destino aprovado!')
      
      setDestinations(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'approved' } : d
      ))
    } catch (error) {
      console.error('❌ Erro ao aprovar destino:', error)
      toast.error(error.message || (isEn ? 'Error approving' : 'Erro ao aprovar'))
    } finally {
      setProcessingId(null)
    }
  }

  // ============================================
  // REJEITAR DESTINO
  // ============================================
  const handleReject = async (id) => {
    const reason = prompt(isEn ? 'Reason for rejection:' : 'Motivo da rejeição:')
    if (reason === null) return

    setProcessingId(id)
    try {
      const { error } = await updateDestination(id, {
        status: 'rejected',
        rejection_reason: reason || (isEn ? 'Rejected by admin' : 'Rejeitado pelo admin'),
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success(isEn ? '❌ Destination rejected!' : '❌ Destino rejeitado!')
      
      setDestinations(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'rejected' } : d
      ))
    } catch (error) {
      console.error('❌ Erro ao rejeitar destino:', error)
      toast.error(error.message || (isEn ? 'Error rejecting' : 'Erro ao rejeitar'))
    } finally {
      setProcessingId(null)
    }
  }

  // ============================================
  // EXCLUIR DESTINO
  // ============================================
  const handleDelete = async (id) => {
    setProcessingId(id)
    try {
      await deleteDestination(id)
      toast.success(isEn ? '🗑️ Destination deleted!' : '🗑️ Destino excluído!')
      setDestinations(prev => prev.filter(d => d.id !== id))
      setShowDeleteModal(null)
    } catch (error) {
      console.error('❌ Erro ao excluir destino:', error)
      toast.error(error.message || (isEn ? 'Error deleting' : 'Erro ao excluir'))
    } finally {
      setProcessingId(null)
    }
  }

  const handleSearch = async () => {
    if (!search.trim()) {
      loadDestinations()
      return
    }
    setLoading(true)
    try {
      const { data } = await searchDestinations(search)
      setDestinations(data || [])
    } catch (error) {
      toast.error('Erro ao pesquisar')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (destination = null) => {
    setValidationErrors({})
    if (destination) {
      setEditingDestination(destination)
      setForm({
        name: destination.name || '',
        province: destination.province || '',
        description: destination.description || '',
        full_description: destination.full_description || '',        // 🆕
        attractions_description: destination.attractions_description || '', // 🆕
        image: destination.image || '',
        image_url: destination.image_url || destination.image || '',
        cover_image: destination.cover_image || destination.image_url || destination.image || '',
        gallery: destination.gallery || [],
        attractions: destination.attractions || 0,
        rating: destination.rating || 0,
        highlights: destination.highlights || [],
        best_time_to_visit: destination.best_time_to_visit || '',
        best_time: destination.best_time || destination.best_time_to_visit || '',
        language: destination.language || 'Português',
        currency: destination.currency || 'Kz',
        latitude: destination.latitude !== null && destination.latitude !== undefined ? String(destination.latitude) : '',
        longitude: destination.longitude !== null && destination.longitude !== undefined ? String(destination.longitude) : '',
        address: destination.address || '',
      })
    } else {
      setEditingDestination(null)
      setForm({
        name: '',
        province: '',
        description: '',
        full_description: '',        // 🆕
        attractions_description: '', // 🆕
        image: '',
        image_url: '',
        cover_image: '',
        gallery: [],
        attractions: 0,
        rating: 0,
        highlights: [],
        best_time_to_visit: '',
        best_time: '',
        language: 'Português',
        currency: 'Kz',
        latitude: '',
        longitude: '',
        address: '',
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingDestination(null)
    setValidationErrors({})
    setIsSubmitting(false)
    setUploadProgress(0)
  }

  // ============================================
  // FUNÇÕES DE VALIDAÇO
  // ============================================

  const validateLatitude = (value) => {
    if (value === '' || value === null || value === undefined) {
      return { valid: true }
    }
    
    const num = Number(value)
    if (isNaN(num)) {
      return { valid: false, error: 'Latitude deve ser um número válido' }
    }
    if (num < VALIDATION_RULES.LATITUDE.MIN || num > VALIDATION_RULES.LATITUDE.MAX) {
      return { valid: false, error: VALIDATION_RULES.LATITUDE.ERROR }
    }
    return { valid: true }
  }

  const validateLongitude = (value) => {
    if (value === '' || value === null || value === undefined) {
      return { valid: true }
    }
    
    const num = Number(value)
    if (isNaN(num)) {
      return { valid: false, error: 'Longitude deve ser um número válido' }
    }
    if (num < VALIDATION_RULES.LONGITUDE.MIN || num > VALIDATION_RULES.LONGITUDE.MAX) {
      return { valid: false, error: VALIDATION_RULES.LONGITUDE.ERROR }
    }
    return { valid: true }
  }

  const validateRating = (value) => {
    if (value === '' || value === null || value === undefined) {
      return { valid: true }
    }
    
    const num = Number(value)
    if (isNaN(num)) {
      return { valid: false, error: 'Avaliação deve ser um número válido' }
    }
    if (num < VALIDATION_RULES.RATING.MIN || num > VALIDATION_RULES.RATING.MAX) {
      return { valid: false, error: VALIDATION_RULES.RATING.ERROR }
    }
    return { valid: true }
  }

  const validateAttractions = (value) => {
    if (value === '' || value === null || value === undefined) {
      return { valid: true }
    }
    
    const num = Number(value)
    if (isNaN(num)) {
      return { valid: false, error: 'Atrações deve ser um número válido' }
    }
    if (num < VALIDATION_RULES.ATTRACTIONS.MIN || !Number.isInteger(num)) {
      return { valid: false, error: VALIDATION_RULES.ATTRACTIONS.ERROR }
    }
    return { valid: true }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!form.name || form.name.trim() === '') {
      errors.name = 'Nome é obrigatório'
    }
    if (!form.province) {
      errors.province = 'Província é obrigatória'
    }
    
    const latValidation = validateLatitude(form.latitude)
    if (!latValidation.valid) {
      errors.latitude = latValidation.error
    }
    
    const lngValidation = validateLongitude(form.longitude)
    if (!lngValidation.valid) {
      errors.longitude = lngValidation.error
    }
    
    const ratingValidation = validateRating(form.rating)
    if (!ratingValidation.valid) {
      errors.rating = ratingValidation.error
    }
    
    const attractionsValidation = validateAttractions(form.attractions)
    if (!attractionsValidation.valid) {
      errors.attractions = attractionsValidation.error
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    let error = null
    switch (field) {
      case 'latitude':
        const latResult = validateLatitude(value)
        if (!latResult.valid) error = latResult.error
        break
      case 'longitude':
        const lngResult = validateLongitude(value)
        if (!lngResult.valid) error = lngResult.error
        break
      case 'rating':
        const ratingResult = validateRating(value)
        if (!ratingResult.valid) error = ratingResult.error
        break
      case 'attractions':
        const attResult = validateAttractions(value)
        if (!attResult.valid) error = attResult.error
        break
      default:
        break
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  // ============================================
  // UPLOAD DE IMAGEM
  // ============================================
  
  const handleImageUpload = async (file) => {
    if (!file) {
      toast.error('Nenhum arquivo selecionado')
      return
    }

    // Validar tamanho
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 5MB')
      return
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de imagem não permitido. Use: JPG, PNG, WEBP ou GIF')
      return
    }

    setUploadingImage(true)
    setUploadProgress(0)
    
    try {
      const destinationId = editingDestination?.id || `temp-${Date.now()}`
      
      console.log('📤 Iniciando upload para:', destinationId)
      console.log('📄 Arquivo:', {
        nome: file.name,
        tamanho: file.size,
        tipo: file.type
      })
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      const publicUrl = await uploadDestinationImage(file, destinationId)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!publicUrl) {
        throw new Error('URL da imagem está vazia')
      }
      
      console.log('✅ URL da imagem recebida:', publicUrl)
      
      // Atualizar todos os campos de imagem
      setForm(prev => {
        const updated = {
          ...prev,
          image_url: publicUrl,
          cover_image: publicUrl,
          image: publicUrl
        }
        console.log('📝 Formulário atualizado:', updated)
        return updated
      })
      
      toast.success('✅ Imagem enviada com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error)
      toast.error(error.message || 'Erro ao enviar imagem')
      const fileInput = document.getElementById('image-upload')
      if (fileInput) fileInput.value = ''
    } finally {
      setTimeout(() => {
        setUploadingImage(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  // ============================================
  // SUBMISSO DO FORMULÁRIO - COM NOVOS CAMPOS
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setIsSubmitting(true)
    setLoading(true)
    
    try {
      const imageUrl = form.image_url || form.cover_image || form.image || ''
      
      console.log('📸 URL da imagem no submit:', imageUrl)
      
      const destinationData = {
        name: form.name.trim(),
        province: form.province,
        description: form.description?.trim() || '',
        full_description: form.full_description?.trim() || '',        // 🆕
        attractions_description: form.attractions_description?.trim() || '', // 🆕
        image_url: imageUrl,
        cover_image: imageUrl,
        image: imageUrl,
        gallery: form.gallery || [],
        attractions: form.attractions !== '' ? Number(form.attractions) : 0,
        rating: form.rating !== '' ? Number(form.rating) : null,
        highlights: form.highlights || [],
        best_time_to_visit: form.best_time_to_visit || form.best_time || '',
        best_time: form.best_time || form.best_time_to_visit || '',
        language: form.language || 'Português',
        currency: form.currency || 'Kz',
        latitude: form.latitude !== '' ? Number(form.latitude) : null,
        longitude: form.longitude !== '' ? Number(form.longitude) : null,
        address: form.address?.trim() || '',
        status: 'pending',
      }

      console.log('📤 Enviando dados FINAL:', destinationData)

      let result
      if (editingDestination) {
        result = await updateDestination(editingDestination.id, destinationData)
        toast.success('Destino atualizado com sucesso!')
      } else {
        result = await createDestination(destinationData)
        toast.success('Destino criado com sucesso!')
      }

      handleCloseModal()
      await loadDestinations()
      
      if (result?.data) {
        console.log('✅ Resultado do banco:', {
          id: result.data.id,
          name: result.data.name,
          image_url: result.data.image_url,
          cover_image: result.data.cover_image,
          image: result.data.image,
          full_description: result.data.full_description,
          attractions_description: result.data.attractions_description
        })
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar destino:', error)
      
      let errorMessage = error.message || (editingDestination ? 'Erro ao atualizar' : 'Erro ao criar')
      
      if (error.message?.includes('numeric field overflow')) {
        errorMessage = 'Erro: Valor numérico fora do intervalo permitido. Verifique:\n' +
          '• Latitude: -90 a 90\n' +
          '• Longitude: -180 a 180\n' +
          '• Avaliação: 0 a 5'
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'Já existe um destino com este nome'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setForm(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }))
      setNewHighlight('')
    }
  }

  const handleRemoveHighlight = (index) => {
    setForm(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }))
  }

  const handleAddGallery = () => {
    if (newGallery.trim()) {
      setForm(prev => ({
        ...prev,
        gallery: [...prev.gallery, newGallery.trim()]
      }))
      setNewGallery('')
    }
  }

  const handleRemoveGallery = (index) => {
    setForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  // ============================================
  // FILTROS
  // ============================================
  const filteredDestinations = destinations.filter(d => {
    const matchesSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.province?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase()) ||
      d.full_description?.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Estatísticas
  const stats = {
    total: destinations.length,
    pending: destinations.filter(d => d.status === 'pending').length,
    approved: destinations.filter(d => d.status === 'approved').length,
    rejected: destinations.filter(d => d.status === 'rejected').length,
  }

  const hasValidationErrors = Object.keys(validationErrors).some(key => validationErrors[key])

  if (loading && destinations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={28} className="text-primary-500" />
            {isEn ? 'Destinations' : 'Destinos'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEn
              ? `Manage all destinations (${destinations.length})`
              : `Gerencie todos os destinos (${destinations.length})`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={loadDestinations}
            disabled={loading}
          >
            {isEn ? 'Refresh' : 'Atualizar'}
          </Button>
          <Button icon={PlusCircle} onClick={() => handleOpenModal()}>
            {isEn ? 'New Destination' : 'Novo Destino'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Pending' : 'Pendentes'}</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Approved' : 'Aprovados'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Rejected' : 'Rejeitados'}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Search e Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            icon={Search}
            placeholder={isEn ? 'Search destinations...' : 'Pesquisar destinos...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Status'}</option>
            <option value="pending">{isEn ? 'Pending' : 'Pendentes'}</option>
            <option value="approved">{isEn ? 'Approved' : 'Aprovados'}</option>
            <option value="rejected">{isEn ? 'Rejected' : 'Rejeitados'}</option>
          </select>
        </div>
        <Button onClick={handleSearch} variant="secondary">
          {isEn ? 'Search' : 'Buscar'}
        </Button>
        {search && (
          <Button variant="ghost" onClick={() => { setSearch(''); loadDestinations() }}>
            {isEn ? 'Clear' : 'Limpar'}
          </Button>
        )}
      </div>

      {/* Lista */}
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MapPin size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">{isEn ? 'No destinations found' : 'Nenhum destino encontrado'}</p>
          <p className="text-sm">{isEn ? 'Click "New Destination" to add one' : 'Clique em "Novo Destino" para adicionar'}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Destination' : 'Destino'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Province' : 'Província'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Status' : 'Status'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Rating' : 'Avaliação'}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{isEn ? 'Actions' : 'Ações'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <DestinationImage
                          src={dest.image_url || dest.cover_image || dest.image}
                          alt={dest.name}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{dest.name}</span>
                          <p className="text-xs text-gray-400 line-clamp-1">{dest.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{dest.province}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={dest.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span>{dest.rating || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/destinos/${dest.id}`} target="_blank">
                          <Button variant="ghost" size="sm" icon={Eye} className="text-blue-500" />
                        </Link>
                        
                        {dest.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              icon={CheckCircle}
                              onClick={() => handleApprove(dest.id)}
                              disabled={processingId === dest.id}
                              className="text-white"
                            >
                              {processingId === dest.id ? <Loader2 size={14} className="animate-spin" /> : null}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                              onClick={() => handleReject(dest.id)}
                              disabled={processingId === dest.id}
                              className="text-white"
                            >
                              {processingId === dest.id ? <Loader2 size={14} className="animate-spin" /> : null}
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Edit} 
                          onClick={() => handleOpenModal(dest)} 
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2} 
                          className="text-red-500" 
                          onClick={() => setShowDeleteModal(dest.id)} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span>
              {isEn
                ? `Showing ${filteredDestinations.length} of ${destinations.length} destinations`
                : `Mostrando ${filteredDestinations.length} de ${destinations.length} destinos`
              }
            </span>
            {stats.pending > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                {stats.pending} {isEn ? 'pending' : 'pendentes'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal com novos campos */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingDestination ? (isEn ? 'Edit Destination' : 'Editar Destino') : (isEn ? 'New Destination' : 'Novo Destino')}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              {isEn ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button 
              icon={Save} 
              onClick={handleSubmit} 
              disabled={loading || uploadingImage || isSubmitting || hasValidationErrors}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSubmitting ? (isEn ? 'Saving...' : 'Salvando...') : (isEn ? 'Save' : 'Salvar')}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {hasValidationErrors && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {isEn ? 'Please correct the highlighted errors before saving.' : 'Por favor, corrija os erros destacados antes de salvar.'}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={isEn ? 'Name' : 'Nome'}
              value={form.name}
              onChange={(e) => {
                setForm(prev => ({ ...prev, name: e.target.value }))
                if (e.target.value.trim()) {
                  setValidationErrors(prev => ({ ...prev, name: null }))
                }
              }}
              required
              error={validationErrors.name}
              placeholder={isEn ? 'Ex: Kissama National Park' : 'Ex: Parque Nacional da Kissama'}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isEn ? 'Province' : 'Província'} *
              </label>
              <select
                className={`w-full rounded-xl border ${
                  validationErrors.province ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
                } bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100`}
                value={form.province}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, province: e.target.value }))
                  if (e.target.value) {
                    setValidationErrors(prev => ({ ...prev, province: null }))
                  }
                }}
                required
              >
                <option value="">{isEn ? 'Select a province' : 'Selecione uma província'}</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {validationErrors.province && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {validationErrors.province}
                </p>
              )}
            </div>
          </div>

          {/* 🆕 Descrição Curta */}
          <TextArea
            label={isEn ? 'Short Description' : 'Descrição Curta'}
            icon={BookOpen}
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder={isEn ? 'Brief summary of the destination...' : 'Resumo breve do destino...'}
            rows={3}
            maxLength={500}
            showCount
            helper={isEn ? 'Short summary for the destination card' : 'Resumo curto para o card do destino'}
          />

          {/* 🆕 Descrição Completa / História */}
          <TextArea
            label={isEn ? 'Full Description / History' : 'Descrição Completa / História'}
            icon={History}
            value={form.full_description}
            onChange={(e) => setForm(prev => ({ ...prev, full_description: e.target.value }))}
            placeholder={
              isEn 
                ? 'Tell the story of this destination, its history, culture, and what makes it unique...' 
                : 'Conte a história deste destino, sua cultura, história e o que o torna único...'
            }
            rows={6}
            maxLength={5000}
            showCount
            helper={isEn ? 'Detailed description with history and cultural context' : 'Descrição detalhada com história e contexto cultural'}
          />

          {/* 🆕 O que fazer / Atrações Turísticas */}
          <TextArea
            label={isEn ? 'What to do / Tourist Attractions' : 'O que fazer / Atrações Turísticas'}
            icon={Camera}
            value={form.attractions_description}
            onChange={(e) => setForm(prev => ({ ...prev, attractions_description: e.target.value }))}
            placeholder={
              isEn 
                ? 'What can tourists do? Beaches, museums, tours, local cuisine, etc...' 
                : 'O que os turistas podem fazer? Praias, museus, passeios, gastronomia local, etc...'
            }
            rows={5}
            maxLength={3000}
            showCount
            helper={isEn ? 'Main attractions and activities for tourists' : 'Principais atrações e atividades para turistas'}
          />

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium mb-1">{isEn ? 'Cover Image' : 'Imagem de Capa'}</label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                {form.image_url || form.cover_image || form.image ? (
                  <img 
                    src={form.image_url || form.cover_image || form.image} 
                    alt="Capa" 
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      e.target.src = 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=400&q=80'
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon size={28} className="mx-auto mb-1" />
                    <span className="text-xs">{isEn ? 'No image' : 'Sem imagem'}</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 size={24} className="animate-spin text-white mx-auto mb-1" />
                      <span className="text-xs text-white">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className={`px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition text-sm flex items-center gap-2 ${
                    uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImage ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploadingImage ? (isEn ? 'Uploading...' : 'Enviando...') : (isEn ? 'Choose image' : 'Escolher imagem')}
                </label>
                <p className="text-xs text-gray-400">{isEn ? 'Recommended: 1200x630px, max 5MB' : 'Recomendado: 1200x630px, max 5MB'}</p>
                {form.image_url && (
                  <p className="text-xs text-green-500">✅ {isEn ? 'Image uploaded' : 'Imagem carregada'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={isEn ? 'Attractions' : 'Atrações'}
              type="number"
              min="0"
              step="1"
              value={form.attractions}
              onChange={(e) => handleFieldChange('attractions', e.target.value)}
              error={validationErrors.attractions}
              helper={isEn ? 'Positive integer' : 'Número inteiro positivo'}
              placeholder="0"
            />
            <Input
              label={isEn ? 'Rating' : 'Avaliação'}
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => handleFieldChange('rating', e.target.value)}
              error={validationErrors.rating}
              helper={isEn ? 'Between 0 and 5' : 'Entre 0 e 5'}
              placeholder="4.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{isEn ? 'Best time to visit' : 'Melhor época para visitar'}</label>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              value={form.best_time_to_visit || form.best_time}
              onChange={(e) => setForm(prev => ({ ...prev, best_time_to_visit: e.target.value, best_time: e.target.value }))}
              placeholder={isEn ? 'May to October (dry season)' : 'Maio a Outubro (época seca)'}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label={isEn ? 'Latitude' : 'Latitude'}
                type="text"
                value={form.latitude}
                onChange={(e) => handleFieldChange('latitude', e.target.value)}
                error={validationErrors.latitude}
                helper="-90 to 90 degrees"
                placeholder="-8.8383"
              />
            </div>
            <div>
              <Input
                label={isEn ? 'Longitude' : 'Longitude'}
                type="text"
                value={form.longitude}
                onChange={(e) => handleFieldChange('longitude', e.target.value)}
                error={validationErrors.longitude}
                helper="-180 to 180 degrees"
                placeholder="13.2344"
              />
            </div>
          </div>

          <Input
            label={isEn ? 'Address' : 'Endereço'}
            value={form.address}
            onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder={isEn ? 'Av. 4 de Fevereiro, Luanda' : 'Av. 4 de Fevereiro, Luanda'}
          />

          {/* Destaques */}
          <div>
            <label className="block text-sm font-medium mb-1">{isEn ? 'Highlights' : 'Destaques'}</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder={isEn ? 'Add highlight (ex: Paradise beaches)' : 'Adicionar destaque (ex: Praias paradisíacas)'}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
              />
              <Button type="button" onClick={handleAddHighlight}>{isEn ? 'Add' : 'Adicionar'}</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.highlights.map((h, i) => (
                <span key={i} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {h}
                  <button type="button" onClick={() => handleRemoveHighlight(i)} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Resumo dos valores para debug */}
          <div className="text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
            <details>
              <summary className="cursor-pointer hover:text-gray-600">🔍 Valores a serem enviados</summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-x-auto">
                {JSON.stringify({
                  name: form.name,
                  province: form.province,
                  description: form.description,
                  full_description: form.full_description || '❌',
                  attractions_description: form.attractions_description || '❌',
                  image_url: form.image_url || '❌',
                  cover_image: form.cover_image || '❌',
                  image: form.image || '❌',
                  latitude: form.latitude !== '' ? Number(form.latitude) : null,
                  longitude: form.longitude !== '' ? Number(form.longitude) : null,
                  rating: form.rating !== '' ? Number(form.rating) : null,
                  attractions: form.attractions !== '' ? Number(form.attractions) : 0,
                }, null, 2)}
              </pre>
            </details>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isEn ? '⚠️ Delete Destination' : '⚠️ Excluir Destino'}
                </h3>
                <p className="text-sm text-red-500 dark:text-red-400 font-semibold">
                  {isEn ? 'This action CANNOT be undone!' : 'Esta ação NO pode ser desfeita!'}
                </p>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {isEn 
                  ? 'All destination data will be permanently deleted:' 
                  : 'Todos os dados do destino serão permanentemente excluídos:'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={processingId === showDeleteModal}
                className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingId === showDeleteModal ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isEn ? 'Delete' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}