# AGENTS.md

Guidance for AI agents working on the prome codebase.

## Project Overview

Prome is a Tauri v2 desktop app for managing personal AI prompts. Frontend is React 19 + TypeScript + Vite; backend is Rust with sqlx/SQLite. Each "vault" is a folder containing a `prome.db` database file.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Zustand, React Router v7
- **Backend**: Rust, Tauri v2, sqlx (SQLite), tokio
- **Tooling**: pnpm, Biome (lint/format), Vitest (tests), Cargo

## Key Conventions

- **No comments** in source code unless explicitly requested.
- **Biome** enforces formatting and import ordering. Run `pnpm lint:fix` before committing.
- **TypeScript** strict mode. Always run `pnpm typecheck` after changes.
- **Rust** code follows `rustfmt.toml`. Run `cargo fmt` and `cargo build` to verify.
- **Commits** follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
- **No secrets** in code. Never log or commit credentials.

## Architecture

### Frontend (`src/`)

- `components/` - UI components grouped by domain (category, layout, prompt, tag, ui, vault).
- `pages/` - Route-level page components rendered by React Router.
- `stores/app.ts` - Single Zustand store holding vault state, filters, and cached categories/tags.
- `lib/invoke.ts` - Typed wrappers around `@tauri-apps/api/core` `invoke()`. Always use these instead of calling `invoke` directly.
- `router/index.tsx` - Uses `createMemoryRouter`. Initial path is set after vault initialization to avoid UI flash.
- `types/index.ts` - TypeScript interfaces mirroring Rust models in `src-tauri/src/db/models.rs`.

### Backend (`src-tauri/src/`)

- `main.rs` - App entry and window setup.
- `commands/` - Tauri command handlers grouped by entity: `vault`, `category`, `tag`, `prompt`.
- `db/` - `connection.rs` (DbState, pool management), `models.rs` (structs), `migrations.rs` (schema + seed).
- `config.rs` - App config persisted to JSON; tracks recent vaults.
- `error.rs` - `AppError` enum with serde support for IPC error passing.

### Data Flow

1. Frontend calls a function in `lib/invoke.ts`.
2. That calls Tauri's `invoke("command_name", args)`.
3. Rust command in `commands/` executes against the SQLite pool from `DbState`.
4. Result or error is serialized back to the frontend.

### Vault Model

- A vault is a **folder**, not a file. The database lives at `<vault_folder>/prome.db`.
- `vault_create(dir_path)` and `vault_open(dir_path)` both take a folder path.
- Vault name is derived from the folder name.

## Commands Reference

| Task | Command |
|------|---------|
| Dev server (frontend only) | `pnpm dev` |
| Full app dev | `pnpm tauri dev` |
| Type check | `pnpm typecheck` |
| Lint + format | `pnpm lint:fix` |
| Run tests | `pnpm test` |
| Test coverage | `pnpm test:coverage` |
| Build production bundle | `pnpm tauri build` |
| Rust check | `cd src-tauri && cargo build` |
| Rust format | `cd src-tauri && cargo fmt` |

## Testing

- Tests live in `tests/` using Vitest + React Testing Library.
- Tauri APIs are mocked in tests (see `tests/App.test.tsx`).
- Run `pnpm test` before submitting changes.

## Pre-commit Hooks

- `simple-git-hooks` runs `lint-staged` on pre-commit.
- `lint-staged` runs `biome check --write` on staged files.
- Ensure typecheck and tests pass before committing.
