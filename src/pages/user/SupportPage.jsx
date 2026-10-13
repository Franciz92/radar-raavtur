// src/pages/user/SupportPage.jsx
// ============================================
// PÁGINA DE APOIO - LISTA DE TICKETS
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LifeBuoy, Plus, Loader2, ChevronRight, Send, X, Clock,
  MessageCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getUserTickets,
  createTicket,
  SUPPORT_CATEGORIES,
  TICKET_STATUS,
  TICKET_PRIORITY,
} from '../../services/supportService';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    category: 'other',
    priority: 'normal',
    message: '',
  });

  useEffect(() => {
    if (user?.id) loadTickets();
  }, [user?.id]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const result = await getUserTickets(user.id);
      if (result.success) setTickets(result.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error(isEn ? 'Fill all fields' : 'Preencha todos os campos');
      return;
    }

    setCreating(true);
    try {
      const result = await createTicket(form, user.id);
      if (result.success) {
        toast.success(isEn ? 'Ticket created!' : 'Ticket criado!');
        setShowCreateModal(false);
        setForm({ subject: '', category: 'other', priority: 'normal', message: '' });
        navigate(`/apoio/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <LifeBuoy size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isEn ? 'Support Center' : 'Centro de Apoio'}
              </h1>
              <p className="text-white/90 text-sm">
                {isEn ? 'We are here to help you' : 'Estamos aqui para ajudar'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            {isEn ? 'New Ticket' : 'Novo Ticket'}
          </button>
        </div>
      </div>

      {/* MODAL CRIAR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEn ? 'New Support Ticket' : 'Novo Ticket de Apoio'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  {isEn ? 'Subject *' : 'Assunto *'}
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={isEn ? 'Brief description' : 'Breve descrição'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  {isEn ? 'Category' : 'Categoria'}
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                >
                  {SUPPORT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {isEn ? cat.labelEn : cat.labelPt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  {isEn ? 'Priority' : 'Prioridade'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TICKET_PRIORITY).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, priority: key })}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border-2 transition ${
                        form.priority === key
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {isEn ? val.en : val.pt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                  {isEn ? 'Message *' : 'Mensagem *'}
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  placeholder={isEn ? 'Describe your issue...' : 'Descreva o seu problema...'}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition font-medium"
                >
                  {isEn ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {isEn ? 'Create' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTA */}
      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <LifeBuoy size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'No tickets yet' : 'Sem tickets ainda'}
          </h3>
          <p className="text-gray-500 mb-6">
            {isEn ? 'Need help? Create your first ticket' : 'Precisa de ajuda? Crie o seu primeiro ticket'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {isEn ? 'Create Ticket' : 'Criar Ticket'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
            const priority = TICKET_PRIORITY[ticket.priority] || TICKET_PRIORITY.normal;
            const category = SUPPORT_CATEGORIES.find(c => c.value === ticket.category);

            return (
              <Link
                key={ticket.id}
                to={`/apoio/${ticket.id}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {ticket.subject}
                      </h3>
                      {ticket.unread_count > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {ticket.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>{category?.icon} {isEn ? category?.labelEn : category?.labelPt}</span>
                      <span className={`px-2 py-0.5 rounded-full ${status.bg}`}>
                        {status.icon} {isEn ? status.en : status.pt}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${priority.bg}`}>
                        {isEn ? priority.en : priority.pt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(ticket.last_message_at)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}