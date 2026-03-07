# LLM Natural Language to Cron — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the regex-based NL parser with an LLM (OpenAI gpt-4o-mini) via a Cloudflare Worker proxy, triggered by a submit button.

**Architecture:** Browser sends POST to Cloudflare Worker, which calls OpenAI and returns a cron string. The worker uses Hono for routing and CORS. The NL input component switches from debounced regex to a submit-based async call.

**Tech Stack:** Cloudflare Workers, Hono, OpenAI API (gpt-4o-mini), React 19

---

### Task 1: Scaffold the Cloudflare Worker project

**Files:**
- Create: `workers/nl-to-cron/package.json`
- Create: `workers/nl-to-cron/tsconfig.json`
- Create: `workers/nl-to-cron/wrangler.jsonc`
- Create: `workers/nl-to-cron/src/index.ts` (placeholder)

**Step 1: Create the worker directory and package.json**

```bash
mkdir -p workers/nl-to-cron/src
```

Write `workers/nl-to-cron/package.json`:
```json
{
  "name": "nl-to-cron-worker",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "wrangler": "^4.0.0"
  }
}
```

**Step 2: Create wrangler.jsonc**

Write `workers/nl-to-cron/wrangler.jsonc`:
```jsonc
{
  "name": "nl-to-cron",
  "main": "src/index.ts",
  "compatibility_date": "2024-12-01"
}
```

**Step 3: Create tsconfig.json**

Write `workers/nl-to-cron/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "lib": ["ESNext"],
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src"]
}
```

**Step 4: Create placeholder index.ts**

Write `workers/nl-to-cron/src/index.ts`:
```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

app.post('/', async (c) => {
  return c.json({ cron: null })
})

export default app
```

**Step 5: Install dependencies**

```bash
cd workers/nl-to-cron && npm install
```

**Step 6: Verify worker runs**

```bash
cd workers/nl-to-cron && npx wrangler dev --port 8787
```

Hit `POST http://localhost:8787/` with `{"input":"test"}` — should return `{"cron":null}`.

**Step 7: Commit**

```bash
git add workers/nl-to-cron/
git commit -m "feat: scaffold cloudflare worker for NL-to-cron"
```

---

### Task 2: Implement the OpenAI proxy in the worker

**Files:**
- Modify: `workers/nl-to-cron/src/index.ts`

**Step 1: Implement the full worker**

Replace `workers/nl-to-cron/src/index.ts` with:

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  OPENAI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors())

app.post('/', async (c) => {
  const body = await c.req.json<{ input?: string }>()
  const input = body.input?.trim()

  if (!input) {
    return c.json({ cron: null })
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 30,
      messages: [
        {
          role: 'system',
          content:
            'Convert the user\'s natural language schedule description into a standard 5-field cron expression (minute hour day-of-month month day-of-week). Reply with ONLY the cron expression, nothing else. If the input cannot be converted to a valid cron expression, reply with exactly: null',
        },
        { role: 'user', content: input },
      ],
    }),
  })

  if (!response.ok) {
    return c.json({ cron: null, error: 'LLM request failed' }, 500)
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[]
  }

  const raw = data.choices?.[0]?.message?.content?.trim()

  if (!raw || raw === 'null') {
    return c.json({ cron: null })
  }

  // Validate it looks like a 5-field cron expression
  const fields = raw.split(/\s+/)
  if (fields.length !== 5) {
    return c.json({ cron: null })
  }

  return c.json({ cron: raw })
})

export default app
```

**Step 2: Test locally with a real API key**

```bash
cd workers/nl-to-cron
OPENAI_API_KEY=sk-... npx wrangler dev --port 8787
```

```bash
curl -X POST http://localhost:8787/ -H "Content-Type: application/json" -d '{"input":"every weekday at 9am"}'
```

Expected: `{"cron":"0 9 * * 1-5"}`

**Step 3: Commit**

```bash
git add workers/nl-to-cron/src/index.ts
git commit -m "feat: implement OpenAI proxy in cloudflare worker"
```

---

### Task 3: Update NL input component to use the API

**Files:**
- Modify: `components/nl-input.tsx`
- Delete: `lib/nl-to-cron.ts`

**Step 1: Rewrite `components/nl-input.tsx`**

Replace the entire file with:

```tsx
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
```

**Step 2: Delete `lib/nl-to-cron.ts`**

```bash
rm lib/nl-to-cron.ts
```

**Step 3: Verify the Next.js app builds**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

**Step 4: Commit**

```bash
git add components/nl-input.tsx
git rm lib/nl-to-cron.ts
git commit -m "feat: switch NL input from regex to LLM API"
```

---

### Task 4: Add environment variable and deployment docs

**Files:**
- Create: `workers/nl-to-cron/.dev.vars.example`
- Modify: `.env.example` or create `.env.local.example` (for `NEXT_PUBLIC_NL_CRON_WORKER_URL`)

**Step 1: Create `.dev.vars.example` for the worker**

Write `workers/nl-to-cron/.dev.vars.example`:
```
OPENAI_API_KEY=sk-your-key-here
```

**Step 2: Create `.env.local.example` for the Next.js app**

Write `.env.local.example`:
```
NEXT_PUBLIC_NL_CRON_WORKER_URL=http://localhost:8787
```

**Step 3: Add `.dev.vars` to `.gitignore`**

Append to the root `.gitignore`:
```
# Worker secrets
workers/nl-to-cron/.dev.vars
```

**Step 4: Commit**

```bash
git add workers/nl-to-cron/.dev.vars.example .env.local.example .gitignore
git commit -m "docs: add env var examples for worker and Next.js"
```

---

### Task 5: End-to-end verification

**Step 1: Start the worker locally**

```bash
cd workers/nl-to-cron
cp .dev.vars.example .dev.vars  # then fill in real key
npx wrangler dev --port 8787
```

**Step 2: Start the Next.js app**

```bash
NEXT_PUBLIC_NL_CRON_WORKER_URL=http://localhost:8787 pnpm dev
```

**Step 3: Manual test checklist**

- [ ] Type "every weekday at 9am", click Generate → cron input shows `0 9 * * 1-5`, explanation updates
- [ ] Type "every 15 minutes", press Enter → `*/15 * * * *`
- [ ] Type "every monday at 3pm", click Generate → `0 15 * * 1`
- [ ] Type gibberish, click Generate → shows error hint, cron input unchanged
- [ ] Clear NL input → no side effects
- [ ] Cheatsheet still works independently
- [ ] Dark mode looks correct
- [ ] Loading spinner appears during API call

**Step 4: Final build check**

```bash
pnpm build
```

Expected: Build succeeds.
