// src/pages/admin/AdminCompanyApprovals.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  Calendar,
  FileText,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  AlertTriangle,
  MessageSquare,
  Send,
  RefreshCw, // ← ADICIONADO
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-xl text-sm font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {Icon && <Icon size={18} className="flex-shrink-0" />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
      ${variants[variant] || variants.default}
    `}>
      {children}
    </span>
  );
};

const Input = ({ icon: Icon, value, onChange, placeholder, className = '' }) => {
  return (
    <div className="relative flex-1">
      {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm
          text-gray-900 placeholder-gray-400
          transition-all duration-200
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500
          ${Icon ? 'pl-10' : ''}
          ${className}
        `}
      />
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AdminCompanyApprovals() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ============================================
  // VERIFICAR PERMISSO
  // ============================================
  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('Acesso negado. Área restrita a administradores.');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  // ============================================
  // CARREGAR EMPRESAS - CORRIGIDO
  // ============================================
  const loadCompanies = async () => {
    try {
      setLoading(true);
      
      console.log('🔄 [Admin] Carregando empresas...');

      let query = supabase
        .from('companies')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Filtrar por status - CORRIGIDO: usar 'pending_approval'
      if (filterStatus !== 'all') {
        const statusMap = {
          'pending': 'pending_approval',
          'pending_approval': 'pending_approval',
          'approved': 'approved',
          'rejected': 'rejected',
        };
        query = query.eq('status', statusMap[filterStatus] || filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log(`✅ [Admin] ${data?.length || 0} empresas carregadas`);
      setCompanies(data || []);
      
    } catch (error) {
      console.error('❌ [Admin] Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [filterStatus]);

  // ============================================
  // FUNÇÕES DE APROVAÇO - CORRIGIDAS
  // ============================================
  const handleApprove = async (companyId) => {
    if (!confirm('Tem certeza que deseja aprovar esta empresa?')) return;
    
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rejection_reason: null, // Limpar motivo de rejeição
        })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('✅ Empresa aprovada com sucesso!');
      await loadCompanies();
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erro ao aprovar empresa:', error);
      toast.error('Erro ao aprovar empresa');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (companyId) => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('❌ Empresa rejeitada');
      await loadCompanies();
      setShowRejectModal(false);
      setRejectionReason('');
      setShowModal(false);
    } catch (error) {
      console.error('❌ Erro ao rejeitar empresa:', error);
      toast.error('Erro ao rejeitar empresa');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCompanies();
    setRefreshing(false);
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  // ============================================
  // FILTROS
  // ============================================
  const filteredCompanies = companies.filter(company => {
    const search = searchTerm.toLowerCase();
    return (
      company.name?.toLowerCase().includes(search) ||
      company.email?.toLowerCase().includes(search) ||
      company.category?.toLowerCase().includes(search) ||
      company.profiles?.name?.toLowerCase().includes(search)
    );
  });

  // ============================================
  // ESTATÍSTICAS - CORRIGIDAS
  // ============================================
  const stats = {
    total: companies.length,
    pending: companies.filter(c => c.status === 'pending_approval' || c.status === 'pending').length,
    approved: companies.filter(c => c.status === 'approved').length,
    rejected: companies.filter(c => c.status === 'rejected').length,
  };

  // ============================================
  // RENDER LOADING
  // ============================================
  if (loading) {
    return (
      <div className="container mx-auto py-12 max-w-7xl px-4">
        <div className="flex items-center justify-center h-64 flex-col">
          <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="container mx-auto py-8 max-w-7xl px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 size={24} className="text-blue-600" />
              Aprovação de Empresas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gerencie os cadastros de empresas aguardando aprovação
            </p>
          </div>
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? 'cursor-wait' : ''}
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <Building2 size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Pendentes</span>
            <Clock size={18} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Aprovadas</span>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Rejeitadas</span>
            <XCircle size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email, categoria..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-48 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">Todos os status</option>
          <option value="pending_approval">⏳ Pendentes</option>
          <option value="approved">✅ Aprovadas</option>
          <option value="rejected">❌ Rejeitadas</option>
        </select>
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Nenhuma empresa encontrada com este termo' : 'Nenhuma empresa cadastrada ainda'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={24} className="text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {company.name}
                      </h3>
                      <Badge variant={company.status === 'approved' ? 'approved' : company.status === 'pending_approval' || company.status === 'pending' ? 'pending' : 'rejected'}>
                        {company.status === 'approved' && <CheckCircle size={12} />}
                        {(company.status === 'pending_approval' || company.status === 'pending') && <Clock size={12} />}
                        {company.status === 'rejected' && <XCircle size={12} />}
                        {company.status === 'approved' ? 'Aprovada' : (company.status === 'pending_approval' || company.status === 'pending') ? 'Pendente' : 'Rejeitada'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {company.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {company.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {company.address?.province || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> {company.profiles?.name || 'Usuário'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {company.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    icon={Eye}
                    onClick={() => handleViewDetails(company)}
                  >
                    Ver
                  </Button>
                  {(company.status === 'pending_approval' || company.status === 'pending') && (
                    <>
                      <Button
                        variant="success"
                        icon={Check}
                        onClick={() => handleApprove(company.id)}
                        disabled={processing}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="danger"
                        icon={X}
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowRejectModal(true);
                        }}
                        disabled={processing}
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Detalhes da Empresa
              </h2>
              <Button
                variant="ghost"
                icon={X}
                onClick={() => setShowModal(false)}
              >
                Fechar
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {/* Logo e Nome */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {selectedCompany.logo ? (
                    <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h3>
                  <Badge variant={selectedCompany.status === 'approved' ? 'approved' : selectedCompany.status === 'pending_approval' || selectedCompany.status === 'pending' ? 'pending' : 'rejected'}>
                    {selectedCompany.status === 'approved' ? '✅ Aprovada' : (selectedCompany.status === 'pending_approval' || selectedCompany.status === 'pending') ? '⏳ Pendente' : '❌ Rejeitada'}
                  </Badge>
                </div>
              </div>

              {/* Informações */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail size={16} /> {selectedCompany.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Phone size={16} /> {selectedCompany.phone}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 size={16} /> {selectedCompany.category}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">NIF</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText size={16} /> {selectedCompany.nif || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Website</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe size={16} /> {selectedCompany.website || 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Data de Cadastro</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar size={16} /> {new Date(selectedCompany.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin size={16} />
                  {selectedCompany.address?.street || ''}, {selectedCompany.address?.city || ''}, {selectedCompany.address?.province || ''}
                </p>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Redes Sociais */}
              {selectedCompany.social_media && Object.values(selectedCompany.social_media).some(v => v) && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Redes Sociais</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.social_media.facebook && (
                      <a href={selectedCompany.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        Facebook
                      </a>
                    )}
                    {selectedCompany.social_media.instagram && (
                      <a href={selectedCompany.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline text-sm">
                        Instagram
                      </a>
                    )}
                    {selectedCompany.social_media.twitter && (
                      <a href={selectedCompany.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                        Twitter
                      </a>
                    )}
                    {selectedCompany.social_media.linkedin && (
                      <a href={selectedCompany.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-sm">
                        LinkedIn
                      </a>
                    )}
                    {selectedCompany.social_media.youtube && (
                      <a href={selectedCompany.social_media.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline text-sm">
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Ações no Modal */}
              {(selectedCompany.status === 'pending_approval' || selectedCompany.status === 'pending') && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="success"
                    icon={Check}
                    onClick={() => handleApprove(selectedCompany.id)}
                    disabled={processing}
                    className="flex-1"
                  >
                    Aprovar Empresa
                  </Button>
                  <Button
                    variant="danger"
                    icon={X}
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    disabled={processing}
                    className="flex-1"
                  >
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-red-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Rejeitar Empresa
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Você está prestes a rejeitar a empresa <strong>{selectedCompany.name}</strong>. Por favor, informe o motivo.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 min-h-[100px]"
                rows={4}
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  icon={X}
                  onClick={() => handleReject(selectedCompany.id)}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {processing ? <Loader2 size={18} className="animate-spin" /> : 'Rejeitar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}