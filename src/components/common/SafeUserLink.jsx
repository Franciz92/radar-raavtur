// src/components/common/SafeUserLink.jsx

import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export const SafeUserLink = ({ user, isEn, showAvatar = true }) => {
  const userId = user?.id;
  const userName = user?.name || (isEn ? 'Anonymous' : 'Anônimo');
  const userAvatar = user?.avatar_url || null;

  if (!userId) {
    return (
      <div className="flex items-center gap-2">
        {showAvatar && (
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <User size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {userName}
        </span>
      </div>
    );
  }

  return (
    <Link 
      to={`/perfil/${userId}`} 
      className="flex items-center gap-2 hover:text-purple-500 transition group"
    >
      {showAvatar && (
        userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <User size={16} className="text-purple-600 dark:text-purple-400" />
          </div>
        )
      )}
      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-500 transition">
        {userName}
      </span>
    </Link>
  );
};