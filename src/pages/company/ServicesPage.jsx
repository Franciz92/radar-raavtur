import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ServicesPage() {
  const [services] = useState([
    { id: 's1', name: 'Tour Histórico de Luanda', category: 'Experiência', price: 15000, status: 'Ativo' },
    { id: 's2', name: 'Passeio de Barco na Baía', category: 'Experiência', price: 25000, status: 'Ativo' },
    { id: 's3', name: 'Transfer Aeroporto-Hotel', category: 'Transporte', price: 10000, status: 'Ativo' },
    { id: 's4', name: 'Jantar Romântico Benguela', category: 'Restaurante', price: 35000, status: 'Inativo' },
  ])

  return (
    <div className="container-custom" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>📦 Serviços</h1>
        <Link to="/empresa/servicos/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
          <PlusCircle size={18} /> Adicionar
        </Link>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Nome</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Categoria</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Preço</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Estado</th>
              <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: '#6b7280' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '16px', fontWeight: 500 }}>{service.name}</td>
                <td style={{ padding: '16px', color: '#6b7280' }}>{service.category}</td>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                  {formatCurrency(service.price)}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: service.status === 'Ativo' ? '#d1fae5' : '#fee2e2',
                    color: service.status === 'Ativo' ? '#065f46' : '#991b1b'
                  }}>
                    {service.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Link to={`/empresa/servicos/${service.id}/editar`} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>
                      <Edit size={16} />
                    </Link>
                    <button style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}