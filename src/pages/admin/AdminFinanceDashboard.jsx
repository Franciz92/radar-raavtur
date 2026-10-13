import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, DollarSign, TrendingUp, TrendingDown,
  Building2, Calendar, Download, Filter, BarChart3,
  PieChart, Wallet, CreditCard
} from 'lucide-react'
import Button from '../../components/Button'
import Badge from '../../components/common/Badge'

export default function AdminFinanceDashboard() {
  const [period, setPeriod] = useState('month')

  const stats = [
    { label: 'Receita Total', value: '2.450.000 Kz', change: '+12.5%', icon: DollarSign, color: 'text-green-500' },
    { label: 'Comissões', value: '245.000 Kz', change: '+8.3%', icon: Wallet, color: 'text-blue-500' },
    { label: 'Empresas Ativas', value: '48', change: '+6', icon: Building2, color: 'text-purple-500' },
    { label: 'Total Reservas', value: '1.234', change: '+15.2%', icon: CreditCard, color: 'text-orange-500' },
  ]

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Financeiro
            </h1>
            <p className="text-sm text-gray-500">Visão geral das finanças da plataforma</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <Button variant="secondary" icon={Download}>Exportar</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <stat.icon size={24} className={stat.color} />
              <Badge variant={stat.change.startsWith('+') ? 'success' : 'danger'}>
                {stat.change}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Gráficos Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <BarChart3 size={48} className="opacity-20" />
            <span className="ml-3">Gráfico em desenvolvimento</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Distribuição de Comissões</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <PieChart size={48} className="opacity-20" />
            <span className="ml-3">Gráfico em desenvolvimento</span>
          </div>
        </div>
      </div>

      {/* Últimas Transações */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Últimas Transações</h3>
          <Button variant="ghost" size="sm">Ver todas</Button>
        </div>
        <div className="space-y-3">
          {[
            { id: 1, company: 'Angola Travel Experts', service: 'Tour Histórico', amount: 15000, commission: 1500, date: '2025-02-15', status: 'completed' },
            { id: 2, company: 'Hotel Baía Azul', service: 'Reserva de Quarto', amount: 85000, commission: 8500, date: '2025-02-14', status: 'pending' },
            { id: 3, company: 'EcoAngola Adventures', service: 'Safari', amount: 75000, commission: 7500, date: '2025-02-13', status: 'completed' },
          ].map((tx) => (
            <div key={tx.id} className="flex flex-wrap items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl gap-2">
              <div>
                <p className="font-medium text-sm">{tx.company}</p>
                <p className="text-xs text-gray-500">{tx.service} • {tx.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{tx.amount.toLocaleString()} Kz</p>
                <p className="text-xs text-gray-500">Comissão: {tx.commission.toLocaleString()} Kz</p>
              </div>
              <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                {tx.status === 'completed' ? 'Concluída' : 'Pendente'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}