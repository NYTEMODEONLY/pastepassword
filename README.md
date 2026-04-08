# PastePassword

A lightweight, local-only credential manager for developers who need a better place than Notes.app to temporarily store passwords, API keys, tokens, and secrets.

## Features

- **Quick Paste** — Paste a credential, auto-detect its type, tag it, done in 3 clicks
- **Instant Search** — Cmd+K to find any credential in milliseconds
- **Encrypted Vault** — AES-256 encryption at rest via SQLCipher
- **Zero Network** — Completely offline. No cloud sync, no telemetry, no analytics
- **Lightweight** — ~8MB app size, sub-second startup
- **Cross-Platform** — macOS, Windows, Linux

## Tech Stack

- [Tauri 2.0](https://tauri.app/) — Rust backend, tiny footprint
- React + TypeScript + Vite — Fast, typed frontend
- SQLCipher — Encrypted SQLite database
- Argon2id — OWASP-recommended password hashing

## Security

- Master password unlocks an AES-256 encrypted database
- Secrets are never sent over the network
- Clipboard auto-clears after 30 seconds
- Auto-lock after idle timeout
- Memory is zeroized when secrets go out of scope

## Development

```bash
# Install dependencies
pnpm install

# Run in development
pnpm tauri dev

# Build for production
pnpm tauri build
```

## License

MIT
