// src/services/destinationService.js

import { supabase } from './supabase'

// ============================================
// CONSTANTES DE VALIDAÇO
// ============================================

const VALIDATION = {
  LATITUDE: {
    MIN: -90,
    MAX: 90,
    PRECISION: 8,
    ERROR: 'Latitude deve estar entre -90 e 90 graus'
  },
  LONGITUDE: {
    MIN: -180,
    MAX: 180,
    PRECISION: 8,
    ERROR: 'Longitude deve estar entre -180 e 180 graus'
  },
  RATING: {
    MIN: 0,
    MAX: 5,
    PRECISION: 2,
    ERROR: 'Avaliação deve estar entre 0 e 5'
  },
  ATTRACTIONS: {
    MIN: 0,
    MAX: 999999,
    ERROR: 'Número de atrações deve ser positivo'
  },
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }
}

// ============================================
// FUNÇÕES DE VALIDAÇO
// ============================================

/**
 * Valida e converte um valor numérico
 */
const validateNumber = (value, fieldName, options = {}) => {
  const { min, max, required = false, allowNull = true } = options
  
  // Tratar valores vazios
  if (value === '' || value === null || value === undefined) {
    if (required) {
      throw new Error(`${fieldName} é obrigatório`)
    }
    return allowNull ? null : 0
  }
  
  // Converter para número
  const num = Number(value)
  
  // Verificar se é número válido
  if (isNaN(num)) {
    throw new Error(`${fieldName} deve ser um número válido`)
  }
  
  // Verificar se é finito
  if (!isFinite(num)) {
    throw new Error(`${fieldName} deve ser um número finito`)
  }
  
  // Verificar limites
  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} deve ser maior ou igual a ${min}`)
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} deve ser menor ou igual a ${max}`)
  }
  
  return num
}

/**
 * Valida coordenadas geográficas
 */
const validateCoordinate = (value, type) => {
  const config = type === 'latitude' ? VALIDATION.LATITUDE : VALIDATION.LONGITUDE
  
  if (value === '' || value === null || value === undefined) {
    return null
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    throw new Error(`${type} deve ser um número válido`)
  }
  
  if (!isFinite(num)) {
    throw new Error(`${type} deve ser um número finito`)
  }
  
  if (num < config.MIN || num > config.MAX) {
    throw new Error(config.ERROR)
  }
  
  // Arredondar para a precisão correta
  return Number(num.toFixed(config.PRECISION))
}

/**
 * Valida rating (avaliação)
 */
const validateRating = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    throw new Error('Avaliação deve ser um número válido')
  }
  
  if (num < VALIDATION.RATING.MIN || num > VALIDATION.RATING.MAX) {
    throw new Error(VALIDATION.RATING.ERROR)
  }
  
  return Number(num.toFixed(VALIDATION.RATING.PRECISION))
}

/**
 * Valida attractions (número de atrações)
 */
const validateAttractions = (value) => {
  if (value === '' || value === null || value === undefined) {
    return 0
  }
  
  const num = Number(value)
  
  if (isNaN(num)) {
    throw new Error('Número de atrações deve ser um número válido')
  }
  
  if (num < VALIDATION.ATTRACTIONS.MIN) {
    throw new Error(VALIDATION.ATTRACTIONS.ERROR)
  }
  
  return Math.floor(num) // Garantir que é inteiro
}

/**
 * Valida string (texto)
 */
const validateString = (value, fieldName, options = {}) => {
  const { required = false, maxLength = 1000, allowEmpty = false } = options
  
  if (value === '' || value === null || value === undefined) {
    if (required) {
      throw new Error(`${fieldName} é obrigatório`)
    }
    return ''
  }
  
  const str = String(value).trim()
  
  if (required && str.length === 0) {
    throw new Error(`${fieldName} não pode estar vazio`)
  }
  
  if (!allowEmpty && str.length === 0) {
    return ''
  }
  
  if (str.length > maxLength) {
    throw new Error(`${fieldName} deve ter no máximo ${maxLength} caracteres`)
  }
  
  return str
}

/**
 * Valida URL de imagem
 */
const validateImageUrl = (value) => {
  if (value === '' || value === null || value === undefined) {
    return ''
  }
  
  const str = String(value).trim()
  
  // Se for uma URL válida ou um caminho
  if (str.length > 0) {
    // Validar se é uma URL (opcional)
    try {
      new URL(str)
    } catch (e) {
      // Não é uma URL válida, mas pode ser um caminho relativo
      // Apenas retornar o valor
    }
  }
  
  return str
}

