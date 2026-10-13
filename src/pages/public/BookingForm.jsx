// src/pages/public/BookingForm.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
// ❌ Remover esta importação errada:
// import { companyService } from '../../services/companyService';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, DollarSign, Loader2, ArrowLeft } from 'lucide-react';

// ... resto do código do BookingForm

// ============================================
// COMPONENTE DE SELEÇO DE PAGAMENTO
// ============================================

const PaymentMethodIcon = ({ type }) => {
  const icons = {
    multicaixa: <Landmark className="w-5 h-5" />,
    card: <CreditCard className="w-5 h-5" />,
    transfer: <Banknote className="w-5 h-5" />,
    cash: <DollarSign className="w-5 h-5" />,
    paypal: <Wallet className="w-5 h-5" />,
    mobile: <Smartphone className="w-5 h-5" />,
    qr: <QrCode className="w-5 h-5" />,
    pix: <QrCode className="w-5 h-5" />,
    other: <Wallet className="w-5 h-5" />,
  };
  return icons[type] || icons.other;
};

const PaymentMethodCard = ({ method, selected, onSelect, isEn }) => {
  const labels = {
    multicaixa: isEn ? 'Multicaixa' : 'Multicaixa',
    card: isEn ? 'Credit/Debit Card' : 'Cartão de Crédito/Débito',
    transfer: isEn ? 'Bank Transfer' : 'Transferência Bancária',
    cash: isEn ? 'Cash' : 'Dinheiro',
    paypal: 'PayPal',
    mobile: isEn ? 'Mobile Money' : 'Dinheiro Móvel',
    qr: isEn ? 'QR Code' : 'QR Code',
    pix: 'PIX',
    other: isEn ? 'Other' : 'Outro',
  };

  return (
    <div
      onClick={() => onSelect(method)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        selected?.id === method.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          selected?.id === method.id
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          <PaymentMethodIcon type={method.type} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">
            {labels[method.type] || method.name}
          </p>
          {method.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {method.description}
            </p>
          )}
        </div>
        {selected?.id === method.id && (
          <CheckCircle className="w-5 h-5 text-blue-500" />
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BookingForm() {
  const { serviceId, companyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEn } = useLanguage();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [service, setService] = useState(null);
  const [company, setCompany] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    guests: 1,
    notes: '',
  });

  // Validação
  const [errors, setErrors] = useState({});

  // Locale para formatação
  const locale = isEn ? enUS : ptBR;

  // ============================================
  // CARREGAR DADOS
  // ============================================

  useEffect(() => {
    if (!user) {
      toast.error(isEn ? 'Please login to book' : 'Faça login para reservar');
      navigate('/login');
      return;
    }
    loadData();
  }, [serviceId, companyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar serviço
      if (serviceId) {
        const serviceResult = await hotelManagementService.getServiceById(serviceId);
        if (serviceResult.success && serviceResult.data) {
          setService(serviceResult.data);
        }
      }

      // Carregar empresa
      if (companyId) {
        const companyResult = await companyService.getCompanyById(companyId);
        if (companyResult.success && companyResult.data) {
          setCompany(companyResult.data);
        }

        // Carregar métodos de pagamento da empresa
        const paymentResult = await hotelManagementService.getPaymentMethodsByCompany(companyId);
        if (paymentResult.success && paymentResult.data) {
          setPaymentMethods(paymentResult.data);
        }
      }

      // Definir data padrão (amanhã)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        date: tomorrow.toISOString().split('T')[0],
      }));

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading data' : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = isEn ? 'Please select a date' : 'Selecione uma data';
    }
    
    if (!formData.time) {
      newErrors.time = isEn ? 'Please select a time' : 'Selecione um horário';
    }
    
    if (formData.guests < 1) {
      newErrors.guests = isEn ? 'At least 1 guest' : 'Mínimo 1 hóspede';
    }
    
    if (!selectedPayment) {
      newErrors.payment = isEn ? 'Please select a payment method' : 'Selecione um método de pagamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(isEn ? 'Please fill all required fields' : 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!user) {
      toast.error(isEn ? 'Please login to book' : 'Faça login para reservar');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      toast.loading(isEn ? 'Creating booking...' : 'Criando reserva...', { id: 'booking' });

      const bookingData = {
        userId: user.id,
        serviceId: service?.id || null,
        companyId: company?.id || null,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        totalPrice: service?.price || 0,
        itemName: service?.name || 'Serviço',
        itemType: 'service',
        notes: formData.notes || '',
        paymentMethod: selectedPayment?.type || 'pending',
        paymentMethodId: selectedPayment?.id || null,
        paymentStatus: 'pending',
      };

      console.log('📝 Criando reserva com pagamento:', bookingData);

      const result = await createBooking(bookingData);
      
      toast.dismiss('booking');

      if (result.success) {
        toast.success(
          isEn ? '✅ Booking created successfully!' : '✅ Reserva criada com sucesso!',
          { duration: 3000 }
        );
        
        toast.success(
          isEn ? '💳 Payment pending - Check your bookings' : '💳 Pagamento pendente - Verifique suas reservas',
          { duration: 4000 }
        );
        
        setTimeout(() => {
          navigate('/minhas-reservas');
        }, 2000);
      } else {
        toast.error(result.error || (isEn ? 'Error creating booking' : 'Erro ao criar reserva'));
      }
    } catch (error) {
      toast.dismiss('booking');
      console.error('❌ Erro ao criar reserva:', error);
      toast.error(isEn ? 'Error creating booking' : 'Erro ao criar reserva');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // RENDERIZAÇO
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!service || !company) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          {isEn ? 'Service or company not found' : 'Serviço ou empresa não encontrado'}
        </h3>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          {isEn ? 'Go back' : 'Voltar'}
        </button>
      </div>
    );
  }

  // Gerar horários disponíveis
  const times = [];
  for (let h = 8; h <= 20; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`);
    times.push(`${String(h).padStart(2, '0')}:30`);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'Complete Your Booking' : 'Finalizar Reserva'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo do Serviço */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Service Details' : 'Detalhes do Serviço'}
            </h2>
            
            <div className="flex gap-4">
              {service.images && service.images[0] ? (
                <img
                  src={service.images[0]}
                  alt={service.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Building2 size={32} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {company.name}
                </p>
                {company.address && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} />
                    {company.address.city}, {company.address.province}
                  </p>
                )}
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {service.price?.toLocaleString()} Kz
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data e Horário */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Date & Time' : 'Data e Horário'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isEn ? 'Date' : 'Data'} *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isEn ? 'Time' : 'Horário'} *
                  </label>
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    {times.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-500">{errors.time}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Hóspedes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Guests' : 'Hóspedes'}
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isEn ? 'Number of guests' : 'Número de hóspedes'} *
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      guests: Math.max(1, prev.guests - 1)
                    }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white w-12 text-center">
                    {formData.guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      guests: Math.min(10, prev.guests + 1)
                    }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    +
                  </button>
                  {errors.guests && (
                    <p className="text-sm text-red-500">{errors.guests}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Métodos de Pagamento */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isEn ? 'Payment Method' : 'Método de Pagamento'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEn ? 'Select your preferred payment method' : 'Selecione seu método de pagamento preferido'}
                  </p>
                </div>
                <Shield className="w-5 h-5 text-green-500" />
              </div>

              {paymentMethods.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {isEn ? 'No payment methods available for this company' : 'Nenhum método de pagamento disponível para esta empresa'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      selected={selectedPayment}
                      onSelect={setSelectedPayment}
                      isEn={isEn}
                    />
                  ))}
                  {errors.payment && (
                    <p className="text-sm text-red-500 mt-2">{errors.payment}</p>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Lock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {isEn 
                    ? 'Your payment information is secure and encrypted'
                    : 'Suas informações de pagamento estão seguras e criptografadas'}
                </p>
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEn ? 'Additional Notes' : 'Observações Adicionais'}
              </h2>
              
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={isEn ? 'Any special requests or notes...' : 'Algum pedido especial ou observação...'}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={submitting || paymentMethods.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isEn ? 'Processing...' : 'Processando...'}
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  {isEn ? 'Confirm Booking & Pay' : 'Confirmar Reserva e Pagar'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar - Resumo */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resumo da Reserva */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Booking Summary' : 'Resumo da Reserva'}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Service' : 'Serviço'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {service.name}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Company' : 'Empresa'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {company.name}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Date' : 'Data'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(formData.date), 'dd/MM/yyyy', { locale })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Time' : 'Horário'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.time}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {isEn ? 'Guests' : 'Hóspedes'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.guests}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {isEn ? 'Total' : 'Total'}
                  </span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {(service.price * formData.guests).toLocaleString()} Kz
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {isEn ? 'including taxes' : 'incluindo impostos'}
                </p>
              </div>

              {selectedPayment && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {isEn ? 'Payment method selected' : 'Método de pagamento selecionado'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}