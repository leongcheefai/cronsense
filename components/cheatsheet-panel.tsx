import { CHEATSHEET_PATTERNS } from '@/lib/cron'
import { BookOpen } from 'lucide-react'

interface CheatsheetPanelProps {
  onSelect: (cron: string) => void
}

export function CheatsheetPanel({ onSelect }: CheatsheetPanelProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-secondary/30">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          Quick Reference
        </span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border">
        {CHEATSHEET_PATTERNS.map((pattern) => (
          <button
            key={pattern.cron}
            onClick={() => onSelect(pattern.cron)}
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
    </div>
  )
}
