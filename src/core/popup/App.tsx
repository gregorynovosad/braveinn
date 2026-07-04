import { useState, useEffect } from 'react';
import { pluginManifests } from '../../plugins';
import { PluginCard } from './PluginCard';
import './styles.css';

const STORAGE_PREFIX = 'braveinn:plugin';

export function App() {
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const keys = pluginManifests.map((m) => `${STORAGE_PREFIX}:${m.id}:enabled`);
    chrome.storage.local.get(keys).then((result) => {
      const map: Record<string, boolean> = {};
      for (const m of pluginManifests) {
        const key = `${STORAGE_PREFIX}:${m.id}:enabled`;
        map[m.id] = result[key] !== false;
      }
      setEnabledMap(map);
      setLoading(false);
    });
  }, []);

  async function handleToggle(pluginId: string, enabled: boolean) {
    setEnabledMap((prev) => ({ ...prev, [pluginId]: enabled }));
    chrome.runtime.sendMessage({ type: 'BRAVEINN_SET_ENABLED', pluginId, enabled });
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
        {pluginManifests.length === 0 && (
          <div className="empty">No plugins installed.</div>
        )}
      </div>
    </div>
  );
}
