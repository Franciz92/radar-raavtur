// src/components/experience/CommentSection.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getComments, addComment, deleteComment } from '../../services/experienceService';
import {
  User,
  Loader2,
  Send,
  Trash2,
  Reply,
  Heart,
  Clock,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DE COMENTÁRIO
// ============================================

const CommentItem = ({ comment, experienceId, isEn, onDelete, onReply }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isEn ? 'Just now' : 'Agora mesmo';
    if (minutes < 60) return `${minutes}m ${isEn ? 'ago' : 'atrás'}`;
    if (hours < 24) return `${hours}h ${isEn ? 'ago' : 'atrás'}`;
    if (days < 7) return `${days}d ${isEn ? 'ago' : 'atrás'}`;
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error(isEn ? 'Please write a reply' : 'Por favor, escreva uma resposta');
      return;
    }

    setSubmitting(true);
    try {
      const result = await addComment(user.id, experienceId, replyContent, comment.id);
      if (result.success) {
        toast.success(isEn ? 'Reply sent!' : 'Resposta enviada!');
        setReplyContent('');
        setShowReplyForm(false);
        onReply(result.data);
      }
    } catch (error) {
      console.error('❌ Erro ao responder:', error);
      toast.error(isEn ? 'Error sending reply' : 'Erro ao enviar resposta');
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = user?.id === comment.user_id;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User size={16} className="text-purple-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {comment.user?.name || isEn ? 'Anonymous' : 'Anônimo'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
            {comment.content}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-gray-500 hover:text-purple-500 transition flex items-center gap-1"
            >
              <Reply size={12} />
              {isEn ? 'Reply' : 'Responder'}
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs text-gray-500 hover:text-red-500 transition flex items-center gap-1"
              >
                <Trash2 size={12} />
                {isEn ? 'Delete' : 'Remover'}
              </button>
            )}
          </div>

          {/* Formulário de resposta */}
          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={isEn ? 'Write a reply...' : 'Escreva uma resposta...'}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                onKeyPress={(e) => e.key === 'Enter' && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={submitting || !replyContent.trim()}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition flex items-center gap-1 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Respostas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              experienceId={experienceId}
              isEn={isEn}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL DE COMENTÁRIOS
// ============================================

export default function CommentSection({ experienceId, onCommentCountUpdate }) {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (experienceId) {
      loadComments();
    }
  }, [experienceId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const result = await getComments(experienceId);
      if (result.success) {
        setComments(result.data);
        if (onCommentCountUpdate) {
          const total = result.data.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
          onCommentCountUpdate(total);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to comment' : 'Faça login para comentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error(isEn ? 'Please write a comment' : 'Por favor, escreva um comentário');
      return;
    }

    setSubmitting(true);
    try {
      const result = await addComment(user.id, experienceId, newComment);
      if (result.success) {
        setComments(prev => [result.data, ...prev]);
        setNewComment('');
        toast.success(isEn ? 'Comment added!' : 'Comentário adicionado!');
        if (onCommentCountUpdate) {
          onCommentCountUpdate(comments.length + 1);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar comentário:', error);
      toast.error(isEn ? 'Error adding comment' : 'Erro ao adicionar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm(isEn ? 'Delete this comment?' : 'Remover este comentário?')) return;

    try {
      const result = await deleteComment(commentId, experienceId);
      if (result.success) {
        // Recarregar comentários
        await loadComments();
        toast.success(isEn ? 'Comment removed!' : 'Comentário removido!');
      }
    } catch (error) {
      console.error('❌ Erro ao remover comentário:', error);
      toast.error(isEn ? 'Error removing comment' : 'Erro ao remover comentário');
    }
  };

  const handleReply = (newReply) => {
    // Atualizar a lista de comentários com a nova resposta
    const updateReplies = (comments) => {
      return comments.map(comment => {
        if (comment.id === newReply.parent_id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateReplies(comment.replies),
          };
        }
        return comment;
      });
    };
    setComments(updateReplies(comments));
    if (onCommentCountUpdate) {
      onCommentCountUpdate(comments.length + 1);
    }
  };

  const visibleComments = showAll ? comments : comments.slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulário de comentário */}
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User size={18} className="text-purple-500" />
            </div>
          )}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isEn ? 'Write a comment...' : 'Escreva um comentário...'}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Lista de comentários */}
      {comments.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">{isEn ? 'No comments yet' : 'Nenhum comentário ainda'}</p>
          <p className="text-xs text-gray-400">
            {isEn ? 'Be the first to comment!' : 'Seja o primeiro a comentar!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              experienceId={experienceId}
              isEn={isEn}
              onDelete={handleDeleteComment}
              onReply={handleReply}
            />
          ))}
          {comments.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-purple-500 hover:text-purple-600 transition flex items-center gap-1 mx-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp size={16} />
                  {isEn ? 'Show less' : 'Ver menos'}
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  {isEn ? `Show ${comments.length - 3} more` : `Ver mais ${comments.length - 3}`}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}