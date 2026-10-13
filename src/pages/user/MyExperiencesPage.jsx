// src/pages/user/MyExperiencesPage.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUserExperiences, createExperience, updateExperience, deleteExperience } from '../../services/experienceService';
import { supabase } from '../../services/supabase';
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  MapPin,
  Calendar,
  User,
  Heart,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  X,
  Upload,
  Camera,
  Video,
  Music,
  Link as LinkIcon,
  Tag,
  Globe,
  Smile,
  Clock,
  Eye,
  Heart as HeartIcon,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
  Check,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE FORMULÁRIO DE EXPERIÊNCIA
// ============================================

const ExperienceForm = ({ experience, onSave, onCancel, isEn, user }) => {
  const [formData, setFormData] = useState({
    title: experience?.title || '',
    content: experience?.content || '',
    location: experience?.location || '',
    tags: experience?.tags?.join(', ') || '',
    image_url: experience?.image_url || '',
  });
  const [imagePreview, setImagePreview] = useState(experience?.image_url || null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(experience?.content?.length || 0);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'content') {
      setCharCount(value.length);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(isEn ? 'Image must be less than 10MB' : 'A imagem deve ter menos de 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error(isEn ? 'Please upload an image file' : 'Por favor, faça upload de uma imagem');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `experiences/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('experience-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('experience-images')
        .getPublicUrl(fileName);

      setImagePreview(publicUrl);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success(isEn ? '📸 Image uploaded!' : '📸 Imagem carregada!');
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      toast.error(error.message || (isEn ? 'Error uploading image' : 'Erro ao carregar imagem'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(isEn ? '✏️ Title is required' : '✏️ Título é obrigatório');
      return;
    }
    if (!formData.content.trim()) {
      toast.error(isEn ? '📝 Content is required' : '📝 Conteúdo é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const result = await onSave({
        ...formData,
        tags,
      });
      if (result.success) {
        toast.success(isEn ? '✅ Experience published!' : '✅ Experiência publicada!');
        onCancel();
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(error.message || (isEn ? 'Error saving' : 'Erro ao salvar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {experience ? (isEn ? '✏️ Edit Experience' : '✏️ Editar Experiência') : (isEn ? '📝 New Experience' : '📝 Nova Experiência')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEn ? 'Share your travel story with the world' : 'Partilhe a sua história de viagem com o mundo'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isEn ? '📸 Cover Image' : '📸 Imagem de Capa'}
            </label>
            <div 
              className={`relative rounded-xl overflow-hidden border-2 border-dashed ${
                imagePreview ? 'border-green-400 dark:border-green-600' : 'border-gray-300 dark:border-gray-600'
              } hover:border-purple-400 transition cursor-pointer group`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Experience"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                      <Camera size={18} />
                      {isEn ? 'Change image' : 'Alterar imagem'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image_url: '' }));
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-56 bg-gray-50 dark:bg-gray-700/30">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                    <Upload size={32} className="text-purple-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {isEn ? 'Click to upload image' : 'Clique para carregar imagem'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isEn ? 'PNG, JPG, GIF up to 10MB' : 'PNG, JPG, GIF até 10MB'}
                  </p>
                  {uploading && (
                    <div className="mt-3 flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-purple-500" />
                      <span className="text-sm text-gray-500">{isEn ? 'Uploading...' : 'Carregando...'}</span>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? '✏️ Title' : '✏️ Título'} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={isEn ? 'My amazing trip to...' : 'Minha viagem incrível para...'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-lg"
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.title.length}/100</p>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MapPin size={16} className="inline mr-1" />
              {isEn ? 'Location' : 'Localização'}
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={isEn ? 'e.g., Luanda, Angola' : 'Ex: Luanda, Angola'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEn ? '📝 Story' : '📝 História'} *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              placeholder={isEn 
                ? 'Share your experience in detail... What happened? What did you feel? What did you learn?' 
                : 'Partilhe a sua experiência em detalhe... O que aconteceu? O que sentiu? O que aprendeu?'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              maxLength={5000}
              required
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{charCount}/5000</span>
              <span>{isEn ? 'Min 50 characters recommended' : 'Mín 50 caracteres recomendados'}</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Tag size={16} className="inline mr-1" />
              {isEn ? 'Tags' : 'Tags'}
              <span className="text-xs text-gray-400 font-normal ml-1">
                ({isEn ? 'comma separated' : 'separadas por vírgula'})
              </span>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder={isEn ? 'adventure, travel, beach, culture' : 'aventura, viagem, praia, cultura'}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
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
              className="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  {experience ? (isEn ? 'Update' : 'Atualizar') : (isEn ? 'Publish' : 'Publicar')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE DE CARD DE EXPERIÊNCIA (MINHAS)
// ============================================

const ExperienceCard = ({ experience, isEn, onEdit, onDelete, onView }) => {
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition group">
      {experience.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={experience.image_url}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute top-3 right-3 flex gap-1">
            <button
              onClick={() => onEdit(experience)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition shadow-sm"
              title={isEn ? 'Edit' : 'Editar'}
            >
              <Edit size={16} className="text-gray-700" />
            </button>
            <button
              onClick={() => onDelete(experience.id)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 transition shadow-sm"
              title={isEn ? 'Delete' : 'Remover'}
            >
              <Trash2 size={16} className="text-gray-700 hover:text-red-500" />
            </button>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-500 transition line-clamp-1">
            {experience.title}
          </h3>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(experience.created_at)}
          </span>
        </div>
        {experience.location && (
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={14} />
            {experience.location}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
          {experience.content}
        </p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Heart size={14} className="text-red-500" />
            {experience.likes_count || 0}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <MessageCircle size={14} className="text-blue-500" />
            {experience.comments_count || 0}
          </span>
          <button
            onClick={() => onView(experience.id)}
            className="ml-auto text-sm text-purple-500 hover:text-purple-600 font-medium flex items-center gap-1"
          >
            {isEn ? 'Read more' : 'Ver mais'}
            <Eye size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function MyExperiencesPage() {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadExperiences();
  }, [isAuthenticated]);

  const loadExperiences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await getUserExperiences(user.id);
      if (result.success) {
        const data = result.data || [];
        setExperiences(data);
        setStats({
          total: data.length,
          totalLikes: data.reduce((acc, e) => acc + (e.likes_count || 0), 0),
          totalComments: data.reduce((acc, e) => acc + (e.comments_count || 0), 0),
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar experiências:', error);
      toast.error(isEn ? 'Error loading experiences' : 'Erro ao carregar experiências');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    const result = await createExperience({
      ...data,
      user_id: user.id,
    });
    if (result.success) {
      setExperiences(prev => [result.data, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
      }));
    }
    return result;
  };

  const handleUpdate = async (data) => {
    const result = await updateExperience(editingExperience.id, data);
    if (result.success) {
      setExperiences(prev => prev.map(e => e.id === editingExperience.id ? result.data : e));
    }
    return result;
  };

  const handleDelete = async (id) => {
    if (!confirm(isEn ? 'Delete this experience?' : 'Remover esta experiência?')) return;

    try {
      const result = await deleteExperience(id);
      if (result.success) {
        const deleted = experiences.find(e => e.id === id);
        setExperiences(prev => prev.filter(e => e.id !== id));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          totalLikes: prev.totalLikes - (deleted?.likes_count || 0),
          totalComments: prev.totalComments - (deleted?.comments_count || 0),
        }));
        toast.success(isEn ? '🗑️ Experience removed!' : '🗑️ Experiência removida!');
      }
    } catch (error) {
      console.error('❌ Erro ao remover:', error);
      toast.error(isEn ? 'Error removing' : 'Erro ao remover');
    }
  };

  const handleView = (id) => {
    navigate(`/experiencia/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={28} className="text-purple-500" />
            {isEn ? 'My Experiences' : 'Minhas Experiências'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn 
              ? `${stats.total} stories shared · ${stats.totalLikes} likes · ${stats.totalComments} comments`
              : `${stats.total} histórias partilhadas · ${stats.totalLikes} curtidas · ${stats.totalComments} comentários`}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingExperience(null);
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <PlusCircle size={20} />
          {isEn ? 'Share Experience' : 'Partilhar Experiência'}
        </button>
      </div>

      {/* Lista de Experiências */}
      {experiences.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={48} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEn ? 'No experiences yet' : 'Nenhuma experiência ainda'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            {isEn 
              ? 'Share your first travel story with the community! Tell the world about your adventures.'
              : 'Partilhe a sua primeira história de viagem com a comunidade! Conte ao mundo sobre as suas aventuras.'}
          </p>
          <button
            onClick={() => {
              setEditingExperience(null);
              setShowForm(true);
            }}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
          >
            <PlusCircle size={20} />
            {isEn ? 'Share Your Experience' : 'Partilhe sua Experiência'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              isEn={isEn}
              onEdit={(exp) => {
                setEditingExperience(exp);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modal do Formulário */}
      {showForm && (
        <ExperienceForm
          experience={editingExperience}
          onSave={editingExperience ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingExperience(null);
          }}
          isEn={isEn}
          user={user}
        />
      )}
    </div>
  );
}