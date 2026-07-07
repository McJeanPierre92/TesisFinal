import { Prisma } from '@prisma/client'

export function transformDecimals(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (obj instanceof Prisma.Decimal) {
    return obj.toNumber()
  }

  if (Array.isArray(obj)) {
    return obj.map(transformDecimals)
  }

  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const newObj = {}
    for (const key in obj) {
      newObj[key] = transformDecimals(obj[key])
    }
    return newObj
  }

  return obj
}
