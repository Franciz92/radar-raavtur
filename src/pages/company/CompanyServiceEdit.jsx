import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import { useCompany } from '../../context/CompanyContext'
import { getCompanyServiceById, updateCompanyService, deleteCompanyService } from '../../services/supabase'
import toast from 'react-hot-toast'

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
  }
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

const Input = ({ label, type = 'text', value, onChange, placeholder, required, disabled, className = '' }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      />
    </div>
  )
}

const TextArea = ({ label, value, onChange, placeholder, rows = 4 }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <textarea
        rows={rows}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 resize-none"
      />
    </div>
  )
}

const Select = ({ label, value, onChange, options, placeholder }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select
        value={value || ''}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="">{placeholder || 'Selecione...'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

const serviceCategories = [
  'Hotel', 'Restaurante', 'Experiência', 'Evento', 
  'Transporte', 'Rent-a-car', 'Guia Turístico', 'Outro'
]

export default function CompanyServiceEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { company } = useCompany()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [service, setService] = useState(null)
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    currency: 'Kz',
    duration: '',
    location: '',
    images: [],
    features: [],
    status: 'pending',
  })

  useEffect(() => {
    if (id) {
      loadService()
    }
  }, [id])

  const loadService = async () => {
    setLoading(true)
    try {
      // Converter ID para string
      const serviceId = String(id)
      const data = await getCompanyServiceById(serviceId)
      
      if (data) {
        setService(data)
        setForm({
          name: data.name || '',
          category: data.category || '',
          description: data.description || '',
          price: data.price || '',
          currency: data.currency || 'Kz',
          duration: data.duration || '',
          location: data.location || '',
          images: data.images || [],
          features: data.features || [],
          status: data.status || 'pending',
        })
      } else {
        toast.error('Serviço não encontrado')
        navigate('/empresa/servicos')
      }
    } catch (error) {
      console.error('Erro ao carregar serviço:', error)
      toast.error('Erro ao carregar serviço')
      navigate('/empresa/servicos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos obrigatórios
    if (!form.name.trim()) {
      toast.error('Nome do serviço é obrigatório')
      return
    }

    if (!form.category) {
      toast.error('Categoria é obrigatória')
      return
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error('Preço deve ser maior que zero')
      return
    }

    setSaving(true)
    
    try {
      const updateData = {
        name: form.name.trim(),
        category: form.category,
        description: form.description || '',
        price: parseFloat(form.price) || 0,
        currency: form.currency || 'Kz',
        duration: form.duration || '',
        location: form.location || '',
        images: form.images || [],
        features: form.features || [],
        status: form.status || 'pending',
      }

      await updateCompanyService(id, updateData)
      toast.success('Serviço atualizado com sucesso!')
      navigate('/empresa/servicos')
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      toast.error(error.message || 'Erro ao atualizar serviço')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) {
      return
    }

    setSaving(true)
    try {
      await deleteCompanyService(id)
      toast.success('Serviço excluído com sucesso!')
      navigate('/empresa/servicos')
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      toast.error('Erro ao excluir serviço')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-8 max-w-2xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <span className="ml-4 text-gray-500">Carregando serviço...</span>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="container-custom py-8 max-w-2xl text-center">
        <p className="text-gray-500">Serviço não encontrado</p>
        <button onClick={() => navigate('/empresa/servicos')} className="mt-4 text-primary-500 hover:underline">
          Voltar para serviços
        </button>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 max-w-2xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/empresa/servicos')} 
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Serviço</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Atualize as informações do serviço</p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
        <Input
          label="Nome do Serviço *"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          placeholder="Ex: Tour Histórico de Luanda"
          required
        />

        <Select
          label="Categoria *"
          value={form.category}
          onChange={(e) => setForm({...form, category: e.target.value})}
          options={serviceCategories}
          placeholder="Selecione a categoria"
        />

        <TextArea
          label="Descrição"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          placeholder="Descreva os detalhes do serviço..."
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Preço (Kz) *"
            type="number"
            value={form.price}
            onChange={(e) => setForm({...form, price: e.target.value})}
            placeholder="15000"
            required
          />
          <Input
            label="Duração"
            value={form.duration}
            onChange={(e) => setForm({...form, duration: e.target.value})}
            placeholder="Ex: 4 horas, 1 dia"
          />
        </div>

        <Input
          label="Localização"
          value={form.location}
          onChange={(e) => setForm({...form, location: e.target.value})}
          placeholder="Ex: Luanda, Angola"
        />

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={form.status || 'pending'}
            onChange={(e) => setForm({...form, status: e.target.value})}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="pending">Pendente</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/empresa/servicos')} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            icon={Trash2} 
            onClick={handleDelete} 
            disabled={saving}
            className="ml-auto"
          >
            Excluir
          </Button>
        </div>
      </form>
    </div>
  )
}