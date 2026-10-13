import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './formatCurrency'

// EXPORTAR PARA CSV
export const exportToCSV = (data, filename = 'relatorio-financeiro.csv') => {
  if (!data || !data.length) return

  const headers = ['Servico', 'Valor Bruto', 'Comissao', 'Empresa', 'Estado']

  const rows = data.map((item) => [
    `"${item.service_name || 'Serviço Turístico'}"`,
    item.gross_amount || 0,
    item.platform_commission || 0,
    item.company_amount || 0,
    `"${item.payment_status || 'Pendente'}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// EXPORTAR PARA PDF
export const exportToPDF = (data, filename = 'relatorio-financeiro.pdf') => {
  if (!data || !data.length) return

  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42)
  doc.text('RAVTUR - Relatório Financeiro', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-PT')}`, 14, 28)

  const tableColumns = ['Serviço', 'Valor Bruto', 'Comissão', 'Empresa', 'Estado']
  const tableRows = data.map((item) => [
    item.service_name || 'Serviço Turístico',
    formatCurrency(item.gross_amount || 0),
    formatCurrency(item.platform_commission || 0),
    formatCurrency(item.company_amount || 0),
    (item.payment_status || 'Pendente').toUpperCase(),
  ])

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  })

  doc.save(filename)
}