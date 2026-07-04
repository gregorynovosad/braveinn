# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BraveInn** is a Brave/Chromium browser extension that acts as a personal plugin host. Rather than publishing many separate extensions, this single extension loads and manages personal sub-plugins developed with AI. Think of it as a meta-extension: one installed extension that can run many personal tools.

Brave is Chromium-based, so this is a standard Chrome Extension using **Manifest V3**.

## Commands

```bash
npm install          # install dependencies
npm run dev          # watch mode — rebuilds on change (load unpacked from dist/)
npm run build        # production build → dist/
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest
npm test -- --run src/plugins/my-plugin   # run tests for a single plugin
```

To develop: run `npm run dev`, then in Brave go to `brave://extensions` → enable Developer Mode → Load unpacked → select the `dist/` folder.

## Architecture

### Core vs. Plugins

```
src/
  core/            # Extension shell — loaded once, never modified per-plugin
    background.ts  # Service worker: plugin registry, message routing, lifecycle
    popup/         # Main popup: plugin list, enable/disable toggles
    options/       # Options page: per-plugin settings
    api/           # PluginAPI interface exposed to plugins
  plugins/         # Each sub-plugin is a self-contained directory
    <plugin-name>/
      index.ts     # Plugin entry point — exports a Plugin object
      manifest.ts  # Plugin metadata (id, name, version, permissions needed)
      panel.tsx    # Optional: UI panel rendered in the main popup
      content.ts   # Optional: injected into web pages
      __tests__/
  shared/          # Types and utilities shared by core and plugins
    types.ts       # Plugin, PluginManifest, PluginAPI interfaces
    utils.ts
```

### Plugin Contract

Every plugin exports a `Plugin` object conforming to the interface in `shared/types.ts`. The core registers plugins at startup via a static import map in `src/plugins/index.ts` — no dynamic `eval` or remote code (CSP compliance).

```ts
// shared/types.ts — the central contract
interface Plugin {
  manifest: PluginManifest;
  onInstall?: (api: PluginAPI) => void;
  onEnable?: (api: PluginAPI) => void;
  onDisable?: (api: PluginAPI) => void;
  panel?: React.ComponentType;         // UI shown in popup
  contentScript?: ContentScriptConfig; // if the plugin needs page access
}
```

### Message Routing

The background service worker is the single message bus. Plugins communicate with their content scripts and with each other through namespaced messages: `{ pluginId: string, type: string, payload: unknown }`. The core routes messages to the correct plugin handler and enforces that plugins cannot read each other's namespaces.

### Permissions

Plugins declare their required permissions in `manifest.ts`. The core's `manifest.json` requests the union of all plugin permissions at build time (a build script reads all `plugins/*/manifest.ts` and merges them). This means adding a new plugin that needs a new permission requires rebuilding and re-accepting the updated permissions.

## Tech Stack

- **TypeScript** — strict mode
- **Vite** with `@crxjs/vite-plugin` — handles MV3 service worker bundling and hot reload
- **React** — popup and options UI
- **Vitest** — unit tests; content script integration tests run in a real browser via Playwright
- **ESLint** + **Prettier**

## Key Conventions

- Plugin IDs must be unique, kebab-case strings (e.g. `"tab-cleaner"`).
- Plugins are statically imported; never use `eval`, `new Function`, or remote script loading — MV3 CSP prohibits it.
- Plugin state is stored via `chrome.storage.local` keyed by plugin ID. Access it only through the `PluginAPI.storage` wrapper, not directly from plugin code.
- Content scripts from different plugins run in separate isolated worlds to avoid conflicts.
- The `dist/` folder is git-ignored; commit only source.
