// src/pages/company/CompanyWithdrawalNew.jsx

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  Building2,
  User,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function CompanyWithdrawalNew() {
  const navigate = useNavigate()
  const { company } = useCompany()
  const { isEn } = useLanguage()
  
  const [loading, setLoading] = useState(false)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [formData, setFormData] = useState({
    amount: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
    iban: '',
    swift: '',
    notes: ''
  })

  useEffect(() => {
    loadAvailableBalance()
  }, [])

  const loadAvailableBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('company_amount')
        .eq('company_id', company.id)
        .eq('status', 'completed')
      
      if (error) throw error
      
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('company_id', company.id)
        .eq('status', 'completed')
      
      const totalEarnings = data.reduce((acc, t) => acc + t.company_amount, 0)
      const totalWithdrawn = withdrawalsData?.reduce((acc, w) => acc + w.amount, 0) || 0
      
      setAvailableBalance(totalEarnings - totalWithdrawn)
    } catch (error) {
      console.error('Erro ao calcular saldo:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    
    if (!amount || amount <= 0) {
      toast.error(isEn ? 'Enter a valid amount' : 'Digite um valor válido')
      return
    }
    if (amount > availableBalance) {
      toast.error(isEn ? 'Insufficient balance' : 'Saldo insuficiente')
      return
    }
    if (!formData.bank_name.trim() || !formData.bank_account.trim() || !formData.bank_holder.trim()) {
      toast.error(isEn ? 'Fill all bank fields' : 'Preencha todos os campos bancários')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          company_id: company.id,
          amount: amount,
          currency: 'Kz',
          bank_name: formData.bank_name.trim(),
          bank_account: formData.bank_account.trim(),
          bank_holder: formData.bank_holder.trim(),
          iban: formData.iban?.trim() || '',
          swift: formData.swift?.trim() || '',
          notes: formData.notes?.trim() || '',
          status: 'pending'
        }])
        .select()
        .single()
      
      if (error) throw error
      
      toast.success(isEn ? 'Withdrawal requested!' : 'Saque solicitado!')
      navigate('/empresa/saques')
    } catch (error) {
      console.error('Erro:', error)
      toast.error(error.message || (isEn ? 'Error' : 'Erro'))
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/empresa/saques" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft size={18} /> {isEn ? 'Back' : 'Voltar'}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet size={28} className="text-primary-500" />
          {isEn ? 'Request Withdrawal' : 'Solicitar Saque'}
        </h1>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
          <span className="text-gray-500">{isEn ? 'Available Balance' : 'Saldo Disponível'}</span>
          <span className={`text-2xl font-bold ${availableBalance > 0 ? 'text-green-600' : 'text-gray-600'}`}>
            {formatCurrency(availableBalance)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Amount' : 'Valor'} *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Kz</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="1000"
                step="100"
                required
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Bank Name' : 'Nome do Banco'} *</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Account Number' : 'Número da Conta'} *</label>
            <input
              type="text"
              value={formData.bank_account}
              onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Account Holder' : 'Titular da Conta'} *</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.bank_holder}
                onChange={(e) => setFormData({ ...formData, bank_holder: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IBAN</label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SWIFT</label>
              <input
                type="text"
                value={formData.swift}
                onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Notes' : 'Observações'}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link to="/empresa/saques" className="flex-1 px-4 py-2.5 text-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              {isEn ? 'Cancel' : 'Cancelar'}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
              {loading ? (isEn ? 'Sending...' : 'Enviando...') : (isEn ? 'Request' : 'Solicitar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}