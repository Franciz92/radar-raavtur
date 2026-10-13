import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'

export default function NewServicePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', category: '', description: '', location: '', price: '', phone: '', hours: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Serviço criado com sucesso!')
    navigate('/empresa/servicos')
  }

  return (
    <div className="container-custom" style={{ padding: '40px 0', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>➕ Novo Serviço</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Nome do serviço</label>
          <input className="input-field" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Categoria</label>
          <select className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required>
            <option value="">Selecionar</option>
            <option value="Hotel">Hotel</option>
            <option value="Restaurante">Restaurante</option>
            <option value="Experiência">Experiência</option>
            <option value="Transporte">Transporte</option>
            <option value="Evento">Evento</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Descrição</label>
          <textarea className="input-field" rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Localização</label>
          <select className="input-field" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}>
            <option value="">Selecionar província</option>
            <option value="Luanda">Luanda</option>
            <option value="Benguela">Benguela</option>
            <option value="Huíla">Huíla</option>
            <option value="Namibe">Namibe</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Preço (Kz)</label>
          <input className="input-field" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Telefone</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Horário</label>
            <input className="input-field" placeholder="09:00 - 18:00" value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={18} /> Criar serviço
        </button>
      </form>
    </div>
  )
}