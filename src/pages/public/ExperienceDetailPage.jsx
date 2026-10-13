// src/pages/public/ExperienceDetailPage.jsx
// ============================================
// DETALHE DA EXPERIÊNCIA/PUBLICAÇO
// - Likes, Comentários, Views, Shares
// - Autor clicável
// - Editar/Eliminar experiência (se for dono)
// - ✅ Editar/Eliminar comentário (se for autor)
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import CreateExperienceModal from '../../components/experience/CreateExperienceModal';
import {
  getExperienceById,
  toggleLike,
  checkUserLiked,
  addComment,
  deleteComment,
  registerView,
  registerShare,
  deleteExperience,
} from '../../services/experienceService';
import {
  ArrowLeft, Heart, MessageCircle, Share2, MapPin, Star,
  User, Loader2, Eye, Send, Trash2, Edit3, X,
  CheckCircle, AlertCircle, Calendar, Copy, Check, Save
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE: COMENTÁRIO (com edição)
// ============================================
const CommentItem = ({ comment, isEn, user, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isEn ? 'Just now' : 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const commentUser = comment.user || null;
  const userName = commentUser?.name || (isEn ? 'Anonymous' : 'Anónimo');
  const userAvatar = commentUser?.avatar_url || null;
  const isOwnComment = commentUser?.id === user?.id;

  // ============================================
  // GUARDAR EDIÇO
  // ============================================
  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error(isEn ? 'Comment cannot be empty' : 'O comentário não pode estar vazio');
      return;
    }

    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('experience_comments')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', comment.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(isEn ? 'Comment updated!' : 'Comentário atualizado!');
      setIsEditing(false);
      
      // Notificar o pai para atualizar a lista
      if (onUpdate) {
        onUpdate(comment.id, editContent.trim());
      }
    } catch (error) {
      console.error('❌ Erro ao editar comentário:', error);
      toast.error(error.message || (isEn ? 'Error updating' : 'Erro ao atualizar'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
      {/* Avatar */}
      <Link 
        to={commentUser?.id ? `/perfil/${commentUser.id}` : '#'} 
        className="flex-shrink-0"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-amber-500 transition"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <User size={18} className="text-amber-600" />
          </div>
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {commentUser?.id ? (
            <Link
              to={`/perfil/${commentUser.id}`}
              className="font-semibold text-sm text-gray-900 dark:text-white hover:text-amber-600 transition"
            >
              {userName}
            </Link>
          ) : (
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{userName}</span>
          )}
          <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
          
          {/* Badge "editado" */}
          {comment.updated_at && comment.created_at !== comment.updated_at && (
            <span className="text-[10px] text-gray-400 italic">
              ({isEn ? 'edited' : 'editado'})
            </span>
          )}

          {/* Botões do autor */}
          {isOwnComment && !isEditing && (
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
                title={isEn ? 'Edit' : 'Editar'}
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title={isEn ? 'Delete' : 'Eliminar'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Modo edição */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {isEn ? 'Save' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition"
              >
                <X size={12} />
                {isEn ? 'Cancel' : 'Cancelar'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ExperienceDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // CARREGAR
  // ============================================
  useEffect(() => {
    if (id) loadExperience();
  }, [id]);

  const loadExperience = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [ExperienceDetail] Carregando:', id);
      const result = await getExperienceById(id);

      if (!result.success) throw new Error(result.error);
      if (!result.data) {
        setError(isEn ? 'Experience not found' : 'Experiência não encontrada');
        setLoading(false);
        return;
      }

      setExperience(result.data);
      setLikesCount(result.data.likes_count || 0);
      setComments(result.data.comments || []);

      if (user?.id) {
        const likeResult = await checkUserLiked(id, user.id);
        if (likeResult.success) setLiked(likeResult.liked);
        await registerView(id, user.id);
      }
    } catch (err) {
      console.error('❌ [ExperienceDetail] Erro:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LIKE
  // ============================================
  const handleLike = async () => {
    if (!user) {
      toast.error(isEn ? 'Login to like' : 'Faça login para curtir');
      navigate('/login');
      return;
    }

    const result = await toggleLike(id, user.id);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likesCount);
      setExperience(prev => ({ ...prev, likes_count: result.likesCount }));
    } else {
      toast.error(result.error);
    }
  };

  // ============================================
  // SHARE
  // ============================================
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: experience.title,
          text: experience.content?.slice(0, 100),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(isEn ? 'Link copied!' : 'Link copiado!');
      }
      await registerShare(id, user?.id, 'link');
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Erro:', err);
    }
  };

  // ============================================
  // COMENTAR
  // ============================================
  const handleAddComment = async () => {
    if (!user) {
      toast.error(isEn ? 'Login to comment' : 'Faça login para comentar');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setLoadingComment(true);
    const result = await addComment(id, user.id, newComment);

    if (result.success) {
      setComments(prev => [result.data, ...prev]);
      setNewComment('');
      toast.success(isEn ? 'Comment added!' : 'Comentário adicionado!');
    } else {
      toast.error(result.error);
    }
    setLoadingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm(isEn ? 'Delete this comment?' : 'Eliminar este comentário?')) return;

    const result = await deleteComment(commentId, user.id, id);
    if (result.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success(isEn ? 'Comment deleted!' : 'Comentário eliminado!');
    } else {
      toast.error(result.error);
    }
  };

  // ============================================
  // ✅ ATUALIZAR COMENTÁRIO LOCALMENTE
  // ============================================
  const handleUpdateComment = (commentId, newContent) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, content: newContent, updated_at: new Date().toISOString() }
          : c
      )
    );
  };

  // ============================================
  // ELIMINAR EXPERIÊNCIA
  // ============================================
  const handleDeleteExperience = async () => {
    if (!confirm(isEn ? 'Delete permanently?' : 'Eliminar permanentemente?')) return;
    
    setDeleting(true);
    const result = await deleteExperience(id, user.id);
    
    if (result.success) {
      toast.success(isEn ? 'Deleted!' : 'Eliminada!');
      navigate('/experiencias');
    } else {
      toast.error(result.error);
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    loadExperience();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================
  // LOADING / ERRO
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-amber-500" />
        <p className="text-gray-500">
          {isEn ? 'Loading...' : 'A carregar...'}
        </p>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
            {isEn ? 'Not found' : 'Não encontrada'}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
          <Link to="/experiencias" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition">
            <ArrowLeft size={18} />
            {isEn ? 'Back' : 'Voltar'}
          </Link>
        </div>
      </div>
    );
  }

  const author = experience.user || {
    id: experience.user_id,
    name: isEn ? 'User' : 'Utilizador',
    avatar_url: null,
  };
  const isOwner = user?.id === experience.user_id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <CreateExperienceModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        experience={experience}
      />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 max-w-4xl flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-amber-600 transition"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">{isEn ? 'Back' : 'Voltar'}</span>
          </button>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
              >
                <Edit3 size={16} />
                {isEn ? 'Edit' : 'Editar'}
              </button>
              <button
                onClick={handleDeleteExperience}
                disabled={deleting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isEn ? 'Delete' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Imagem */}
          {experience.images && experience.images.length > 0 && (
            <div className="relative h-96 bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <img src={experience.images[0]} alt={experience.title} className="w-full h-full object-cover" />
              {experience.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">
                  📸 1 / {experience.images.length}
                </div>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            
            {/* Autor */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <Link to={`/perfil/${author.id}`} className="flex items-center gap-3 hover:opacity-80 transition group">
                {author.avatar_url ? (
                  <img src={author.avatar_url} alt={author.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/20 group-hover:ring-amber-500 transition" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <User size={24} className="text-white" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition">
                    {author.name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(experience.created_at)}
                  </p>
                </div>
              </Link>

              {experience.rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= experience.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {experience.title}
            </h1>

            {/* Localização */}
            {experience.location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6">
                <MapPin size={18} className="text-amber-500" />
                <span>
                  {experience.location}
                  {experience.province && `, ${experience.province}`}
                </span>
              </div>
            )}

            {/* Conteúdo */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                {experience.content}
              </p>
            </div>

            {/* Galeria */}
            {experience.images && experience.images.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {experience.images.slice(1).map((url, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  liked
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                <Heart size={18} className={liked ? 'fill-current' : ''} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500">
                <Eye size={18} />
                <span>{experience.views_count || 0}</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500">
                <MessageCircle size={18} />
                <span>{comments.length}</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition ml-auto"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                <span className="hidden sm:inline">
                  {copied ? (isEn ? 'Copied!' : 'Copiado!') : (isEn ? 'Share' : 'Partilhar')}
                </span>
              </button>
            </div>
          </div>
        </article>

        {/* ============================================ */}
        {/* COMENTÁRIOS */}
        {/* ============================================ */}
        <section className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle size={22} className="text-amber-500" />
            {isEn ? 'Comments' : 'Comentários'} ({comments.length})
          </h2>

          {/* Input */}
          {isAuthenticated ? (
            <div className="flex gap-3 mb-6">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-amber-600" />
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isEn ? 'Write a comment...' : 'Escreva um comentário...'}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={loadingComment || !newComment.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition disabled:opacity-50"
                  >
                    {loadingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isEn ? 'Send' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <p className="text-gray-500 mb-3">
                {isEn ? 'Login to comment' : 'Faça login para comentar'}
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition">
                <User size={16} />
                {isEn ? 'Login' : 'Entrar'}
              </Link>
            </div>
          )}

          {/* Lista */}
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500">
                {isEn ? 'No comments yet. Be the first!' : 'Ainda sem comentários. Seja o primeiro!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isEn={isEn}
                  user={user}
                  onDelete={handleDeleteComment}
                  onUpdate={handleUpdateComment}
                />
              ))}
            </div>
          )}
        </section>

        {/* Ver mais */}
        <div className="mt-6 text-center">
          <Link
            to="/experiencias"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            <ArrowLeft size={18} />
            {isEn ? 'See more experiences' : 'Ver mais experiências'}
          </Link>
        </div>
      </div>
    </div>
  );
}