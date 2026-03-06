'use client'

import { Copy, Check, X } from 'lucide-react'
import { useState } from 'react'

interface CronInputProps {
  value: string
  onChange: (value: string) => void
  isValid: boolean
  hasInput: boolean
}

export function CronInput({ value, onChange, isValid, hasInput }: CronInputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="* * * * *"
          className={`w-full bg-secondary/50 border-2 rounded-lg px-4 py-3 font-mono text-lg tracking-wider placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
            hasInput
              ? isValid
                ? 'border-emerald-500/50 focus:border-emerald-500'
                : 'border-red-500/50 focus:border-red-500'
              : 'border-border focus:border-primary'
          }`}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          min hr day month weekday
        </span>
      </div>
      <button
        onClick={handleCopy}
        disabled={!value}
        className="px-4 py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
        title="Copy cron expression"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-500">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </>
        )}
      </button>
      <button
        onClick={handleClear}
        disabled={!value}
        className="px-4 py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
        title="Clear input"
      >
        <X className="w-4 h-4" />
        <span>Clear</span>
      </button>
    </div>
  )
}
