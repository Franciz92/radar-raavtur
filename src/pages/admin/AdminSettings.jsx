// src/pages/admin/AdminSettings.jsx

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Settings,
  Globe,
  Moon,
  Sun,
  DollarSign,
  Percent,
  Shield,
  Mail,
  Bell,
  Save,
  Loader2,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  Package,
  CreditCard,
  Database,
  HardDrive,
  Lock,
  Key
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const navigate = useNavigate()
  const { isEn, language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    platformName: 'Radar RAVTUR',
    platformEmail: 'admin@radarravtur.com',
    platformFee: 10,
    currency: 'Kz',
    maintenance: false,
    allowRegistration: true,
    allowCompanyRegistration: true,
    maxBookingsPerDay: 50,
    maxGuestsPerBooking: 20,
    bookingCancellationDays: 3,
    reviewModeration: true,
    notificationsEnabled: true,
    emailNotifications: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Tentar buscar configurações do banco
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') throw error
      
      if (data) {
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Salvar configurações
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      toast.success(isEn ? 'Settings saved successfully!' : 'Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error(error.message || (isEn ? 'Error saving settings' : 'Erro ao salvar configurações'))
    } finally {
      setSaving(false)
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={28} className="text-primary-500" />
            {isEn ? 'Admin Settings' : 'Configurações do Admin'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isEn 
              ? 'Manage platform settings and preferences'
              : 'Gerencie as configurações e preferências da plataforma'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configurações Gerais */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-primary-500" />
            {isEn ? 'General Settings' : 'Configurações Gerais'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Platform Name' : 'Nome da Plataforma'}
              </label>
              <input
                type="text"
                name="platformName"
                value={settings.platformName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Platform Email' : 'Email da Plataforma'}
              </label>
              <input
                type="email"
                name="platformEmail"
                value={settings.platformEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Platform Fee (%)' : 'Taxa da Plataforma (%)'}
              </label>
              <div className="relative">
                <Percent size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="platformFee"
                  value={settings.platformFee}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Currency' : 'Moeda'}
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="Kz">Kz (Kwanza)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Allow user registration' : 'Permitir registro de usuários'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="allowCompanyRegistration"
                checked={settings.allowCompanyRegistration}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Allow company registration' : 'Permitir registro de empresas'}
              </span>
            </label>
          </div>
        </div>

        {/* Configurações de Reservas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" />
            {isEn ? 'Booking Settings' : 'Configurações de Reservas'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Max Bookings Per Day' : 'Máximo de Reservas por Dia'}
              </label>
              <input
                type="number"
                name="maxBookingsPerDay"
                value={settings.maxBookingsPerDay}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Max Guests Per Booking' : 'Máximo de Pessoas por Reserva'}
              </label>
              <input
                type="number"
                name="maxGuestsPerBooking"
                value={settings.maxGuestsPerBooking}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Cancellation Days' : 'Dias para Cancelamento'}
              </label>
              <input
                type="number"
                name="bookingCancellationDays"
                value={settings.bookingCancellationDays}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary-500" />
            {isEn ? 'Preferences' : 'Preferências'}
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="maintenance"
                checked={settings.maintenance}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Maintenance Mode' : 'Modo de Manutenção'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="reviewModeration"
                checked={settings.reviewModeration}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Review Moderation' : 'Moderação de Avaliações'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Enable Notifications' : 'Ativar Notificações'}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Email Notifications' : 'Notificações por Email'}
              </span>
            </label>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Moon size={20} className="text-primary-500" />
            {isEn ? 'Appearance' : 'Aparência'}
          </h2>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Theme' : 'Tema'}:
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
              >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'dark' ? (isEn ? 'Dark' : 'Escuro') : (isEn ? 'Light' : 'Claro')}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isEn ? 'Language' : 'Idioma'}:
              </span>
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {language.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Link
            to="/admin/dashboard"
            className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
          >
            {isEn ? 'Cancel' : 'Cancelar'}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving 
              ? (isEn ? 'Saving...' : 'Salvando...') 
              : (isEn ? 'Save Settings' : 'Salvar Configurações')
            }
          </button>
        </div>
      </form>
    </div>
  )
}