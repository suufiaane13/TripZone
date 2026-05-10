/** Messages Postgres / PostgREST pour doublon ou violation d’unicité */
export function formatReservationDuplicateError(message: string): string {
  const m = message.toLowerCase()
  if (
    m.includes('existe déjà') ||
    m.includes('duplicate key') ||
    m.includes('unique constraint') ||
    m.includes('23505')
  ) {
    return 'Une réservation existe déjà pour ce trajet avec ce nom et ce numéro.'
  }
  return message
}
