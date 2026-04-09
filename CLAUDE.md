# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PastePassword is a local-only credential manager for developers, built with **Tauri 2.0** (Rust backend + React 19 frontend). All data stays on-device in a SQLCipher-encrypted SQLite database. No network access — CSP blocks all external requests.

## Commands

```bash
# Development (starts Vite on :1420 + Rust backend with hot reload)
pnpm tauri dev

# Production build (output: src-tauri/target/release/bundle/)
pnpm tauri build

# Frontend only
pnpm dev              # Vite dev server
pnpm build            # tsc + vite build

# Backend only
cd src-tauri
cargo check           # Type check
cargo test            # Run tests
cargo fmt             # Format

# CI checks (what GitHub Actions runs)
npx tsc --noEmit      # Frontend type check
cd src-tauri && cargo check && cargo test  # Backend checks
```

Releases are triggered by pushing a git tag (`v*`), which builds for macOS arm64/x64, Linux x64, and Windows x64 via GitHub Actions.

## Architecture

**IPC boundary**: Frontend communicates with Rust backend exclusively through Tauri's `invoke()` IPC. All invoke wrappers are centralized in `src/lib/tauri.ts` with TypeScript types. Backend commands live in `src-tauri/src/commands/` and are registered in `src-tauri/src/lib.rs` via `tauri::generate_handler![]`.

**Auth flow**: `App.tsx` renders one of three views based on `authStore.view`: `"setup"` (first run) → `"unlock"` (returning user) → `"main"` (authenticated). The vault is locked by dropping the DB connection and zeroizing the derived key.

**Security boundary**: List queries return `CredentialSummary` (no secret value). The secret is only fetched via `get_credential(id)` on explicit view/copy. Clipboard auto-clears after 30 seconds.

**State management**: Two Zustand stores — `authStore` (auth flow, vault lifecycle) and `credentialStore` (CRUD, filters, search, tags). Stores call invoke wrappers from `src/lib/tauri.ts`.

**Backend state**: `AppState` (Mutex-wrapped) holds the optional SQLCipher `Connection` (None = locked), vault path, auto-lock timer, and derived key. All commands check `is_unlocked()` before accessing DB.

**Encryption**: Master password → Argon2id KDF (64MB, 3 iterations, 4 parallel) → 32-byte key → SQLCipher AES-256-CBC. Salt stored in `vault.salt` alongside the DB. Vault location is platform-specific via the `dirs` crate (`~/Library/Application Support/PastePassword/` on macOS).

**Search**: FTS5 virtual table on `title`, `notes`, `cred_type` columns with auto-sync triggers.

**Credential type detection**: `src-tauri/src/detection/credential_type.rs` uses regex to auto-detect types (SSH key, AWS key, JWT, GitHub token, Stripe key, etc.) when adding credentials.

## Styling

The app uses a dark-only design system (Linear/Raycast-inspired). Theme tokens are defined as CSS custom properties in `src/styles/globals.css` via Tailwind v4 `@theme`.

**Important**: Tailwind v4 `@theme` tokens don't render reliably in Tauri's webview for some properties. Critical UI uses **inline styles** from `src/lib/styles.ts` as the reliable path. When adding new UI, prefer importing style objects from `styles.ts` for interactive elements.

## Adding a New Tauri Command

1. Write the handler in `src-tauri/src/commands/` (takes `State<'_, Mutex<AppState>>`)
2. Register it in the `generate_handler![]` macro in `src-tauri/src/lib.rs`
3. Add a typed invoke wrapper in `src/lib/tauri.ts`
4. Add TypeScript types to `src/types/index.ts` if needed
