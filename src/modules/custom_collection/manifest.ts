import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  id: "custom_collection",
  name: "Coletânea",
  version: "1.0.0",
  description: "Crie e organize suas próprias coletâneas de músicas.",
  author: "elvieira",
  category: "personalized",
  icon: "mdi-music-box-multiple",
  showInMainMenu: false,
  development: false,
  system: false,
  overlay: false,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