/**
 * Valida array
 */
const validateArray = (value) => {
  if (!value || !Array.isArray(value)) {
    return []
  }
  return value
}

/**
 * Valida booleano
 */
const validateBoolean = (value) => {
  if (value === '' || value === null || value === undefined) {
    return false
  }
  return Boolean(value)
}

// ============================================
// FUNÇÕES DE AUTENTICAÇO E PERMISSO
// ============================================

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user }
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error)
    return { user: null }
  }
}

export const checkAuthAndPermissions = async () => {
  try {
    const { user } = await getCurrentUser()
    
    if (!user) {
      throw new Error('Usuário não está logado. Faça login para continuar.')
    }
    
    console.log('✅ Usuário autenticado:', user.email)
    return { user, isAuthenticated: true }
    
  } catch (error) {
    console.error('❌ Erro de autenticação:', error)
    throw error
  }
}

// ============================================
// FUNÇÕES PÚBLICAS (READ)
// ============================================

export const getDestinations = async () => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('name')
    
    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao buscar destinos:', error)
    return { data: [] }
  }
}

export const getDestinationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    
    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Erro ao buscar destino:', error)
    return { data: null }
  }
}

export const getFeaturedDestinations = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('rating', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao buscar destinos em destaque:', error)
    return { data: [] }
  }
}

export const searchDestinations = async (query) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .or(`name.ilike.%${query}%,province.ilike.%${query}%,description.ilike.%${query}%,full_description.ilike.%${query}%,attractions_description.ilike.%${query}%`)
      .order('name')
    
    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao pesquisar destinos:', error)
    return { data: [] }
  }
}

// ============================================
// FUNÇÕES ADMIN (CRUD) - COM VALIDAÇO COMPLETA
// ============================================

/**
 * Obtém a lista de campos que existem na tabela destinations
 */
const getValidFields = () => {
  return [
    'id', 'name', 'province', 'description', 
    'full_description',        // 🆕 História / Descrição completa
    'attractions_description', // 🆕 O que fazer / Atrações
    'image_url',
    'cover_image', 'gallery', 'attractions', 'rating', 'highlights',
    'best_time_to_visit', 'best_time', 'language', 'currency',
    'latitude', 'longitude', 'address', 'is_featured',
    'created_at', 'updated_at', 'status', 'approved_at', 'rejection_reason'
  ]
}

/**
 * Valida e sanitiza os dados antes de inserir/atualizar
 */
