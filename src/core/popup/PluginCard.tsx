import type { PluginManifest } from '../../shared/types';

interface Props {
  manifest: PluginManifest;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function PluginCard({ manifest, enabled, onToggle }: Props) {
  return (
    <div className="plugin-card">
      <div className="plugin-info">
        <div className="plugin-name">{manifest.name}</div>
        <div className="plugin-description">{manifest.description}</div>
      </div>
      <label className="toggle" aria-label={`Toggle ${manifest.name}`}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}
