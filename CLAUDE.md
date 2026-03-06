# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is CronSense?

A single-page cron expression explainer tool. Users paste a cron expression and get a plain-English explanation, field-by-field breakdown, and next run times. Built with Next.js 16, React 19, and deployed on Vercel.

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm lint` — run ESLint

## Architecture

This is a client-side-only app (no API routes, no server actions). The single page (`app/page.tsx`) is marked `'use client'` and composes these domain components:

- `components/cron-input.tsx` — the expression input field
- `components/explanation-badge.tsx` — plain-English explanation display
- `components/field-breakdown.tsx` — per-field (min/hr/day/month/weekday) breakdown
- `components/next-run-list.tsx` — upcoming scheduled run times
- `components/cheatsheet-panel.tsx` — common cron patterns quick-select

All cron parsing logic lives in `lib/cron.ts`, which wraps two libraries:
- `cronstrue` — converts cron to human-readable text
- `cron-parser` — computes next run dates

Supports both 5-field (standard) and 6-field (with seconds) cron expressions.

## UI Framework

- shadcn/ui (new-york style) with components in `components/ui/`
- Tailwind CSS v4 with CSS variables for theming
- Dark mode only (hardcoded `className="dark"` on `<html>`)
- Icons: lucide-react
- Path alias: `@/*` maps to project root
