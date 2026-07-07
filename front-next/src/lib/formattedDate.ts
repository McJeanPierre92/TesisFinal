import { format, parse, tzDate } from '@formkit/tempo'

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const parseDate = (date: string | Date, newFormat = 'DD/MM/YYYY') => {
  const isoDate =
    typeof date === 'string' ? new Date(date).toISOString().split('T')[0] : date
  const dateTimezone = tzDate(isoDate, timeZone)

  const formatted = format(dateTimezone, newFormat)

  return parse(formatted, newFormat)
}

export const formattedDate = (
  date: string | Date,
  newFormat = 'DD/MM/YYYY'
) => {
  const formatted = format(date, newFormat)

  return formatted
}
