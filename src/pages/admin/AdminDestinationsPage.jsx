import { useState, useEffect } from 'react'
import { 
  Search, Edit, Trash2, Star, Plus, X, 
  Loader2, AlertCircle, Check, MapPin, 
  Globe, Calendar, Users, Image as ImageIcon,
  Filter, ChevronDown
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    province: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    image_url: '',
    attractions: '',
    best_time: '',
    rating: 0,
    language: '',
    currency: '',
    highlights: [],
  })

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setDestinations(data || [])
    } catch (error) {
      console.error('Erro ao carregar destinos:', error)
      toast.error('Erro ao carregar destinos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (destination = null) => {
    if (destination) {
      setEditingDestination(destination)
      setForm({
        name: destination.name || '',
        description: destination.description || '',
        province: destination.province || '',
        location: destination.location || '',
        address: destination.address || '',
        latitude: destination.latitude || '',
        longitude: destination.longitude || '',
        image_url: destination.image_url || '',
        attractions: destination.attractions || '',
        best_time: destination.best_time || '',
        rating: destination.rating || 0,
        language: destination.language || '',
        currency: destination.currency || '',
        highlights: destination.highlights || [],
      })
    } else {
      setEditingDestination(null)
      setForm({
        name: '',
        description: '',
        province: '',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        image_url: '',
        attractions: '',
        best_time: '',
        rating: 0,
        language: '',
        currency: '',
        highlights: [],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDestination(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const data = {
        name: form.name,
        description: form.description,
        province: form.province,
        location: form.location,
        address: form.address,
        latitude: parseFloat(form.latitude) || null,
        longitude: parseFloat(form.longitude) || null,
        image_url: form.image_url,
        attractions: form.attractions,
        best_time: form.best_time,
        rating: parseFloat(form.rating) || 0,
        language: form.language,
        currency: form.currency,
        highlights: form.highlights,
        updated_at: new Date().toISOString(),
      }

      let result
      if (editingDestination) {
        // Atualizar destino existente
        const { data, error } = await supabase
          .from('destinations')
          .update(data)
          .eq('id', editingDestination.id)
          .select()
          .maybeSingle()

        if (error) throw error
        result = data
        toast.success('Destino atualizado com sucesso!')
      } else {
        // Criar novo destino
        const { data, error } = await supabase
          .from('destinations')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
          }])
          .select()
          .maybeSingle()

        if (error) throw error
        result = data
        toast.success('Destino criado com sucesso!')
      }

      await loadDestinations()
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar destino:', error)
      toast.error('Erro ao salvar destino')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja excluir o destino "${name}"?`)) return

    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Destino excluído com sucesso!')
      await loadDestinations()
    } catch (error) {
      console.error('Erro ao excluir destino:', error)
      toast.error('Erro ao excluir destino')
    }
  }

  const filteredDestinations = destinations.filter(d => {
    const searchLower = search.toLowerCase()
    return d.name?.toLowerCase().includes(searchLower) ||
           d.province?.toLowerCase().includes(searchLower) ||
           d.description?.toLowerCase().includes(searchLower)
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={28} className="text-primary-500" />
              Destinos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gerir destinos turísticos de Angola
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all hover:scale-105"
          >
            <Plus size={18} />
            Adicionar destino
          </button>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar destinos por nome, província..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredDestinations.length} destinos encontrados</span>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Província
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Atrações
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    Melhor época
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDestinations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <MapPin size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">Nenhum destino encontrado</p>
                      <p className="text-sm">Clique em "Adicionar destino" para criar um novo</p>
                    </td>
                  </tr>
                ) : (
                  filteredDestinations.map((dest) => (
                    <tr key={dest.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {dest.image_url ? (
                              <img
                                src={dest.image_url}
                                alt={dest.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={18} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {dest.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                          {dest.province || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                        {dest.attractions || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {dest.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-600 dark:text-gray-400">
                        {dest.best_time || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(dest)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(dest.id, dest.name)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer da tabela */}
          {filteredDestinations.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Total: {filteredDestinations.length} destinos</span>
              <span>Última atualização: {new Date().toLocaleDateString('pt-PT')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingDestination ? 'Editar Destino' : 'Novo Destino'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="input-field"
                    required
                    placeholder="Ex: Parque Nacional da Quiçama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Província *
                  </label>
                  <input
                    type="text"
                    value={form.province}
                    onChange={(e) => setForm({...form, province: e.target.value})}
                    className="input-field"
                    required
                    placeholder="Ex: Luanda"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="input-field min-h-[100px]"
                  placeholder="Descrição detalhada do destino..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Luanda, Angola"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Av. 4 de Fevereiro, 123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm({...form, latitude: e.target.value})}
                    className="input-field"
                    placeholder="Ex: -8.8383"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm({...form, longitude: e.target.value})}
                    className="input-field"
                    placeholder="Ex: 13.2344"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Imagem (URL)
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({...form, image_url: e.target.value})}
                  className="input-field"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Atrações
                  </label>
                  <input
                    type="text"
                    value={form.attractions}
                    onChange={(e) => setForm({...form, attractions: e.target.value})}
                    className="input-field"
                    placeholder="Ex: 15 atrações"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Melhor época
                  </label>
                  <input
                    type="text"
                    value={form.best_time}
                    onChange={(e) => setForm({...form, best_time: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Maio a Setembro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Avaliação
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({...form, rating: parseFloat(e.target.value) || 0})}
                    className="input-field"
                    placeholder="Ex: 4.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Idioma
                  </label>
                  <input
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({...form, language: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Português, Inglês"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Moeda
                  </label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({...form, currency: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Kz"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  {editingDestination ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}