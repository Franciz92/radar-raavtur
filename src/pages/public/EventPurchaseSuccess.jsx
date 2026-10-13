// src/pages/public/EventPurchaseSuccess.jsx

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import QRCodeGenerator from '../../components/QRCodeGenerator';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Loader2,
  Download,
  Printer,
  Share2,
  User,
  Phone,
  Mail,
  Globe,
  QrCode,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventPurchaseSuccess() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEn } = useLanguage();
  const [purchase, setPurchase] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (!purchaseId) {
      navigate('/');
      return;
    }
    loadPurchase();
  }, [purchaseId]);

  const loadPurchase = async () => {
    setLoading(true);
    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('event_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

      if (purchaseError) throw purchaseError;
      setPurchase(purchaseData);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', purchaseData.event_id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

    } catch (error) {
      console.error('❌ Erro ao carregar compra:', error);
      toast.error(isEn ? 'Error loading purchase' : 'Erro ao carregar compra');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 500);
  };

  const generatePDF = async () => {
    if (!purchase || !event) return;

    setDownloading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const ticketColor = event.ticket_color || '#7c3aed';

      // ============================================
      // HEADER COM LOGO E COR
      // ============================================
      doc.setFillColor(ticketColor);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor('#ffffff');
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(isEn ? 'TICKET CONFIRMED' : 'INGRESSO CONFIRMADO', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(event.title || '', pageWidth / 2, 30, { align: 'center' });

      // ============================================
      // STATUS
      // ============================================
      doc.setFillColor('#dcfce7');
      doc.roundedRect(margin, 48, pageWidth - (margin * 2), 10, 2, 2, 'F');
      doc.setTextColor('#166534');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✅ ' + (isEn ? 'Payment Confirmed' : 'Pagamento Confirmado'), pageWidth / 2, 55, { align: 'center' });

      let y = 65;

      // ============================================
      // INFORMAÇÕES DO CLIENTE
      // ============================================
      doc.setDrawColor('#e5e7eb');
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setTextColor('#1e293b');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(isEn ? 'Holder' : 'Titular', margin, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(user?.name || user?.email || (isEn ? 'Anonymous' : 'Anônimo'), margin + 60, y + 5);

      doc.setTextColor('#1e293b');
      doc.setFont('helvetica', 'bold');
      doc.text(isEn ? 'Ticket ID' : 'ID do Ingresso', pageWidth - 80, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text('#' + purchase.id.slice(0, 12).toUpperCase(), pageWidth - 30, y + 5, { align: 'right' });

      y += 15;

      // ============================================
      // DETALHES DO EVENTO
      // ============================================
      doc.setDrawColor('#e5e7eb');
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setTextColor('#1e293b');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(isEn ? 'Event Details' : 'Detalhes do Evento', margin, y + 5);

      y += 12;

      const details = [
        [isEn ? 'Event' : 'Evento', event.title || ''],
        [isEn ? 'Organizer' : 'Organizador', event.organizer || (isEn ? 'Not informed' : 'Não informado')],
        [isEn ? 'Date & Time' : 'Data e Hora', formatDate(event.date)],
        [isEn ? 'Location' : 'Local', event.location || (isEn ? 'Not informed' : 'Não informado')],
      ];

      autoTable(doc, {
        startY: y,
        head: [],
        body: details,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: '#f1f5f9',
          lineWidth: 0.5,
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: '#64748b', cellWidth: 60 },
          1: { textColor: '#1e293b' },
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 10;

      // ============================================
      // DETALHES DA COMPRA
      // ============================================
      doc.setDrawColor('#e5e7eb');
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setTextColor('#1e293b');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(isEn ? 'Purchase Details' : 'Detalhes da Compra', margin, y + 5);

      y += 12;

      const purchaseDetails = [
        [isEn ? 'Ticket Type' : 'Tipo de Ingresso', purchase.ticket_name || ''],
        [isEn ? 'Quantity' : 'Quantidade', purchase.quantity + 'x'],
        [isEn ? 'Unit Price' : 'Preço Unitário', purchase.unit_price.toLocaleString() + ' Kz'],
      ];

      autoTable(doc, {
        startY: y,
        head: [],
        body: purchaseDetails,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: '#f1f5f9',
          lineWidth: 0.5,
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: '#64748b', cellWidth: 60 },
          1: { textColor: '#1e293b' },
        },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 10;

      // ============================================
      // TOTAL
      // ============================================
      doc.setFillColor(ticketColor + '20');
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 15, 2, 2, 'F');
      doc.setTextColor('#1e293b');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(isEn ? 'Total Paid' : 'Total Pago', margin + 10, y + 10);
      doc.setTextColor(ticketColor);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(purchase.total_price.toLocaleString() + ' Kz', pageWidth - margin - 10, y + 10, { align: 'right' });

      y += 25;

      // ============================================
      // QR CODE
      // ============================================
      const qrSize = 50;
      const qrX = (pageWidth - qrSize) / 2;

      const qrData = JSON.stringify({
        ticket_id: purchase.id,
        event: event.title,
        holder: user?.name || user?.email || 'Anonymous',
        organizer: event.organizer || 'RAVTUR',
        date: event.date,
        ticket: purchase.ticket_name,
        quantity: purchase.quantity,
        total: purchase.total_price
      });

      try {
        const qrDataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          height: 300,
          color: {
            dark: ticketColor,
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H',
          margin: 2
        });

        doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);

        y += qrSize + 8;

        doc.setTextColor('#94a3b8');
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(isEn ? 'Scan to validate ticket' : 'Escanear para validar ingresso', pageWidth / 2, y, { align: 'center' });

        y += 5;
        doc.setTextColor('#cbd5e1');
        doc.setFontSize(7);
        doc.text(`${user?.name || user?.email} • ${event.organizer || 'RAVTUR'}`, pageWidth / 2, y, { align: 'center' });

      } catch (qrError) {
        console.error('❌ Erro ao gerar QR Code:', qrError);
        doc.setTextColor('#94a3b8');
        doc.setFontSize(10);
        doc.text(isEn ? 'QR Code unavailable' : 'QR Code indisponível', pageWidth / 2, y + 25, { align: 'center' });
        y += 30;
      }

      y += 15;

      // ============================================
      // RODAPÉ
      // ============================================
      doc.setDrawColor('#e5e7eb');
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setTextColor('#475569');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(event.organizer || 'RAVTUR', pageWidth / 2, y, { align: 'center' });

      y += 5;
      doc.setTextColor('#94a3b8');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');

      let footerText = '';
      if (event.organizer_phone) footerText += `📞 ${event.organizer_phone}  `;
      if (event.organizer_email) footerText += `✉️ ${event.organizer_email}  `;
      if (event.organizer_website) footerText += `🌐 ${event.organizer_website}`;
      doc.text(footerText || (isEn ? 'RAVTUR Events' : 'Eventos RAVTUR'), pageWidth / 2, y, { align: 'center' });

      y += 6;
      doc.setTextColor('#cbd5e1');
      doc.setFontSize(6);
      doc.text(
        isEn ? 'This ticket is valid only with official identification. Non-transferable.' : 'Este ingresso é válido apenas com identificação oficial. Intransferível.',
        pageWidth / 2,
        y,
        { align: 'center' }
      );

      y += 5;
      doc.text(`RAVTUR Events • ${new Date().getFullYear()}`, pageWidth / 2, y, { align: 'center' });

      // ============================================
      // SALVAR PDF
      // ============================================
      const fileName = `comprovante-${event.title?.replace(/\s+/g, '-').toLowerCase() || 'evento'}.pdf`;
      doc.save(fileName);
      toast.success(isEn ? '✅ PDF downloaded!' : '✅ PDF baixado!');

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      toast.error(isEn ? 'Error generating PDF' : 'Erro ao gerar PDF');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dados para o QR Code
  const qrData = JSON.stringify({
    ticket_id: purchase?.id,
    event: event?.title,
    holder: user?.name || user?.email,
    organizer: event?.organizer,
    date: event?.date,
    ticket: purchase?.ticket_name,
    quantity: purchase?.quantity,
    total: purchase?.total_price
  });

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
        <p className="text-gray-500">{isEn ? 'Purchase not found' : 'Compra não encontrada'}</p>
        <Link to="/" className="text-purple-500 hover:underline mt-2 inline-block">
          {isEn ? 'Go to home' : 'Ir para home'}
        </Link>
      </div>
    );
  }

  const ticketColor = event.ticket_color || '#7c3aed';

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header com botões */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/eventos" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
          {isEn ? 'Back to events' : 'Voltar para eventos'}
        </Link>
        <div className="flex gap-2">
          <button
            onClick={generatePDF}
            disabled={downloading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileText size={18} />
            )}
            {isEn ? 'PDF' : 'PDF'}
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <Printer size={18} />
            {printing ? (isEn ? 'Printing...' : 'Imprimindo...') : (isEn ? 'Print' : 'Imprimir')}
          </button>
        </div>
      </div>

      {/* Comprovante */}
      <div
        id="receipt-content"
        ref={receiptRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header com logo */}
        <div className="p-6 text-white text-center" style={{ background: ticketColor }}>
          {event.organizer_logo && (
            <div className="bg-white p-2 rounded-lg inline-block mb-3">
              <img 
                src={event.organizer_logo} 
                alt={event.organizer} 
                className="h-12 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold">
            {isEn ? 'Ticket Confirmed!' : 'Ingresso Confirmado!'}
          </h1>
          <p className="text-white/80 mt-1">{event.title}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-500/30 px-4 py-1.5 rounded-full">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">
              {isEn ? 'Payment Confirmed' : 'Pagamento Confirmado'}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Informações do Cliente */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                <User size={14} />
                {isEn ? 'Holder' : 'Titular'}
              </p>
              <p className="font-medium text-gray-900 dark:text-white mt-1">
                {user?.name || user?.email || (isEn ? 'Anonymous' : 'Anônimo')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                <Ticket size={14} />
                {isEn ? 'Ticket ID' : 'ID do Ingresso'}
              </p>
              <p className="font-mono font-medium text-gray-900 dark:text-white mt-1 text-sm">
                #{purchase.id.slice(0, 12).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Detalhes do Evento */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {isEn ? 'Event Details' : 'Detalhes do Evento'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Event' : 'Evento'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Organizer' : 'Organizador'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{event.organizer || (isEn ? 'Not informed' : 'Não informado')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Date & Time' : 'Data e Hora'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">{isEn ? 'Location' : 'Local'}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalhes da Compra */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {isEn ? 'Purchase Details' : 'Detalhes da Compra'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Ticket Type' : 'Tipo de Ingresso'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{purchase.ticket_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Quantity' : 'Quantidade'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{purchase.quantity}x</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500">{isEn ? 'Unit Price' : 'Preço Unitário'}</span>
                <span className="font-medium text-gray-900 dark:text-white">{purchase.unit_price.toLocaleString()} Kz</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">
                {isEn ? 'Total Paid' : 'Total Pago'}
              </span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {purchase.total_price.toLocaleString()} Kz
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="inline-block bg-white dark:bg-gray-700 p-3 rounded-lg">
              <QRCodeGenerator 
                data={qrData}
                size={150}
                color={ticketColor}
                bgColor="#ffffff"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isEn ? 'Scan to validate ticket' : 'Escanear para validar ingresso'}
            </p>
            <p className="text-xs text-gray-400 font-mono mt-1">
              {user?.name || user?.email} • {event.organizer || 'RAVTUR'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <User size={14} /> {event.organizer || 'RAVTUR'}
            </span>
            {event.organizer_phone && (
              <span className="flex items-center gap-1">
                <Phone size={14} /> {event.organizer_phone}
              </span>
            )}
            {event.organizer_email && (
              <span className="flex items-center gap-1">
                <Mail size={14} /> {event.organizer_email}
              </span>
            )}
            {event.organizer_website && (
              <span className="flex items-center gap-1">
                <Globe size={14} /> {event.organizer_website.replace('https://', '').replace('http://', '')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isEn 
              ? 'This ticket is valid only with official identification. Non-transferable.' 
              : 'Este ingresso é válido apenas com identificação oficial. Intransferível.'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            RAVTUR Events • {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Ações adicionais */}
      <div className="mt-6 flex flex-wrap gap-3 no-print">
        <Link
          to={`/evento/${event.id}`}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition"
        >
          {isEn ? 'Back to Event' : 'Voltar ao Evento'}
        </Link>
        <Link
          to="/meus-ingressos"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
        >
          {isEn ? 'My Tickets' : 'Meus Ingressos'}
        </Link>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success(isEn ? 'Link copied!' : 'Link copiado!');
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <Share2 size={18} />
          {isEn ? 'Share' : 'Compartilhar'}
        </button>
      </div>
    </div>
  );
}