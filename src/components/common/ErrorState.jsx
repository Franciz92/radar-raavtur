import { AlertTriangle } from 'lucide-react'
import Button from '../Button'

export default function ErrorState({ message = 'Ocorreu um erro ao carregar os dados.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle size={64} className="mb-4 text-red-400" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Erro</h3>
      <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">{message}</p>
      {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
    </div>
  )
}