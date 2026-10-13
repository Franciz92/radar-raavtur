// src/components/BookingForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createBooking } from '../services/bookingService';
import { hotelManagementService } from '../services/hotelManagementService';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  Banknote,
  Wallet,
  Landmark,
  Smartphone,
  Check,
  ChevronRight,
  Loader2,
  ArrowLeft,
  MapPin,
  Building2,
  Phone,
  Mail
} from 'lucide-react';

// ============================================
// ÍCONES DOS MÉTODOS DE PAGAMENTO
// ============================================

const PaymentMethodIcon = ({ type }) => {
  const icons = {
    'multicaixa': <Landmark className="w-6 h-6" />,
    'card': <CreditCard className="w-6 h-6" />,
    'transfer': <Banknote className="w-6 h-6" />,
    'cash': <Wallet className="w-6 h-6" />,
    'paypal': <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.481a.753.753 0 0 1 .74-.632h6.485c3.069 0 4.394 1.427 4.394 3.373 0 1.965-1.525 3.388-3.5 3.388h-2.743l-1.134 7.027z"/></svg>,
    'other': <CreditCard className="w-6 h-6" />,
  };
  return icons[type] || <CreditCard className="w-6 h-6" />;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BookingForm({ 
  service, 
  company, 
  onClose, 
  onSuccess,
  initialDate = null,
  initialGuests = 1 
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEn } = useLanguage();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    date: initialDate || new Date().toISOString().split('T')[0],
    time: '10:00',
    guests: initialGuests || 1,
    notes: '',
    paymentMethod: null,
  });
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [step, setStep] = useState(1); // 1: Detalhes, 2: Pagamento, 3: Confirmação
  const [bookingResult, setBookingResult] = useState(null);

  // Carregar métodos de pagamento da empresa
  useEffect(() => {
    loadPaymentMethods();
  }, [company]);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const result = await hotelManagementService.getPaymentMethodsByCompany(company.id);
      
      if (result.success && result.data && result.data.length > 0) {
        // Filtrar métodos ativos
        const activeMethods = result.data.filter(m => m.is_active !== false);
        setPaymentMethods(activeMethods);
        
        // Selecionar o primeiro método por padrão
        if (activeMethods.length > 0) {
          setSelectedPayment(activeMethods[0]);
          setFormData(prev => ({ ...prev, paymentMethod: activeMethods[0].id }));
        }
      } else {
        // Se não houver métodos cadastrados, usar métodos padrão
        const defaultMethods = [
          { id: 'default-cash', name: 'Dinheiro', type: 'cash', is_active: true },
          { id: 'default-transfer', name: 'Transferência Bancária', type: 'transfer', is_active: true },
        ];
        setPaymentMethods(defaultMethods);
        setSelectedPayment(defaultMethods[0]);
        setFormData(prev => ({ ...prev, paymentMethod: defaultMethods[0].id }));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métodos de pagamento:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  // Calcular valor total (com impostos se necessário)
  const calculateTotal = () => {
    let total = service.price || 0;
    // Se houver taxa de serviço
    // total += total * 0.1; // 10% de taxa de serviço
    return total;
  };

  const totalPrice = calculateTotal();

  // Validar se pode reservar
  const canBook = () => {
    if (!user) {
      toast.error(isEn ? 'Please login to book' : 'Faça login para reservar');
      return false;
    }
    if (user.id === company.user_id) {
      toast.error(isEn ? 'You cannot book your own service' : 'Você não pode reservar seu próprio serviço');
      return false;
    }
    if (!selectedPayment) {
      toast.error(isEn ? 'Please select a payment method' : 'Selecione um método de pagamento');
      return false;
    }
    return true;
  };

  // Avançar para próximo passo
  const nextStep = () => {
    if (step === 1) {
      // Validar dados básicos
      if (!formData.date) {
        toast.error(isEn ? 'Please select a date' : 'Selecione uma data');
        return;
      }
      if (!formData.guests || formData.guests < 1) {
        toast.error(isEn ? 'Please select number of guests' : 'Selecione o número de hóspedes');
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

  // Voltar passo
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Submeter reserva
  const handleSubmit = async () => {
    if (!canBook()) return;

    setLoading(true);
    try {
      const bookingData = {
        userId: user.id,
        serviceId: service.id,
        companyId: company.id,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        totalPrice: totalPrice,
        itemName: service.name,
        itemType: 'service',
        notes: formData.notes || `Reserva para ${service.name}`,
      };

      console.log('📝 Criando reserva:', bookingData);

      const result = await createBooking(bookingData);

      if (result.success) {
        setBookingResult(result.data);
        setStep(3);
        
        // Notificar sucesso
        toast.success(isEn ? '✅ Booking created successfully!' : '✅ Reserva criada com sucesso!');
        
        // Registrar método de pagamento selecionado (se necessário)
        // Aqui você pode salvar o método de pagamento em uma tabela separada
        if (selectedPayment && result.data) {
          await savePaymentMethod(result.data.id, selectedPayment);
        }

        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        toast.error(result.error || isEn ? 'Error creating booking' : 'Erro ao criar reserva');
      }
    } catch (error) {
      console.error('❌ Erro ao criar reserva:', error);
      toast.error(isEn ? 'Error creating booking' : 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  // Salvar método de pagamento da reserva
  const savePaymentMethod = async (bookingId, paymentMethod) => {
    try {
      // Se você tiver uma tabela de pagamentos
      // const { error } = await supabase
      //   .from('booking_payments')
      //   .insert([{
      //     booking_id: bookingId,
      //     payment_method_id: paymentMethod.id,
      //     payment_method_type: paymentMethod.type,
      //     payment_method_name: paymentMethod.name,
      //     amount: totalPrice,
      //     status: 'pending',
      //     created_at: new Date().toISOString(),
      //   }]);
    } catch (error) {
      console.error('❌ Erro ao salvar método de pagamento:', error);
    }
  };

  // Renderizar passo 1 - Detalhes da reserva
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Resumo do serviço */}
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {service.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {service.description || 'Sem descrição'}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-500">Preço por pessoa</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {service.price?.toLocaleString()} Kz
          </span>
        </div>
      </div>

      {/* Seleção de data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Calendar className="inline w-4 h-4 mr-1" />
          {isEn ? 'Date' : 'Data'}
        </label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Seleção de horário */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Clock className="inline w-4 h-4 mr-1" />
          {isEn ? 'Time' : 'Horário'}
        </label>
        <select
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="08:00">08:00</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
          <option value="13:00">13:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
          <option value="17:00">17:00</option>
          <option value="18:00">18:00</option>
        </select>
      </div>

      {/* Número de hóspedes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <Users className="inline w-4 h-4 mr-1" />
          {isEn ? 'Guests' : 'Hóspedes'}
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-xl font-bold"
          >
            -
          </button>
          <span className="text-xl font-semibold min-w-[40px] text-center">
            {formData.guests}
          </span>
          <button
            onClick={() => setFormData({ ...formData, guests: formData.guests + 1 })}
            className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-xl font-bold"
          >
            +
          </button>
          <span className="text-sm text-gray-500 ml-2">
            {formData.guests > 1 ? 'pessoas' : 'pessoa'}
          </span>
        </div>
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {isEn ? 'Notes (optional)' : 'Observações (opcional)'}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="2"
          placeholder={isEn ? 'Any special requests?' : 'Alguma solicitação especial?'}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Botão avançar */}
      <button
        onClick={nextStep}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
      >
        {isEn ? 'Continue to Payment' : 'Continuar para Pagamento'}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Renderizar passo 2 - Métodos de pagamento
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Resumo do valor */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300">
            {isEn ? 'Total to Pay' : 'Total a Pagar'}
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalPrice.toLocaleString()} Kz
          </span>
        </div>
        <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
          <span>{service.name}</span>
          <span>{formData.guests} {formData.guests > 1 ? 'pessoas' : 'pessoa'}</span>
        </div>
      </div>

      {/* Métodos de pagamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {isEn ? 'Select Payment Method' : 'Selecione o Método de Pagamento'}
        </label>

        {loadingMethods ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>{isEn ? 'No payment methods available' : 'Nenhum método de pagamento disponível'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  setSelectedPayment(method);
                  setFormData({ ...formData, paymentMethod: method.id });
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                  selectedPayment?.id === method.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  selectedPayment?.id === method.id
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <PaymentMethodIcon type={method.type} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {method.name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {method.type === 'multicaixa' && 'Multicaixa'}
                    {method.type === 'card' && 'Cartão de Crédito/Débito'}
                    {method.type === 'transfer' && 'Transferência Bancária'}
                    {method.type === 'cash' && 'Dinheiro'}
                    {method.type === 'paypal' && 'PayPal'}
                    {method.type === 'other' && 'Outro'}
                  </p>
                </div>
                {selectedPayment?.id === method.id && (
                  <Check className="w-6 h-6 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instruções de pagamento (se houver) */}
      {selectedPayment?.instructions && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isEn ? 'Payment Instructions' : 'Instruções de Pagamento'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedPayment.instructions}
          </p>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition"
        >
          {isEn ? 'Back' : 'Voltar'}
        </button>
        <button
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
              <Check className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Renderizar passo 3 - Confirmação
  const renderStep3 = () => (
    <div className="text-center py-8 space-y-6">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {isEn ? 'Booking Confirmed!' : 'Reserva Confirmada!'}
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300">
        {isEn 
          ? 'Your booking has been created successfully. Check your bookings page for details.'
          : 'Sua reserva foi criada com sucesso. Verifique sua página de reservas para detalhes.'
        }
      </p>

      {/* Detalhes da reserva */}
      {bookingResult && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 text-left max-w-sm mx-auto">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Booking ID' : 'ID da Reserva'}</span>
              <span className="font-mono text-gray-900 dark:text-white">
                #{bookingResult.id?.slice(0, 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Service' : 'Serviço'}</span>
              <span className="text-gray-900 dark:text-white">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Date' : 'Data'}</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(formData.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Guests' : 'Hóspedes'}</span>
              <span className="text-gray-900 dark:text-white">{formData.guests}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
              <span className="font-medium">{isEn ? 'Total' : 'Total'}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {totalPrice.toLocaleString()} Kz
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/minhas-reservas')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          {isEn ? 'My Bookings' : 'Minhas Reservas'}
        </button>
        <button
          onClick={() => navigate(`/empresa/${company.id}`)}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition"
        >
          {isEn ? 'Back to Company' : 'Voltar à Empresa'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-auto">
      {/* Cabeçalho */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEn ? 'Book Service' : 'Reservar Serviço'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            ✕
          </button>
        </div>
        
        {/* Progresso */}
        <div className="flex items-center gap-2 mt-4">
          <div className={`flex-1 h-2 rounded-full transition ${
            step >= 1 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          <div className={`flex-1 h-2 rounded-full transition ${
            step >= 2 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          <div className={`flex-1 h-2 rounded-full transition ${
            step >= 3 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          }`} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{isEn ? 'Details' : 'Detalhes'}</span>
          <span>{isEn ? 'Payment' : 'Pagamento'}</span>
          <span>{isEn ? 'Done' : 'Concluído'}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
}