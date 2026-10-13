// src/pages/user/TicketDetailPage.jsx
// ============================================
// DETALHE DO TICKET - CONVERSA
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Loader2, User, Shield, CheckCircle,
  Clock, Lock, MessageCircle, LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getTicketById,
  sendMessage,
  markMessagesAsRead,
  updateTicketStatus,
  TICKET_STATUS,
  TICKET_PRIORITY,
  SUPPORT_CATEGORIES,
} from '../../services/supportService';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const result = await getTicketById(id);
      if (result.success && result.data) {
        setTicket(result.data);
        await markMessagesAsRead(id, isAdmin ? 'admin' : 'user');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
      } else {
        toast.error(isEn ? 'Ticket not found' : 'Ticket não encontrado');
        navigate('/apoio');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(
        id,
        user.id,
        isAdmin ? 'admin' : 'user',
        message
      );

      if (result.success) {
        setTicket(prev => ({
          ...prev,
          messages: [...prev.messages, result.data],
        }));
        setMessage('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        toast.error(result.error);
      }
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const result = await updateTicketStatus(id, newStatus, user.id);
    if (result.success) {
      setTicket(prev => ({ ...prev, status: newStatus }));
      toast.success(isEn ? 'Status updated!' : 'Estado atualizado!');
    }
  };

  const formatTime = (date) => {
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

  if (!ticket) return null;

  const status = TICKET_STATUS[ticket.status] || TICKET_STATUS.open;
  const priority = TICKET_PRIORITY[ticket.priority] || TICKET_PRIORITY.normal;
  const category = SUPPORT_CATEGORIES.find(c => c.value === ticket.category);
  const isClosed = ticket.status === 'closed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden">
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <button
            onClick={() => navigate('/apoio')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 dark:text-white truncate">
              {ticket.subject}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap mt-1">
              <span>{category?.icon} {isEn ? category?.labelEn : category?.labelPt}</span>
              <span className={`px-2 py-0.5 rounded-full ${status.bg}`}>
                {status.icon} {isEn ? status.en : status.pt}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${priority.bg}`}>
                {isEn ? priority.en : priority.pt}
              </span>
            </div>
          </div>
        </div>

        {/* INFO DO UTILIZADOR (admin) */}
        {isAdmin && ticket.user && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-3">
            {ticket.user.avatar_url ? (
              <img src={ticket.user.avatar_url} alt={ticket.user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link to={`/perfil/${ticket.user.id}`} className="font-medium text-blue-700 dark:text-blue-300 hover:underline">
                {ticket.user.name}
              </Link>
              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                {ticket.user.email}
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full flex items-center gap-1">
              <Shield size={12} />
              Admin
            </span>
          </div>
        )}

        {/* AÇÕES (admin) */}
        {isAdmin && !isClosed && (
          <div className="p-3 bg-gray-50 dark:bg-gray-900/30 flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500 flex items-center gap-1 mr-auto">
              <Lock size={12} />
              {isEn ? 'Change status:' : 'Alterar estado:'}
            </span>
            <button
              onClick={() => handleStatusChange('in_progress')}
              className="px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              {isEn ? 'In Progress' : 'Em Progresso'}
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              {isEn ? 'Resolved' : 'Resolvido'}
            </button>
            <button
              onClick={() => handleStatusChange('closed')}
              className="px-3 py-1.5 text-xs font-medium bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              {isEn ? 'Close' : 'Fechar'}
            </button>
          </div>
        )}

        {/* AVISO FECHADO */}
        {isClosed && (
          <div className="p-3 bg-gray-100 dark:bg-gray-900/50 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <Lock size={14} />
            {isEn ? 'This ticket is closed' : 'Este ticket está fechado'}
          </div>
        )}
      </div>

      {/* MENSAGENS */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 max-h-[60vh] overflow-y-auto">
        {ticket.messages.map((msg, idx) => {
          const isMe = msg.sender_id === user.id;
          const sender = msg.sender;
          const isAdminMsg = msg.sender_role === 'admin';

          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              {sender?.avatar_url ? (
                <img
                  src={sender.avatar_url}
                  alt={sender.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isAdminMsg ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  {isAdminMsg ? <Shield size={16} className="text-blue-600" /> : <User size={16} className="text-amber-600" />}
                </div>
              )}

              {/* Bubble */}
              <div className={`flex-1 max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                <div className={`inline-flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="font-medium text-xs text-gray-900 dark:text-white">
                    {sender?.name || (isEn ? 'User' : 'Utilizador')}
                  </span>
                  {isAdminMsg && (
                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">
                      ADMIN
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                </div>
                <div className={`inline-block px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <p className="text-sm whitespace-pre-wrap text-left">{msg.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      {!isClosed ? (
        <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isEn ? 'Type your message...' : 'Escreva a sua mensagem...'}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span className="hidden sm:inline">{isEn ? 'Send' : 'Enviar'}</span>
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Lock size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {isEn ? 'This ticket is closed. Create a new one if you need more help.' : 'Este ticket está fechado. Crie um novo se precisar de mais ajuda.'}
          </p>
          <button
            onClick={() => navigate('/apoio')}
            className="mt-3 inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 font-medium text-sm"
          >
            <ArrowLeft size={14} />
            {isEn ? 'Back to support' : 'Voltar ao apoio'}
          </button>
        </div>
      )}
    </div>
  );
}