// src/components/booking/BookingModal.jsx

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, CreditCard, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createBooking } from '../../services/bookingService';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import BookingReceipt from './BookingReceipt';

export default function BookingModal({ isOpen, onClose, service, business, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const { isEn } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    guests: 1,
    notes: '',
  });

  // Carregar métodos de pagamento da empresa
  useEffect(() => {
    if (isOpen && business?.id) {
      loadPaymentMethods();
    }
  }, [isOpen, business]);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('business_id', business.id)
        .eq('is_active', true);

      if (error) throw error;
      setPaymentMethods(data || []);
      if (data && data.length > 0) {
        setSelectedPayment(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
    }
  };

  // Resetar estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        guests: 1,
        notes: '',
      });
      setSelectedPayment(null);
      setBookingResult(null);
      setShowReceipt(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const totalPrice = (service?.price || 0) * formData.guests;

  const nextStep = () => {
    if (step === 1) {
      if (!formData.date) {
        toast.error(isEn ? 'Please select a date' : 'Selecione uma data');
        return;
      }
      if (formData.guests < 1) {
        toast.error(isEn ? 'Select at least 1 guest' : 'Selecione pelo menos 1 hóspede');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedPayment) {
        toast.error(isEn ? 'Please select a payment method' : 'Selecione um método de pagamento');
        return;
      }
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error(isEn ? 'Please login to book' : 'Faça login para reservar');
      return;
    }

    if (user.id === business?.user_id) {
      toast.error(isEn ? 'You cannot book your own service' : 'Você não pode reservar seu próprio serviço');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        userId: user.id,
        serviceId: service.id,
        businessId: business.id,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        totalPrice: totalPrice,
        notes: formData.notes || `Reserva para ${service.title}`,
      };

      console.log('📝 Criando reserva:', bookingData);

      const result = await createBooking(bookingData);

      if (result.success) {
        setBookingResult(result.data);
        setShowReceipt(true);
        toast.success(isEn ? '✅ Booking confirmed!' : '✅ Reserva confirmada!');
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        toast.error(result.error || (isEn ? 'Error creating booking' : 'Erro ao criar reserva'));
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(isEn ? 'Error creating booking' : 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price || 0);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEn ? 'Book Service' : 'Reservar Serviço'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{business?.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {step < 3 && (
              <>
                <div className="flex items-center gap-2 mt-4">
                  <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{isEn ? 'Details' : 'Detalhes'}</span>
                  <span>{isEn ? 'Payment' : 'Pagamento'}</span>
                </div>
              </>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {/* STEP 1: Detalhes */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{service.title}</h4>
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                  )}
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-500">{isEn ? 'Price per person' : 'Preço por pessoa'}</span>
                    <span className="font-bold text-amber-600">{formatPrice(service.price)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {isEn ? 'Date' : 'Data'} *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {isEn ? 'Time' : 'Horário'} *
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Users className="inline w-4 h-4 mr-1" />
                    {isEn ? 'Guests' : 'Hóspedes'} *
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                      className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-xl font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold min-w-[40px] text-center">{formData.guests}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, guests: formData.guests + 1 })}
                      className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isEn ? 'Notes (optional)' : 'Observações (opcional)'}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="2"
                    placeholder={isEn ? 'Any special requests?' : 'Alguma solicitação especial?'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isEn ? 'Continue to Payment' : 'Continuar para Pagamento'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 2: Pagamento */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">{isEn ? 'Total to Pay' : 'Total a Pagar'}</span>
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {service.title} × {formData.guests} {formData.guests > 1 ? 'pessoas' : 'pessoa'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isEn ? 'Select Payment Method' : 'Selecione o Método de Pagamento'} *
                  </label>
                  
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>{isEn ? 'No payment methods available' : 'Nenhum método de pagamento disponível'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method)}
                          className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            selectedPayment?.id === method.id
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <span className="text-2xl">
                            {method.type === 'multicaixa' && '🏦'}
                            {method.type === 'card' && '💳'}
                            {method.type === 'transfer' && '🏛️'}
                            {method.type === 'cash' && '💰'}
                            {method.type === 'paypal' && '🌐'}
                            {method.type === 'other' && '📦'}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {method.type === 'multicaixa' && 'Multicaixa'}
                              {method.type === 'card' && 'Cartão'}
                              {method.type === 'transfer' && 'Transferência'}
                              {method.type === 'cash' && 'Dinheiro'}
                              {method.type === 'paypal' && 'PayPal'}
                              {method.type === 'other' && 'Outro'}
                            </p>
                          </div>
                          {selectedPayment?.id === method.id && (
                            <CheckCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition"
                  >
                    {isEn ? 'Back' : 'Voltar'}
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!selectedPayment || loading}
                    className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isEn ? 'Creating...' : 'Criando...'}
                      </>
                    ) : (
                      <>
                        {isEn ? 'Confirm Booking' : 'Confirmar Reserva'}
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprovante */}
      {showReceipt && bookingResult && (
        <BookingReceipt
          booking={bookingResult}
          service={service}
          business={business}
          onClose={() => {
            setShowReceipt(false);
            onClose();
          }}
        />
      )}
    </>
  );
}