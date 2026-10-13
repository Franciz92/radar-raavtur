import { supabase } from './supabase'

// Buscar todos os utilizadores (admin)
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data: data || [] }
  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error)
    return { data: [] }
  }
}

// Buscar utilizador por ID
export const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Erro ao buscar utilizador:', error)
    throw error
  }
}

// Atualizar utilizador (admin)
export const updateUser = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error)
    throw error
  }
}

// Excluir utilizador (admin)
export const deleteUser = async (id) => {
  try {
    // Excluir da tabela auth.users (requer admin)
    const { error } = await supabase.auth.admin.deleteUser(id)
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao excluir utilizador:', error)
    throw error
  }
}