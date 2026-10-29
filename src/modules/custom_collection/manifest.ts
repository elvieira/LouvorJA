import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  id: "custom_collection",
  name: "Coletâneas Personalizadas",
  version: "1.0.0",
  description: "Crie e organize suas próprias coletâneas de músicas.",
  author: "railsonmonteiro",
  category: "special_collections",
  icon: "mdi-music-box-multiple",
  development: false,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
