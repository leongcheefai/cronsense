'use client'

import { useState, useEffect, useMemo } from 'react'
import { parseCron } from '@/lib/cron'
import { CronInput } from '@/components/cron-input'
import { ExplanationBadge } from '@/components/explanation-badge'
import { FieldBreakdown } from '@/components/field-breakdown'
import { NextRunList } from '@/components/next-run-list'
import { CheatsheetPanel } from '@/components/cheatsheet-panel'
import { NlInput } from '@/components/nl-input'
import { Terminal } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function CronSensePage() {
  const [cronExpression, setCronExpression] = useState('0 9 * * 1-5')
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
  }, [])

  const parsed = useMemo(() => {
    return parseCron(cronExpression)
  }, [cronExpression])

  const hasInput = cronExpression.trim().length > 0

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Terminal className="w-6 h-6 text-emerald-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              CronSense
            </h1>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-muted-foreground">
            Describe your schedule or paste a cron expression.
          </p>
        </header>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Input & Results */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Natural Language Input */}
            <section>
              <NlInput onCronGenerated={setCronExpression} />
            </section>

            {/* Divider */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
              <div className="flex-1 border-t border-border" />
              <span>or enter cron directly</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Cron Input */}
            <section>
              <CronInput
                value={cronExpression}
                onChange={setCronExpression}
                isValid={parsed.valid}
                hasInput={hasInput}
              />
              <p className="text-xs text-muted-foreground mt-2">
                5-field (min hr day month weekday) or 6-field with seconds
              </p>
            </section>

            {/* Explanation */}
            <section>
              <ExplanationBadge
                isValid={parsed.valid}
                explanation={parsed.explanation}
                errorMessage={hasInput ? parsed.errorMessage : undefined}
              />
            </section>

            {/* Field Breakdown */}
            {hasInput && parsed.fields && (
              <section>
                <FieldBreakdown fields={parsed.fields} isValid={parsed.valid} />
              </section>
            )}

            {/* Next Run Times */}
            {parsed.valid && parsed.nextRuns && (
              <section>
                <NextRunList nextRuns={parsed.nextRuns} timezone={timezone} />
              </section>
            )}
          </div>

          {/* Right Column - Cheatsheet */}
          <div className="lg:w-80 lg:shrink-0">
            <div className="lg:sticky lg:top-8">
              <CheatsheetPanel onSelect={setCronExpression} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Built for developers who keep forgetting what{' '}
            <code className="font-mono bg-secondary px-1.5 py-0.5 rounded">0 */6 * * 1-5</code>{' '}
            means two weeks later.
          </p>
        </footer>
      </div>
    </main>
  )
}
