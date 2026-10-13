export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })
}