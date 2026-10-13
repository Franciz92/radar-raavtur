import { supabase } from './supabase'

export const getBlogPosts = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data: data || [] }
  } catch (err) {
    console.error('Erro ao buscar posts:', err)
    return { data: [] }
  }
}

export const getBlogPostById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return { data }
  } catch (err) {
    console.error('Erro ao buscar post:', err)
    return { data: null }
  }
}

export const createBlogPost = async (postData) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(postData)
    .select()
    .single()
  if (error) throw error
  return { data }
}

export const deleteBlogPost = async (id) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
  if (error) throw error
  return { success: true }
}