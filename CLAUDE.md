# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Asset Locator 5000 — a Vue 3 single-page app for allocating registered investment account balances (TFSA, RRSP, Registered) across asset classes (Canadian Stocks, US Stocks, International Stocks, Bonds) to optimize for tax efficiency. Canadian financial context.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — type-check with vue-tsc then build with Vite
- `npm test` — run all tests (Vitest)
- `npm run test:watch` — run tests in watch mode
- `npx vitest run src/utils/compute.test.ts` — run a single test file
- `npm run lint` — lint with ESLint
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — format with Prettier
- `npm run format:check` — check formatting

## Architecture

- **Vue 3 + TypeScript + Vite 7** with `<script setup>` single-file components
- **No router or state management library** — single-page app with props/emits data flow
- `src/App.vue` — root component, holds output state, passes inputs down via `compute()`
- `src/components/InputPanel.vue` — form with dollar fields (TFSA/RRSP/Registered) and percent allocation fields; emits `change` with `InputValues`
- `src/components/OutputPanel.vue` — displays computed output values, receives `OutputValues` as props
- `src/utils/compute.ts` — pure computation logic (`compute()` and `toNum()` helper); the `compute` algorithm is a placeholder (TODO: replace with real algorithm)
- Tests are co-located with source files (`*.test.ts` next to the module they test)

## Key Conventions

- Test environment: jsdom with Vitest globals enabled (no need to import `describe`/`it`/`expect`)
- Use `type` imports enforced by `@typescript-eslint/consistent-type-imports`
- `no-explicit-any` is enforced in source but relaxed in test files
- Deployed to `/asset-locator/` base path (note: repo name has typo "locator", deploy path is "locator")
