// src/pages/admin/AdminAgencies.jsx

import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import AdminEntityManager from '../../components/admin/AdminEntityManager'
import { Globe, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAgencies() {
  const { isEn } = useLanguage()
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAgencies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAgencies(data || [])
    } catch (error) {
      console.error('Erro ao carregar agências:', error)
      toast.error(isEn ? 'Error loading agencies' : 'Erro ao carregar agências')
    } finally {
      setLoading(false)
    }
  }

  const deleteAgency = async (id) => {
    try {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Erro ao excluir agência:', error)
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
      key: 'phone', 
      label: isEn ? 'Phone' : 'Telefone',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Phone size={14} className="text-gray-400" />
          {item.phone || '-'}
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
      title={isEn ? 'Travel Agencies' : 'Agências de Viagem'}
      icon={Globe}
      entities={agencies}
      loading={loading}
      onLoad={loadAgencies}
      onDelete={deleteAgency}
      columns={columns}
      searchFields={['name', 'location', 'description']}
      createRoute="/admin/agencias/novo"
      editRoute="/admin/agencias/editar"
      viewRoute="/admin/agencias"
      newButtonLabel={isEn ? 'New Agency' : 'Nova Agência'}
      emptyMessage={isEn ? 'No agencies found' : 'Nenhuma agência encontrada'}
      isEn={isEn}
    />
  )
}