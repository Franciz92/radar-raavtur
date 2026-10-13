// src/services/supabase.js

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇO DO SUPABASE
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas! Usando valores padrão...');
}

export const supabase = createClient(
  supabaseUrl || 'https://jcprdnatipbbwxiyewgg.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcHJkbmF0aXBwYnd4aXlld2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI3NjU3MjQsImV4cCI6MjAyODM0MTcyNH0.7iVxwHcrNxNJhS9q6OG3R0sGq3wPxv4HZxQvBqU2KjU',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'apikey': supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcHJkbmF0aXBwYnd4aXlld2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI3NjU3MjQsImV4cCI6MjAyODM0MTcyNH0.7iVxwHcrNxNJhS9q6OG3R0sGq3wPxv4HZxQvBqU2KjU',
      },
    },
  }
);

console.log('✅ Supabase client inicializado');

// ============================================
// FUNÇÕES DE AUTENTICAÇO
// ============================================

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao fazer login com Google:', error);
    throw error;
  }
};

export const signUp = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'user',
          phone: userData.phone || '',
          location: userData.location || '',
        },
      },
    });
    if (error) throw error;
    if (data.user) {
      await createUserProfile(data.user.id, userData);
    }
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar conta:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao sair:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('❌ Erro ao buscar sessão:', error);
    return null;
  }
};

// ============================================
// FUNÇÕES DE PERFIL
// ============================================

export const createUserProfile = async (userId, userData) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        phone: userData.phone || '',
        location: userData.location || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar perfil:', error);
    return false;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES DE EMPRESA
// ============================================

export const createCompany = async (companyData) => {
  try {
    const insertData = {
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone || '',
      website: companyData.website || '',
      description: companyData.description || '',
      category: companyData.category || '',
      nif: companyData.nif || '',
      logo: companyData.logo || null,
      cover_image: companyData.cover_image || null,
      address: companyData.address || {},
      social_media: companyData.social_media || {},
      working_hours: companyData.working_hours || {},
      payment_methods: companyData.payment_methods || [],
      status: 'pending_approval',
      user_id: companyData.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('companies')
      .insert([insertData])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar empresa:', error);
    throw error;
  }
};

export const getUserCompany = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    return null;
  }
};

export const getCompanyById = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    return null;
  }
};

export const getCompanies = async (filters = {}) => {
  try {
    let query = supabase.from('companies').select('*');
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
    }
    if (filters.limit) query = query.limit(filters.limit);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    return [];
  }
};

export const updateCompany = async (companyId, updates) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', companyId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
    throw error;
  }
};

export const approveCompany = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao aprovar empresa:', error);
    throw error;
  }
};

export const rejectCompany = async (companyId, reason) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao rejeitar empresa:', error);
    throw error;
  }
};

export const deleteCompany = async (companyId) => {
  try {
    // 1. Deletar serviços relacionados
    const { error: servicesError } = await supabase
      .from('company_services')
      .delete()
      .eq('company_id', companyId);
    
    if (servicesError) {
      console.error('❌ Erro ao deletar serviços da empresa:', servicesError);
    }

    // 2. Deletar contatos relacionados
    const { error: contactsError } = await supabase
      .from('company_contacts')
      .delete()
      .eq('company_id', companyId);
    
    if (contactsError) {
      console.error('❌ Erro ao deletar contatos da empresa:', contactsError);
    }

    // 3. Deletar galeria relacionada
    const { error: galleryError } = await supabase
      .from('company_gallery')
      .delete()
      .eq('company_id', companyId);
    
    if (galleryError) {
      console.error('❌ Erro ao deletar galeria da empresa:', galleryError);
    }

    // 4. Deletar métodos de pagamento relacionados
    const { error: paymentError } = await supabase
      .from('company_payment_methods')
      .delete()
      .eq('company_id', companyId);
    
    if (paymentError) {
      console.error('❌ Erro ao deletar métodos de pagamento da empresa:', paymentError);
    }

    // 5. Deletar reservas relacionadas
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .eq('company_id', companyId);
    
    if (bookingsError) {
      console.error('❌ Erro ao deletar reservas da empresa:', bookingsError);
    }

    // 6. Deletar avaliações relacionadas
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .eq('company_id', companyId);
    
    if (reviewsError) {
      console.error('❌ Erro ao deletar avaliações da empresa:', reviewsError);
    }

    // 7. Finalmente, deletar a empresa
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) throw error;
    
    console.log('✅ Empresa deletada com sucesso:', companyId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar empresa:', error);
    throw error;
  }
};

