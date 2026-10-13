// src/components/profile/FollowButton.jsx

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { checkIfFollowing, followUser, unfollowUser } from '../../services/profileService';
import toast from 'react-hot-toast';

export default function FollowButton({ targetUserId, onFollowChange }) {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Verificar se já segue
  useEffect(() => {
    const checkFollow = async () => {
      if (!isAuthenticated || !user?.id || !targetUserId) {
        setLoading(false);
        return;
      }

      if (user.id === targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const { isFollowing: following } = await checkIfFollowing(user.id, targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Erro ao verificar follow:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollow();
  }, [user?.id, targetUserId, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to follow' : 'Faça login para seguir');
      return;
    }

    if (user.id === targetUserId) {
      toast.error(isEn ? 'You cannot follow yourself' : 'Não pode seguir a si mesmo');
      return;
    }

    setActionLoading(true);

    try {
      if (isFollowing) {
        const { success, error } = await unfollowUser(user.id, targetUserId);
        if (error) throw error;
        setIsFollowing(false);
        toast.success(isEn ? 'Unfollowed!' : 'Deixou de seguir!');
        if (onFollowChange) onFollowChange(false);
      } else {
        const { data, error } = await followUser(user.id, targetUserId);
        if (error) throw error;
        setIsFollowing(true);
        toast.success(isEn ? 'Following!' : 'Seguindo!');
        if (onFollowChange) onFollowChange(true);
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      toast.error(error.message || (isEn ? 'Error' : 'Erro'));
    } finally {
      setActionLoading(false);
    }
  };

  // Não mostrar o botão para o próprio usuário
  if (user?.id === targetUserId) {
    return null;
  }

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
      >
        <Loader2 size={16} className="animate-spin" />
        {isEn ? 'Loading...' : 'Carregando...'}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={actionLoading}
      className={`
        flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:scale-105
        ${isFollowing
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25'
        }
        ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {actionLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck size={18} />
          {isEn ? 'Following' : 'Seguindo'}
        </>
      ) : (
        <>
          <UserPlus size={18} />
          {isEn ? 'Follow' : 'Seguir'}
        </>
      )}
    </button>
  );
}