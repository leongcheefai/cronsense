'use client'

import { CHEATSHEET_PATTERNS } from '@/lib/cron'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { useState } from 'react'

interface CheatsheetPanelProps {
  onSelect: (cron: string) => void
}

export function CheatsheetPanel({ onSelect }: CheatsheetPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (cron: string) => {
    onSelect(cron)
    setIsOpen(false)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          Quick Reference - Common Patterns
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {CHEATSHEET_PATTERNS.map((pattern) => (
            <button
              key={pattern.cron}
              onClick={() => handleSelect(pattern.cron)}
              className="flex flex-col gap-1 p-3 bg-background hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{pattern.label}</span>
                <code className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                  {pattern.cron}
                </code>
              </div>
              <span className="text-xs text-muted-foreground">{pattern.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
