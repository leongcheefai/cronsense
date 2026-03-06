'use client'

import { type CronFields, getFieldExplanation } from '@/lib/cron'

interface FieldBreakdownProps {
  fields?: CronFields
  isValid: boolean
}

interface FieldCardProps {
  value: string
  label: string
  explanation: string
  type: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek' | 'second'
}

function FieldCard({ value, label, explanation }: FieldCardProps) {
  return (
    <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg border border-border">
      <span className="font-mono text-lg text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
      <span className="text-xs text-emerald-500 mt-1 text-center">{explanation}</span>
    </div>
  )
}

export function FieldBreakdown({ fields, isValid }: FieldBreakdownProps) {
  if (!fields) {
    return null
  }

  const fieldData = fields.second
    ? [
        { value: fields.second, label: 'second', type: 'second' as const },
        { value: fields.minute, label: 'minute', type: 'minute' as const },
        { value: fields.hour, label: 'hour', type: 'hour' as const },
        { value: fields.dayOfMonth, label: 'day', type: 'dayOfMonth' as const },
        { value: fields.month, label: 'month', type: 'month' as const },
        { value: fields.dayOfWeek, label: 'weekday', type: 'dayOfWeek' as const },
      ]
    : [
        { value: fields.minute, label: 'minute', type: 'minute' as const },
        { value: fields.hour, label: 'hour', type: 'hour' as const },
        { value: fields.dayOfMonth, label: 'day', type: 'dayOfMonth' as const },
        { value: fields.month, label: 'month', type: 'month' as const },
        { value: fields.dayOfWeek, label: 'weekday', type: 'dayOfWeek' as const },
      ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Field Breakdown</h3>
      <div className={`grid gap-2 ${fields.second ? 'grid-cols-6' : 'grid-cols-5'}`}>
        {fieldData.map((field) => (
          <FieldCard
            key={field.label}
            value={field.value}
            label={field.label}
            type={field.type}
            explanation={isValid ? getFieldExplanation(field.value, field.type) : '-'}
          />
        ))}
      </div>
    </div>
  )
}
