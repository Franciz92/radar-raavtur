import { useState } from 'react'
import { 
  Search, Trash2, Eye, ShieldCheck, Building2, User, 
  Users, UserCheck, X, Sparkles, AlertTriangle 
} from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    { id: 'u1', name: 'João Silva', email: 'joao@email.ao', role: 'user', location: 'Luanda', createdAt: '2025-01-15' },
    { id: 'u2', name: 'Maria Santos', email: 'maria@email.ao', role: 'company', location: 'Luanda', createdAt: '2025-02-10' },
    { id: 'u3', name: 'Admin RAVTUR', email: 'admin@ravtur.ao', role: 'admin', location: 'Luanda', createdAt: '2024-06-01' },
    { id: 'u4', name: 'Pedro Costa', email: 'pedro@email.ao', role: 'user', location: 'Benguela', createdAt: '2025-03-20' },
    { id: 'u5', name: 'Ana Oliveira', email: 'ana@email.ao', role: 'user', location: 'Huíla', createdAt: '2025-04-05' },
  ])

  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'user', 'company', 'admin'
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)

  // Filtro composto (Pesquisa por Texto + Role Activo)
  const filtered = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase())

    const matchesRole = activeTab === 'all' || u.role === activeTab

    return matchesSearch && matchesRole
  })

  // Eliminar Utilizador
  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id))
    setUserToDelete(null)
  }

  // Estilização do Badge consoante a Role
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        )
      case 'company':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Building2 className="w-3.5 h-3.5" /> Empresa
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <User className="w-3.5 h-3.5" /> Turista
          </span>
        )
    }
  }

  // Estatísticas Rápidas
  const stats = [
    { label: 'Total Registados', value: users.length, icon: Users, color: 'text-slate-300', bg: 'from-slate-800/40 to-slate-900/40' },
    { label: 'Turistas', value: users.filter(u => u.role === 'user').length, icon: UserCheck, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-slate-900/40' },
    { label: 'Empresas', value: users.filter(u => u.role === 'company').length, icon: Building2, color: 'text-indigo-400', bg: 'from-indigo-500/10 to-slate-900/40' },
    { label: 'Administradores', value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: 'text-rose-400', bg: 'from-rose-500/10 to-slate-900/40' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Gestão de Utilizadores
              </h1>
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Painel de controlo centralizado de turistas, empresas parceiras e administradores.
            </p>
          </div>
        </div>

        {/* Grid de Estatísticas / KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div 
                key={idx}
                className={`p-5 rounded-2xl bg-gradient-to-br ${stat.bg} border border-slate-800/80 backdrop-blur-md flex items-center justify-between shadow-lg`}
              >
                <div>
                  <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-white mt-1 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-slate-950/60 border border-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabela de Utilizadores + Controlos */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
          
          {/* Barra Superior: Pesquisa & Filtros em Tabs */}
          <div className="p-6 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Tabs de Filtro de Função */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'user', label: 'Turistas' },
                { id: 'company', label: 'Empresas' },
                { id: 'admin', label: 'Admins' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input de Pesquisa Dinâmico */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, email ou cidade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <span className="text-xs font-medium text-slate-400 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 whitespace-nowrap">
                {filtered.length} de {users.length}
              </span>
            </div>
          </div>

          {/* Tabela de Dados */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Utilizador</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Tipo</th>
                  <th className="py-3.5 px-6">Localização</th>
                  <th className="py-3.5 px-6">Data de Registo</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Nenhum utilizador encontrado com os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-slate-800/30 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 font-medium text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 border border-emerald-400/30 flex items-center justify-center font-bold text-slate-950 shadow-md">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-200">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{user.email}</td>
                      <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-6 text-slate-300 font-medium">{user.location}</td>
                      <td className="py-4 px-6 text-slate-400">{formatDate(user.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setUserToDelete(user)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Eliminar Utilizador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal de Visualização de Detalhes */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-lg text-slate-950">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">{selectedUser.name}</h3>
                <p className="text-xs text-slate-400">ID: {selectedUser.id}</p>
              </div>
            </div>
            <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200 font-medium">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Tipo de Conta:</span>
                {getRoleBadge(selectedUser.role)}
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/40">
                <span className="text-slate-400">Localização:</span>
                <span className="text-slate-200 font-medium">{selectedUser.location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Data de Registo:</span>
                <span className="text-slate-200 font-medium">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Eliminação */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Eliminar Utilizador?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tem a certeza que pretende remover <strong className="text-slate-200">{userToDelete.name}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDelete(userToDelete.id)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-rose-900/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}