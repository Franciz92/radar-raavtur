// src/pages/company/CompanyEdit.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Save, Building2 } from 'lucide-react';

export default function CompanyEdit() {
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const { user, company, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    province: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  });

  // DEBUG - Mostrar no console
  console.log('🔍 CompanyEdit montado!');
  console.log('🔍 authLoading:', authLoading);
  console.log('🔍 company:', company);
  console.log('🔍 user:', user);

  // Carregar dados do company do AuthContext
  useEffect(() => {
    console.log('🔍 useEffect CompanyEdit executado');
    console.log('🔍 authLoading:', authLoading);
    console.log('🔍 company:', company);
    
    if (!authLoading && company) {
      console.log('✅ Company encontrado, carregando dados');
      setFormData({
        name: company.name || '',
        description: company.description || '',
        category: company.category || '',
        province: company.province || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || ''
      });
      setLoading(false);
    } else if (!authLoading && !company) {
      console.log('❌ Nenhuma empresa encontrada');
      setLoading(false);
    }
  }, [authLoading, company]);

  // Atualizar campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Salvar
  const handleSave = async () => {
    if (!company?.id) {
      toast.error(isEn ? 'Company not found' : 'Empresa não encontrada');
      return;
    }

    setSaving(true);
    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        province: formData.province,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website
      };

      console.log('💾 Salvando:', updates);

      const { error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', company.id);

      if (error) throw error;

      toast.success(isEn ? 'Company updated!' : 'Empresa atualizada!');
      navigate('/empresa/dashboard');
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(error.message || (isEn ? 'Update failed' : 'Falha ao atualizar'));
    } finally {
      setSaving(false);
    }
  };

  // PÁGINA DE CARREGAMENTO
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Loading...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  // PÁGINA - SEMPRE RENDERIZAR ALGO
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 size={28} className="text-blue-600" />
            {isEn ? 'Edit Company' : 'Editar Empresa'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isEn ? 'Update your company information' : 'Atualize as informações da empresa'}
          </p>
        </div>
        <button
          onClick={() => navigate('/empresa/dashboard')}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          {isEn ? 'Back' : 'Voltar'}
        </button>
      </div>

      {/* Formulário - SEMPRE RENDERIZAR */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Company Name' : 'Nome da Empresa'} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Category' : 'Categoria'}
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{isEn ? 'Select' : 'Selecione'}</option>
              <option value="Hotel">Hotel</option>
              <option value="Restaurant">Restaurante</option>
              <option value="Tour Agency">Agência de Turismo</option>
              <option value="Tour Guide">Guia Turístico</option>
              <option value="Experience">Experiência</option>
              <option value="Event">Evento</option>
              <option value="Other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Province' : 'Província'}
            </label>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{isEn ? 'Select' : 'Selecione'}</option>
              <option value="Luanda">Luanda</option>
              <option value="Benguela">Benguela</option>
              <option value="Huíla">Huíla</option>
              <option value="Huambo">Huambo</option>
              <option value="Bié">Bié</option>
              <option value="Malanje">Malanje</option>
              <option value="Moxico">Moxico</option>
              <option value="Namibe">Namibe</option>
              <option value="Cabinda">Cabinda</option>
              <option value="Zaire">Zaire</option>
              <option value="Uíge">Uíge</option>
              <option value="Cuanza Norte">Cuanza Norte</option>
              <option value="Cuanza Sul">Cuanza Sul</option>
              <option value="Lunda Norte">Lunda Norte</option>
              <option value="Lunda Sul">Lunda Sul</option>
              <option value="Cuando Cubango">Cuando Cubango</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Address' : 'Endereço'}
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Phone' : 'Telefone'}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? 'Description' : 'Descrição'}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {isEn ? 'Save Changes' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs">
        <p><strong>Debug:</strong></p>
        <p>authLoading: {String(authLoading)}</p>
        <p>company: {company ? company.name : 'null'}</p>
        <p>user: {user ? user.email : 'null'}</p>
      </div>
    </div>
  );
}