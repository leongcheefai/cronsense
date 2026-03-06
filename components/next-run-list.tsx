'use client'

import { formatNextRun, getRelativeTime } from '@/lib/cron'
import { Clock, Globe } from 'lucide-react'

interface NextRunListProps {
  nextRuns?: Date[]
  timezone: string
}

export function NextRunList({ nextRuns, timezone }: NextRunListProps) {
  if (!nextRuns || nextRuns.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Next 10 Run Times
        </h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {timezone}
        </span>
      </div>
      <div className="bg-secondary/30 rounded-lg border border-border overflow-hidden">
        <ul className="divide-y divide-border">
          {nextRuns.map((date, index) => (
            <li
              key={date.toISOString()}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 text-right">
                  {index + 1}.
                </span>
                <span className="font-mono text-sm text-foreground">
                  {formatNextRun(date, timezone)}
                </span>
              </div>
              {index === 0 && (
                <span className="text-xs text-emerald-500 font-medium">
                  {getRelativeTime(date)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
