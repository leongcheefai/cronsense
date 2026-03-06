# CronSense

Paste a cron expression, understand it instantly. Get plain-English explanations, field-by-field breakdowns, and next run times.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Plain-English explanation of any cron expression
- Field-by-field breakdown (minute, hour, day, month, weekday)
- Next 10 scheduled run times in your local timezone
- Supports both 5-field (standard) and 6-field (with seconds) expressions
- Quick-select cheatsheet of common cron patterns

## Tech Stack

- [Next.js](https://nextjs.org) 16 / React 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (new-york style)
- [cronstrue](https://github.com/bradymholt/cRonstrue) — human-readable cron descriptions
- [cron-parser](https://github.com/harrisiirak/cron-parser) — next run date computation

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
