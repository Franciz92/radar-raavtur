import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Package, DollarSign } from 'lucide-react'
import { useCompany } from '../../context/CompanyContext'
import toast from 'react-hot-toast'

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-200 disabled:opacity-50 ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}{children}
    </button>
  )
}

export default function CompanyServiceNew() {
  const navigate = useNavigate()
  const { addService, loading } = useCompany()
  const [form, setForm] = useState({ name: '', category: '', description: '', price: '', duration: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Preencha os campos obrigatórios'); return }
    await addService({ ...form, price: Number(form.price), status: 'pending' })
    navigate('/empresa/servicos')
  }

  return (
    <div className="container-custom py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/empresa/servicos')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"><ArrowLeft size={20} /></button>
        <div><h1 className="text-2xl font-bold">Novo Serviço</h1><p className="text-sm text-gray-500">Adicione um novo serviço</p></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div><label className="block text-sm font-medium mb-1">Nome *</label><input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
        <div><label className="block text-sm font-medium mb-1">Categoria</label><input className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="Ex: Experiência" /></div>
        <div><label className="block text-sm font-medium mb-1">Descrição</label><textarea className="input-field h-24" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium mb-1">Preço (Kz) *</label><input type="number" className="input-field" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required /></div>
          <div><label className="block text-sm font-medium mb-1">Duração</label><input className="input-field" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} placeholder="4 horas" /></div>
        </div>
        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" icon={Save} disabled={loading}>{loading ? 'Criando...' : 'Criar Serviço'}</Button>
          <Button variant="secondary" onClick={() => navigate('/empresa/servicos')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}