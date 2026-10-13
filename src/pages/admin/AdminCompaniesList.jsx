// ============================================
// src/components/admin/AdminCompaniesList.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Eye, Edit, CheckCircle, XCircle, Clock, Search, Filter, Building2, Users, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminCompaniesList = () => {
  const { companies, loadAllCompanies, deleteCompany, getCompanyStats, loading } = useCompany();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({});
  const [expandedCompany, setExpandedCompany] = useState(null);

  // Carregar empresas ao montar o componente
  useEffect(() => {
    if (user?.role === 'admin') {
      loadCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    try {
      const filters = { status: statusFilter };
      if (search) filters.search = search;
      await loadAllCompanies(filters);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    }
  };

  // Buscar estatísticas de uma empresa
  const loadCompanyStats = async (companyId) => {
    if (stats[companyId]) return; // Já carregado
    
    try {
      const data = await getCompanyStats(companyId);
      if (data) {
        setStats(prev => ({ ...prev, [companyId]: data }));
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Handler para deletar empresa
  const handleDelete = async (companyId) => {
    if (!confirmDelete) {
      setConfirmDelete(companyId);
      return;
    }
    
    try {
      setDeleting(true);
      const result = await deleteCompany(companyId);
      if (result) {
        setConfirmDelete(null);
        toast.success('Empresa deletada com sucesso!');
        await loadCompanies();
        // Limpar estatísticas da empresa deletada
        setStats(prev => {
          const newStats = { ...prev };
          delete newStats[companyId];
          return newStats;
        });
      }
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
      toast.error(error.message || 'Erro ao deletar empresa');
    } finally {
      setDeleting(false);
    }
  };

  // Cancelar confirmação
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  // Badge de status
  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const labels = {
      approved: '✅ Aprovada',
      pending: '⏳ Pendente',
      rejected: '❌ Rejeitada',
      inactive: '⏸️ Inativa'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status || 'Desconhecido'}
      </span>
    );
  };

  // Verificar se o usuário atual é admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-700">Acesso Restrito</h2>
          <p className="text-gray-500">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Gestão de Empresas
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie todas as empresas cadastradas no sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              Total: {companies?.length || 0} empresas
            </span>
          </div>
          <button
            onClick={loadCompanies}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                Carregando...
              </>
            ) : (
              '🔄 Atualizar'
            )}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar empresa por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadCompanies()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">📋 Todos os status</option>
          <option value="pending">⏳ Pendentes</option>
          <option value="approved">✅ Aprovadas</option>
          <option value="rejected">❌ Rejeitadas</option>
          <option value="inactive">⏸️ Inativas</option>
        </select>
        
        <button
          onClick={loadCompanies}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </button>
      </div>

      {/* Tabela de Empresas */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando empresas...</p>
          </div>
        </div>
      ) : companies?.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-gray-400">
            {search || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Ainda não há empresas cadastradas no sistema'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                loadCompanies();
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatísticas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies?.map((company) => (
                <React.Fragment key={company.id}>
                  <tr 
                    className={`hover:bg-gray-50 transition-colors ${expandedCompany === company.id ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      if (expandedCompany === company.id) {
                        setExpandedCompany(null);
                      } else {
                        setExpandedCompany(company.id);
                        loadCompanyStats(company.id);
                      }
                    }}
                  >
                    <td className="px-6 py-4 cursor-pointer">
                      <div className="flex items-center">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.name} 
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-blue-200">
                            {company.name?.charAt(0)?.toUpperCase() || 'E'}
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{company.name || 'Sem nome'}</div>
                          <div className="text-xs text-gray-400">
                            ID: {company.id?.substring(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {company.category || 'Sem categoria'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{company.email || '-'}</div>
                      <div className="text-xs">{company.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(company.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {stats[company.id] ? (
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-blue-500" />
                            {stats[company.id].services || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-green-500" />
                            {stats[company.id].bookings || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {stats[company.id].reviews || 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Clique para carregar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/empresa/${company.id}`;
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver empresa"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/admin/empresa/${company.id}/editar`;
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(company.id);
                          }}
                          disabled={deleting && confirmDelete === company.id}
                          className={`p-2 rounded-lg transition-colors ${
                            confirmDelete === company.id
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={confirmDelete === company.id ? 'Confirmar exclusão' : 'Deletar empresa'}
                        >
                          {deleting && confirmDelete === company.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Linha expandida com detalhes */}
                  {expandedCompany === company.id && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-700 mb-2">📋 Informações</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">NIF:</span> {company.nif || '-'}</p>
                              <p><span className="text-gray-500">Website:</span> {company.website || '-'}</p>
                              <p><span className="text-gray-500">Categoria:</span> {company.category || '-'}</p>
                              <p><span className="text-gray-500">Status:</span> {company.status || '-'}</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-700 mb-2">📍 Endereço</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Morada:</span> {company.address?.street || '-'}</p>
                              <p><span className="text-gray-500">Cidade:</span> {company.address?.city || '-'}</p>
                              <p><span className="text-gray-500">Província:</span> {company.address?.province || '-'}</p>
                              <p><span className="text-gray-500">País:</span> {company.address?.country || 'Angola'}</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-medium text-gray-700 mb-2">👤 Proprietário</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Nome:</span> {company.profiles?.name || '-'}</p>
                              <p><span className="text-gray-500">Email:</span> {company.profiles?.email || '-'}</p>
                              <p><span className="text-gray-500">Role:</span> {company.profiles?.role || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      {confirmDelete && !deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">⚠️ Confirmar Exclusão</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm font-medium">
                Tem certeza que deseja deletar esta empresa?
              </p>
              <ul className="text-xs text-red-600 mt-2 list-disc list-inside">
                <li>Todos os serviços serão removidos</li>
                <li>Todas as reservas serão removidas</li>
                <li>Todas as avaliações serão removidas</li>
                <li>Esta ação é irreversível!</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesList;