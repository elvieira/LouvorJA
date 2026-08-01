export interface ModuleManifest {
  active?: boolean;
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  icon: string;
  showInMainMenu?: boolean;
  development?: boolean;
  language?: string | null;
  minAppVersion?: string;
  dependencies?: string[];
  permissions?: string[];
  translations?: Record<string, unknown>;
  system?: boolean;
  overlay?: boolean;
  components?: Record<string, unknown>;
  componentsEntry?: unknown;
}
