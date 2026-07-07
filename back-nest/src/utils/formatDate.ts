export const formatDate = (date: Date) => {
  const formattedDate = date.toLocaleDateString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return formattedDate
}
