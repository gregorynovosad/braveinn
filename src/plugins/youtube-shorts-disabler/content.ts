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
  // Register the toggle listener BEFORE the storage await so that any toggle
  // message arriving during the async gap is not silently dropped.
  onPluginToggle(PLUGIN_ID, (newEnabled) => {
    newEnabled ? enable() : disable();
  });

  const enabled = await getPluginEnabled(PLUGIN_ID);
  if (enabled) enable();
}

if (import.meta.env.MODE !== 'test') {
  init().catch(console.error);
}
