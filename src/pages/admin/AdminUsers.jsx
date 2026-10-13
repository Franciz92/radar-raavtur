// src/pages/admin/AdminUsers.jsx
// ============================================
// ADMIN USERS - CORRIGIDO
// - handleDeleteUser corrigido (elimina profiles, avisa sobre auth)
// - Suporte opcional para Edge Function "delete-user"
// - Estado otimista na exclusão
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../services/supabase'
import {
  Users,
  Search,
  Eye,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
  Shield,
  Trash2,
  User,
  AlertCircle,
  CheckCircle,
  Ban,
  UserCheck,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Phone,
  MapPin,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const { isEn } = useLanguage()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [showBlockModal, setShowBlockModal] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    loadUsers()
    setupRealtime()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [])

  // ============================================
  // CARREGAR USUÁRIOS
  // ============================================
  const loadUsers = async () => {
    setLoading(true)
    try {
      console.log('🔄 [AdminUsers] Carregando todos os usuários...')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('✅ [AdminUsers] Usuários carregados:', data?.length || 0)
      setUsers(data || [])

    } catch (error) {
      console.error('❌ [AdminUsers] Erro ao carregar usuários:', error)
      toast.error(isEn ? 'Error loading users' : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // CONFIGURAR REALTIME
  // ============================================
  const setupRealtime = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    console.log('📡 [AdminUsers] Configurando Realtime para usuários...')

    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('🔄 [Realtime] Mudança em profiles detectada:', payload)

          if (payload.eventType === 'INSERT') {
            setUsers(prev => [payload.new, ...prev])
            toast.success(isEn ? '🔄 New user registered!' : '🔄 Novo usuário registado!')
          } else if (payload.eventType === 'DELETE') {
            setUsers(prev => prev.filter(u => u.id !== payload.old.id))
            toast.info(isEn ? '🔄 User removed' : '🔄 Usuário removido')
          } else if (payload.eventType === 'UPDATE') {
            setUsers(prev => prev.map(u =>
              u.id === payload.new.id ? payload.new : u
            ))
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [AdminUsers] Status do Realtime:', status)
        setIsRealtimeConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          console.log('✅ [AdminUsers] Realtime conectado com sucesso!')
        }
      })

    channelRef.current = channel
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadUsers()
    setRefreshing(false)
    toast.success(isEn ? 'Users updated!' : 'Usuários atualizados!')
  }

  // ============================================
  // OBTER URL DA FOTO DE PERFIL
  // ============================================
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl
    }

    if (avatarUrl.startsWith('/') || avatarUrl.includes('avatars/')) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatarUrl)
      return data?.publicUrl || null
    }

    return avatarUrl
  }

  // ============================================
  // EXCLUIR USUÁRIO - CORRIGIDO
  // ============================================
  const handleDeleteUser = async (userId) => {
    setDeleteLoading(true)
    try {
      const userToDelete = users.find(u => u.id === userId)
      const userName = userToDelete?.name || 'Usuário'

      console.log('🗑️ [AdminUsers] Eliminando usuário:', userId, userName)

      // ✅ OTIMISTA: remover da lista IMEDIATAMENTE
      setUsers(prev => prev.filter(u => u.id !== userId))

      // 1. Tentar eliminar via Edge Function (se existir)
      let authDeleted = false
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('delete-user', {
          body: { userId }
        })

        if (!fnError && fnData?.success) {
          console.log('✅ [AdminUsers] Utilizador eliminado da auth via Edge Function')
          authDeleted = true
        } else if (fnError) {
          console.warn('⚠️ [AdminUsers] Edge Function não disponível:', fnError.message)
        }
      } catch (fnErr) {
        console.warn('⚠️ [AdminUsers] Edge Function não configurada:', fnErr.message)
      }

      // 2. Eliminar da tabela profiles (sempre)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) {
        // Se falhar, restaurar o utilizador na lista
        if (userToDelete) {
          setUsers(prev => [userToDelete, ...prev].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          ))
        }
        throw profileError
      }

      // 3. Mensagem apropriada
      if (authDeleted) {
        toast.success(
          isEn
            ? `🗑️ User "${userName}" permanently deleted!`
            : `🗑️ Usuário "${userName}" excluído permanentemente!`
        )
      } else {
        toast.success(
          isEn
            ? `🗑️ Profile of "${userName}" deleted! Auth account must be removed manually.`
            : `🗑️ Perfil de "${userName}" excluído! A conta de autenticação deve ser removida manualmente.`,
          { duration: 6000 }
        )
      }

      setShowDeleteModal(null)
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      toast.error(error.message || (isEn ? 'Error deleting user' : 'Erro ao excluir usuário'))
    } finally {
      setDeleteLoading(false)
    }
  }

  // ============================================
  // BLOQUEAR/DESBLOQUEAR USUÁRIO
  // ============================================
  const handleBlockUser = async (userId) => {
    setBlockLoading(true)
    try {
      const userToBlock = users.find(u => u.id === userId)
      const userName = userToBlock?.name || 'Usuário'
      const isBlocked = userToBlock?.status === 'blocked'

      const newStatus = isBlocked ? 'active' : 'blocked'

      const { error } = await supabase
        .from('profiles')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      ))

      toast.success(
        isEn
          ? newStatus === 'blocked'
            ? `🔒 User "${userName}" blocked!`
            : `🔓 User "${userName}" unblocked!`
          : newStatus === 'blocked'
            ? `🔒 Usuário "${userName}" bloqueado!`
            : `🔓 Usuário "${userName}" desbloqueado!`
      )

      setShowBlockModal(null)
    } catch (error) {
      console.error('❌ Erro ao bloquear/desbloquear usuário:', error)
      toast.error(error.message || (isEn ? 'Error updating user' : 'Erro ao atualizar usuário'))
    } finally {
      setBlockLoading(false)
    }
  }

  // ============================================
  // VISUALIZAR PERFIL DO USUÁRIO
  // ============================================
  const viewUserProfile = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setAvatarError(false)
      setShowProfileModal(true)
    }
  }

  // ============================================
  // ABRIR MODAIS
  // ============================================
  const openDeleteModal = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user?.role === 'admin') {
      toast.error(isEn ? 'Cannot delete an administrator!' : 'Não é possível excluir um administrador!')
      return
    }
    setShowDeleteModal(userId)
  }

  const openBlockModal = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user?.role === 'admin') {
      toast.error(isEn ? 'Cannot block an administrator!' : 'Não é possível bloquear um administrador!')
      return
    }
    setShowBlockModal(userId)
  }

  // ============================================
  // FILTROS
  // ============================================
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.status !== 'blocked') ||
      (filterStatus === 'blocked' && user.status === 'blocked')

    return matchesSearch && matchesStatus
  })

  // ============================================
  // ROLE BADGE
  // ============================================
  const RoleBadge = ({ role }) => {
    const roleMap = {
      admin: { label: 'Admin', variant: 'purple' },
      user: { label: 'User', variant: 'blue' },
      company: { label: 'Company', variant: 'green' },
      guide: { label: 'Guide', variant: 'cyan' }
    }

    const info = roleMap[role] || { label: role || 'User', variant: 'gray' }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${info.variant === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
        ${info.variant === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
        ${info.variant === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
        ${info.variant === 'cyan' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' : ''}
        ${info.variant === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
      `}>
        <Shield size={10} className="mr-1" />
        {info.label}
      </span>
    )
  }

  // ============================================
  // STATUS BADGE
  // ============================================
  const StatusBadge = ({ status }) => {
    if (status === 'blocked') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <Lock size={12} className="mr-1" />
          {isEn ? 'Blocked' : 'Bloqueado'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle size={12} className="mr-1" />
        {isEn ? 'Active' : 'Ativo'}
      </span>
    )
  }

  // ============================================
  // FORMATAR DATA
  // ============================================
  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ============================================
  // CONTAGEM
  // ============================================
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    companies: users.filter(u => u.role === 'company').length,
    blocked: users.filter(u => u.status === 'blocked').length,
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={28} className="text-primary-500" />
            {isEn ? 'Users' : 'Usuários'}
            {isRealtimeConnected ? (
              <span className="text-xs text-green-500 flex items-center gap-1 ml-2">
                <Wifi size={14} />
                {isEn ? 'Live' : 'Ao Vivo'}
              </span>
            ) : (
              <span className="text-xs text-red-500 flex items-center gap-1 ml-2">
                <WifiOff size={14} />
                {isEn ? 'Offline' : 'Offline'}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn
              ? `Manage all registered users (${users.length})`
              : `Gerencie todos os usuários registados (${users.length})`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Total' : 'Total'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-purple-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Admins' : 'Admins'}</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.admins}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Users' : 'Usuários'}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.users}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Companies' : 'Empresas'}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.companies}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-red-500 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{isEn ? 'Blocked' : 'Bloqueados'}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.blocked}</p>
        </div>
      </div>

      {/* Search e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search users...' : 'Pesquisar usuários...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="all">{isEn ? 'All Users' : 'Todos os Usuários'}</option>
            <option value="active">{isEn ? 'Active' : 'Ativos'}</option>
            <option value="blocked">{isEn ? 'Blocked' : 'Bloqueados'}</option>
          </select>
        </div>
      </div>

      {/* Lista de Usuários */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No users found' : 'Nenhum usuário encontrado'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'User' : 'Usuário'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Email' : 'Email'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Role' : 'Função'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Status' : 'Status'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Registered' : 'Registo'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isEn ? 'Actions' : 'Ações'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${user.status === 'blocked' ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          user.status === 'blocked'
                            ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className={`font-medium ${user.status === 'blocked' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {user.name || (isEn ? 'Anonymous' : 'Anônimo')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="text-gray-400" />
                        <span className={`text-sm ${user.status === 'blocked' ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                          {user.email || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => viewUserProfile(user.id)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                          title={isEn ? 'View profile' : 'Ver perfil'}
                        >
                          <Eye size={18} />
                        </button>
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => openBlockModal(user.id)}
                              className={`p-2 rounded-lg transition ${
                                user.status === 'blocked'
                                  ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  : 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                              }`}
                              title={user.status === 'blocked' ? (isEn ? 'Unblock' : 'Desbloquear') : (isEn ? 'Block' : 'Bloquear')}
                            >
                              {user.status === 'blocked' ? <UserCheck size={18} /> : <Ban size={18} />}
                            </button>
                            <button
                              onClick={() => openDeleteModal(user.id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              title={isEn ? 'Delete permanently' : 'Excluir permanentemente'}
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {isEn
                ? `Showing ${filteredUsers.length} of ${users.length} users`
                : `Mostrando ${filteredUsers.length} de ${users.length} usuários`
              }
            </span>
            <div className="flex items-center gap-2">
              {isRealtimeConnected ? (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <Wifi size={12} />
                  {isEn ? 'Live' : 'Ao Vivo'}
                </span>
              ) : (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <WifiOff size={12} />
                  {isEn ? 'Offline' : 'Offline'}
                </span>
              )}
              {stats.blocked > 0 && (
                <span className="text-red-500">
                  {stats.blocked} {isEn ? 'blocked' : 'bloqueados'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PERFIL DO USUÁRIO */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="flex flex-col items-center pt-8 pb-4 px-6">
                <div className="relative">
                  {selectedUser.avatar_url && !avatarError ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-100 dark:border-purple-900/30">
                      <img
                        src={getAvatarUrl(selectedUser.avatar_url)}
                        alt={selectedUser.name || 'Avatar'}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                      {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 border-2 border-white dark:border-gray-800">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                  {selectedUser.name || (isEn ? 'Anonymous' : 'Anônimo')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : selectedUser.role === 'company'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {selectedUser.role || 'User'}
                  </span>
                  {selectedUser.status === 'blocked' ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                      <Lock size={12} />
                      {isEn ? 'Blocked' : 'Bloqueado'}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle size={12} />
                      {isEn ? 'Active' : 'Ativo'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileModal(false)
                  setSelectedUser(null)
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Mail size={18} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Email' : 'Email'}</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{selectedUser.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Phone size={18} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Phone' : 'Telefone'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <MapPin size={18} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Location' : 'Localização'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.location || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <Calendar size={18} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isEn ? 'Registered at' : 'Registado em'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <User size={18} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">{selectedUser.id}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowProfileModal(false)
                  setSelectedUser(null)
                }}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Close' : 'Fechar'}
              </button>
              {selectedUser.role !== 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setShowProfileModal(false)
                      openBlockModal(selectedUser.id)
                    }}
                    className={`flex-1 py-3 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
                      selectedUser.status === 'blocked'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {selectedUser.status === 'blocked' ? <Unlock size={18} /> : <Lock size={18} />}
                    {selectedUser.status === 'blocked' ? (isEn ? 'Unblock' : 'Desbloquear') : (isEn ? 'Block' : 'Bloquear')}
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileModal(false)
                      openDeleteModal(selectedUser.id)
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    {isEn ? 'Delete' : 'Excluir'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isEn ? '⚠️ Permanently Delete User' : '⚠️ Excluir Usuário Permanentemente'}
                </h3>
                <p className="text-sm text-red-500 dark:text-red-400 font-semibold">
                  {isEn ? 'This action CANNOT be undone!' : 'Esta ação NO pode ser desfeita!'}
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {isEn
                  ? 'All user data will be permanently deleted:'
                  : 'Todos os dados do usuário serão permanentemente excluídos:'}
              </p>
              <ul className="text-xs text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
                <li>{isEn ? 'Profile information' : 'Informações do perfil'}</li>
                <li>{isEn ? 'Bookings' : 'Reservas'}</li>
                <li>{isEn ? 'Transactions' : 'Transações'}</li>
                <li>{isEn ? 'Reviews' : 'Avaliações'}</li>
                <li>{isEn ? 'All associated data' : 'Todos os dados associados'}</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {isEn
                  ? 'ℹ️ Note: The authentication account may need to be removed manually in Supabase Dashboard if the Edge Function is not configured.'
                  : 'ℹ️ Nota: A conta de autenticação pode precisar ser removida manualmente no Supabase Dashboard se a Edge Function não estiver configurada.'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteModal)}
                disabled={deleteLoading}
                className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isEn ? 'Delete Permanently' : 'Excluir Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Bloqueio */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                users.find(u => u.id === showBlockModal)?.status === 'blocked'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                {users.find(u => u.id === showBlockModal)?.status === 'blocked'
                  ? <Unlock size={24} className="text-green-600 dark:text-green-400" />
                  : <Lock size={24} className="text-yellow-600 dark:text-yellow-400" />
                }
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {users.find(u => u.id === showBlockModal)?.status === 'blocked'
                    ? (isEn ? '🔓 Unblock User' : '🔓 Desbloquear Usuário')
                    : (isEn ? '🔒 Block User' : '🔒 Bloquear Usuário')
                  }
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {users.find(u => u.id === showBlockModal)?.status === 'blocked'
                    ? (isEn ? 'User will be able to access the platform again' : 'O usuário poderá acessar a plataforma novamente')
                    : (isEn ? 'User will not be able to access the platform' : 'O usuário não poderá acessar a plataforma')
                  }
                </p>
              </div>
            </div>

            <div className={`rounded-xl p-4 mb-4 ${
              users.find(u => u.id === showBlockModal)?.status === 'blocked'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <p className={`text-sm ${
                users.find(u => u.id === showBlockModal)?.status === 'blocked'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {users.find(u => u.id === showBlockModal)?.status === 'blocked'
                  ? (isEn
                      ? 'This action will restore the user\'s access to the platform.'
                      : 'Esta ação irá restaurar o acesso do usuário à plataforma.')
                  : (isEn
                      ? 'This action will prevent the user from accessing the platform.'
                      : 'Esta ação irá impedir o usuário de acessar a plataforma.')
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(null)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => handleBlockUser(showBlockModal)}
                disabled={blockLoading}
                className={`flex-[2] py-3 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  users.find(u => u.id === showBlockModal)?.status === 'blocked'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {blockLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  users.find(u => u.id === showBlockModal)?.status === 'blocked'
                    ? <Unlock size={18} />
                    : <Lock size={18} />
                )}
                {users.find(u => u.id === showBlockModal)?.status === 'blocked'
                  ? (isEn ? 'Unblock' : 'Desbloquear')
                  : (isEn ? 'Block' : 'Bloquear')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}