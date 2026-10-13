// src/pages/user/MyTicketsPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import { Ticket, Calendar, MapPin, Loader2, QrCode, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyTicketsPage() {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_purchases')
        .select(`
          *,
          event:event_id (
            id,
            title,
            image_url,
            date,
            location
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Erro ao carregar ingressos:', error);
      toast.error(isEn ? 'Error loading tickets' : 'Erro ao carregar ingressos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Ticket size={28} className="text-purple-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEn ? 'My Tickets' : 'Meus Ingressos'}
        </h1>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Ticket size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {isEn ? 'You have no tickets yet' : 'Você ainda não tem ingressos'}
          </p>
          <Link
            to="/eventos"
            className="mt-4 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            {isEn ? 'Browse Events' : 'Ver Eventos'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row">
                {/* Imagem */}
                <div className="md:w-48 h-40 md:h-auto">
                  {purchase.event?.image_url ? (
                    <img
                      src={purchase.event.image_url}
                      alt={purchase.event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                      <Calendar size={32} className="text-purple-500" />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {purchase.event?.title || 'Evento'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {purchase.ticket_name} • {purchase.quantity}x
                      </p>
                      {purchase.event?.date && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {new Date(purchase.event.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {purchase.event?.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={14} />
                          {purchase.event.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {purchase.total_price.toLocaleString()} Kz
                      </p>
                      <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                        {isEn ? 'Confirmed' : 'Confirmado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      to={`/compra/sucesso/${purchase.id}`}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition flex items-center gap-1"
                    >
                      <QrCode size={14} />
                      {isEn ? 'View Ticket' : 'Ver Ingresso'}
                    </Link>
                    <Link
                      to={`/evento/${purchase.event_id}`}
                      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg transition"
                    >
                      {isEn ? 'Event Details' : 'Detalhes do Evento'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}