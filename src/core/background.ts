import { pluginManifests } from '../plugins';

const STORAGE_PREFIX = 'braveinn:plugin';

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

  const { pluginId, enabled } = message as unknown as { pluginId: string; enabled: boolean };
  const key = `${STORAGE_PREFIX}:${pluginId}:enabled`;

  chrome.storage.local.set({ [key]: enabled }).then(async () => {
    // Find all tabs matching any plugin's host and forward the toggle
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url?.includes('youtube.com')) {
        chrome.tabs
          .sendMessage(tab.id, { type: 'BRAVEINN_TOGGLE', pluginId, enabled })
          .catch(() => {
            // Tab may not have a content script (e.g. youtube.com/tv)
          });
      }
    }
    sendResponse({ success: true });
  });

  return true; // keep channel open for async response
});
