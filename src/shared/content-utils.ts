import { STORAGE_PREFIX } from './constants';

export async function getPluginEnabled(pluginId: string): Promise<boolean> {
  const key = `${STORAGE_PREFIX}:${pluginId}:enabled`;
  const result = await chrome.storage.local.get(key);
  return result[key] !== false; // default true when not yet set
}

// Returns a cleanup function that removes the listener — call it to prevent accumulation
// on hot-reload or dynamic content-script re-injection.
export function onPluginToggle(
  pluginId: string,
  callback: (enabled: boolean) => void,
): () => void {
  const listener = (message: unknown): void => {
    if (
      message !== null &&
      typeof message === 'object' &&
      'type' in message &&
      message.type === 'BRAVEINN_TOGGLE' &&
      'pluginId' in message &&
      message.pluginId === pluginId &&
      'enabled' in message &&
      typeof (message as Record<string, unknown>).enabled === 'boolean'
    ) {
      callback((message as Record<string, unknown>).enabled as boolean);
    }
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
