export function formatCurrency(value, currency = 'Kz') {
  if (value === 0) return 'Grátis'
  return `${Number(value).toLocaleString('pt-AO')} ${currency}`
}