import { SearchX } from 'lucide-react'
import Button from '../Button'

export default function EmptyState({
  title = 'Nenhum resultado encontrado',
  description = 'Tente ajustar os filtros ou pesquisar por outro termo.',
  action,
  icon: Icon = SearchX,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={64} className="mb-4 text-gray-300 dark:text-gray-600" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}