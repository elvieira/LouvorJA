import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  id: "update",
  name: "Atualização",
  version: "1.0.0",
  description: "Verificação e instalação de atualizações do programa.",
  author: "elvieira",
  category: null,
  icon: "mdi-cloud-download",
  showInMainMenu: false,
  development: false,
  system: true,
  overlay: true,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  moduleOptions: { size: "small" },
};

export default manifest;
