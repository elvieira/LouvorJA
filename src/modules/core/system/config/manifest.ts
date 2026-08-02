import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  id: "config",
  name: "Configurações",
  version: "1.0.0",
  description: "Configurações gerais do sistema. Gerencie a aparência, preferências do programa e comportamentos de projeção da tela.",
  author: "elvieira",
  category: null,
  icon: "mdi-cog",
  showInMainMenu: false,
  development: false,
  system: true,
  overlay: false,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  moduleOptions: {
    size: "small",
  },
};

export default manifest;
