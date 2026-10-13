// src/pages/admin/AdminExperiences.jsx

import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import AdminEntityManager from '../../components/admin/AdminEntityManager'
import { Landmark, MapPin, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminExperiences() {
  const { isEn } = useLanguage()
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)

  const loadExperiences = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setExperiences(data || [])
    } catch (error) {
      console.error('Erro ao carregar experiências:', error)
      toast.error(isEn ? 'Error loading experiences' : 'Erro ao carregar experiências')
    } finally {
      setLoading(false)
    }
  }

  const deleteExperience = async (id) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir experiência:', error)
      return { success: false, error: error.message }
    }
  }

  const columns = [
    { key: 'title', label: isEn ? 'Title' : 'Título' },
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
      key: 'duration', 
      label: isEn ? 'Duration' : 'Duração',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-gray-400" />
          {item.duration || '-'}
        </div>
      )
    },
    { 
      key: 'max_people', 
      label: isEn ? 'Max People' : 'Máx. Pessoas',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Users size={14} className="text-gray-400" />
          {item.max_people || '-'}
        </div>
      )
    },
  ]

  return (
    <AdminEntityManager
      title={isEn ? 'Experiences' : 'Experiências'}
      icon={Landmark}
      entities={experiences}
      loading={loading}
      onLoad={loadExperiences}
      onDelete={deleteExperience}
      columns={columns}
      searchFields={['title', 'location', 'description']}
      createRoute="/admin/experiencias/novo"
      editRoute="/admin/experiencias/editar"
      viewRoute="/admin/experiencias"
      newButtonLabel={isEn ? 'New Experience' : 'Nova Experiência'}
      emptyMessage={isEn ? 'No experiences found' : 'Nenhuma experiência encontrada'}
      isEn={isEn}
    />
  )
}