# prome

[![license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/garrett-he/prome/blob/main/LICENSE)

A personal AI prompts management tool. Store, organize, and quickly retrieve your LLM prompts with a clean, fast desktop experience.

## Features

- **Vault-based storage** - Each vault is a folder containing a `prome.db` SQLite database. Create, open, and switch between vaults freely.
- **Categories & tags** - Hierarchical categories plus flexible tag-based filtering for prompt organization.
- **Prompt editor** - Dedicated editor view with title, description, content, category, and tag support.
- **Quick copy** - One-click copy of prompt content to clipboard.
- **Favorites & usage tracking** - Mark prompts as favorites and track how often each is used.
- **Search & sort** - Full-text search with sort by updated, created, title, or usage.
- **Auto-resume** - Reopens the last-used vault on startup.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | Tauri v2 |
| Frontend | React 19, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| State management | Zustand |
| Routing | React Router v7 |
| Backend | Rust, sqlx (SQLite) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 11
- [Rust](https://www.rust-lang.org/) (stable)
- Tauri v2 system dependencies - see [the Tauri docs](https://v2.tauri.app/start/prerequisites/) for your platform.

### Install & Run

```bash
pnpm install
pnpm tauri dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server |
| `pnpm tauri dev` | Run the full app in development mode |
| `pnpm build` | Build the frontend for production |
| `pnpm tauri build` | Build a distributable desktop bundle |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run Biome lint checks |
| `pnpm lint:fix` | Auto-fix lint and format issues |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:coverage` | Run tests with coverage report |

## Project Structure

```
prome/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # UI components organized by domain
│   │   ├── category/         # Category list
│   │   ├── layout/           # Sidebar, search bar
│   │   ├── prompt/           # Card, grid, detail, editor
│   │   ├── tag/              # Tag list, tag input
│   │   ├── ui/               # shadcn/ui primitives
│   │   └── vault/            # Welcome page, vault switcher
│   ├── lib/                  # Tauri invoke wrappers
│   ├── router/               # React Router config
│   ├── stores/               # Zustand state
│   ├── types/                # Shared TypeScript types
│   └── pages/               # Route-level pages
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── commands/         # Tauri command handlers
│   │   ├── db/               # Database connection, models, migrations
│   │   ├── config.rs         # App config (recent vaults)
│   │   ├── error.rs          # Error types
│   │   └── main.rs           # App entry, window setup
│   ├── Cargo.toml
│   └── tauri.conf.json
├── tests/                    # Unit tests
└── docs/                     # Design docs and plans
```

## Architecture

Prome uses a clear frontend-backend split powered by Tauri's IPC layer.

- **Frontend** calls Rust commands via typed wrappers in `src/lib/invoke.ts`.
- **Backend** exposes commands for vault, category, tag, and prompt operations. Each vault maps to a SQLite database managed by `sqlx`.
- **State** is held in a single Zustand store (`src/stores/app.ts`) that tracks the current vault, filters, and cached categories/tags.

### Database Schema

Each vault's SQLite database contains four tables:

- `categories` - Hierarchical prompt categories (1:N with prompts).
- `tags` - Flat tag list (M:N with prompts via `prompt_tags`).
- `prompts` - Title, description, content, favorite flag, usage count, timestamps.
- `prompt_tags` - Join table for the prompt-tag M:N relationship.

## License

Copyright (C) 2026 Garrett HE <garrett.he@outlook.com>

MIT License, see [LICENSE](./LICENSE).
