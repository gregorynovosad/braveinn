export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
}

export interface Plugin {
  manifest: PluginManifest;
}
