import cronstrue from 'cronstrue'
import cronParser from 'cron-parser'

export interface ParsedCron {
  valid: boolean
  explanation?: string
  nextRuns?: Date[]
  errorMessage?: string
  fields?: CronFields
}

export interface CronFields {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
  second?: string
}

export interface CheatsheetItem {
  label: string
  cron: string
  description: string
}

export const CHEATSHEET_PATTERNS: CheatsheetItem[] = [
  { label: 'Every minute', cron: '* * * * *', description: 'Runs every minute' },
  { label: 'Every hour', cron: '0 * * * *', description: 'On the hour, every hour' },
  { label: 'Every day at midnight', cron: '0 0 * * *', description: 'Once a day at 00:00' },
  { label: 'Every day at noon', cron: '0 12 * * *', description: 'Once a day at 12:00' },
  { label: 'Every weekday at 9am', cron: '0 9 * * 1-5', description: 'Mon-Fri at 09:00' },
  { label: 'Every Sunday at 2am', cron: '0 2 * * 0', description: 'Weekly cleanup job' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *', description: 'Quarter-hour intervals' },
  { label: 'Every 6 hours', cron: '0 */6 * * *', description: '4x per day' },
  { label: '1st of every month', cron: '0 0 1 * *', description: 'Monthly at midnight' },
  { label: 'Every weekday at 8:30am', cron: '30 8 * * 1-5', description: 'Weekday standup trigger' },
  { label: 'Every 5 min, business hours', cron: '*/5 9-17 * * 1-5', description: 'Working hours only' },
  { label: 'Twice daily', cron: '0 8,20 * * *', description: '8am and 8pm' },
]

function parseFieldsFromExpression(expression: string): CronFields | undefined {
  const parts = expression.trim().split(/\s+/)
  
  if (parts.length === 5) {
    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    }
  } else if (parts.length === 6) {
    return {
      second: parts[0],
      minute: parts[1],
      hour: parts[2],
      dayOfMonth: parts[3],
      month: parts[4],
      dayOfWeek: parts[5],
    }
  }
  
  return undefined
}

export function getFieldExplanation(field: string, type: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'second'): string {
  if (field === '*') {
    return 'any'
  }
  
  if (field.startsWith('*/')) {
    const interval = field.slice(2)
    switch (type) {
      case 'minute': return `every ${interval} min`
      case 'hour': return `every ${interval} hr`
      case 'second': return `every ${interval} sec`
      default: return `every ${interval}`
    }
  }
  
  if (field.includes('-')) {
    const [start, end] = field.split('-')
    if (type === 'dayOfWeek') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return `${days[parseInt(start)] || start}-${days[parseInt(end)] || end}`
    }
    if (type === 'hour') {
      return `${start}:00-${end}:00`
    }
    return `${start}-${end}`
  }
  
  if (field.includes(',')) {
    return field.split(',').join(', ')
  }
  
  if (type === 'minute' || type === 'second') {
    return `:${field.padStart(2, '0')}`
  }
  
  if (type === 'hour') {
    return `${field}:00`
  }
  
  if (type === 'dayOfWeek') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[parseInt(field)] || field
  }
  
  if (type === 'month') {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[parseInt(field)] || field
  }
  
  return field
}

export function parseCron(expression: string, count = 10): ParsedCron {
  const trimmed = expression.trim()
  
  if (!trimmed) {
    return { valid: false, errorMessage: 'Enter a cron expression' }
  }
  
  try {
    const explanation = cronstrue.toString(trimmed, { 
      throwExceptionOnParseError: true,
      use24HourTimeFormat: false 
    })
    const interval = cronParser.parseExpression(trimmed)
    const nextRuns: Date[] = []
    
    for (let i = 0; i < count; i++) {
      const next = interval.next()
      nextRuns.push(next.toDate())
    }
    
    const fields = parseFieldsFromExpression(trimmed)
    
    return { valid: true, explanation, nextRuns, fields }
  } catch (e) {
    return { 
      valid: false, 
      errorMessage: (e as Error).message,
      fields: parseFieldsFromExpression(trimmed)
    }
  }
}

export function formatNextRun(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(date)
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    const remainingHours = hours % 24
    if (remainingHours > 0) {
      return `in ${days}d ${remainingHours}h`
    }
    return `in ${days}d`
  }
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60
    if (remainingMinutes > 0) {
      return `in ${hours}h ${remainingMinutes}m`
    }
    return `in ${hours}h`
  }
  
  if (minutes > 0) {
    return `in ${minutes}m`
  }
  
  return `in ${seconds}s`
}