export const getCompanyWithStats = async (companyId) => {
  try {
    const company = await getCompanyById(companyId);
    if (!company) return null;

    const stats = await getCompanyStats(companyId);
    const services = await getCompanyServices(companyId);
    const reviews = await getCompanyReviews(companyId, 5);

    return {
      ...company,
      stats,
      services: services || [],
      recentReviews: reviews || [],
      totalServices: services?.length || 0,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar empresa com estatísticas:', error);
    return null;
  }
};

export const getCompaniesByStatus = async (status) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar empresas com status ${status}:`, error);
    return [];
  }
};

export const getCompaniesCount = async () => {
  try {
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ Erro ao contar empresas:', error);
    return 0;
  }
};

export const updateCompanyStatus = async (companyId, status, reason = null) => {
  try {
    const updates = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updates.rejected_at = new Date().toISOString();
      updates.rejection_reason = reason;
    } else if (status === 'suspended') {
      updates.suspended_at = new Date().toISOString();
      updates.suspension_reason = reason;
    }

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar status da empresa:', error);
    throw error;
  }
};

export const getFeaturedCompanies = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar empresas em destaque:', error);
    return [];
  }
};

export const searchCompanies = async (filters) => {
  try {
    let query = supabase.from('companies').select('*').eq('status', 'approved');
    
    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.city) {
      query = query.eq('address->>city', filters.city);
    }
    
    if (filters.province) {
      query = query.eq('address->>province', filters.province);
    }
    
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    
    if (filters.sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (filters.sortBy === 'name') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    return [];
  }
};

export const getCompanyCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('category')
      .eq('status', 'approved');
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
    return categories;
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return [];
  }
};

// ============================================
// FUNÇÕES DE DESTINOS
// ============================================

export const getDestinations = async () => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('status', 'active')
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar destinos:', error);
    return [];
  }
};

export const getDestinationById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar destino:', error);
    return null;
  }
};

export const getDestinationProvinces = async () => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('province')
      .order('province');
    if (error) throw error;
    const provinces = [...new Set(data.map(item => item.province).filter(Boolean))];
    return provinces;
  } catch (error) {
    console.error('❌ Erro ao buscar províncias:', error);
    return [];
  }
};

export const getDestinationsByProvince = async (province) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('province', province)
      .eq('status', 'active')
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar destinos por província:', error);
    return [];
  }
};

export const getDestinationsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar destinos por categoria:', error);
    return [];
  }
};

export const getFeaturedDestinations = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar destinos em destaque:', error);
    return [];
  }
};

export const getDestinationsWithCoordinates = async (options = {}) => {
  try {
    let query = supabase
      .from('destinations')
      .select('*')
      .not('coordinates', 'is', null);
    
    if (options.province) {
      query = query.eq('province', options.province);
    }
    
    if (options.category) {
      query = query.eq('category', options.category);
    }
    
    if (options.ids && options.ids.length > 0) {
      query = query.in('id', options.ids);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(destination => ({
      ...destination,
      position: destination.coordinates ? {
        lat: destination.coordinates.lat || destination.coordinates.latitude,
        lng: destination.coordinates.lng || destination.coordinates.longitude,
      } : null,
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar destinos com coordenadas:', error);
    return [];
  }
};

export const getNearbyDestinations = async (lat, lng, radius = 10, limit = 20) => {
  try {
    const destinations = await getDestinationsWithCoordinates({ limit: 100 });
    
    const nearby = destinations
      .filter(d => d.coordinates)
      .map(d => {
        const distance = calculateDistance(
          lat,
          lng,
          d.coordinates.lat || d.coordinates.latitude,
          d.coordinates.lng || d.coordinates.longitude,
        );
        return { ...d, distance: Math.round(distance * 10) / 10 };
      })
      .filter(d => d.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return nearby;
  } catch (error) {
    console.error('❌ Erro ao buscar destinos próximos:', error);
    return [];
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const searchDestinations = async (filters) => {
  try {
    let query = supabase.from('destinations').select('*').eq('status', 'active');
    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }
    if (filters.province) query = query.eq('province', filters.province);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('name', { ascending: true });
    }
    if (filters.limit) query = query.limit(filters.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar destinos:', error);
    return [];
  }
};

export const createDestination = async (destinationData) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .insert([{
        name: destinationData.name,
        province: destinationData.province,
        category: destinationData.category || 'turismo',
        description: destinationData.description,
        image: destinationData.image || null,
        gallery: destinationData.gallery || [],
        rating: destinationData.rating || 0,
        total_reviews: destinationData.total_reviews || 0,
        coordinates: destinationData.coordinates || null,
        features: destinationData.features || [],
        status: destinationData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar destino:', error);
    throw error;
  }
};

export const updateDestination = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar destino:', error);
    throw error;
  }
};

export const deleteDestination = async (id) => {
  try {
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar destino:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE SERVIÇOS DA EMPRESA
// ============================================

export const getCompanyServices = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error);
    return [];
  }
};

export const createCompanyService = async (serviceData) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .insert([{
        company_id: serviceData.companyId,
        name: serviceData.name,
        category: serviceData.category,
        description: serviceData.description,
        price: serviceData.price,
        currency: serviceData.currency || 'Kz',
        duration: serviceData.duration,
        location: serviceData.location,
        images: serviceData.images || [],
        features: serviceData.features || [],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar serviço:', error);
    throw error;
  }
};

export const updateCompanyService = async (serviceId, updates) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error);
    throw error;
  }
};

export const deleteCompanyService = async (serviceId) => {
  try {
    const { error } = await supabase
      .from('company_services')
      .delete()
      .eq('id', serviceId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar serviço:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE CONTATOS DA EMPRESA
// ============================================

export const getCompanyContacts = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('company_contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error);
    return [];
  }
};

export const createCompanyContact = async (contactData) => {
  try {
    const { data, error } = await supabase
      .from('company_contacts')
      .insert([{
        company_id: contactData.companyId,
        type: contactData.type,
        value: contactData.value,
        label: contactData.label || '',
        is_primary: contactData.is_primary || false,
        created_at: new Date().toISOString(),
      }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar contato:', error);
    throw error;
  }
};

export const deleteCompanyContact = async (contactId) => {
  try {
    const { error } = await supabase
      .from('company_contacts')
      .delete()
      .eq('id', contactId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar contato:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE GALERIA DA EMPRESA
// ============================================

export const getCompanyGallery = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('company_gallery')
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar galeria:', error);
    return [];
  }
};

export const createCompanyGalleryImage = async (imageData) => {
  try {
    const { data, error } = await supabase
      .from('company_gallery')
      .insert([{
        company_id: imageData.companyId,
        image_url: imageData.image_url,
        title: imageData.title || '',
        description: imageData.description || '',
        category: imageData.category || '',
        is_cover: imageData.is_cover || false,
        sort_order: imageData.sort_order || 0,
        created_at: new Date().toISOString(),
      }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao adicionar imagem à galeria:', error);
    throw error;
  }
};

export const deleteCompanyGalleryImage = async (imageId) => {
  try {
    const { error } = await supabase
      .from('company_gallery')
      .delete()
      .eq('id', imageId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar imagem da galeria:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE MÉTODOS DE PAGAMENTO
// ============================================

export const getCompanyPaymentMethods = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('company_payment_methods')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar métodos de pagamento:', error);
    return [];
  }
};

export const createCompanyPaymentMethod = async (methodData) => {
  try {
    const { data, error } = await supabase
      .from('company_payment_methods')
      .insert([{
        company_id: methodData.companyId,
        type: methodData.type,
        name: methodData.name,
        description: methodData.description || '',
        config: methodData.config || {},
        is_active: true,
        is_default: methodData.is_default || false,
        created_at: new Date().toISOString(),
      }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar método de pagamento:', error);
    throw error;
  }
};

export const deleteCompanyPaymentMethod = async (methodId) => {
  try {
    const { error } = await supabase
      .from('company_payment_methods')
      .delete()
      .eq('id', methodId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar método de pagamento:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE NOTIFICAÇÕES
// ============================================

export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar notificações:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    return false;
  }
};

export const getUnreadCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ Erro ao contar notificações:', error);
    return 0;
  }
};

// ============================================
// FUNÇÕES DE RESERVAS
// ============================================

export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        service_id: bookingData.serviceId,
        company_id: bookingData.companyId,
        user_id: bookingData.userId,
        date: bookingData.date,
        time: bookingData.time,
        guests: bookingData.guests || 1,
        price: bookingData.price,
        total_amount: bookingData.totalAmount,
        status: 'pending',
        notes: bookingData.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar reserva:', error);
    throw error;
  }
};

export const getUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, company_services:service_id (*), companies:company_id (*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar reservas:', error);
    return [];
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar reserva:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES PARA PÁGINAS DE CATEGORIAS
// ============================================

export const getHotels = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Hotel')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar hotéis:', error);
    return [];
  }
};

export const getRestaurants = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Restaurante')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar restaurantes:', error);
    return [];
  }
};

export const getAgencies = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Agência de viagens')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar agências:', error);
    return [];
  }
};

export const getGuides = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Guia turístico')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar guias:', error);
    return [];
  }
};

export const getExperiences = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Experiência')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar experiências:', error);
    return [];
  }
};

export const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Evento')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    return [];
  }
};

export const getOtherServices = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', 'Outro')
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar outros serviços:', error);
    return [];
  }
};

export const getCompaniesByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', category)
      .eq('status', 'approved')
      .order('rating', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar empresas da categoria ${category}:`, error);
    return [];
  }
};

