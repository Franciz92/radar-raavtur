import { useState } from 'react'
import { Search } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

export default function AdminBookingsPage() {
  const [bookings] = useState([
    { id: 'BK-001', serviceName: 'Hotel de Convenções', client: 'João Silva', date: '2026-03-15', price: 85000, status: 'confirmed' },
    { id: 'BK-002', serviceName: 'Passeio de Barco', client: 'Maria Santos', date: '2026-03-20', price: 35000, status: 'confirmed' },
    { id: 'BK-003', serviceName: 'Tour Histórico', client: 'Pedro Costa', date: '2026-02-10', price: 15000, status: 'cancelled' },
    { id: 'BK-004', serviceName: 'Eco Lodge Namibe', client: 'Ana Oliveira', date: '2026-04-05', price: 55000, status: 'confirmed' },
  ])

  const [search, setSearch] = useState('')

  const filtered = bookings.filter(b =>
    b.serviceName.toLowerCase().includes(search.toLowerCase()) ||
    b.client.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '40px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>📅 Reservas</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Gerir todas as reservas da plataforma</p>

        <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input className="input-field" placeholder="Pesquisar reservas..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '40px' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Ref</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Serviço</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Cliente</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Data</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Valor</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '12px' }}>{booking.id}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{booking.serviceName}</td>
                  <td style={{ padding: '16px' }}>{booking.client}</td>
                  <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>{formatDate(booking.date)}</td>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--color-primary-600)' }}>{formatCurrency(booking.price)}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: booking.status === 'confirmed' ? '#d1fae5' : '#fee2e2',
                      color: booking.status === 'confirmed' ? '#065f46' : '#991b1b'
                    }}>
                      {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}