# BraveInn

A personal Brave/Chromium extension that acts as a plugin host. One installed extension runs all your personal tools — no need to publish or manage separate extensions for each one.

## Plugins

| Plugin | What it does |
|--------|-------------|
| YouTube Shorts Disabler | Hides Shorts from the feed, sidebar, and search results. Redirects `/shorts/` URLs to the regular video player. |

## Load in Brave

1. `npm install`
2. `npm run dev` — starts watch mode, rebuilds on every save
3. Open `brave://extensions` → enable **Developer mode** → **Load unpacked** → select the `dist/` folder
4. Click the puzzle-piece icon in the toolbar to pin BraveInn

After any code change the extension reloads automatically. For content script changes you still need to refresh the target page.

## Commands

```bash
npm run dev        # watch mode (use this while developing)
npm run build      # one-off production build
npm run typecheck  # tsc type check
npm run lint       # eslint
npm test           # run all tests once
npm run test:watch # run tests in watch mode
```

## Adding a plugin

1. Create `src/plugins/<your-plugin>/`
   - `manifest.ts` — id, name, description, version
   - `content.ts` — content script (runs in the page); import helpers from `../../shared/content-utils`
   - `logic.ts` — pure DOM/logic functions, imported by `content.ts` and tests
   - `__tests__/` — Vitest unit tests

2. Register it in `src/plugins/index.ts`:
   ```ts
   import { yourPluginMeta } from './your-plugin/manifest';
   export const pluginManifests: PluginManifest[] = [
     youtubeShortsMeta,
     yourPluginMeta, // ← add here
   ];
   ```

3. Add the content script to `manifest.json`:
   ```json
   {
     "matches": ["*://*.example.com/*"],
     "js": ["src/plugins/your-plugin/content.ts"],
     "run_at": "document_idle"
   }
   ```
   Add any new `host_permissions` to `manifest.json` as well.

No other files need to change. The popup picks up the new plugin automatically.

## Tech stack

- **Vite** + **@crxjs/vite-plugin** — MV3-aware bundler with hot reload
- **TypeScript** strict mode
- **React** — popup UI
- **Vitest** + **happy-dom** — unit tests
