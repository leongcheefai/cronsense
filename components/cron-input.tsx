'use client'

import { Copy, Check, X } from 'lucide-react'
import { useState, useRef } from 'react'

interface CronInputProps {
  value: string
  onChange: (value: string) => void
  isValid: boolean
  hasInput: boolean
}

export function CronInput({ value, onChange, isValid, hasInput }: CronInputProps) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    let cursor = e.target.selectionStart ?? val.length

    // Auto-space on single character insertion (not paste/delete)
    if (val.length === value.length + 1 && cursor > 1) {
      const prev = val[cursor - 2]
      const curr = val[cursor - 1]

      // Get the current field token (everything since the last space)
      const beforeCursor = val.slice(0, cursor - 1)
      const lastSpace = beforeCursor.lastIndexOf(' ')
      const currentField = beforeCursor.slice(lastSpace + 1)

      // Check if prev char is part of a separator that expects more digits (range/step/list)
      const inCompound = /[,\-/]$/.test(currentField)

      const needsSpace =
        // * or digit followed by * → new field
        (curr === '*' && (prev === '*' || /[0-9]/.test(prev))) ||
        // * followed by digit (but not */) → new field
        (/[0-9]/.test(curr) && prev === '*' && (cursor < 3 || val[cursor - 3] !== '/')) ||
        // digit followed by digit: auto-space unless in a compound expression (range/step/list)
        // allows: 1-31, */15, 5,10 to stay together
        // splits: 12345 → 1 2 3 4 5
        (/[0-9]/.test(curr) && /[0-9]/.test(prev) && !inCompound)

      if (needsSpace) {
        val = val.slice(0, cursor - 1) + ' ' + val.slice(cursor - 1)
        cursor += 1
      }
    }

    onChange(val)
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(cursor, cursor)
    })
  }

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
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
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
