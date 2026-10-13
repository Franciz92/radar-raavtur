// src/pages/admin/AdminSupportPage.jsx
// ============================================
// ADMIN - LISTA DE TICKETS DE APOIO
// ============================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy, Search, Loader2, ChevronRight, MessageCircle,
  Clock, User, Filter, Shield
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  getAllTickets,
  getSupportStats,
  TICKET_STATUS,
  TICKET_PRIORITY,
  SUPPORT_CATEGORIES,
} from '../../services/supportService';
import toast from 'react-hot-toast';

export default function AdminSupportPage() {
  const { isEn } = useLanguage();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    loadData();
  }, [filterStatus, filterPriority]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (filterPriority !== 'all') filters.priority = filterPriority;

      const [ticketsResult, statsResult] = await Promise.all([
        getAllTickets(filters),
        getSupportStats(),
      ]);

      if (ticketsResult.success) setTickets(ticketsResult.data || []);
      if (statsResult.success) setStats(statsResult.data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q)
    );
  });

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(isEn ? 'en-US' : 'pt-AO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LifeBuoy size={28} className="text-amber-500" />
            {isEn ? 'Support Tickets' : 'Tickets de Apoio'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEn ? `${stats.total} tickets total` : `${stats.total} tickets no total`}
          </p>
        </div>
        {stats.unread > 0 && (
          <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-medium text-sm flex items-center gap-2">
            <MessageCircle size={16} />
            {stats.unread} {isEn ? 'unread messages' : 'mensagens não lidas'}
          </span>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'total', label: isEn ? 'Total' : 'Total', color: 'gray' },
          { key: 'open', label: isEn ? 'Open' : 'Aberto', color: 'yellow' },
          { key: 'in_progress', label: isEn ? 'In Progress' : 'Em Progresso', color: 'blue' },
          { key: 'resolved', label: isEn ? 'Resolved' : 'Resolvido', color: 'green' },
          { key: 'closed', label: isEn ? 'Closed' : 'Fechado', color: 'gray' },
        ].map(item => (
          <div key={item.key} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 uppercase">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats[item.key] || 0}</p>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search tickets...' : 'Pesquisar tickets...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{isEn ? 'All Status' : 'Todos os Estados'}</option>
            <option value="open">{isEn ? 'Open' : 'Aberto'}</option>
            <option value="in_progress">{isEn ? 'In Progress' : 'Em Progresso'}</option>
            <option value="resolved">{isEn ? 'Resolved' : 'Resolvido'}</option>
            <option value="closed">{isEn ? 'Closed' : 'Fechado'}</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">{isEn ? 'All Priority' : 'Todas as Prioridades'}</option>
            <option value="low">{isEn ? 'Low' : 'Baixa'}</option>
            <option value="normal">{isEn ? 'Normal' : 'Normal'}</option>
            <option value="high">{isEn ? 'High' : 'Alta'}</option>
            <option value="urgent">{isEn ? 'Urgent' : 'Urgente'}</option>
          </select>
        </div>
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={40} className="animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <LifeBuoy size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {isEn ? 'No tickets found' : 'Nenhum ticket encontrado'}
          </h3>
          <p className="text-gray-500">
            {isEn ? 'No tickets match your filters' : 'Nenhum ticket corresponde aos filtros'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => {
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
                  
                  {/* Avatar do user */}
                  {ticket.user?.avatar_url ? (
                    <img
                      src={ticket.user.avatar_url}
                      alt={ticket.user.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-amber-600" />
                    </div>
                  )}

                  {/* Info */}
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
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <User size={12} />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{ticket.user?.name}</span>
                      <span>·</span>
                      <span className="truncate">{ticket.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
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