// src/utils/downloadReceipt.js

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

/**
 * Baixa o comprovativo como PDF
 * @param {HTMLElement} element - Elemento HTML a ser convertido
 * @param {string} fileName - Nome do arquivo (sem extensão)
 * @returns {Promise<boolean>}
 */
export const downloadReceiptAsPDF = async (element, fileName = 'comprovativo-reserva') => {
  try {
    if (!element) {
      throw new Error('Elemento do comprovativo não encontrado');
    }

    // Mostrar loading
    const loadingToast = toast.loading('Gerando PDF...');

    // Configurar o elemento para melhor captura
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Capturar o elemento como canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Alta qualidade
      useCORS: true, // Permitir imagens externas
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Restaurar overflow
    document.body.style.overflow = originalOverflow;

    // Criar PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Se a imagem for maior que uma página, adicionar mais páginas
    if (imgHeight > 297) {
      let heightLeft = imgHeight - 297;
      let position = 0;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
    }

    // Salvar o PDF
    const finalFileName = `${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(finalFileName);

    toast.dismiss(loadingToast);
    toast.success('PDF baixado com sucesso!');

    return true;
  } catch (error) {
    console.error('❌ Erro ao baixar PDF:', error);
    toast.error('Erro ao gerar PDF. Tente novamente.');
    return false;
  }
};

/**
 * Baixa o comprovativo como imagem (PNG)
 * @param {HTMLElement} element - Elemento HTML a ser convertido
 * @param {string} fileName - Nome do arquivo (sem extensão)
 * @returns {Promise<boolean>}
 */
export const downloadReceiptAsImage = async (element, fileName = 'comprovativo-reserva') => {
  try {
    if (!element) {
      throw new Error('Elemento do comprovativo não encontrado');
    }

    const loadingToast = toast.loading('Gerando imagem...');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Criar link para download
    const link = document.createElement('a');
    link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast.dismiss(loadingToast);
    toast.success('Imagem baixada com sucesso!');

    return true;
  } catch (error) {
    console.error('❌ Erro ao baixar imagem:', error);
    toast.error('Erro ao gerar imagem. Tente novamente.');
    return false;
  }
};