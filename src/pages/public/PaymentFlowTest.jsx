// src/pages/public/PaymentFlowTest.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  ChevronRight,
  Shield,
  Lock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase, createBooking, updateBookingPayment } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function PaymentFlowTest() {
  const { user, isAuthenticated } = useAuth()
  const { company } = useCompany()
  const { isEn } = useLanguage()
  const navigate = useNavigate()

  // Estados do fluxo
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // Dados da reserva
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    serviceCategory: '',
    companyId: '',
    companyName: '',
    bookingDateService: '',
    bookingTime: '',
    guests: 1,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: ''
  })

  // Dados do pagamento
  const [paymentData, setPaymentData] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    mobileNumber: '',
    mobileProvider: '',
    bankName: '',
    bankAccount: '',
    bankHolder: ''
  })

  // Resultado
  const [result, setResult] = useState(null)
  const [bookingId, setBookingId] = useState(null)

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerEmail: user.email || '',
        customerPhone: user.phone || ''
      }))
    }
  }, [user])

  // Simular serviços disponíveis
  const mockServices = [
    { id: '1', name: 'Tour Histórico de Luanda', price: 15000, category: 'Experiência', companyId: 'comp1', companyName: 'Angola Tours' },
    { id: '2', name: 'Passeio de Barco na Baía', price: 25000, category: 'Experiência', companyId: 'comp2', companyName: 'Marítima Turismo' },
    { id: '3', name: 'Transfer Aeroporto-Hotel', price: 10000, category: 'Transporte', companyId: 'comp3', companyName: 'Angola Transfers' },
    { id: '4', name: 'Hotel Resort 5 Estrelas', price: 45000, category: 'Hotel', companyId: 'comp4', companyName: 'Resorts Angola' },
  ]

  const handleServiceSelect = (service) => {
    setBookingData(prev => ({
      ...prev,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceCategory: service.category,
      companyId: service.companyId,
      companyName: service.companyName
    }))
    setStep(2)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    if (!bookingData.serviceId) {
      toast.error(isEn ? 'Please select a service' : 'Por favor, selecione um serviço')
      return
    }

    if (!bookingData.bookingDateService) {
      toast.error(isEn ? 'Please select a date' : 'Por favor, selecione uma data')
      return
    }

    setProcessing(true)
    
    try {
      // Criar reserva
      const result = await createBooking({
        userId: user.id,
        serviceId: bookingData.serviceId,
        companyId: bookingData.companyId,
        bookingDateService: bookingData.bookingDateService,
        bookingTime: bookingData.bookingTime || null,
        guests: bookingData.guests || 1,
        subtotal: bookingData.servicePrice * (bookingData.guests || 1),
        customerName: bookingData.customerName || user.name,
        customerEmail: bookingData.customerEmail || user.email,
        customerPhone: bookingData.customerPhone || '',
        paymentMethod: 'pending',
        paymentData: {}
      })
      
      setBookingId(result)
      
      toast.success(isEn ? 'Booking created successfully!' : 'Reserva criada com sucesso!')
      setStep(3)
      
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      toast.error(error.message || (isEn ? 'Error creating booking' : 'Erro ao criar reserva'))
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Atualizar pagamento
      const paymentResult = await updateBookingPayment(bookingId, {
        paymentMethod: paymentData.method,
        paymentId: `pay_${Date.now()}`,
        status: 'completed'
      })
      
      setResult({
        success: true,
        bookingId: bookingId,
        amount: bookingData.servicePrice * bookingData.guests,
        platformFee: (bookingData.servicePrice * bookingData.guests) * 0.10,
        companyAmount: (bookingData.servicePrice * bookingData.guests) * 0.90,
        paymentMethod: paymentData.method,
        transactionId: `txn_${Date.now()}`
      })
      
      toast.success(isEn ? 'Payment completed successfully!' : 'Pagamento realizado com sucesso!')
      setStep(4)
      
    } catch (error) {
      console.error('Erro no pagamento:', error)
      toast.error(error.message || (isEn ? 'Error processing payment' : 'Erro ao processar pagamento'))
      setResult({
        success: false,
        error: error.message || 'Payment failed'
      })
    } finally {
      setProcessing(false)
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: isEn ? 'Select Service' : 'Selecionar Serviço' },
      { number: 2, label: isEn ? 'Book' : 'Reservar' },
      { number: 3, label: isEn ? 'Payment' : 'Pagamento' },
      { number: 4, label: isEn ? 'Confirmation' : 'Confirmação' }
    ]

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${step >= s.number ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                ${step === s.number ? 'ring-4 ring-primary-500/30' : ''}
              `}>
                {step > s.number ? <CheckCircle size={20} /> : s.number}
              </div>
              <span className={`text-xs mt-1 ${step >= s.number ? 'text-primary-500' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${step > s.number ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  // ============================================
  // PASSO 1: Selecionar Serviço
  // ============================================
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {isEn ? 'Select a Service' : 'Selecione um Serviço'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        {isEn 
          ? 'Choose a service to start the booking process'
          : 'Escolha um serviço para iniciar o processo de reserva'
        }
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockServices.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition text-left"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {service.category}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {service.companyName}
                </p>
              </div>
              <p className="text-lg font-bold text-primary-500">
                {service.price.toLocaleString()} Kz
              </p>
            </div>
            <div className="mt-3 flex items-center justify-end text-primary-500 text-sm">
              {isEn ? 'Select' : 'Selecionar'}
              <ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  // ============================================
  // PASSO 2: Reservar
  // ============================================
  const renderStep2 = () => (
    <form onSubmit={handleBookingSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {isEn ? 'Booking Details' : 'Detalhes da Reserva'}
      </h2>

      {/* Resumo do serviço */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {bookingData.serviceName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {bookingData.companyName} • {bookingData.serviceCategory}
            </p>
          </div>
          <p className="text-lg font-bold text-primary-500">
            {bookingData.servicePrice.toLocaleString()} Kz
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Date' : 'Data'} *
          </label>
          <input
            type="date"
            value={bookingData.bookingDateService}
            onChange={(e) => setBookingData({ ...bookingData, bookingDateService: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Time' : 'Horário'}
          </label>
          <input
            type="time"
            value={bookingData.bookingTime}
            onChange={(e) => setBookingData({ ...bookingData, bookingTime: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Number of Guests' : 'Número de Pessoas'} *
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={bookingData.guests}
            onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) || 1 })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Total Price' : 'Preço Total'}
          </label>
          <p className="text-xl font-bold text-primary-500 pt-2">
            {(bookingData.servicePrice * bookingData.guests).toLocaleString()} Kz
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Your Name' : 'Seu Nome'} *
          </label>
          <input
            type="text"
            value={bookingData.customerName}
            onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Email' : 'Email'} *
          </label>
          <input
            type="email"
            value={bookingData.customerEmail}
            onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Phone' : 'Telefone'}
          </label>
          <input
            type="tel"
            value={bookingData.customerPhone}
            onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {isEn ? 'Notes' : 'Observações'}
          </label>
          <textarea
            value={bookingData.notes}
            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          {isEn ? 'Back' : 'Voltar'}
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-1 px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowRight size={18} />
          )}
          {processing 
            ? (isEn ? 'Creating booking...' : 'Criando reserva...') 
            : (isEn ? 'Proceed to Payment' : 'Ir para Pagamento')
          }
        </button>
      </div>
    </form>
  )

  // ============================================
  // PASSO 3: Pagamento
  // ============================================
  const renderStep3 = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {isEn ? 'Payment' : 'Pagamento'}
      </h2>

      {/* Resumo do pedido */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Service' : 'Serviço'}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {bookingData.serviceName}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Date' : 'Data'}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(bookingData.bookingDateService).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Guests' : 'Pessoas'}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {bookingData.guests}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
          <span className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Subtotal' : 'Subtotal'}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {(bookingData.servicePrice * bookingData.guests).toLocaleString()} Kz
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Service Fee (10%)' : 'Taxa de Serviço (10%)'}
          </span>
          <span className="font-medium text-yellow-500">
            {((bookingData.servicePrice * bookingData.guests) * 0.10).toLocaleString()} Kz
          </span>
        </div>
        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
          <span className="text-gray-900 dark:text-white">
            {isEn ? 'Total' : 'Total'}
          </span>
          <span className="text-primary-500">
            {((bookingData.servicePrice * bookingData.guests) * 1.10).toLocaleString()} Kz
          </span>
        </div>
      </div>

      {/* Métodos de pagamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {isEn ? 'Payment Method' : 'Método de Pagamento'} *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['card', 'mobile', 'bank', 'wallet'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentData({ ...paymentData, method })}
              className={`p-3 rounded-xl border-2 transition text-center
                ${paymentData.method === method 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
              `}
            >
              {method === 'card' && <CreditCard size={24} className="mx-auto mb-1" />}
              {method === 'mobile' && <Smartphone size={24} className="mx-auto mb-1" />}
              {method === 'bank' && <Banknote size={24} className="mx-auto mb-1" />}
              {method === 'wallet' && <Wallet size={24} className="mx-auto mb-1" />}
              <span className="text-xs font-medium">
                {method === 'card' && (isEn ? 'Card' : 'Cartão')}
                {method === 'mobile' && (isEn ? 'Mobile' : 'Móvel')}
                {method === 'bank' && (isEn ? 'Bank' : 'Banco')}
                {method === 'wallet' && (isEn ? 'Wallet' : 'Carteira')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Detalhes do pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentData.method === 'card' && (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Card Number' : 'Número do Cartão'} *
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Card Holder' : 'Titular do Cartão'} *
              </label>
              <input
                type="text"
                placeholder={isEn ? 'Name on card' : 'Nome no cartão'}
                value={paymentData.cardName}
                onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Expiry Date' : 'Data de Validade'} *
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={paymentData.cardExpiry}
                onChange={(e) => setPaymentData({ ...paymentData, cardExpiry: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVV *
              </label>
              <input
                type="password"
                placeholder="123"
                value={paymentData.cardCvv}
                onChange={(e) => setPaymentData({ ...paymentData, cardCvv: e.target.value })}
                required
                maxLength="4"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </>
        )}

        {paymentData.method === 'mobile' && (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Mobile Number' : 'Número de Telefone'} *
              </label>
              <input
                type="tel"
                placeholder="912 345 678"
                value={paymentData.mobileNumber}
                onChange={(e) => setPaymentData({ ...paymentData, mobileNumber: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Provider' : 'Operadora'} *
              </label>
              <select
                value={paymentData.mobileProvider}
                onChange={(e) => setPaymentData({ ...paymentData, mobileProvider: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              >
                <option value="">{isEn ? 'Select provider' : 'Selecione a operadora'}</option>
                <option value="unitel">Unitel</option>
                <option value="movicel">Movicel</option>
                <option value="africell">Africell</option>
              </select>
            </div>
          </>
        )}

        {paymentData.method === 'bank' && (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Bank Name' : 'Nome do Banco'} *
              </label>
              <input
                type="text"
                placeholder={isEn ? 'Bank name' : 'Nome do banco'}
                value={paymentData.bankName}
                onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Account Number' : 'Número da Conta'} *
              </label>
              <input
                type="text"
                placeholder={isEn ? 'Account number' : 'Número da conta'}
                value={paymentData.bankAccount}
                onChange={(e) => setPaymentData({ ...paymentData, bankAccount: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isEn ? 'Account Holder' : 'Titular da Conta'} *
              </label>
              <input
                type="text"
                placeholder={isEn ? 'Account holder name' : 'Nome do titular'}
                value={paymentData.bankHolder}
                onChange={(e) => setPaymentData({ ...paymentData, bankHolder: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </>
        )}
      </div>

      {/* Segurança */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Lock size={16} className="text-green-500" />
        <span>
          {isEn 
            ? 'Your payment information is secure and encrypted'
            : 'Suas informações de pagamento são seguras e criptografadas'
          }
        </span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          {isEn ? 'Back' : 'Voltar'}
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-1 px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Shield size={18} />
          )}
          {processing 
            ? (isEn ? 'Processing...' : 'Processando...') 
            : (isEn ? 'Pay Now' : 'Pagar Agora')
          }
        </button>
      </div>
    </form>
  )

  // ============================================
  // PASSO 4: Confirmação
  // ============================================
  const renderStep4 = () => (
    <div className="text-center space-y-6">
      {result?.success ? (
        <>
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Payment Successful!' : 'Pagamento Realizado!'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn 
              ? 'Your booking has been confirmed and payment processed successfully.'
              : 'Sua reserva foi confirmada e o pagamento processado com sucesso.'
            }
          </p>

          {/* Detalhes da transação */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-left max-w-md mx-auto">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Booking ID' : 'ID da Reserva'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.bookingId?.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Transaction ID' : 'ID da Transação'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {result.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Amount' : 'Valor'}
                </span>
                <span className="font-bold text-primary-500">
                  {result.amount.toLocaleString()} Kz
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{isEn ? 'Platform Fee (10%)' : 'Taxa da Plataforma (10%)'}</span>
                <span>{result.platformFee.toLocaleString()} Kz</span>
              </div>
              <div className="flex justify-between text-xs text-green-500">
                <span>{isEn ? 'Company Earnings' : 'Ganhos da Empresa'}</span>
                <span>{result.companyAmount.toLocaleString()} Kz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Payment Method' : 'Método de Pagamento'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {result.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Status' : 'Status'}
                </span>
                <span className="font-medium text-green-500">
                  {isEn ? 'Completed' : 'Concluído'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setStep(1)
                setBookingData({
                  ...bookingData,
                  serviceId: '',
                  serviceName: '',
                  servicePrice: 0,
                  bookingDateService: '',
                  bookingTime: '',
                  guests: 1
                })
                setResult(null)
                setBookingId(null)
              }}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center gap-2"
            >
              <ArrowRight size={18} />
              {isEn ? 'New Booking' : 'Nova Reserva'}
            </button>
            <button
              onClick={() => navigate('/minhas-reservas')}
              className="px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
            >
              {isEn ? 'My Bookings' : 'Minhas Reservas'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Payment Failed' : 'Pagamento Falhou'}
          </h2>
          <p className="text-red-500 dark:text-red-400">
            {result?.error || (isEn ? 'An error occurred during payment' : 'Ocorreu um erro durante o pagamento')}
          </p>
          <button
            onClick={() => setStep(3)}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            {isEn ? 'Try Again' : 'Tentar Novamente'}
          </button>
        </>
      )}
    </div>
  )

  // ============================================
  // RENDER
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800">
          <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isEn ? 'Login Required' : 'Login Necessário'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isEn 
              ? 'Please login to test the payment flow'
              : 'Faça login para testar o fluxo de pagamento'
            }
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition"
          >
            {isEn ? 'Go to Login' : 'Ir para Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        {renderStepIndicator()}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  )
}