const validateAndSanitizeData = (data, isUpdate = false) => {
  const errors = []
  const sanitized = {}
  
  console.log('🔍 Validando dados:', data)
  
  try {
    // Campos obrigatórios para criação
    if (!isUpdate) {
      if (!data.name || data.name.trim() === '') {
        errors.push('Nome do destino é obrigatório')
      }
      if (!data.province || data.province.trim() === '') {
        errors.push('Província é obrigatória')
      }
    }
    
    // Name
    if (data.name !== undefined) {
      sanitized.name = validateString(data.name, 'Nome', { required: true, maxLength: 200 })
    }
    
    // Province
    if (data.province !== undefined) {
      sanitized.province = validateString(data.province, 'Província', { required: true, maxLength: 100 })
    }
    
    // Description (curta)
    if (data.description !== undefined) {
      sanitized.description = validateString(data.description, 'Descrição', { maxLength: 500 })
    }
    
    // 🆕 Full Description (História completa)
    if (data.full_description !== undefined) {
      sanitized.full_description = validateString(data.full_description, 'Descrição completa', { maxLength: 5000 })
    }
    
    // 🆕 Attractions Description (O que fazer)
    if (data.attractions_description !== undefined) {
      sanitized.attractions_description = validateString(data.attractions_description, 'Atrações turísticas', { maxLength: 3000 })
    }
    
    // Address
    if (data.address !== undefined) {
      sanitized.address = validateString(data.address, 'Endereço', { maxLength: 500 })
    }
    
    // Language
    if (data.language !== undefined) {
      sanitized.language = validateString(data.language, 'Idioma', { maxLength: 50 })
    }
    
    // Currency
    if (data.currency !== undefined) {
      sanitized.currency = validateString(data.currency, 'Moeda', { maxLength: 10 })
    }
    
    // Best time to visit
    if (data.best_time_to_visit !== undefined) {
      sanitized.best_time_to_visit = validateString(data.best_time_to_visit, 'Melhor época', { maxLength: 500 })
    }
    
    if (data.best_time !== undefined) {
      sanitized.best_time = validateString(data.best_time, 'Melhor época', { maxLength: 500 })
    }
    
    // Latitude
    if (data.latitude !== undefined) {
      try {
        sanitized.latitude = validateCoordinate(data.latitude, 'latitude')
      } catch (error) {
        errors.push(error.message)
      }
    }
    
    // Longitude
    if (data.longitude !== undefined) {
      try {
        sanitized.longitude = validateCoordinate(data.longitude, 'longitude')
      } catch (error) {
        errors.push(error.message)
      }
    }
    
    // Rating
    if (data.rating !== undefined) {
      try {
        sanitized.rating = validateRating(data.rating)
      } catch (error) {
        errors.push(error.message)
      }
    }
    
    // Attractions (número)
    if (data.attractions !== undefined) {
      try {
        sanitized.attractions = validateAttractions(data.attractions)
      } catch (error) {
        errors.push(error.message)
      }
    }
    
    // Highlights
    if (data.highlights !== undefined) {
      sanitized.highlights = validateArray(data.highlights)
    }
    
    // Gallery
    if (data.gallery !== undefined) {
      sanitized.gallery = validateArray(data.gallery)
    }
    
    // Is featured
    if (data.is_featured !== undefined) {
      sanitized.is_featured = validateBoolean(data.is_featured)
    }
    
    // ============================================
    // STATUS - PERMITIR ATUALIZAÇO
    // ============================================
    if (data.status !== undefined) {
      const validStatus = ['pending', 'approved', 'rejected']
      if (!validStatus.includes(data.status)) {
        errors.push(`Status inválido. Valores permitidos: ${validStatus.join(', ')}`)
      } else {
        sanitized.status = data.status
      }
    }
    
    // Approved at
    if (data.approved_at !== undefined) {
      sanitized.approved_at = data.approved_at
    }
    
    // Rejection reason
    if (data.rejection_reason !== undefined) {
      sanitized.rejection_reason = validateString(data.rejection_reason, 'Motivo da rejeição', { maxLength: 500 })
    }
    
    // ============================================
    // IMAGEM
    // ============================================
    const imageUrl = data.image_url || data.cover_image || data.image || ''
    
    if (imageUrl) {
      sanitized.image_url = validateImageUrl(imageUrl)
      sanitized.cover_image = validateImageUrl(imageUrl)
      sanitized.image = validateImageUrl(imageUrl)
    }
    
    console.log('📸 Dados de imagem processados:', {
      image_url: sanitized.image_url,
      cover_image: sanitized.cover_image,
      image: sanitized.image
    })
    
    // Timestamps
    if (!isUpdate) {
      sanitized.created_at = new Date().toISOString()
    }
    sanitized.updated_at = new Date().toISOString()
    
    // Se houver erros, lançar exceção com todos
    if (errors.length > 0) {
      throw new Error(`Erros de validação:\n${errors.join('\n')}`)
    }
    
    console.log('✅ Dados validados e sanitizados:', sanitized)
    return sanitized
    
  } catch (error) {
    console.error('❌ Erro na validação:', error)
    throw error
  }
}

export const createDestination = async (destinationData) => {
  try {
    console.log('📝 Criando destino - Dados recebidos:', destinationData)
    
    // Verificar autenticação
    await checkAuthAndPermissions()
    
    // Validar e sanitizar os dados
    const sanitizedData = validateAndSanitizeData(destinationData, false)
    
    // Verificar se os campos obrigatórios foram preenchidos
    if (!sanitizedData.name || sanitizedData.name.trim() === '') {
      throw new Error('Nome do destino é obrigatório')
    }
    if (!sanitizedData.province || sanitizedData.province.trim() === '') {
      throw new Error('Província é obrigatória')
    }
    
    // Se status não foi definido, definir como 'pending'
    if (!sanitizedData.status) {
      sanitizedData.status = 'pending'
    }
    
    console.log('📤 Inserindo no banco:', sanitizedData)
    
    const { data, error } = await supabase
      .from('destinations')
      .insert([sanitizedData])
      .select()
      .maybeSingle()
    
    if (error) {
      console.error('❌ Erro Supabase ao criar:', error)
      
      if (error.message?.includes('numeric field overflow')) {
        throw new Error('Erro: Valor numérico fora do intervalo permitido. Verifique latitude (-90 a 90), longitude (-180 a 180) e rating (0 a 5).')
      }
      
      if (error.message?.includes('row-level security')) {
        throw new Error('Erro de permissão: Você não tem autorização para criar destinos. Verifique se está logado como administrador.')
      }
      
      throw error
    }
    
    console.log('✅ Destino criado com sucesso:', data)
    return { data }
    
  } catch (error) {
    console.error('❌ Erro ao criar destino:', error)
    throw error
  }
}

