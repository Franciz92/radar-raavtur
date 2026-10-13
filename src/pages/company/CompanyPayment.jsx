import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, CreditCard, Wallet, Landmark, Banknote, 
  Smartphone, FileText, Check, X, Plus, Trash2,
  AlertCircle, Shield
} from 'lucide-react'
import { useCompany } from '../../context/CompanyContext'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { 
  PAYMENT_METHODS, 
  getCompanyPaymentMethods, 
  savePaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod 
} from '../../services/paymentService'
import toast from 'react-hot-toast'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CompanyPayment() {
  const { company } = useCompany()
  const { user } = useAuth()
  const { isEn } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [config, setConfig] = useState({})

  useEffect(() => {
    if (company?.id) {
      loadPaymentMethods()
    }
  }, [company])

  const loadPaymentMethods = async () => {
    setLoading(true)
    try {
      const methods = await getCompanyPaymentMethods(company.id)
      setPaymentMethods(methods)
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error)
      toast.error('Erro ao carregar métodos de pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMethod = async (methodId) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId)
    if (!method) return

    try {
      const result = await savePaymentMethod(company.id, {
        type: method.id,
        name: method.name,
        config: config[methodId] || {},
        is_default: paymentMethods.length === 0,
      })
      
      setPaymentMethods(prev => [...prev, result])
      toast.success('Método de pagamento adicionado!')
      setShowAddModal(false)
      setSelectedMethod(null)
    } catch (error) {
      console.error('Erro ao adicionar método:', error)
      toast.error('Erro ao adicionar método de pagamento')
    }
  }

  const handleRemoveMethod = async (methodId) => {
    if (!confirm('Tem certeza que deseja remover este método de pagamento?')) return

    try {
      await deletePaymentMethod(methodId)
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId))
      toast.success('Método removido!')
    } catch (error) {
      console.error('Erro ao remover método:', error)
      toast.error('Erro ao remover método de pagamento')
    }
  }

  const handleSetDefault = async (methodId) => {
    try {
      await updatePaymentMethod(methodId, { is_default: true })
      // Atualizar lista
      setPaymentMethods(prev => prev.map(m => ({
        ...m,
        is_default: m.id === methodId,
      })))
      toast.success('Método definido como padrão!')
    } catch (error) {
      console.error('Erro ao definir padrão:', error)
      toast.error('Erro ao definir método padrão')
    }
  }

  const getMethodIcon = (type) => {
    const icons = {
      'multicaixa': Smartphone,
      'referencia': FileText,
      'visa': CreditCard,
      'transfer': Landmark,
      'cash': Banknote,
    }
    const Icon = icons[type] || CreditCard
    return <Icon size={20} />
  }

  if (!company) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="max-w-md mx-auto">
          <CreditCard size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Empresa não encontrada</h2>
          <p className="text-gray-500 mb-6">Registe a sua empresa primeiro.</p>
          <Link to="/empresa/cadastro">
            <Button>Registrar Empresa</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/empresa/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Métodos de Pagamento
          </h1>
          <p className="text-sm text-gray-500">
            Configure os métodos de pagamento aceitos pela sua empresa
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <Shield size={18} className="text-blue-600" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Configure os métodos de pagamento que seus clientes poderão usar para reservar seus serviços.
        </p>
      </div>

      {/* Lista de Métodos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Métodos Ativos
          </h3>
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>
            Adicionar Método
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Nenhum método de pagamento configurado</p>
            <p className="text-sm mt-2">Adicione pelo menos um método para aceitar pagamentos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const methodInfo = PAYMENT_METHODS.find(m => m.id === method.type)
              return (
                <div
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    method.is_default
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-2xl">{methodInfo?.icon || '💳'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {method.name || methodInfo?.name || method.type}
                      </p>
                      {method.is_default && (
                        <Badge variant="success">Padrão</Badge>
                      )}
                      <Badge variant="primary">Ativo</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{methodInfo?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Definir Padrão
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveMethod(method.id)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Adicionar Método */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Adicionar Método de Pagamento
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const isAdded = paymentMethods.some(m => m.type === method.id)
                  return (
                    <div
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isAdded
                          ? 'border-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-primary-500'
                      }`}
                      onClick={() => !isAdded && handleAddMethod(method.id)}
                    >
                      <div className="text-2xl">{method.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      {isAdded ? (
                        <Badge variant="success">Adicionado</Badge>
                      ) : (
                        <Button size="sm">Adicionar</Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}