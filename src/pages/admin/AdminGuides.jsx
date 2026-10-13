// src/pages/admin/AdminGuides.jsx

import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import AdminEntityManager from '../../components/admin/AdminEntityManager'
import { UserCog, MapPin, Star, Languages } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminGuides() {
  const { isEn } = useLanguage()
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)

  const loadGuides = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuides(data || [])
    } catch (error) {
      console.error('Erro ao carregar guias:', error)
      toast.error(isEn ? 'Error loading guides' : 'Erro ao carregar guias')
    } finally {
      setLoading(false)
    }
  }

  const deleteGuide = async (id) => {
    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir guia:', error)
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
      key: 'languages', 
      label: isEn ? 'Languages' : 'Idiomas',
      render: (item) => {
        const langs = Array.isArray(item.languages) ? item.languages : []
        return (
          <div className="flex items-center gap-1">
            <Languages size={14} className="text-gray-400" />
            {langs.length > 0 ? langs.slice(0, 2).join(', ') + (langs.length > 2 ? '...' : '') : '-'}
          </div>
        )
      }
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
  ]

  return (
    <AdminEntityManager
      title={isEn ? 'Tour Guides' : 'Guias Turísticos'}
      icon={UserCog}
      entities={guides}
      loading={loading}
      onLoad={loadGuides}
      onDelete={deleteGuide}
      columns={columns}
      searchFields={['name', 'location', 'description', 'languages']}
      createRoute="/admin/guias/novo"
      editRoute="/admin/guias/editar"
      viewRoute="/admin/guias"
      newButtonLabel={isEn ? 'New Guide' : 'Novo Guia'}
      emptyMessage={isEn ? 'No guides found' : 'Nenhum guia encontrado'}
      isEn={isEn}
    />
  )
}