export const updateDestination = async (id, updates) => {
  try {
    if (!id) {
      throw new Error('ID do destino é obrigatório')
    }
    
    console.log('📝 Atualizando destino - ID:', id, 'Dados:', updates)
    
    // Verificar autenticação
    await checkAuthAndPermissions()
    
    // Validar e sanitizar os dados
    const sanitizedData = validateAndSanitizeData(updates, true)
    
    // Remover campos que não podem ser atualizados
    delete sanitizedData.id
    delete sanitizedData.created_at
    
    console.log('📤 Atualizando no banco:', sanitizedData)
    
    const { data, error } = await supabase
      .from('destinations')
      .update(sanitizedData)
      .eq('id', id)
      .select()
      .maybeSingle()
    
    if (error) {
      console.error('❌ Erro Supabase ao atualizar:', error)
      
      if (error.message?.includes('numeric field overflow')) {
        throw new Error('Erro: Valor numérico fora do intervalo permitido. Verifique latitude (-90 a 90), longitude (-180 a 180) e rating (0 a 5).')
      }
      
      if (error.message?.includes('row-level security')) {
        throw new Error('Erro de permissão: Você não tem autorização para atualizar destinos.')
      }
      
      throw error
    }
    
    console.log('✅ Destino atualizado com sucesso:', data)
    return { data }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar destino:', error)
    throw error
  }
}

export const deleteDestination = async (id) => {
  try {
    if (!id) {
      throw new Error('ID do destino é obrigatório')
    }
    
    console.log('🗑️ Excluindo destino:', id)
    
    // Verificar autenticação
    await checkAuthAndPermissions()
    
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Erro Supabase ao excluir:', error)
      
      if (error.message?.includes('row-level security')) {
        throw new Error('Erro de permissão: Você não tem autorização para excluir destinos.')
      }
      
      throw error
    }
    
    console.log('✅ Destino excluído com sucesso:', id)
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro ao excluir destino:', error)
    throw error
  }
}

// ============================================
// FUNÇO PARA UPLOAD DE IMAGEM
// ============================================

export const uploadDestinationImage = async (file, destinationId) => {
  try {
    if (!file) {
      console.error('❌ Nenhum arquivo selecionado')
      throw new Error('Nenhum arquivo selecionado')
    }
    
    console.log('📤 uploadDestinationImage chamado com:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      destinationId: destinationId || 'temp'
    })
    
    const id = destinationId || `temp-${Date.now()}`
    
    // Validar tamanho
    if (file.size > VALIDATION.IMAGE.MAX_SIZE) {
      throw new Error(`A imagem deve ter menos de ${VALIDATION.IMAGE.MAX_SIZE / 1024 / 1024}MB`)
    }
    
    // Validar tipo
    if (!VALIDATION.IMAGE.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido. Use: ${VALIDATION.IMAGE.ALLOWED_TYPES.join(', ')}`)
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}-${Date.now()}.${fileExt}`
    const filePath = `destinations/${fileName}`
    
    console.log('📤 Enviando imagem para o bucket "destinations":', filePath)
    
    // PRIMEIRA TENTATIVA: Bucket 'destinations'
    let publicUrl = null
    let uploadError = null
    
    try {
      const { error } = await supabase.storage
        .from('destinations')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        })
      
      uploadError = error
      
      if (!error) {
        const { data: { publicUrl: url } } = supabase.storage
          .from('destinations')
          .getPublicUrl(filePath)
        publicUrl = url
        console.log('✅ Upload no bucket "destinations" bem-sucedido!')
        console.log('📸 URL:', publicUrl)
      } else {
        console.log('⚠️ Erro no bucket "destinations":', error.message)
      }
    } catch (err) {
      console.log('⚠️ Exceção no bucket "destinations":', err.message)
      uploadError = err
    }
    
    // SEGUNDA TENTATIVA: Bucket 'public' se o primeiro falhou
    if (!publicUrl && uploadError) {
      console.log('🔄 Tentando bucket "public"...')
      
      const publicPath = `destinations/${fileName}`
      
      try {
        const { error } = await supabase.storage
          .from('public')
          .upload(publicPath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          })
        
        if (!error) {
          const { data: { publicUrl: url } } = supabase.storage
            .from('public')
            .getPublicUrl(publicPath)
          publicUrl = url
          console.log('✅ Upload no bucket "public" bem-sucedido!')
          console.log('📸 URL:', publicUrl)
        } else {
          console.error('❌ Erro no bucket "public":', error.message)
          throw new Error(`Erro no upload: ${error.message}`)
        }
      } catch (err) {
        console.error('❌ Exceção no bucket "public":', err.message)
        throw new Error(`Erro no upload: ${err.message}`)
      }
    }
    
    if (!publicUrl) {
      throw new Error('Não foi possível obter a URL da imagem após o upload')
    }
    
    console.log('✅ Upload concluído com sucesso! URL final:', publicUrl)
    return publicUrl
    
  } catch (error) {
    console.error('❌ Erro no upload da imagem:', error)
    throw error
  }
}

