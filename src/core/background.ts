import { pluginManifests } from '../plugins';
import { STORAGE_PREFIX } from '../shared/constants';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    const defaults: Record<string, boolean> = {};
    for (const m of pluginManifests) {
      defaults[`${STORAGE_PREFIX}:${m.id}:enabled`] = true;
    }
    await chrome.storage.local.set(defaults);
  }
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (
    message === null ||
    typeof message !== 'object' ||
    !('type' in message) ||
    message.type !== 'BRAVEINN_SET_ENABLED'
  ) {
    return;
  }

  const msg = message as Record<string, unknown>;

  // Validate field types and that the plugin actually exists
  if (
    typeof msg.pluginId !== 'string' ||
    typeof msg.enabled !== 'boolean' ||
    !pluginManifests.some((m) => m.id === msg.pluginId)
  ) {
    sendResponse({ success: false, error: 'invalid payload' });
    return;
  }

  const pluginId = msg.pluginId as string;
  const enabled = msg.enabled as boolean;
  const key = `${STORAGE_PREFIX}:${pluginId}:enabled`;

  chrome.storage.local
    .set({ [key]: enabled })
    .then(async () => {
      // Filter at query level — no JS-side URL filtering needed
      const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' });
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, { type: 'BRAVEINN_TOGGLE', pluginId, enabled })
            .catch(() => {
              // Tab may not have a content script (e.g. youtube.com/tv)
            });
        }
      }
      sendResponse({ success: true });
    })
    .catch((err: Error) => {
      sendResponse({ success: false, error: err.message });
    });

  return true; // keep channel open for async response
});
