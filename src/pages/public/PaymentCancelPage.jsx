// src/pages/public/PaymentCancelPage.jsx

import { Link } from 'react-router-dom'
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function PaymentCancelPage() {
  const { isEn } = useLanguage()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isEn ? 'Payment Cancelled' : 'Pagamento Cancelado'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isEn 
            ? 'Your payment was cancelled. You can try again or contact support if you need assistance.'
            : 'Seu pagamento foi cancelado. Você pode tentar novamente ou entrar em contato com o suporte se precisar de ajuda.'
          }
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6 border border-yellow-200 dark:border-yellow-800 text-left">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            {isEn 
              ? 'No charges were made to your account.'
              : 'Nenhum valor foi cobrado da sua conta.'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/pagamento/reintentar"
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            {isEn ? 'Try Again' : 'Tentar Novamente'}
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            {isEn ? 'Home' : 'Início'}
          </Link>
        </div>
      </div>
    </div>
  )
}