// src/pages/public/EventPaymentPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Smartphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Clock,
  QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventPaymentPage() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEn } = useLanguage();

  const [purchase, setPurchase] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentMethods = [
    {
      id: 'multicaixa',
      name: 'Multicaixa',
      icon: CreditCard,
      description: isEn ? 'Pay with Multicaixa card' : 'Pague com cartão Multicaixa',
      color: 'bg-blue-500'
    },
    {
      id: 'bank_transfer',
      name: isEn ? 'Bank Transfer' : 'Transferência Bancária',
      icon: Building2,
      description: isEn ? 'Transfer from your bank account' : 'Transfira da sua conta bancária',
      color: 'bg-green-500'
    },
    {
      id: 'mobile_money',
      name: isEn ? 'Mobile Money' : 'Dinheiro Móvel',
      icon: Smartphone,
      description: isEn ? 'Pay with mobile money' : 'Pague com dinheiro móvel',
      color: 'bg-purple-500'
    }
  ];

  useEffect(() => {
    if (!purchaseId) {
      navigate('/');
      return;
    }
    loadPurchaseData();
  }, [purchaseId]);

  const loadPurchaseData = async () => {
    setLoading(true);
    try {
      // Buscar compra
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('event_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (purchaseError) throw purchaseError;

      if (purchaseData.user_id !== user?.id) {
        toast.error(isEn ? 'Unauthorized' : 'Não autorizado');
        navigate('/');
        return;
      }

      setPurchase(purchaseData);

      // Buscar evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', purchaseData.event_id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading payment' : 'Erro ao carregar pagamento');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error(isEn ? 'Please select a payment method' : 'Selecione um método de pagamento');
      return;
    }

    setProcessing(true);
    try {
      // Atualizar compra com método de pagamento
      const { error: updateError } = await supabase
        .from('event_purchases')
        .update({
          payment_method: selectedMethod,
          payment_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) throw updateError;

      // Redirecionar para confirmação
      navigate(`/evento/pagamento/confirmar/${purchaseId}`);

    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error(isEn ? 'Error processing payment' : 'Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!purchase || !event) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <p className="text-gray-500">{isEn ? 'Purchase not found' : 'Compra não encontrada'}</p>
        <Link to="/eventos" className="text-purple-500 hover:underline mt-2 inline-block">
          {isEn ? 'Back to events' : 'Voltar para eventos'}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/evento/${event.id}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Payment' : 'Pagamento'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Choose your payment method' : 'Escolha o método de pagamento'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métodos de Pagamento */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Payment Methods' : 'Métodos de Pagamento'}
            </h2>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <div
                    key={method.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${method.color}`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={24} className="text-purple-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handlePayment}
              disabled={!selectedMethod || processing}
              className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isEn ? 'Processing...' : 'Processando...'}
                </>
              ) : (
                <>
                  <DollarSign size={20} />
                  {isEn ? 'Pay Now' : 'Pagar Agora'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Resumo da Compra */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isEn ? 'Order Summary' : 'Resumo do Pedido'}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">{isEn ? 'Event' : 'Evento'}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {event.title}
                </p>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Ticket' : 'Ingresso'}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {purchase.ticket_name}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Quantity' : 'Quantidade'}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {purchase.quantity}x
                </span>
              </div>

              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Unit Price' : 'Preço Unitário'}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {purchase.unit_price.toLocaleString()} Kz
                </span>
              </div>

              <div className="flex justify-between py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {isEn ? 'Total' : 'Total'}
                </span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {purchase.total_price.toLocaleString()} Kz
                </span>
              </div>

              {event.date && (
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Calendar size={14} />
                  {new Date(event.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                  {event.location && (
                    <>
                      <span>•</span>
                      <MapPin size={14} />
                      {event.location}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}