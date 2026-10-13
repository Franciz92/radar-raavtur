import { supabase } from './supabase'

export const createCompany = async (companyData) => {
  const { data, error } = await supabase
    .from('companies')
    .insert(companyData)
    .select()
    .single()
  if (error) throw error
  return { data }
}

export const updateCompany = async (id, updates) => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { data }
}

export const getMyCompany = async (userId) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return { data: null }
  return { data }
}

export const checkNifExists = async (nif) => {
  const { data, error } = await supabase
    .from('companies')
    .select('id')
    .eq('nif', nif)
    .single()
  return { exists: !!data }
}

export const uploadDocument = async (companyId, docType, file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${companyId}-${docType}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('company-documents')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('company-documents')
    .getPublicUrl(fileName)
  
  return publicUrl
}

export const addCompanyHistory = async (companyId, action, details) => {
  await supabase.from('company_history').insert({
    company_id: companyId,
    action,
    details,
  })
}