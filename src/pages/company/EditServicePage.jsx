import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'

export default function EditServicePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: 'Tour Histórico de Luanda',
    category: 'Experiência',
    description: 'Um passeio incrível pela história de Luanda.',
    location: 'Luanda',
    price: '15000',
    phone: '+244 923 456 789',
    hours: '09:00 - 17:00',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Serviço atualizado com sucesso!')
    navigate('/empresa/servicos')
  }

  return (
    <div className="container-custom" style={{ padding: '40px 0', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>✏️ Editar Serviço</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Nome</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Categoria</label>
          <select className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
            <option value="Hotel">Hotel</option>
            <option value="Restaurante">Restaurante</option>
            <option value="Experiência">Experiência</option>
            <option value="Transporte">Transporte</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Descrição</label>
          <textarea className="input-field" rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Preço (Kz)</label>
          <input className="input-field" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save size={18} /> Guardar
          </button>
          <button type="button" onClick={() => navigate('/empresa/servicos')} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}