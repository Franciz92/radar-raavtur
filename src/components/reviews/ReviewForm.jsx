import { useState } from 'react'
import { Star, X, Upload } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const Button = ({ children, variant = 'primary', icon: Icon, className = '', onClick, disabled }) => {
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

export default function ReviewForm({ 
  initialRating = 0, 
  initialComment = '', 
  onSubmit, 
  onCancel,
  submitting,
  isEdit = false,
  isEn 
}) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(initialComment)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error(isEn ? 'Please select a rating' : 'Selecione uma avaliação')
      return
    }
    onSubmit(rating, comment)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit 
            ? (isEn ? 'Edit Review' : 'Editar Avaliação') 
            : (isEn ? 'Write a Review' : 'Escrever Avaliação')}
        </h3>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} icon={X}>
            {isEn ? 'Cancel' : 'Cancelar'}
          </Button>
        )}
      </div>

      {/* Estrelas */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none"
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {rating > 0 ? `${rating}/5` : (isEn ? 'Select rating' : 'Selecione')}
        </span>
      </div>

      {/* Comentário */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          {isEn ? 'Comment' : 'Comentário'}
        </label>
        <textarea
          className="input-field h-24"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={isEn ? 'Share your experience...' : 'Compartilhe sua experiência...'}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <Button type="submit" disabled={submitting || rating === 0}>
          {submitting 
            ? (isEn ? 'Sending...' : 'Enviando...') 
            : isEdit 
              ? (isEn ? 'Update Review' : 'Atualizar') 
              : (isEn ? 'Submit Review' : 'Enviar Avaliação')}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {isEn ? 'Cancel' : 'Cancelar'}
          </Button>
        )}
      </div>
    </form>
  )
}