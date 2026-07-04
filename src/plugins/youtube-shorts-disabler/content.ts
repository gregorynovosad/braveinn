import { injectShortsBlocker, removeShortsBlocker, shouldRedirect, extractVideoId } from './logic';
import { getPluginEnabled, onPluginToggle } from '../../shared/content-utils';

const PLUGIN_ID = 'youtube-shorts-disabler';

function redirect(): void {
  if (shouldRedirect(location.pathname)) {
    const id = extractVideoId(location.pathname);
    if (id) location.replace(`/watch?v=${id}`);
  }
}

function enable(): void {
  injectShortsBlocker();
  redirect();
  document.addEventListener('yt-navigate-finish', redirect);
}

function disable(): void {
  removeShortsBlocker();
  document.removeEventListener('yt-navigate-finish', redirect);
}

async function init(): Promise<void> {
  const enabled = await getPluginEnabled(PLUGIN_ID);
  if (enabled) enable();
  onPluginToggle(PLUGIN_ID, (newEnabled) => {
    newEnabled ? enable() : disable();
  });
}

// Guard prevents auto-init in the Vitest environment
if (import.meta.env.MODE !== 'test') {
  init();
}
