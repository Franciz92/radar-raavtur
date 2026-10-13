import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Star, User, ThumbsUp, Trash2, Edit, Clock } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'

// ============================================
// COMPONENTES INTERNOS
// ============================================

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  )
}

const Avatar = ({ name, avatarUrl, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-700 dark:text-primary-400 flex-shrink-0 overflow-hidden`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        name?.charAt(0) || 'U'
      )}
    </div>
  )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ReviewList({ 
  reviews, 
  stats, 
  userReview, 
  loading, 
  markHelpful, 
  deleteReview,
  onEdit,
  isEn 
}) {
  const { user, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="skeleton h-16 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg">Nenhuma avaliação ainda</p>
        <p className="text-sm">Seja o primeiro a avaliar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-500">{stats.average || 0}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(stats.average) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{stats.total} avaliações</p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = stats.percentage?.[rating] || 0
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-6">{rating}</span>
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de avaliações */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const isOwner = user?.id === review.user_id
          const isAdmin = user?.role === 'admin'
          
          return (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar 
                  name={review.profiles?.name} 
                  avatarUrl={review.profiles?.avatar_url}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.profiles?.name || 'Utilizador'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= review.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300 dark:text-gray-600'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(isOwner || isAdmin) && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={Edit}
                            onClick={() => onEdit?.(review)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={Trash2}
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteReview(review.id)}
                          >
                            Excluir
                          </Button>
                        </>
                      )}
                      {isAuthenticated && !isOwner && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={ThumbsUp}
                          onClick={() => markHelpful(review.id)}
                        >
                          Útil ({review.helpful_count || 0})
                        </Button>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {review.images.map((img, i) => (
                        <img 
                          key={i}
                          src={img}
                          alt={`Avaliação ${i+1}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}