// ============================================
// FUNÇO PARA REMOVER IMAGEM DO STORAGE
// ============================================

export const deleteDestinationImage = async (imageUrl) => {
  try {
    if (!imageUrl) return { success: true }
    
    let urlParts = imageUrl.split('/destinations/')
    if (urlParts.length < 2) {
      urlParts = imageUrl.split('/public/')
      if (urlParts.length < 2) {
        console.log('⚠️ URL não parece ser de um bucket conhecido')
        return { success: true }
      }
    }
    
    const filePath = urlParts[1]
    const bucket = imageUrl.includes('/public/') ? 'public' : 'destinations'
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      console.error('Erro ao remover imagem:', error)
      return { success: false, error }
    }
    
    console.log('✅ Imagem removida:', filePath)
    return { success: true }
    
  } catch (error) {
    console.error('❌ Erro ao remover imagem:', error)
    return { success: false, error }
  }
}

// ============================================
// FUNÇO PARA CORRIGIR DESTINOS SEM IMAGEM
// ============================================

export const fixDestinationsWithoutImage = async () => {
  try {
    console.log('🔍 Buscando destinos sem imagem...')
    
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .or('image_url.is.null,image_url.eq.,cover_image.is.null,cover_image.eq.')
    
    if (error) throw error
    
    console.log(`🔍 Encontrados ${destinations?.length || 0} destinos sem imagem`)
    
    const defaultImage = 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=400&q=80'
    const results = []
    
    for (const dest of destinations || []) {
      const { error: updateError } = await supabase
        .from('destinations')
        .update({
          image_url: defaultImage,
          cover_image: defaultImage,
          image: defaultImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', dest.id)
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar ${dest.name}:`, updateError)
        results.push({ name: dest.name, success: false, error: updateError.message })
      } else {
        console.log(`✅ Imagem adicionada para: ${dest.name}`)
        results.push({ name: dest.name, success: true })
      }
    }
    
    console.log('📊 Resultado da correção:', {
      total: destinations?.length || 0,
      sucessos: results.filter(r => r.success).length,
      erros: results.filter(r => !r.success).length
    })
    
    return { success: true, results }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir destinos:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// FUNÇO PARA VERIFICAR A ESTRUTURA DA TABELA
// ============================================

export const getDestinationTableInfo = async () => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Erro ao obter informações da tabela:', error)
      return { columns: [], error }
    }
    
    const columns = data && data.length > 0 ? Object.keys(data[0]) : []
    console.log('📊 Colunas da tabela destinations:', columns)
    return { columns, data: data?.[0] || null }
    
  } catch (error) {
    console.error('Erro:', error)
    return { columns: [], error }
  }
}

// ============================================
// FUNÇO AUXILIAR PARA INSERIR DADOS EM MASSA
// ============================================

export const bulkInsertDestinations = async (destinations) => {
  const results = {
    success: [],
    errors: []
  }
  
  for (const destination of destinations) {
    try {
      const result = await createDestination(destination)
      results.success.push(result.data)
    } catch (error) {
      results.errors.push({
        data: destination,
        error: error.message
      })
    }
  }
  
  console.log('📊 Resultado do bulk insert:', {
    success: results.success.length,
    errors: results.errors.length
  })
  
  return results
}

// ============================================
// EXPORTAÇO DAS CONSTANTES DE VALIDAÇO
// ============================================

export { VALIDATION }