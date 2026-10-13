export default function Card({ children, className = '', hover = true, onClick, padding = true }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white shadow-sm dark:bg-gray-800 dark:shadow-gray-900/30 ${hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : ''} ${padding ? 'p-4' : ''} ${className}`}
    >
      {children}
    </div>
  )
}