# AGENTS.md

Vue 3 + Vite + Pinia expense-splitting app ("juntadas"). No backend, no router.

## Commands (pnpm)

- `pnpm dev` — Vite dev server
- `pnpm test` — vitest run (unit tests only; node env, no component tests)
- `pnpm lint` — runs BOTH oxlint and eslint, each with `--fix` (mutates files)
- `pnpm type-check` — `vue-tsc --build`
- `pnpm build` — type-check + build (`run-p`); run this before finishing, not just `build-only`
- `pnpm format` — oxfmt on `src/`

## Repo rules (from PLAN.md, enforced in code)

- Code, identifiers, types in **English**; **UI strings in Spanish**
- Amounts are **integer cents** everywhere; ARS formatting is presentation-only (`src/utils/currency.ts`)
- **No vue-router**: navigation is state in the Pinia store (`view`: `list` | `detail` | `results` in `src/stores/gatherings.ts`)
- All state is in-memory (Pinia refs); reloading loses data. Never add persistence or a backend without asking
- IDs via `crypto.randomUUID()` (`src/utils/uuid.ts`)
- Settlement engine is pure functions in `src/utils/settlements.ts` (balance = paid − shares, greedy payer↔creditor matching). Keep it pure and unit-tested

## Testing quirks

- Tests live in `src/**/__tests__/*.spec.ts`
- `tsconfig.app.json` **excludes** `src/**/__tests__/*`, so `pnpm type-check` does NOT type-check test files

## Style

- No semicolons, single quotes (`.oxfmtrc.json`); 2-space indent, 100-col limit (`.editorconfig`)
- Import alias `@/` → `src/` (configured in `vite.config.ts` + `tsconfig.app.json`)
