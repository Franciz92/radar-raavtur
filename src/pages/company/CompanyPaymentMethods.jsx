// src/pages/company/CompanyPaymentMethods.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useCompany } from '../../context/CompanyContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCard,
  Wallet,
  Banknote,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  Building2,
  Star,
  Settings,
  Landmark,
  Globe,
  FileText,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// CONSTANTES
// ============================================

const PAYMENT_METHOD_TYPES = [
  { id: 'multicaixa', name: 'Multicaixa Express', icon: '🏦', description: 'Pagamento via Multicaixa Express' },
  { id: 'visa', name: 'Visa/Mastercard', icon: '💳', description: 'Cartões de crédito e débito' },
  { id: 'transfer', name: 'Transferência Bancária', icon: '🏛️', description: 'Transferência bancária' },
  { id: 'cash', name: 'Dinheiro', icon: '💰', description: 'Pagamento em dinheiro' },
  { id: 'paypal', name: 'PayPal', icon: '🌐', description: 'PayPal' },
  { id: 'referencia', name: 'Referência Multicaixa', icon: '📝', description: 'Pagamento com referência Multicaixa' },
  { id: 'other', name: 'Outro', icon: '📦', description: 'Outro método de pagamento' },
];

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, onClick, disabled, className = '', type = 'button' }) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl ${sizes[size]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, required, type = 'text', icon: Icon, helper }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${Icon ? 'pl-10' : ''}`}
        />
      </div>
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  );
};

const Select = ({ label, value, onChange, options, placeholder, required }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select
        value={value || ''}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 appearance-none"
      >
        <option value="">{placeholder || 'Selecione...'}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.icon} {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CompanyPaymentMethods() {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { isEn } = useLanguage();
  
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    is_default: false,
  });

  // ============================================
  // CARREGAR MÉTODOS DE PAGAMENTO
  // ============================================
  useEffect(() => {
    if (company?.id) {
      loadPaymentMethods();
    }
  }, [company]);

  const loadPaymentMethods = async () => {
    if (!company?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Carregando métodos de pagamento para empresa:', company.id);

      const { data, error } = await supabase
        .from('company_payment_methods')
        .select('*')
        .eq('company_id', company.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Métodos carregados:', data);
      setMethods(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar métodos:', error);
      toast.error(isEn ? 'Error loading payment methods' : 'Erro ao carregar métodos de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentMethods();
    setRefreshing(false);
    toast.success(isEn ? 'Payment methods updated!' : 'Métodos de pagamento atualizados!');
  };

  // ============================================
  // ADICIONAR MÉTODO
  // ============================================
  const handleAddMethod = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.name) {
      toast.error(isEn ? 'Please fill all required fields' : 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!company?.id) {
      toast.error(isEn ? 'Company not found' : 'Empresa não encontrada');
      return;
    }

    setSubmitting(true);
    try {
      const dataToInsert = {
        company_id: company.id,
        type: formData.type,
        name: formData.name,
        description: formData.description || '',
        is_active: true,
        is_default: formData.is_default || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📤 Inserindo método de pagamento:', dataToInsert);

      const { data, error } = await supabase
        .from('company_payment_methods')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        throw error;
      }

      console.log('✅ Método inserido:', data);

      toast.success(isEn ? 'Payment method added!' : 'Método de pagamento adicionado!');
      setShowAddModal(false);
      setFormData({ type: '', name: '', description: '', is_default: false });
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Erro ao adicionar método:', error);
      toast.error(error.message || isEn ? 'Error adding payment method' : 'Erro ao adicionar método de pagamento');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // REMOVER MÉTODO
  // ============================================
  const handleDeleteMethod = async (id) => {
    if (!confirm(isEn ? 'Are you sure you want to delete this payment method?' : 'Tem certeza que deseja remover este método de pagamento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('company_payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(isEn ? 'Payment method removed!' : 'Método de pagamento removido!');
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Erro ao remover método:', error);
      toast.error(error.message || isEn ? 'Error removing payment method' : 'Erro ao remover método de pagamento');
    }
  };

  // ============================================
  // DEFINIR COMO PADRO
  // ============================================
  const handleSetDefault = async (id) => {
    try {
      // Remover padrão de todos os métodos
      await supabase
        .from('company_payment_methods')
        .update({ is_default: false })
        .eq('company_id', company.id);

      // Definir novo padrão
      const { error } = await supabase
        .from('company_payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success(isEn ? 'Default payment method set!' : 'Método de pagamento padrão definido!');
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Erro ao definir padrão:', error);
      toast.error(error.message || isEn ? 'Error setting default' : 'Erro ao definir método padrão');
    }
  };

  // ============================================
  // ALTERNAR STATUS
  // ============================================
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('company_payment_methods')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(isEn 
        ? `Payment method ${currentStatus ? 'deactivated' : 'activated'}!` 
        : `Método de pagamento ${currentStatus ? 'desativado' : 'ativado'}!`
      );
      await loadPaymentMethods();
    } catch (error) {
      console.error('❌ Erro ao alternar status:', error);
      toast.error(error.message || isEn ? 'Error toggling status' : 'Erro ao alternar status');
    }
  };

  // ============================================
  // GET ICONE
  // ============================================
  const getMethodIcon = (type) => {
    const method = PAYMENT_METHOD_TYPES.find(m => m.id === type);
    return method?.icon || '💳';
  };

  const getMethodName = (type) => {
    const method = PAYMENT_METHOD_TYPES.find(m => m.id === type);
    return method?.name || type;
  };

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Loading payment methods...' : 'Carregando métodos de pagamento...'}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: PRINCIPAL
  // ============================================
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/empresa/dashboard')} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard size={28} className="text-blue-600" />
              {isEn ? 'Payment Methods' : 'Métodos de Pagamento'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEn 
                ? `Manage your payment methods (${methods.length})`
                : `Gerencie seus métodos de pagamento (${methods.length})`
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {isEn ? 'Refresh' : 'Atualizar'}
          </button>
          <button
            onClick={() => {
              setFormData({ type: '', name: '', description: '', is_default: false });
              setEditingMethod(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            {isEn ? 'Add Method' : 'Adicionar Método'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs flex flex-wrap gap-4">
        <span><strong>Company ID:</strong> {company?.id || 'Não carregado'}</span>
        <span><strong>Total Métodos:</strong> {methods.length}</span>
        <span><strong>RLS:</strong> Desabilitado</span>
      </div>

      {/* Lista de Métodos */}
      {methods.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'No payment methods added yet' : 'Nenhum método de pagamento adicionado ainda'}
          </p>
          <button
            onClick={() => {
              setFormData({ type: '', name: '', description: '', is_default: false });
              setEditingMethod(null);
              setShowAddModal(true);
            }}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
          >
            <Plus size={18} />
            {isEn ? 'Add your first payment method' : 'Adicione seu primeiro método de pagamento'}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getMethodIcon(method.type)}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {method.name || getMethodName(method.type)}
                    </h4>
                    {method.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Star size={12} className="mr-1" />
                        {isEn ? 'Default' : 'Padrão'}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${method.is_active 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }
                    `}>
                      {method.is_active 
                        ? (isEn ? 'Active' : 'Ativo') 
                        : (isEn ? 'Inactive' : 'Inativo')
                      }
                    </span>
                  </div>
                  {method.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Tipo: {method.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={isEn ? 'Set as default' : 'Definir como padrão'}
                  >
                    <Star size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleToggleStatus(method.id, method.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={isEn ? 'Toggle status' : 'Alternar status'}
                >
                  {method.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title={isEn ? 'Delete' : 'Remover'}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Método */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title={isEn ? 'Add Payment Method' : 'Adicionar Método de Pagamento'}
      >
        <form onSubmit={handleAddMethod} className="space-y-4">
          <Select
            label={isEn ? 'Payment Type *' : 'Tipo de Pagamento *'}
            value={formData.type}
            onChange={(e) => {
              const type = e.target.value;
              const method = PAYMENT_METHOD_TYPES.find(m => m.id === type);
              setFormData(prev => ({
                ...prev,
                type,
                name: method?.name || '',
                description: method?.description || '',
              }));
            }}
            options={PAYMENT_METHOD_TYPES}
            placeholder={isEn ? 'Select payment type...' : 'Selecione o tipo de pagamento...'}
            required
          />
          <Input
            label={isEn ? 'Name *' : 'Nome *'}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={isEn ? 'Ex: Multicaixa Express' : 'Ex: Multicaixa Express'}
            required
          />
          <Input
            label={isEn ? 'Description' : 'Descrição'}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={isEn ? 'Description of the payment method...' : 'Descrição do método de pagamento...'}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              id="is_default"
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700 dark:text-gray-300">
              {isEn ? 'Set as default payment method' : 'Definir como método de pagamento padrão'}
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              variant="primary"
              icon={submitting ? Loader2 : Check}
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (isEn ? 'Saving...' : 'Salvando...') : (isEn ? 'Add Method' : 'Adicionar')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
            >
              {isEn ? 'Cancel' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}