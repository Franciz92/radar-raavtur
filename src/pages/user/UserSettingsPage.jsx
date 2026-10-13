// src/pages/user/UserSettingsPage.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Save, Loader2, ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

export default function UserSettingsPage() {
  const { user, updateUser, refreshUser } = useAuth()
  const { isEn } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '' })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateUser({ name: formData.name, phone: formData.phone, location: formData.location })
      await refreshUser()
      toast.success(isEn ? 'Settings updated!' : 'Configurações atualizadas!')
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-4">
        <Settings size={28} className="text-primary-500" />
        {isEn ? 'Settings' : 'Configurações'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mt-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Name' : 'Nome'}</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={formData.email} disabled className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isEn ? 'Phone' : 'Telefone'}</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700" />
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-6 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? (isEn ? 'Saving...' : 'Salvando...') : (isEn ? 'Save' : 'Salvar')}
        </button>
      </form>
    </div>
  )
}