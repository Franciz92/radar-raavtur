// src/pages/admin/AdminHotels.jsx

import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import AdminEntityManager from '../../components/admin/AdminEntityManager'
import { Hotel, MapPin, Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminHotels() {
  const { isEn } = useLanguage()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  const loadHotels = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setHotels(data || [])
    } catch (error) {
      console.error('Erro ao carregar hotéis:', error)
      toast.error(isEn ? 'Error loading hotels' : 'Erro ao carregar hotéis')
    } finally {
      setLoading(false)
    }
  }

  const deleteHotel = async (id) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir hotel:', error)
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
      key: 'rating', 
      label: isEn ? 'Rating' : 'Avaliação',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400" />
          {item.rating || 'N/A'}
        </div>
      )
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
      title={isEn ? 'Hotels' : 'Hotéis'}
      icon={Hotel}
      entities={hotels}
      loading={loading}
      onLoad={loadHotels}
      onDelete={deleteHotel}
      columns={columns}
      searchFields={['name', 'location', 'description']}
      createRoute="/admin/hoteis/novo"
      editRoute="/admin/hoteis/editar"
      viewRoute="/admin/hoteis"
      newButtonLabel={isEn ? 'New Hotel' : 'Novo Hotel'}
      emptyMessage={isEn ? 'No hotels found' : 'Nenhum hotel encontrado'}
      isEn={isEn}
    />
  )
}