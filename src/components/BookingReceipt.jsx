// src/components/BookingReceipt.jsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  Building2,
  Calendar,
  Clock,
  Users,
  CreditCard,
  FileText,
  X,
  Copy,
  Check,
  Loader2,
  Image as ImageIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Shield,
  Star,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { downloadReceiptAsPDF, downloadReceiptAsImage } from '../utils/downloadReceipt';
import toast from 'react-hot-toast';

// ============================================
// COMPONENTE DO COMPROVATIVO - PROFISSIONAL
// ============================================

export function BookingReceipt({ booking, service, company, onClose }) {
  const { isEn } = useLanguage();
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Gerar QR Code
  useEffect(() => {
    if (booking?.id) {
      generateQRCode();
    }
  }, [booking]);

  const generateQRCode = async () => {
    try {
      setQrCodeLoading(true);
      const bookingUrl = `${window.location.origin}/minha-reserva/${booking.id}`;
      
      // Dados mais completos para o QR Code
      const qrData = JSON.stringify({
        id: booking.id,
        service: service?.name,
        company: company?.name,
        date: booking.date,
        time: booking.time,
        total: booking.total_price,
        guests: booking.guests,
        url: bookingUrl,
      });
      
      const qr = await QRCode.toDataURL(qrData, {
        width: 250,
        margin: 2,
        color: {
          dark: '#1a1a2e',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrCode(qr);
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return `${Number(price).toLocaleString()} Kz`;
  };

  const copyBookingId = () => {
    if (booking?.id) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      toast.success(isEn ? 'Booking ID copied!' : 'ID da reserva copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleDownloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) {
      toast.error(isEn ? 'Error generating PDF' : 'Erro ao gerar PDF');
      return;
    }
    setIsDownloading(true);
    await downloadReceiptAsPDF(element, `reserva-${booking.id?.slice(0, 8)}`);
    setIsDownloading(false);
  };

  const handleDownloadImage = async () => {
    const element = receiptRef.current;
    if (!element) {
      toast.error(isEn ? 'Error generating image' : 'Erro ao gerar imagem');
      return;
    }
    setIsDownloading(true);
    await downloadReceiptAsImage(element, `reserva-${booking.id?.slice(0, 8)}`);
    setIsDownloading(false);
  };

  const handleShare = async () => {
    const bookingUrl = `${window.location.origin}/minha-reserva/${booking.id}`;
    const shareData = {
      title: `${isEn ? 'Booking Confirmation' : 'Comprovativo de Reserva'} - ${service?.name}`,
      text: `${isEn ? 'Booking confirmed at' : 'Reserva confirmada em'} ${company?.name}\n${isEn ? 'Booking ID' : 'ID da Reserva'}: ${booking.id}\n${isEn ? 'Total' : 'Total'}: ${formatPrice(booking.total_price)}\n\n${bookingUrl}`,
      url: bookingUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          copyBookingId();
        }
      }
    } else {
      copyBookingId();
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: isEn ? 'Pending' : 'Pendente',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: '⏳',
      },
      confirmed: {
        label: isEn ? 'Confirmed' : 'Confirmada',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: '✅',
      },
      completed: {
        label: isEn ? 'Completed' : 'Concluída',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: '📌',
      },
      cancelled: {
        label: isEn ? 'Cancelled' : 'Cancelada',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: '❌',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(booking?.status);
  const companyName = company?.name || 'Empresa';
  const serviceName = service?.name || 'Serviço';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Cabeçalho do Modal */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 rounded-t-2xl border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEn ? 'Booking Confirmation' : 'Comprovativo de Reserva'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEn ? 'Electronic receipt' : 'Comprovativo eletrónico'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEÚDO DO COMPROVATIVO */}
        <div className="p-6" ref={receiptRef}>
          <div className="receipt-container bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            
            {/* ============================================
                TOPO - LOGO DA EMPRESA
                ============================================ */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-6 text-white">
              <div className="flex items-center justify-between">
                {/* Logo e Nome da Empresa */}
                <div className="flex items-center gap-4">
                  {company?.logo ? (
                    <img 
                      src={company.logo} 
                      alt={companyName} 
                      className="w-20 h-20 rounded-full border-4 border-white/40 object-cover bg-white shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center shadow-xl">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{companyName}</h3>
                    <p className="text-sm text-blue-200 opacity-90 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {isEn ? 'Verified Establishment' : 'Estabelecimento Verificado'}
                    </p>
                  </div>
                </div>
                
                {/* Número da Reserva e Status */}
                <div className="text-right bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold tracking-wider">#{booking?.id?.slice(0, 8)}</div>
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full mt-1 ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================
                CORPO DO COMPROVATIVO
                ============================================ */}
            <div className="p-6 space-y-5">
              
              {/* Título do Serviço */}
              <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-3">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{serviceName}</h4>
                {service?.category && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {service.category}
                  </span>
                )}
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {isEn ? 'Date' : 'Data'}
                  </label>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDate(booking?.date)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isEn ? 'Time' : 'Horário'}
                  </label>
                  <p className="font-semibold text-gray-900 dark:text-white">{booking?.time || '10:00'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {isEn ? 'Guests' : 'Hóspedes'}
                  </label>
                  <p className="font-semibold text-gray-900 dark:text-white">{booking?.guests || 1}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {isEn ? 'Payment' : 'Pagamento'}
                  </label>
                  <p className="font-semibold text-gray-900 dark:text-white">{booking?.payment_method || (isEn ? 'Pending' : 'Pendente')}</p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {isEn ? 'Total' : 'Total'}
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(booking?.total_price)}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {booking?.notes && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {isEn ? 'Notes' : 'Observações'}
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{booking.notes}</p>
                </div>
              )}

              {/* ============================================
                  QR CODE - DESTAQUE
                  ============================================ */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0">
                  {qrCodeLoading ? (
                    <div className="w-36 h-36 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : qrCode ? (
                    <div className="relative p-2 bg-white rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-600">
                      <img 
                        src={qrCode} 
                        alt="QR Code" 
                        className="w-36 h-36"
                      />
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] px-3 py-0.5 rounded-full whitespace-nowrap shadow-md">
                        {isEn ? 'SCAN ME' : 'SCAN ME'}
                      </div>
                    </div>
                  ) : (
                    <div className="w-36 h-36 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <p className="text-[10px] text-center text-gray-400 mt-3">
                    {isEn ? 'Scan QR Code to view details' : 'Scan o QR Code para ver detalhes'}
                  </p>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {isEn ? 'Booking ID' : 'ID da Reserva'}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                      {booking?.id}
                    </code>
                    <button
                      onClick={copyBookingId}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      title={isEn ? 'Copy ID' : 'Copiar ID'}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 justify-center sm:justify-start">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>
                      {isEn 
                        ? 'Present this code at the establishment' 
                        : 'Apresente este código no estabelecimento'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data de Emissão */}
              <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400">
                  {isEn ? 'Issued on' : 'Emitido em'}: {new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isEn 
                    ? 'Thank you for choosing our services!' 
                    : 'Obrigado por escolher os nossos serviços!'}
                </p>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap justify-between items-center text-xs text-gray-400">
                <span>© {new Date().getFullYear()} {companyName}</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {isEn ? 'Secure receipt' : 'Comprovativo seguro'}
                </span>
                <span>{isEn ? 'Electronic document' : 'Documento eletrónico'}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            <button
              onClick={handlePrint}
              disabled={isPrinting || isDownloading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isPrinting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
              {isEn ? 'Print' : 'Imprimir'}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {isEn ? 'Download PDF' : 'Baixar PDF'}
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              {isEn ? 'Download Image' : 'Baixar Imagem'}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition shadow-md hover:shadow-lg"
            >
              <Share2 className="w-5 h-5" />
              {isEn ? 'Share' : 'Partilhar'}
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/minhas-reservas');
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition"
            >
              {isEn ? 'My Bookings' : 'Minhas Reservas'}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos para Impressão */}
      <style>{`
        @media print {
          .fixed {
            position: static !important;
          }
          .bg-black\\/60 {
            background: none !important;
            backdrop-filter: none !important;
          }
          .max-h-\\[95vh\\] {
            max-height: none !important;
          }
          .overflow-y-auto {
            overflow: visible !important;
          }
          .receipt-container {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
          }
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
          }
          .bg-gradient-to-r {
            background: linear-gradient(to right, #1d4ed8, #4f46e5, #7c3aed) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-yellow-100 {
            background: #fef3c7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-green-100 {
            background: #d1fae5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-blue-50 {
            background: #eff6ff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-gray-50 {
            background: #f9fafb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-white\\/10 {
            background: rgba(255, 255, 255, 0.1) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .backdrop-blur-sm {
            backdrop-filter: none !important;
          }
          .shadow-lg, .shadow-md, .shadow-xl {
            box-shadow: none !important;
          }
          .border-4 {
            border-width: 4px !important;
          }
          .border-white\\/40 {
            border-color: rgba(255, 255, 255, 0.4) !important;
          }
          .rounded-full {
            border-radius: 9999px !important;
          }
        }
        @media print and (color) {
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}