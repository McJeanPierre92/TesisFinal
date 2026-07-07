import { LANGUAGE_KEY } from '@/constants/const'

export const formattedNumber = (
  value: number,
  precision = 2,
  style: 'currency' | 'decimal' = 'decimal'
): string | number => {
  return Intl.NumberFormat(LANGUAGE_KEY, {
    style,
    currency: 'USD',
    maximumFractionDigits: precision
  }).format(value)
}