// ============================================
// FUNÇÕES PARA HOTÉIS, RESTAURANTES, EXPERIÊNCIAS, EVENTOS (VIA SERVICES)
// ============================================

export const getHotelServices = async () => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*, companies:company_id (*)')
      .eq('category', 'Hotel')
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar serviços de hotéis:', error);
    return [];
  }
};

export const getRestaurantServices = async () => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*, companies:company_id (*)')
      .eq('category', 'Restaurante')
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar serviços de restaurantes:', error);
    return [];
  }
};

export const getExperienceServices = async () => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*, companies:company_id (*)')
      .eq('category', 'Experiência')
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar serviços de experiências:', error);
    return [];
  }
};

export const getEventServices = async () => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*, companies:company_id (*)')
      .eq('category', 'Evento')
      .in('status', ['active', 'approved'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar serviços de eventos:', error);
    return [];
  }
};

// ============================================
// FUNÇÕES DE BLOG
// ============================================

export const getBlogPosts = async (limit = 10, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, profiles:author_id (name, email, avatar_url)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar posts do blog:', error);
    return [];
  }
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, profiles:author_id (name, email, avatar_url)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar post do blog:', error);
    return null;
  }
};

export const createBlogPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: postData.title,
        slug: postData.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
        content: postData.content,
        excerpt: postData.excerpt || '',
        category: postData.category || 'general',
        tags: postData.tags || [],
        image: postData.image || null,
        author_id: postData.authorId,
        status: postData.status || 'draft',
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar post:', error);
    throw error;
  }
};

