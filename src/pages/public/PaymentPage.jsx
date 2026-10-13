// src/pages/public/PaymentPage.jsx
// ✅ Alinhado com as colunas reais da tabela `bookings`
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import {
  Loader2, CheckCircle, ArrowLeft, CreditCard, Wallet, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // ============================================
  // Traduções
  // ============================================
  const t = {
    completePayment: isEn ? 'Complete Payment' : 'Finalizar Pagamento',
    bookingDetails: isEn ? 'Booking Details' : 'Detalhes da Reserva',
    service: isEn ? 'Service' : 'Serviço',
    date: isEn ? 'Date' : 'Data',
    time: isEn ? 'Time' : 'Hora',
    guests: isEn ? 'Guests' : 'Pessoas',
    status: isEn ? 'Status' : 'Status',
    total: isEn ? 'Total' : 'Total',
    selectPaymentMethod: isEn ? 'Select Payment Method' : 'Selecione o Método de Pagamento',
    noPaymentMethods: isEn
      ? 'No payment methods available'
      : 'Nenhum método de pagamento disponível',
    payNow: isEn ? 'Pay Now' : 'Pagar Agora',
    processing: isEn ? 'Processing...' : 'Processando...',
    back: isEn ? 'Back' : 'Voltar',
    backToBookings: isEn ? 'Back to Bookings' : 'Voltar às Reservas',
    notFound: isEn ? 'Reservation not found' : 'Reserva não encontrada',
    notFoundDesc: isEn
      ? 'The reservation you are looking for does not exist.'
      : 'A reserva que você está procurando não existe.',
    paymentSuccess: isEn ? 'Payment successful!' : 'Pagamento realizado com sucesso!',
    paymentFailed: isEn ? 'Payment failed' : 'Pagamento falhou',
    selectMethodRequired: isEn
      ? 'Please select a payment method'
      : 'Selecione um método de pagamento',
    loadingReservation: isEn ? 'Loading reservation...' : 'A carregar reserva...',
  };

  // ============================================
  // Carregar reserva DIRETO do supabase
  // ============================================
  useEffect(() => {
    if (bookingId) loadReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const loadReservation = async () => {
    setLoading(true);
    try {
      console.log('🔍 [PaymentPage] Buscando booking:', bookingId);

      // ✅ Buscar DIRETO da tabela `bookings`
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar booking:', error);
        toast.error(t.notFound);
        setLoading(false);
        return;
      }

      if (!booking) {
        console.error('❌ Booking não encontrado');
        toast.error(t.notFound);
        setLoading(false);
        return;
      }

      // Enriquecer com dados do serviço
      let service = null;
      if (booking.service_id) {
        const { data: s } = await supabase
          .from('business_services')
          .select('id, name, description, price, category, logo_url, image_url')
          .eq('id', booking.service_id)
          .maybeSingle();
        service = s;
      }

      // Enriquecer com dados da empresa
      let business = null;
      const bizId = booking.business_id || booking.company_id;
      if (bizId) {
        const { data: b } = await supabase
          .from('businesses')
          .select('id, name, logo_url, address, phone, email, category, province')
          .eq('id', bizId)
          .maybeSingle();
        business = b;
      }

      const enriched = {
        ...booking,
        service,
        business,
      };

      console.log('✅ [PaymentPage] Booking encontrado:', enriched);
      setReservation(enriched);

      // Carregar métodos de pagamento
      if (bizId) {
        const { data: methods } = await supabase
          .from('business_payment_methods')
          .select('*')
          .eq('business_id', bizId)
          .eq('is_active', true);

        setPaymentMethods(methods || []);
        if (methods && methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar reserva:', error);
      toast.error(isEn ? 'Error loading reservation' : 'Erro ao carregar reserva');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Pagar — UPDATE direto na tabela `bookings`
  // ============================================
  const handlePayment = async () => {
    setProcessing(true);
    try {
      console.log('💳 [PaymentPage] Processando pagamento...');

      // ✅ Update EXATO com colunas reais
      const updateData = {
        status: 'confirmed',
        payment_status: 'paid',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (selectedMethod) {
        // Se tiveres uma coluna para guardar o método, adiciona aqui
        // (a tabela não tem payment_method_id, então guardamos em notes ou ignoramos)
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', reservation.id);

      if (error) {
        console.error('❌ Erro ao atualizar booking:', error);
        throw error;
      }

      console.log('✅ [PaymentPage] Booking atualizado');
      toast.success(t.paymentSuccess);
      navigate(`/pagamento/sucesso?booking=${reservation.id}`);
    } catch (error) {
      console.error('❌ Erro no pagamento:', error);
      toast.error(t.paymentFailed);
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // Loading
  // ============================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
        <p className="text-gray-500 dark:text-gray-400">{t.loadingReservation}</p>
      </div>
    );
  }

  // ============================================
  // Não encontrada
  // ============================================
  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
        <div className="inline-flex p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.notFound}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{t.notFoundDesc}</p>
        <Link
          to="/minhas-reservas"
          className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToBookings}
        </Link>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        to="/minhas-reservas"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.back}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t.completePayment}
        </h1>

        {/* Detalhes */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            {t.bookingDetails}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t.service}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {reservation.service?.name || reservation.item_name || 'Serviço'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t.date}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(reservation.date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t.time}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {reservation.time || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t.guests}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {reservation.guests || 1}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t.status}</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  reservation.status === 'confirmed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : reservation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {reservation.status}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="font-semibold text-gray-900 dark:text-white">{t.total}</span>
              <span className="font-bold text-primary-500 text-lg">
                {reservation.total_price} Kz
              </span>
            </div>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        {paymentMethods.length > 0 ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t.selectPaymentMethod}
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedMethod === method.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedMethod === method.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {method.method_type}
                    </p>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>{t.noPaymentMethods}</p>
          </div>
        )}

        {/* Botão Pagar */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 rounded-xl text-white font-medium transition flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              {t.payNow}
            </>
          )}
        </button>
      </div>
    </div>
  );
}