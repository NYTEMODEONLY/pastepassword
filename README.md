# PastePassword

A lightweight, local-only credential manager for developers who need a better place than Notes.app to temporarily store passwords, API keys, tokens, and secrets.

Built by [nytemode](https://nytemode.com)

## Why PastePassword?

If you're a developer, you've probably pasted credentials into Notes, a text file, or a sticky note "just temporarily." Over time, those notes pile up — you lose track of what belongs to which project, when you added it, or what it even is.

PastePassword fixes this. Paste a credential, it auto-detects the type, you tag it, and it's organized and encrypted in seconds.

## Features

- **Quick Add** — Paste a credential with `⌘N` from anywhere. Auto-detects type (API key, token, password, SSH key, env var)
- **Instant Search** — `⌘K` to find any credential in milliseconds via full-text search
- **Encrypted Vault** — AES-256 encryption at rest via SQLCipher, Argon2id key derivation
- **Zero Network** — Completely offline. No cloud sync, no telemetry, no analytics. Your secrets stay on your machine
- **System Tray** — Quick access from the menubar. Global shortcuts work from any app
- **Auto-lock** — Vault locks after idle timeout. Clipboard auto-clears after 30 seconds
- **Tags** — Organize by project, environment, or any custom tag
- **Import/Export** — Backup and restore your vault as JSON
- **Cross-Platform** — macOS, Windows, Linux

## Install

### Download

Grab the latest release from [GitHub Releases](https://github.com/NYTEMODEONLY/pastepassword/releases).

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `.dmg` |
| macOS (Intel) | `.dmg` |
| Windows | `.msi` |
| Linux | `.AppImage` / `.deb` |

### Build from source

```bash
# Prerequisites: Rust, Node.js 22+, pnpm
git clone https://github.com/NYTEMODEONLY/pastepassword.git
cd pastepassword
pnpm install
pnpm tauri dev      # development
pnpm tauri build    # production build
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘N` | Quick Add credential |
| `⌘K` | Search credentials |
| `⌘⇧V` | Quick Add (global, from any app) |
| `⌘⇧F` | Search (global, from any app) |
| `j` / `k` | Navigate credential list |
| `Esc` | Close modal / deselect |

## Security

| Layer | Technology |
|---|---|
| Encryption | AES-256-CBC (SQLCipher) |
| Key Derivation | Argon2id (64MB memory, 3 iterations, 4 parallelism) |
| Memory | Secrets zeroized on drop via `zeroize` crate |
| Network | Zero — CSP blocks all requests, no fetch/XHR |
| Clipboard | Auto-clears after 30 seconds |
| Storage | Single encrypted file in app data directory |

## Tech Stack

- [Tauri 2.0](https://tauri.app/) — Rust backend, ~8MB app size
- React 19 + TypeScript — Frontend
- SQLCipher — Encrypted SQLite
- Tailwind CSS 4 — Styling

## Auto-detected Credential Types

PastePassword automatically classifies what you paste:

- **Password** — strings with special characters
- **API Key** — Stripe keys, AWS access keys, hex strings, base64 keys
- **Token** — JWTs, GitHub PATs, Bearer tokens
- **SSH Key** — PEM-formatted private keys
- **Env Var** — `KEY=value` format

## License

MIT - see [LICENSE](LICENSE)

---

A [nytemode](https://nytemode.com) project
