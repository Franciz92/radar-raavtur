// src/pages/admin/AdminDestinationNew.jsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Globe,
  Star,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Plus,
  Image,
  Clock
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function AdminDestinationNew() {
  const navigate = useNavigate()
  const { isEn } = useLanguage()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    province: '',
    latitude: '',
    longitude: '',
    address: '',
    rating: '',
    attractions: '',
    image_url: '',
    best_time: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.province.trim()) {
      toast.error(isEn ? 'Name and province are required' : 'Nome e província são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const insertData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        province: formData.province.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        address: formData.address.trim(),
        rating: formData.rating ? parseFloat(formData.rating) : null,
        attractions: formData.attractions ? parseInt(formData.attractions) : null,
        image_url: formData.image_url.trim() || null,
        best_time: formData.best_time.trim() || null,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('destinations')
        .insert([insertData])
      
      if (error) throw error
      
      toast.success(isEn ? 'Destination created successfully!' : 'Destino criado com sucesso!')
      navigate('/admin/destinos')
    } catch (error) {
      console.error('Erro ao criar destino:', error)
      toast.error(error.message || (isEn ? 'Error creating destination' : 'Erro ao criar destino'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/destinos" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={28} className="text-primary-500" />
            {isEn ? 'New Destination' : 'Novo Destino'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn ? 'Create a new destination' : 'Crie um novo destino'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Name' : 'Nome'} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Province' : 'Província'} *
              </label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Description' : 'Descrição'}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Latitude' : 'Latitude'}
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Longitude' : 'Longitude'}
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Address' : 'Endereço'}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Rating' : 'Avaliação'}
              </label>
              <div className="relative">
                <Star size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Number of Attractions' : 'Número de Atrações'}
              </label>
              <div className="relative">
                <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="attractions"
                  value={formData.attractions}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Image URL' : 'URL da Imagem'}
            </label>
            <div className="relative">
              <Image size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Best Time to Visit' : 'Melhor Época para Visitar'}
            </label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="best_time"
                value={formData.best_time}
                onChange={handleChange}
                placeholder="ex: Maio a Setembro"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/admin/destinos"
            className="flex-1 px-4 py-2.5 text-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
          >
            {isEn ? 'Cancel' : 'Cancelar'}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? (isEn ? 'Creating...' : 'Criando...') : (isEn ? 'Create' : 'Criar')}
          </button>
        </div>
      </form>
    </div>
  )
}