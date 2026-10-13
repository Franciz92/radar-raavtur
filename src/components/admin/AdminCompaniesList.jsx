// ============================================
// src/components/admin/AdminCompaniesList.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Edit, Eye, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

export const AdminCompaniesList = () => {
  const { companies, getAllCompanies, deleteCompany, loading } = useCompany();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    try {
      await getAllCompanies({ status: statusFilter, search });
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const handleDelete = async (companyId) => {
    if (!confirmDelete) {
      setConfirmDelete(companyId);
      return;
    }
    
    try {
      setDeleting(true);
      await deleteCompany(companyId);
      setConfirmDelete(null);
      await loadCompanies();
    } catch (error) {
      alert('Erro ao deletar empresa: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      approved: '✅ Aprovada',
      pending: '⏳ Pendente',
      rejected: '❌ Rejeitada',
      inactive: '⏸️ Inativa'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🏢 Gestão de Empresas</h2>
        <div className="text-sm text-gray-500">
          Total: {companies?.length || 0} empresas
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar empresa..."
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovadas</option>
          <option value="rejected">Rejeitadas</option>
          <option value="inactive">Inativas</option>
        </select>
        
        <button
          onClick={loadCompanies}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Tabela de Empresas */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : companies?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Nenhuma empresa encontrada</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies?.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {company.name?.charAt(0) || 'E'}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">ID: {company.id?.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{company.email}</td>
                  <td className="px-6 py-4">{getStatusBadge(company.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {company.created_at ? new Date(company.created_at).toLocaleDateString('pt-AO') : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.location.href = `/empresa/${company.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver empresa"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => window.location.href = `/admin/empresa/${company.id}/editar`}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(company.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal de Confirmação (opcional) */}
      {confirmDelete && !deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja deletar esta empresa? <br />
              <span className="text-red-600 font-medium">
                Esta ação é irreversível e deletará todos os serviços e dados relacionados!
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};