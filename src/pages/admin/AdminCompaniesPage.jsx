import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Search, Building2, Mail, Phone, MapPin,
  CheckCircle, XCircle, Clock, Eye, MoreVertical,
  Filter, PlusCircle, Trash2, Edit
} from 'lucide-react'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

const Input = ({ icon: Icon, className = '', type = 'text', value, onChange, placeholder, ...props }) => {
  return (
    <div className="relative w-full">
      {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${Icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  )
}

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

// ============================================
// DADOS MOCK
// ============================================
const mockCompanies = [
  {
    id: '1',
    name: 'Angola Travel Experts',
    email: 'contact@angolatravelexperts.ao',
    phone: '+244 923 456 789',
    category: 'Agência de viagens',
    status: 'approved',
    createdAt: '2025-01-15',
    services: 12,
    rating: 4.6,
  },
  {
    id: '2',
    name: 'EcoAngola Adventures',
    email: 'info@ecoangola.ao',
    phone: '+244 945 222 333',
    category: 'Operadora turística',
    status: 'pending',
    createdAt: '2025-02-10',
    services: 3,
    rating: 0,
  },
  {
    id: '3',
    name: 'Hotel Baía Azul',
    email: 'reservas@hotelbaiaazul.ao',
    phone: '+244 934 567 890',
    category: 'Hotel',
    status: 'approved',
    createdAt: '2025-01-20',
    services: 8,
    rating: 4.3,
  },
  {
    id: '4',
    name: 'Benguela Tours',
    email: 'info@benguelatours.ao',
    phone: '+244 934 111 222',
    category: 'Agência de viagens',
    status: 'rejected',
    createdAt: '2025-02-01',
    services: 0,
    rating: 0,
  },
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function AdminCompaniesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [companies, setCompanies] = useState(mockCompanies)

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || c.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovada</Badge>
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejeitada</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      setCompanies(prev => prev.filter(c => c.id !== id))
      toast.success('Empresa removida!')
    }
  }

  const stats = {
    total: companies.length,
    approved: companies.filter(c => c.status === 'approved').length,
    pending: companies.filter(c => c.status === 'pending').length,
    rejected: companies.filter(c => c.status === 'rejected').length,
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Empresas</h1>
            <p className="text-sm text-gray-500">Gerencie todas as empresas da plataforma</p>
          </div>
        </div>
        <Button icon={PlusCircle}>Nova Empresa</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-gray-500">Aprovadas</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pendentes</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-gray-500">Rejeitadas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            icon={Search}
            placeholder="Pesquisar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="approved">Aprovadas</option>
          <option value="pending">Pendentes</option>
          <option value="rejected">Rejeitadas</option>
        </select>
      </div>

      {/* Lista */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Nenhuma empresa encontrada</p>
          <p className="text-sm">Tente ajustar os filtros ou adicionar uma nova empresa</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviços</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <Building2 size={18} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{company.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone size={14} className="text-gray-400" />
                        {company.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(company.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{company.services}</span>
                        <span className="text-xs text-gray-400">serviços</span>
                        {company.rating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-yellow-500">
                            ★ {company.rating}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/empresas/${company.id}`}>
                          <Button variant="ghost" size="sm" icon={Eye} className="text-blue-500 hover:text-blue-600" />
                        </Link>
                        {company.status === 'pending' && (
                          <Link to={`/admin/empresas/${company.id}/aprovar`}>
                            <Button variant="success" size="sm" icon={CheckCircle} />
                          </Link>
                        )}
                        <Button variant="ghost" size="sm" icon={Edit} className="text-gray-500 hover:text-gray-700" />
                        <Button variant="ghost" size="sm" icon={Trash2} className="text-red-500 hover:text-red-600" onClick={() => handleDelete(company.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="mt-4 text-sm text-gray-500">
        Mostrando {filteredCompanies.length} de {companies.length} empresas
      </div>
    </div>
  )
}