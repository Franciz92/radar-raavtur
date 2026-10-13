// src/pages/company/CompanyPaymentMethods.jsx

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Plus, Edit, Trash2, Loader2, RefreshCw, Star, ArrowLeft } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function CompanyPaymentMethods() {
  const { company } = useCompany()
  const { isEn } = useLanguage()
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (company?.id) loadMethods()
  }, [company])

  const loadMethods = async () => {
    if (!company?.id) { setLoading(false); return }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('company_id', company.id)
        .order('is_default', { ascending: false })
      if (error) throw error
      setMethods(data || [])
    } catch (error) {
      console.error('Erro:', error)
      toast.error(isEn ? 'Error loading payment methods' : 'Erro ao carregar métodos')
    } finally {
      setLoading(false)
    }
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
      <Link to="/empresa/pagamentos" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft size={18} /> {isEn ? 'Back' : 'Voltar'}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <CreditCard size={28} className="text-primary-500" />
        {isEn ? 'Payment Methods' : 'Métodos de Pagamento'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{methods.length} {isEn ? 'methods' : 'métodos'}</p>

      {methods.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100">
          <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{isEn ? 'No payment methods' : 'Nenhum método de pagamento'}</p>
          <button className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:text-primary-600">
            <Plus size={18} /> {isEn ? 'Add method' : 'Adicionar método'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((method) => (
            <div key={method.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <CreditCard size={24} className="text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{method.name}</h3>
                    <p className="text-xs text-gray-500">{method.type}</p>
                  </div>
                </div>
                {method.is_default && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-700">
                    <Star size={12} className="mr-1" /> Default
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs ${method.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {method.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-1">
                  <button className="p-1 text-gray-500 hover:text-primary-500 rounded-lg"><Edit size={16} /></button>
                  <button className="p-1 text-gray-500 hover:text-red-500 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}