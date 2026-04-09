# Contributing to PastePassword

Thanks for your interest in contributing! PastePassword is a community-driven project and we welcome contributions of all kinds.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/pastepassword.git`
3. Install dependencies: `pnpm install`
4. Start the dev server: `pnpm tauri dev`

## Prerequisites

- [Rust](https://rustup.rs/) (stable toolchain)
- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/)
- macOS: Xcode Command Line Tools
- Linux: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

## Development Workflow

1. Create a branch for your feature or fix: `git checkout -b feat/my-feature`
2. Make your changes
3. Verify TypeScript: `npx tsc --noEmit`
4. Verify Rust: `cd src-tauri && cargo check`
5. Run Rust tests: `cd src-tauri && cargo test`
6. Test the app: `pnpm tauri dev`
7. Commit with a clear message
8. Push and open a PR

## Code Style

- **Frontend**: TypeScript with strict mode. Use inline styles (via `lib/styles.ts`) for UI components — Tailwind CSS v4 theme tokens don't render reliably in Tauri's webview.
- **Backend**: Standard Rust formatting (`cargo fmt`). Use `thiserror` for error types. Secrets must implement `Zeroize`.
- **Commits**: Imperative mood, explain why not what. Example: "Add clipboard auto-clear to prevent secret leakage"

## Architecture

- **Frontend → Backend**: Tauri IPC via `invoke()`. Type-safe wrappers in `src/lib/tauri.ts`.
- **State**: Zustand stores in `src/stores/`. The backend holds the SQLCipher connection in `Mutex<AppState>`.
- **Security boundary**: Secrets are only returned by `get_credential` (explicit view/copy), never in list queries.

## What We're Looking For

- Bug fixes
- New credential type detectors (add regex patterns in `src-tauri/src/detection/credential_type.rs`)
- UI/UX improvements
- Accessibility improvements
- Documentation
- Platform-specific fixes (Windows, Linux)

## Security

If you find a security vulnerability, please **do not** open a public issue. Email the maintainer directly via the contact on [nytemode.com](https://nytemode.com).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
