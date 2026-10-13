import { supabase } from './supabase'

// Obter comissão por categoria
export const getCommissionByCategory = async (category) => {
  const { data, error } = await supabase
    .from('commission_settings')
    .select('commission_percent')
    .eq('category', category)
    .single()
  if (error || !data) return { commission_percent: 10 }
  return data
}

// Calcular valores da reserva
export const calculateReservationAmounts = (grossAmount, commissionPercent) => {
  const platformCommission = (grossAmount * commissionPercent) / 100
  const companyAmount = grossAmount - platformCommission
  return { platformCommission, companyAmount }
}

// Criar transação financeira
export const createFinancialTransaction = async (data) => {
  const { data: result, error } = await supabase
    .from('financial_transactions')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return { data: result }
}

// Obter carteira da empresa
export const getCompanyWallet = async (companyId) => {
  const { data, error } = await supabase
    .from('company_wallets')
    .select('*')
    .eq('company_id', companyId)
    .single()
  if (error) return { data: null }
  return { data }
}

// Atualizar carteira
export const updateCompanyWallet = async (companyId, updates) => {
  const { data, error } = await supabase
    .from('company_wallets')
    .upsert({ company_id: companyId, ...updates })
  if (error) throw error
  return { data }
}

// Obter relatórios financeiros
export const getFinancialReport = async () => {
  const { data } = await supabase
    .from('financial_transactions')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: data || [] }
}

// Calcular totais
export const calculateTotals = (transactions) => {
  const totals = {
    grossRevenue: 0,
    platformCommissions: 0,
    companyPayouts: 0,
    refunds: 0,
    netPlatformRevenue: 0,
  }
  transactions.forEach(t => {
    totals.grossRevenue += Number(t.gross_amount) || 0
    totals.platformCommissions += Number(t.platform_commission) || 0
    totals.companyPayouts += Number(t.company_amount) || 0
    totals.refunds += Number(t.refund_amount) || 0
    totals.netPlatformRevenue += Number(t.net_platform_revenue) || 0
  })
  return totals
}