export const updateBlogPost = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        ...(updates.status === 'published' && { published_at: new Date().toISOString() })
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id) => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar post:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE FAVORITOS
// ============================================

export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error);
    return [];
  }
};

export const addFavorite = async (favoriteData) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: favoriteData.userId,
        item_id: favoriteData.itemId,
        item_type: favoriteData.itemType,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao adicionar favorito:', error);
    throw error;
  }
};

export const removeFavorite = async (userId, itemId, itemType) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao remover favorito:', error);
    return false;
  }
};

export const isFavorite = async (userId, itemId, itemType) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('❌ Erro ao verificar favorito:', error);
    return false;
  }
};

// ============================================
// FUNÇÕES DE AVALIAÇÕES (REVIEWS)
// ============================================

export const createReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        service_id: reviewData.serviceId,
        user_id: reviewData.userId,
        company_id: reviewData.companyId,
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        images: reviewData.images || [],
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar avaliação:', error);
    throw error;
  }
};

export const getServiceReviews = async (serviceId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles:user_id (name, email, avatar_url)')
      .eq('service_id', serviceId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações:', error);
    return [];
  }
};

export const getCompanyReviews = async (companyId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles:user_id (name, email, avatar_url), company_services:service_id (name, category)')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações da empresa:', error);
    return [];
  }
};

export const approveReview = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    if (data.company_id) {
      await updateCompanyRating(data.company_id);
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao aprovar avaliação:', error);
    throw error;
  }
};

export const rejectReview = async (reviewId, reason) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao rejeitar avaliação:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar avaliação:', error);
    return false;
  }
};

