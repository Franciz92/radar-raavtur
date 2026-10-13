// src/pages/public/PaymentSuccessPage.jsx

import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Home, Receipt } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function PaymentSuccessPage() {
  const { isEn } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirecionar após 10 segundos
    const timer = setTimeout(() => {
      navigate('/minhas-reservas')
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isEn ? 'Payment Successful!' : 'Pagamento Realizado!'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {isEn 
            ? 'Your payment has been processed successfully. You will receive a confirmation email shortly.'
            : 'Seu pagamento foi processado com sucesso. Você receberá um email de confirmação em breve.'
          }
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center gap-3">
            <Receipt size={20} className="text-primary-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isEn ? 'Transaction ID' : 'ID da Transação'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {`TXN-${Date.now().toString(36).toUpperCase()}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/minhas-reservas"
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2"
          >
            <Receipt size={18} />
            {isEn ? 'My Bookings' : 'Minhas Reservas'}
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            {isEn ? 'Home' : 'Início'}
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-400">
          {isEn 
            ? 'You will be redirected automatically in 10 seconds...'
            : 'Você será redirecionado automaticamente em 10 segundos...'
          }
        </p>
      </div>
    </div>
  )
}