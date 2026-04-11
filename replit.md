# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Tilawet Analizör (`artifacts/tilawet-analyzer`)
- **Path**: `/` (root)
- **Kind**: react-vite web app
- **Purpose**: Real-time AI-powered Quran recitation analysis tool for ilimsaray.com
- **Features**:
  - OpenAI API key provided by user (stored in sessionStorage only)
  - Whisper-1 for Arabic audio transcription
  - GPT-4o for 5-criteria recitation scoring (100 points total)
  - MediaRecorder API for in-browser audio recording (max 3 min)
  - Canvas waveform visualizer
  - Animated score reveal with circular progress
  - Typewriter effect for general commentary
  - Dark theme with neon lime-green (#CCFF00) brand accent
  - All UI text in Turkish
- **Key Files**:
  - `src/pages/TilawetApp.tsx` — main app component with all states
  - `src/components/ApiKeyModal.tsx` — API key entry modal
  - `src/components/WaveformVisualizer.tsx` — Canvas waveform
  - `src/components/ScoreCircle.tsx` — animated total score circle
  - `src/components/ScoreCard.tsx` — individual criterion card with expand
  - `src/hooks/useRecorder.ts` — MediaRecorder hook with AudioContext analyser
  - `src/lib/openai.ts` — Whisper transcription + GPT-4o analysis

### API Server (`artifacts/api-server`)
- Standard Express API server at `/api`
- Currently only has health check endpoint

### Canvas/Mockup Sandbox (`artifacts/mockup-sandbox`)
- Design mockup sandbox at `/__mockup`
