// src/pages/company/CompanyMenu.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getDishesByRestaurant, createDish, updateDish, deleteDish } from '../../services/restaurantService';
import { supabase } from '../../services/supabase';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Utensils,
  Image as ImageIcon,
  X,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE FORMULÁRIO DE PRATO
// ============================================

const DishForm = ({ dish, onSave, onCancel, isEn, restaurantId }) => {
  const [formData, setFormData] = useState({
    name: dish?.name || '',
    description: dish?.description || '',
    price: dish?.price || '',
    category: dish?.category || 'Principal',
    image_url: dish?.image_url || '',
    status: dish?.status || 'active',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(dish?.image_url || null);

  const categories = [
    'Entrada',
    'Principal',
    'Sobremesa',
    'Bebida',
    'Acompanhamento',
    'Petisco',
    'Outro',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `restaurant_${restaurantId}/dish_${Date.now()}.${fileExt}`;
      const filePath = `restaurant-dishes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('restaurant-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(filePath);

      setImagePreview(publicUrl);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success(isEn ? 'Image uploaded!' : 'Imagem carregada!');
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      toast.error(isEn ? 'Error uploading image' : 'Erro ao carregar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(isEn ? 'Dish name is required' : 'Nome do prato é obrigatório');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error(isEn ? 'Valid price is required' : 'Preço válido é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const result = await onSave({
        ...formData,
        price: parseFloat(formData.price),
        restaurant_id: restaurantId,
      });

      if (result.success) {
        toast.success(isEn ? 'Dish saved successfully!' : 'Prato salvo com sucesso!');
        onCancel();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar prato:', error);
      toast.error(error.message || (isEn ? 'Error saving dish' : 'Erro ao salvar prato'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {dish ? (isEn ? 'Edit Dish' : 'Editar Prato') : (isEn ? 'New Dish' : 'Novo Prato')}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Dish Name' : 'Nome do Prato'} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={isEn ? 'e.g., Grilled Chicken' : 'Ex: Frango Grelhado'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Description' : 'Descrição'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={isEn ? 'Describe the dish...' : 'Descreva o prato...'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Preço e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Price' : 'Preço'} (Kz) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
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
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Image' : 'Imagem'}
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img src={imagePreview} alt="Prato" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">
                      {isEn ? 'Upload' : 'Carregar'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                )}
                {uploading && <Loader2 size={20} className="animate-spin text-orange-500" />}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition"
              >
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    {dish ? <Edit size={20} /> : <Plus size={20} />}
                    {dish ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Create' : 'Criar')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CompanyMenu() {
  const { company, loading: companyLoading } = useCompany();
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['Entrada', 'Principal', 'Sobremesa', 'Bebida', 'Acompanhamento', 'Petisco', 'Outro'];

  useEffect(() => {
    if (company?.id) {
      loadDishes();
    }
  }, [company]);

  const loadDishes = async () => {
    if (!company?.id) return;

    setLoading(true);
    try {
      const result = await getDishesByRestaurant(company.id);
      if (result.success) {
        setDishes(result.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pratos:', error);
      toast.error(isEn ? 'Error loading dishes' : 'Erro ao carregar pratos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDish = async (data) => {
    const result = await createDish(data);
    if (result.success) {
      setDishes(prev => [result.data, ...prev]);
    }
    return result;
  };

  const handleUpdateDish = async (data) => {
    const result = await updateDish(editingDish.id, data);
    if (result.success) {
      setDishes(prev => prev.map(d => d.id === editingDish.id ? result.data : d));
    }
    return result;
  };

  const handleDeleteDish = async (dishId) => {
    if (!confirm(isEn ? 'Delete this dish?' : 'Remover este prato?')) return;

    try {
      const result = await deleteDish(dishId);
      if (result.success) {
        setDishes(prev => prev.filter(d => d.id !== dishId));
        toast.success(isEn ? 'Dish removed!' : 'Prato removido!');
      }
    } catch (error) {
      console.error('❌ Erro ao remover prato:', error);
      toast.error(isEn ? 'Error removing dish' : 'Erro ao remover prato');
    }
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dish.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'No company found' : 'Nenhuma empresa encontrada'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isEn ? 'Please register your company first' : 'Por favor, registe a sua empresa primeiro'}
        </p>
        <button
          onClick={() => navigate('/cadastrar-empresa')}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          {isEn ? 'Register Company' : 'Registar Empresa'}
        </button>
      </div>
    );
  }

  if (company.category !== 'restaurant') {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'Not a Restaurant' : 'Não é um Restaurante'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {isEn 
            ? 'This feature is only available for restaurants' 
            : 'Esta funcionalidade está disponível apenas para restaurantes'}
        </p>
        <button
          onClick={() => navigate('/empresa/dashboard')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {isEn ? 'Back to Dashboard' : 'Voltar ao Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Utensils size={28} className="text-orange-500" />
            {isEn ? 'Restaurant Menu' : 'Menu do Restaurante'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {dishes.length} {isEn ? 'dishes' : 'pratos'} {isEn ? 'available' : 'disponíveis'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDish(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition flex items-center gap-2"
        >
          <Plus size={20} />
          {isEn ? 'Add Dish' : 'Adicionar Prato'}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={isEn ? 'Search dishes...' : 'Pesquisar pratos...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 transition"
        >
          <option value="all">{isEn ? 'All Categories' : 'Todas as Categorias'}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista de Pratos */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Utensils size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEn ? 'No dishes found' : 'Nenhum prato encontrado'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isEn 
              ? 'Add your first dish to start your menu!' 
              : 'Adicione o seu primeiro prato para começar o seu menu!'}
          </p>
          <button
            onClick={() => {
              setEditingDish(null);
              setShowForm(true);
            }}
            className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            <Plus size={18} className="inline mr-2" />
            {isEn ? 'Add First Dish' : 'Adicionar Primeiro Prato'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
            >
              <div className="relative h-40 overflow-hidden">
                {dish.image_url ? (
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-300 dark:from-orange-900 dark:to-orange-700 flex items-center justify-center">
                    <Utensils size={40} className="text-white/50" />
                  </div>
                )}
                <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                  {dish.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{dish.name}</h3>
                {dish.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {dish.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-lg font-bold text-orange-500">
                    {dish.price.toLocaleString()} Kz
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingDish(dish);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal do Formulário */}
      {showForm && (
        <DishForm
          dish={editingDish}
          onSave={editingDish ? handleUpdateDish : handleCreateDish}
          onCancel={() => {
            setShowForm(false);
            setEditingDish(null);
          }}
          isEn={isEn}
          restaurantId={company.id}
        />
      )}
    </div>
  );
}