export const updateCompanyRating = async (companyId) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('company_id', companyId)
      .eq('status', 'approved');

    if (error) throw error;

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      const { data, error: updateError } = await supabase
        .from('companies')
        .update({
          rating: Math.round(averageRating * 10) / 10,
          total_reviews: reviews.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao atualizar rating da empresa:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================

export const getCompanyStats = async (companyId) => {
  try {
    const { count: totalBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    if (bookingError) throw bookingError;

    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('amount')
      .eq('company_id', companyId)
      .eq('status', 'confirmed');
    if (paymentError) throw paymentError;

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const { count: totalReviews, error: reviewError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);
    if (reviewError) throw reviewError;

    return {
      totalBookings: totalBookings || 0,
      totalRevenue: totalRevenue,
      totalReviews: totalReviews || 0,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return null;
  }
};

export const getAdminStats = async () => {
  try {
    const { count: totalUsers, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    if (userError) throw userError;

    const { count: totalCompanies, error: companyError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    if (companyError) throw companyError;

    const { count: pendingCompanies, error: pendingError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');
    if (pendingError) throw pendingError;

    const { count: totalBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    if (bookingError) throw bookingError;

    return {
      totalUsers: totalUsers || 0,
      totalCompanies: totalCompanies || 0,
      pendingCompanies: pendingCompanies || 0,
      totalBookings: totalBookings || 0,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas admin:', error);
    return null;
  }
};

// ============================================
// FUNÇÕES DE UPLOAD/STORAGE
// ============================================

export const uploadFile = async (bucket, filePath, file, options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: options.upsert || false,
        contentType: options.contentType || file.type,
      });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { ...data, publicUrl: urlData.publicUrl };
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    throw error;
  }
};

export const deleteFile = async (bucket, filePath) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    throw error;
  }
};

// ============================================
// FUNÇÕES DE PAGAMENTOS
// ============================================

export const updateBookingPayment = async (bookingId, paymentStatus, paymentDetails = {}) => {
  try {
    // Verificar se já existe um pagamento para esta reserva
    const { data: existingPayment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    let result;

    if (existingPayment) {
      // Atualizar pagamento existente
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: paymentStatus,
          method: paymentDetails.method || existingPayment.method,
          reference: paymentDetails.reference || existingPayment.reference,
          metadata: {
            ...existingPayment.metadata,
            ...paymentDetails.metadata,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString(),
          ...(paymentStatus === 'paid' && { confirmed_at: new Date().toISOString() }),
          ...(paymentStatus === 'refunded' && { refunded_at: new Date().toISOString() })
        })
        .eq('id', existingPayment.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar novo pagamento
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          booking_id: bookingId,
          user_id: paymentDetails.userId || null,
          company_id: paymentDetails.companyId || null,
          amount: paymentDetails.amount || 0,
          currency: paymentDetails.currency || 'Kz',
          method: paymentDetails.method || 'cash',
          status: paymentStatus,
          reference: paymentDetails.reference || null,
          metadata: paymentDetails.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(paymentStatus === 'paid' && { confirmed_at: new Date().toISOString() })
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Se o pagamento foi pago/confirmado, atualizar o status da reserva
    if (paymentStatus === 'paid' || paymentStatus === 'confirmed') {
      await updateBookingStatus(bookingId, 'confirmed');
    }

    // Se o pagamento foi reembolsado, cancelar a reserva
    if (paymentStatus === 'refunded') {
      await updateBookingStatus(bookingId, 'cancelled', 'Pagamento reembolsado');
    }

    return result;
  } catch (error) {
    console.error('❌ Erro ao atualizar pagamento da reserva:', error);
    throw error;
  }
};

export const getBookingPayment = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar pagamento da reserva:', error);
    return null;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        booking_id: paymentData.bookingId,
        user_id: paymentData.userId,
        company_id: paymentData.companyId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'Kz',
        method: paymentData.method || 'cash',
        status: 'pending',
        reference: paymentData.reference || null,
        metadata: paymentData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    if (data.booking_id) {
      await updateBookingStatus(data.booking_id, 'confirmed');
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao confirmar pagamento:', error);
    throw error;
  }
};

export const getUserPayments = async (userId, filters = {}) => {
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id (
          id,
          date,
          time,
          service_id,
          company_services:service_id (name, category),
          companies:company_id (name, logo)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.method) {
      query = query.eq('method', filters.method);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos do usuário:', error);
    return [];
  }
};

export const getCompanyPayments = async (companyId, filters = {}) => {
  try {
    let query = supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id (
          id,
          date,
          time,
          user_id,
          profiles:user_id (name, email, phone)
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar pagamentos da empresa:', error);
    return [];
  }
};

export const refundPayment = async (paymentId, reason, amount = null) => {
  try {
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (findError) throw findError;

    if (payment.status === 'refunded') {
      throw new Error('Este pagamento já foi reembolsado');
    }

    const refundAmount = amount || payment.amount;

    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refundAmount,
        refund_reason: reason,
        updated_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          refund: {
            amount: refundAmount,
            reason: reason,
            processed_at: new Date().toISOString()
          }
        }
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;

    if (data.booking_id) {
      await updateBookingStatus(data.booking_id, 'cancelled', `Pagamento reembolsado: ${reason}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao processar reembolso:', error);
    throw error;
  }
};

export const getCompanyRevenue = async (companyId, dateRange = {}) => {
  try {
    let query = supabase
      .from('payments')
      .select('amount, currency, status, created_at')
      .eq('company_id', companyId)
      .eq('status', 'paid');

    if (dateRange.startDate) {
      query = query.gte('created_at', dateRange.startDate.toISOString());
    }

    if (dateRange.endDate) {
      query = query.lte('created_at', dateRange.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const count = data.length;

    const monthlyData = {};
    data.forEach(payment => {
      const month = payment.created_at.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += payment.amount || 0;
      monthlyData[month].count += 1;
    });

    return {
      totalRevenue: total,
      totalPayments: count,
      averageRevenue: count > 0 ? total / count : 0,
      monthlyData: monthlyData,
      currency: data[0]?.currency || 'Kz'
    };
  } catch (error) {
    console.error('❌ Erro ao calcular receita da empresa:', error);
    return {
      totalRevenue: 0,
      totalPayments: 0,
      averageRevenue: 0,
      monthlyData: {},
      currency: 'Kz'
    };
  }
};

export const getFinancialSummary = async (dateRange = {}) => {
  try {
    let query = supabase
      .from('payments')
      .select('amount, currency, status, created_at, company_id');

    if (dateRange.startDate) {
      query = query.gte('created_at', dateRange.startDate.toISOString());
    }

    if (dateRange.endDate) {
      query = query.lte('created_at', dateRange.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const summary = {
      totalRevenue: 0,
      totalPaid: 0,
      totalPending: 0,
      totalRefunded: 0,
      totalFailed: 0,
      totalTransactions: data.length,
      byStatus: {},
      byCurrency: {},
      companies: {}
    };

    data.forEach(payment => {
      summary.byStatus[payment.status] = (summary.byStatus[payment.status] || 0) + 1;
      summary.byCurrency[payment.currency] = (summary.byCurrency[payment.currency] || 0) + payment.amount;

      if (payment.company_id) {
        if (!summary.companies[payment.company_id]) {
          summary.companies[payment.company_id] = { total: 0, count: 0 };
        }
        summary.companies[payment.company_id].total += payment.amount || 0;
        summary.companies[payment.company_id].count += 1;
      }

      switch (payment.status) {
        case 'paid':
        case 'confirmed':
          summary.totalPaid += payment.amount || 0;
          summary.totalRevenue += payment.amount || 0;
          break;
        case 'pending':
          summary.totalPending += payment.amount || 0;
          break;
        case 'refunded':
          summary.totalRefunded += payment.amount || 0;
          break;
        case 'failed':
          summary.totalFailed += payment.amount || 0;
          break;
        default:
          summary.totalRevenue += payment.amount || 0;
      }
    });

    return summary;
  } catch (error) {
    console.error('❌ Erro ao buscar resumo financeiro:', error);
    return null;
  }
};

// ============================================
// FUNÇÕES DE MENSAGENS/CHAT
// ============================================

export const sendMessage = async (messageData) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: messageData.senderId,
        receiver_id: messageData.receiverId,
        company_id: messageData.companyId,
        content: messageData.content,
        type: messageData.type || 'text',
        read: false,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // Criar notificação para o receptor
    await createNotification({
      userId: messageData.receiverId,
      type: 'new_message',
      title: 'Nova Mensagem',
      message: messageData.content.substring(0, 100) + (messageData.content.length > 100 ? '...' : ''),
      icon: 'MessageCircle',
      link: `/dashboard/messages`,
      metadata: {
        messageId: data.id,
        senderId: messageData.senderId
      }
    });

    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    throw error;
  }
};

export const getMessages = async (conversationId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id (name, avatar_url), receiver:profiles!receiver_id (name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    return [];
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro ao marcar mensagem como lida:', error);
    return false;
  }
};

export const getUnreadMessagesCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('❌ Erro ao contar mensagens não lidas:', error);
    return 0;
  }
};
// ============================================
// EXPORTAÇÕES PRINCIPAIS
// ============================================

export default supabase;

// ============================================
// ALIASES PARA COMPATIBILIDADE
// ============================================

export const getAllCompanies = getCompanies;
export const getCompanyByIdAdmin = getCompanyById;
export const adminApproveCompany = approveCompany;
export const adminRejectCompany = rejectCompany;
export const adminDeleteCompany = deleteCompany;