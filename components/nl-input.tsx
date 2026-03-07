'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

interface NlInputProps {
  onCronGenerated: (cron: string) => void
}

const WORKER_URL = process.env.NEXT_PUBLIC_NL_CRON_WORKER_URL || 'http://localhost:8787'

export function NlInput({ onCronGenerated }: NlInputProps) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async () => {
    const input = value.trim()
    if (!input) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json() as { cron: string | null }

      if (data.cron) {
        setResult(data.cron)
        onCronGenerated(data.cron)
      } else {
        setError('Could not parse — try rephrasing your schedule')
      }
    } catch {
      setError('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }, [value, onCronGenerated])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Try: "every weekday at 9am"'
            className="w-full bg-secondary/50 border-2 border-border rounded-lg pl-10 pr-4 py-3 text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-violet-500 transition-colors"
            spellCheck={false}
            autoComplete="off"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Generate</span>
        </button>
      </div>
      {result && (
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-mono text-xs">
            {result}
          </span>
        </div>
      )}
      {error && (
        <p className="text-xs text-muted-foreground/70">{error}</p>
      )}
    </div>
  )
}
