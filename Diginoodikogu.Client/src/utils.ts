import { dateFmt, toDate, toDateFmt } from '@servicestack/client'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
export const formatCurrency = (n?: number) => (n ? formatter.format(n) : '')
export const formatDate = (s?: string) => (s ? toDateFmt(s) : '')

export const dateInputFormat = (d: Date) => dateFmt(d).replace(/\//g, '-')
const isoDateRegex = /^\d{2,4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}/

export function sanitizeForUi(dto: any) {
  if (!dto) return {}
  Object.keys(dto).forEach((key) => {
    const value = dto[key]
    if (typeof value == 'string') {
      if (value.startsWith('/Date') || value.match(isoDateRegex))
        dto[key] = dateInputFormat(toDate(value))
    }
  })
  return dto
}

export function dateLabel(date: any) {
  return new Date(date).toLocaleDateString('et-EE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
export function dateTimestamp(date: any) {
  try {
    return new Date(date).toISOString()
  } catch (e) {
    return '2000-01-01T00:00:00.000Z'
  }
}
