// src/pages/admin/AdminApprovals.jsx

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function AdminApprovals() {
  const [pendingContent, setPendingContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected

  useEffect(() => {
    loadPendingContent()
  }, [])

  const loadPendingContent = async () => {
    setLoading(true)
    try {
      // Buscar conteúdos pendentes de todas as empresas
      const { data: destinations, error: destError } = await supabase
        .from('destinations')
        .select(`
          *,
          companies:company_id (name, email)
        `)
        .order('created_at', { ascending: false })

      if (destError) throw destError

      setPendingContent(destinations || [])
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
      toast.error('Erro ao carregar conteúdos')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, type) => {
    try {
      const { error } = await supabase
        .from('destinations')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'admin'
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Conteúdo aprovado!')
      loadPendingContent()
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      toast.error('Erro ao aprovar')
    }
  }

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('destinations')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error

      toast.success('Conteúdo rejeitado!')
      loadPendingContent()
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      toast.error('Erro ao rejeitar')
    }
  }

  const filteredContent = pendingContent.filter(item => {
    if (filter === 'all') return true
    return item.status === filter
  })

  const pendingCount = pendingContent.filter(item => item.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Aprovações
          </h1>
          <p className="text-sm text-gray-500">
            Aprove ou rejeite conteúdos publicados pelas empresas
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-xl">
            <Clock size={16} />
            <span className="font-semibold">{pendingCount}</span>
            <span>pendentes</span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            filter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Aprovados
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            filter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Rejeitados
        </button>
      </div>

      {/* Lista de Conteúdos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">Nenhum conteúdo encontrado</p>
          <p className="text-sm">Todos os conteúdos estão aprovados ou não há nada pendente</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                {/* Imagem */}
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1577372844247-c5cf10a9f048?w=100&q=80'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                
                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">
                      Empresa: {item.companies?.name || 'N/A'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : item.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {item.status === 'pending' ? '⏳ Pendente' :
                       item.status === 'approved' ? '✅ Aprovado' :
                       '❌ Rejeitado'}
                    </span>
                  </div>
                </div>

                {/* Ações (apenas para pendentes) */}
                {item.status === 'pending' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(item.id, 'destination')}
                      className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition"
                      title="Aprovar"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition"
                      title="Rejeitar"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}