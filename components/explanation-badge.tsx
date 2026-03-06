'use client'

import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ExplanationBadgeProps {
  isValid: boolean
  explanation?: string
  errorMessage?: string
}

export function ExplanationBadge({ isValid, explanation, errorMessage }: ExplanationBadgeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (explanation) {
      await navigator.clipboard.writeText(explanation)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  if (isValid && explanation) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <span className="text-foreground flex-1">{explanation}</span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          title="Copy explanation"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
        <span className="text-red-400">{errorMessage}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-secondary/50 border border-border rounded-lg">
      <span className="text-muted-foreground">Enter a cron expression above to see its explanation</span>
    </div>
  )
}
