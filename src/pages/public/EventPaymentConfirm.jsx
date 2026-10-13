// src/pages/public/EventPaymentConfirm.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Clock,
  QrCode,
  Printer,
  Download,
  Share2,
  CreditCard,
  Building2,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventPaymentConfirm() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEn } = useLanguage();

  const [purchase, setPurchase] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!purchaseId) {
      navigate('/');
      return;
    }
    loadPurchaseData();
  }, [purchaseId]);

  useEffect(() => {
    if (countdown > 0 && !loading) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !loading) {
      // Redirecionar para comprovante
      navigate(`/compra/sucesso/${purchaseId}`);
    }
  }, [countdown, loading]);

  const loadPurchaseData = async () => {
    setLoading(true);
    try {
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

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', purchaseData.event_id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error(isEn ? 'Error loading data' : 'Erro ao carregar dados');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar status da compra
      const { error: updateError } = await supabase
        .from('event_purchases')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (updateError) throw updateError;

      toast.success(isEn ? '✅ Payment confirmed!' : '✅ Pagamento confirmado!');
      
      // Redirecionar para comprovante
      navigate(`/compra/sucesso/${purchaseId}`);

    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      toast.error(isEn ? 'Error confirming payment' : 'Erro ao confirmar pagamento');
    } finally {
      setConfirming(false);
    }
  };

  const getPaymentMethodName = (method) => {
    const methods = {
      'multicaixa': isEn ? 'Multicaixa Card' : 'Cartão Multicaixa',
      'bank_transfer': isEn ? 'Bank Transfer' : 'Transferência Bancária',
      'mobile_money': isEn ? 'Mobile Money' : 'Dinheiro Móvel'
    };
    return methods[method] || method;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'multicaixa': CreditCard,
      'bank_transfer': Building2,
      'mobile_money': Smartphone
    };
    const Icon = icons[method] || CreditCard;
    return <Icon size={20} className="text-purple-500" />;
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/evento/pagamento/${purchaseId}`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEn ? 'Confirm Payment' : 'Confirmar Pagamento'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'Review and confirm your payment' : 'Revise e confirme seu pagamento'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Resumo da Compra */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {isEn ? 'Order Summary' : 'Resumo do Pedido'}
          </h3>

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Event' : 'Evento'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Ticket' : 'Ingresso'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{purchase.ticket_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Quantity' : 'Quantidade'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{purchase.quantity}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isEn ? 'Payment Method' : 'Método de Pagamento'}</span>
              <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                {getPaymentMethodIcon(purchase.payment_method)}
                {getPaymentMethodName(purchase.payment_method)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">
                {isEn ? 'Total' : 'Total'}
              </span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {purchase.total_price.toLocaleString()} Kz
              </span>
            </div>
          </div>
        </div>

        {/* Informações do Evento */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
            <Clock size={16} />
            <span>
              {isEn 
                ? 'You will be redirected to the ticket page in ' 
                : 'Você será redirecionado para a página do ingresso em '}
              <strong>{countdown}</strong>
              {isEn ? ' seconds' : ' segundos'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
            <Calendar size={16} className="text-purple-500" />
            <span>
              {new Date(event.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {event.location && (
              <>
                <span>•</span>
                <MapPin size={16} className="text-purple-500" />
                <span>{event.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Botão Confirmar */}
        <button
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {confirming ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {isEn ? 'Confirming...' : 'Confirmando...'}
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              {isEn ? 'Confirm Payment' : 'Confirmar Pagamento'}
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isEn 
            ? 'By confirming, you agree to the terms and conditions' 
            : 'Ao confirmar, você concorda com os termos e condições'}
        </p>
      </div>
    </div>
  );
}