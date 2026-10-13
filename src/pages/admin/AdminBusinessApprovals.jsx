// src/pages/admin/AdminBusinessApprovals.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePublicBusiness } from '../../context/PublicBusinessContext';
import businessService from '../../services/businessService';
import { 
  CheckCircle, XCircle, Clock, Building2, 
  Mail, Phone, MapPin, Loader2, Eye,
  Search, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function AdminBusinessApprovals() {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const { forceReload } = usePublicBusiness();
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPendingBusinesses();
  }, []);

  const loadPendingBusinesses = async () => {
    setLoading(true);
    try {
      const data = await businessService.getPendingBusinesses();
      setPendingBusinesses(data);
      console.log('📋 Empresas pendentes carregadas:', data.length);
    } catch (error) {
      console.error('Erro ao carregar empresas pendentes:', error);
      toast.error(isEn ? 'Error loading pending businesses' : 'Erro ao carregar empresas pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      console.log('✅ Aprovando empresa:', id);
      
      // 1. Aprovar a empresa
      const result = await businessService.approveBusiness(id);
      
      if (result) {
        // 2. REMOVER DA LISTA LOCAL
        setPendingBusinesses(prev => {
          const filtered = prev.filter(b => b.id !== id);
          console.log('📋 Removendo da lista. Restam:', filtered.length);
          return filtered;
        });
        
        // 3. RECARREGAR A LISTA DO BANCO
        await loadPendingBusinesses();
        
        // 4. FORÇAR RECARREGAMENTO DO CONTEXTO PÚBLICO
        console.log('🔄 Recarregando contexto público...');
        await forceReload();
        console.log('✅ Contexto público recarregado!');
        
        toast.success(isEn ? 'Business approved successfully!' : 'Empresa aprovada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error);
      toast.error(isEn ? 'Error approving business' : 'Erro ao aprovar empresa');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(
      isEn 
        ? `Are you sure you want to reject "${name}"? This action cannot be undone.`
        : `Tem certeza que deseja rejeitar "${name}"? Esta ação não pode ser desfeita.`
    )) return;

    setProcessing(id);
    try {
      await businessService.rejectBusiness(id);
      setPendingBusinesses(prev => {
        const filtered = prev.filter(b => b.id !== id);
        console.log('📋 Rejeitado. Restam:', filtered.length);
        return filtered;
      });
      await loadPendingBusinesses();
      await forceReload();
      toast.success(isEn ? 'Business rejected!' : 'Empresa rejeitada!');
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error);
      toast.error(isEn ? 'Error rejecting business' : 'Erro ao rejeitar empresa');
    } finally {
      setProcessing(null);
    }
  };

  const filteredBusinesses = pendingBusinesses.filter(business => {
    const matchSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        business.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        business.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const categoryLabels = {
    pt: {
      hotel: 'Hotel',
      restaurant: 'Restaurante',
      agency: 'Agência de Viagens',
      guide: 'Guia Turístico',
      transport: 'Transporte',
      tour: 'Passeio/Atividade',
      event: 'Evento',
      other: 'Outro Serviço'
    },
    en: {
      hotel: 'Hotel',
      restaurant: 'Restaurant',
      agency: 'Travel Agency',
      guide: 'Tour Guide',
      transport: 'Transport',
      tour: 'Tour/Activity',
      event: 'Event',
      other: 'Other Service'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-500" />
            {isEn ? 'Business Approvals' : 'Aprovações de Empresas'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEn 
              ? `${pendingBusinesses.length} businesses waiting for approval`
              : `${pendingBusinesses.length} empresas aguardando aprovação`}
          </p>
        </div>
        <button
          onClick={loadPendingBusinesses}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {isEn ? 'Refresh' : 'Atualizar'}
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search businesses...' : 'Buscar empresas...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Lista */}
      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'No pending businesses' : 'Nenhuma empresa pendente'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn 
              ? 'All businesses have been reviewed and approved' 
              : 'Todas as empresas foram revisadas e aprovadas'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {business.logo_url ? (
                      <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {business.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {isEn ? categoryLabels.en[business.category] : categoryLabels.pt[business.category]}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {isEn ? 'Pending' : 'Pendente'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {business.description || (isEn ? 'No description' : 'Sem descrição')}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                      {business.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {business.email}
                        </span>
                      )}
                      {business.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {business.phone}
                        </span>
                      )}
                      {business.province && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {business.province}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">
                  <Link
                    to={`/negocio/${business.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition"
                  >
                    <Eye className="w-4 h-4" />
                    {isEn ? 'Preview' : 'Visualizar'}
                  </Link>
                  <button
                    onClick={() => handleApprove(business.id)}
                    disabled={processing === business.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 rounded-lg text-sm font-medium text-white transition"
                  >
                    {processing === business.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isEn ? 'Approve' : 'Aprovar'}
                  </button>
                  <button
                    onClick={() => handleReject(business.id, business.name)}
                    disabled={processing === business.id}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg text-sm font-medium text-white transition"
                  >
                    {processing === business.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {isEn ? 'Reject' : 'Rejeitar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}