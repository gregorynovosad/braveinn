const STORAGE_PREFIX = 'braveinn:plugin';

export async function getPluginEnabled(pluginId: string): Promise<boolean> {
  const key = `${STORAGE_PREFIX}:${pluginId}:enabled`;
  const result = await chrome.storage.local.get(key);
  return result[key] !== false; // default true when not yet set
}

export function onPluginToggle(pluginId: string, callback: (enabled: boolean) => void): void {
  chrome.runtime.onMessage.addListener((message: unknown) => {
    if (
      message !== null &&
      typeof message === 'object' &&
      'type' in message &&
      message.type === 'BRAVEINN_TOGGLE' &&
      'pluginId' in message &&
      message.pluginId === pluginId &&
      'enabled' in message
    ) {
      callback(message.enabled as boolean);
    }
  });
}
