// src/components/admin/AdminEntityManager.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminEntityManager({
  title,
  icon: Icon,
  entities,
  loading,
  onLoad,
  onDelete,
  columns,
  searchFields = [],
  createRoute,
  editRoute,
  viewRoute,
  newButtonLabel,
  emptyMessage,
  isEn
}) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedItems, setSelectedItems] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (onLoad) {
      onLoad()
    }
  }, [])

  const filteredEntities = entities.filter(item => {
    if (!search.trim()) return true
    const searchLower = search.toLowerCase()
    return searchFields.some(field => {
      const value = item[field]
      if (!value) return false
      return String(value).toLowerCase().includes(searchLower)
    })
  })

  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredEntities.slice(startIndex, startIndex + itemsPerPage)

  const handleDelete = async (id) => {
    if (!confirm(isEn 
      ? '⚠️ WARNING: This action will permanently delete this item and ALL related data. This cannot be undone!\n\nAre you sure?' 
      : '⚠️ ATENÇO: Esta ação vai excluir PERMANENTEMENTE este item e TODOS os dados relacionados. Isso não pode ser desfeito!\n\nTem certeza?'
    )) return

    setDeleting(true)
    try {
      const result = await onDelete(id)
      if (result.success) {
        toast.success(isEn ? '🗑️ Item permanently deleted!' : '🗑️ Item excluído permanentemente!')
        if (onLoad) onLoad()
      } else {
        toast.error(result.error || (isEn ? 'Error deleting item' : 'Erro ao excluir item'))
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error(isEn ? 'Error deleting item' : 'Erro ao excluir item')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error(isEn ? 'Select at least one item' : 'Selecione pelo menos um item')
      return
    }

    if (!confirm(isEn 
      ? `⚠️ Delete ${selectedItems.length} items permanently?` 
      : `⚠️ Excluir ${selectedItems.length} itens permanentemente?`
    )) return

    setDeleting(true)
    try {
      let successCount = 0
      for (const id of selectedItems) {
        const result = await onDelete(id)
        if (result.success) successCount++
      }
      toast.success(isEn ? `${successCount} items deleted!` : `${successCount} itens excluídos!`)
      setSelectedItems([])
      if (onLoad) onLoad()
    } catch (error) {
      console.error('Erro ao excluir em massa:', error)
      toast.error(isEn ? 'Error deleting items' : 'Erro ao excluir itens')
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedItems.length && paginatedItems.length > 0) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedItems.map(item => item.id))
    }
  }

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={28} className="text-purple-500" />}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {entities.length} {isEn ? 'items' : 'itens'} {isEn ? 'found' : 'encontrados'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={18} />
              {isEn ? `Delete (${selectedItems.length})` : `Excluir (${selectedItems.length})`}
            </button>
          )}
          {onLoad && (
            <button
              onClick={onLoad}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
            </button>
          )}
          {createRoute && (
            <Link
              to={createRoute}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <Plus size={20} />
              {newButtonLabel || (isEn ? 'New' : 'Novo')}
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? 'Search...' : 'Pesquisar...'}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      {entities.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {emptyMessage || (isEn ? 'No items found' : 'Nenhum item encontrado')}
          </p>
          {createRoute && (
            <Link
              to={createRoute}
              className="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <Plus size={18} className="inline mr-2" />
              {isEn ? 'Create your first item' : 'Criar seu primeiro item'}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </th>
                    {columns.map((col, index) => (
                      <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {isEn ? 'Actions' : 'Ações'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </td>
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {col.render ? col.render(item) : item[col.key] || '-'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {viewRoute && (
                            <Link
                              to={`${viewRoute}/${item.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition"
                              title={isEn ? 'View' : 'Ver'}
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          {editRoute && (
                            <Link
                              to={`${editRoute}/${item.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-500 rounded transition"
                              title={isEn ? 'Edit' : 'Editar'}
                            >
                              <Edit size={16} />
                            </Link>
                          )}
                          <button
                            onClick={() => setShowDeleteConfirm(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded transition"
                            title={isEn ? 'Delete' : 'Excluir'}
                          >
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                {isEn ? 'Showing' : 'Mostrando'} {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredEntities.length)} {isEn ? 'of' : 'de'} {filteredEntities.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação de Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isEn ? '⚠️ Permanently Delete' : '⚠️ Excluir Permanentemente'}
                </h3>
                <p className="text-sm text-red-500 dark:text-red-400 font-semibold">
                  {isEn ? 'This action CANNOT be undone!' : 'Esta ação NO pode ser desfeita!'}
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                {isEn 
                  ? 'All related data will be permanently deleted:' 
                  : 'Todos os dados relacionados serão permanentemente excluídos:'}
              </p>
              <ul className="text-xs text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
                <li>{isEn ? 'Transactions' : 'Transações'}</li>
                <li>{isEn ? 'Bookings' : 'Reservas'}</li>
                <li>{isEn ? 'Reviews' : 'Avaliações'}</li>
                <li>{isEn ? 'All associated data' : 'Todos os dados associados'}</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleting}
                className="flex-[2] py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={18} />}
                {isEn ? 'Delete Permanently' : 'Excluir Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}