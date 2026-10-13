// src/pages/admin/AdminRestaurants.jsx

import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import AdminEntityManager from '../../components/admin/AdminEntityManager'
import { Utensils, MapPin, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminRestaurants() {
  const { isEn } = useLanguage()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRestaurants = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error)
      toast.error(isEn ? 'Error loading restaurants' : 'Erro ao carregar restaurantes')
    } finally {
      setLoading(false)
    }
  }

  const deleteRestaurant = async (id) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir restaurante:', error)
      return { success: false, error: error.message }
    }
  }

  const columns = [
    { key: 'name', label: isEn ? 'Name' : 'Nome' },
    { 
      key: 'location', 
      label: isEn ? 'Location' : 'Localização',
      render: (item) => (
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-gray-400" />
          {item.location || '-'}
        </div>
      )
    },
    { 
      key: 'cuisine', 
      label: isEn ? 'Cuisine' : 'Cozinha',
      render: (item) => item.cuisine || '-'
    },
    { 
      key: 'status', 
      label: isEn ? 'Status' : 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === 'active' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {item.status || (isEn ? 'Inactive' : 'Inativo')}
        </span>
      )
    },
  ]

  return (
    <AdminEntityManager
      title={isEn ? 'Restaurants' : 'Restaurantes'}
      icon={Utensils}
      entities={restaurants}
      loading={loading}
      onLoad={loadRestaurants}
      onDelete={deleteRestaurant}
      columns={columns}
      searchFields={['name', 'location', 'cuisine', 'description']}
      createRoute="/admin/restaurantes/novo"
      editRoute="/admin/restaurantes/editar"
      viewRoute="/admin/restaurantes"
      newButtonLabel={isEn ? 'New Restaurant' : 'Novo Restaurante'}
      emptyMessage={isEn ? 'No restaurants found' : 'Nenhum restaurante encontrado'}
      isEn={isEn}
    />
  )
}