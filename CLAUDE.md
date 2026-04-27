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

**Auto-lock**: A background thread in `src-tauri/src/lib.rs::setup_auto_lock` polls every 10s and locks the vault if `AppState.should_auto_lock()` returns true. The frontend keeps the timer fresh by invoking `touch_activity` on user interaction and listens for the emitted `vault-locked` event to flip back to the unlock screen. Settings change the timeout via `set_auto_lock_seconds`.

**Tray + window**: The main window hides (not quits) on close — `on_window_event` intercepts `CloseRequested` with `api.prevent_close()`. The tray menu emits `tray-quick-add`, `tray-search`, and `tray-lock` events that the frontend listens for; global shortcuts (registered via the global-shortcut plugin) target the same commands (`CmdOrCtrl+Shift+V` quick-add, `CmdOrCtrl+Shift+F` search).

**Sidebar counts**: `credentialStore` holds two lists — `credentials` (filtered/searched view, drives the main list) and `allCredentials` (unfiltered, drives sidebar totals and per-type counts). Sidebar reads from `allCredentials`; the main list reads from `credentials`. Mixing them produces "All shows 1 when Favorites is selected"–style bugs.

**External links**: Tauri's CSP (`default-src 'self'`) blocks `<a target="_blank">` and `window.open`. Use the existing `open_url` Tauri command (defined in `src-tauri/src/lib.rs`) via `invoke("open_url", { url })` — it shells out to `open`/`cmd start`/`xdg-open` per platform. There's no TS wrapper; call `invoke` directly.

## Styling

The app uses a dark-only design system (Linear/Raycast-inspired) with purple accent `#7B45C1`. Theme tokens are defined in two places:

- **CSS custom properties** in `src/styles/globals.css` via Tailwind v4 `@theme`
- **Inline style primitives** in `src/lib/styles.ts` (colors, inputStyle, btnPrimary, etc.)

**Important**: Tailwind v4 `@theme` tokens don't render reliably in Tauri's webview for some properties. Critical UI uses **inline styles** from `src/lib/styles.ts` as the reliable path. When adding new UI, prefer importing style objects from `styles.ts` for interactive elements.

**Color changes must be applied in both places** — `styles.ts` for inline styles AND `globals.css` for CSS classes. Several components also have hardcoded color values (auth screens, sidebar) that must be updated manually. Always grep for the old hex value across `*.tsx` files.

**Native `<select>` elements don't work** in Tauri's macOS webview — the OS renders the dropdown popup with its own font, ignoring CSS. Use `CustomSelect` from `src/components/ui/CustomSelect.tsx` instead. It renders the dropdown in the webview with full styling control.

## Adding a New Tauri Command

1. Write the handler in `src-tauri/src/commands/` (takes `State<'_, Mutex<AppState>>`)
2. Register it in the `generate_handler![]` macro in `src-tauri/src/lib.rs`
3. Add a typed invoke wrapper in `src/lib/tauri.ts`
4. Add TypeScript types to `src/types/index.ts` if needed

## Local Install

```bash
pnpm tauri build --bundles app  # skip the slow DMG step (~30s vs several minutes)
rm -rf /Applications/PastePassword.app
cp -R src-tauri/target/release/bundle/macos/PastePassword.app /Applications/
```

Drop `--bundles app` only when producing a release DMG — the macOS DMG step uses `osascript` to mount and arrange icons and dominates the build time. Since the app isn't code-signed, first launch requires: right-click → Open → confirm in the Gatekeeper dialog.
