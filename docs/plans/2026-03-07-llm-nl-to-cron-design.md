# LLM-powered Natural Language to Cron

## Context
Replace the rule-based regex parser with an LLM (OpenAI gpt-4o-mini) via a Cloudflare Worker proxy. This handles arbitrary natural language inputs without maintaining pattern-matching code.

## Architecture

```
Browser (NlInput) → POST → Cloudflare Worker → OpenAI gpt-4o-mini → cron string
```

## Cloudflare Worker (`/workers/nl-to-cron/`)

- Single `src/index.ts` using Hono (lightweight, Cloudflare-native)
- One endpoint: `POST /` with `{ "input": "every weekday at 9am" }` body
- System prompt instructs the model to return only a valid 5-field cron expression or `"null"` if unparseable
- OpenAI API key stored as a Cloudflare Worker secret (via `wrangler secret put`)
- CORS configured to allow CronSense domain
- Returns `{ "cron": "0 9 * * 1-5" }` or `{ "cron": null }`

## Component Changes (`components/nl-input.tsx`)

- Remove regex parser import, remove debounce
- Add submit button (Enter key also triggers)
- Show loading spinner while waiting
- On success: green badge with result, call `onCronGenerated`
- On failure/null: show hint message
- On network error: show error message

## Files to Remove

- `lib/nl-to-cron.ts` — regex parser replaced by LLM

## What Stays the Same

Everything else: cron input, explanation, breakdown, next runs, cheatsheet, page layout with divider.
