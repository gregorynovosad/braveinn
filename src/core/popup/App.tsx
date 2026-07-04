import { useState, useEffect } from 'react';
import { pluginManifests } from '../../plugins';
import { STORAGE_PREFIX } from '../../shared/constants';
import { PluginCard } from './PluginCard';
import './styles.css';

export function App() {
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Compute each key once and reuse in both the query and the result mapping
    const entries = pluginManifests.map((m) => ({
      id: m.id,
      key: `${STORAGE_PREFIX}:${m.id}:enabled`,
    }));
    chrome.storage.local
      .get(entries.map((e) => e.key))
      .then((result) => {
        const map: Record<string, boolean> = {};
        for (const { id, key } of entries) {
          map[id] = result[key] !== false;
        }
        setEnabledMap(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleToggle(pluginId: string, enabled: boolean) {
    // Optimistic update
    setEnabledMap((prev) => ({ ...prev, [pluginId]: enabled }));
    try {
      await chrome.runtime.sendMessage({ type: 'BRAVEINN_SET_ENABLED', pluginId, enabled });
    } catch {
      // Roll back if the background is unreachable (e.g. extension reloading)
      setEnabledMap((prev) => ({ ...prev, [pluginId]: !enabled }));
    }
  }

  if (loading) {
    return <div className="loading">Loading…</div>;
  }

  return (
    <div className="app">
      <div className="header">BraveInn</div>
      <div className="plugin-list">
        {pluginManifests.map((m) => (
          <PluginCard
            key={m.id}
            manifest={m}
            enabled={enabledMap[m.id] ?? true}
            onToggle={(enabled) => handleToggle(m.id, enabled)}
          />
        ))}
        {pluginManifests.length === 0 && <div className="empty">No plugins installed.</div>}
      </div>
    </div>
  );
}
