export interface ModuleManifest {
  active?: boolean;
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string | null;
  icon: string | null;
  showInMainMenu?: boolean;
  development?: boolean;
  language?: string | null;
  minAppVersion?: string;
  dependencies?: string[];
  permissions?: string[];
  translations?: Record<string, unknown>;
  system?: boolean;
  overlay?: boolean;
  moduleOptions?: Record<string, unknown> | null;
  translationKey?: string;
  components?: Record<string, unknown>;
  componentsEntry?: unknown;
}
