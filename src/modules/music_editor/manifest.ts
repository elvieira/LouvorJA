import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  development: false,
  id: "music_editor",
  name: "Editor de Música",
  version: "1.0.0",
  description: "Crie e edite músicas personalizadas com letra dividida em slides, prontas para projeção.",
  author: "railsonmonteiro",
  category: "personalized",
  icon: "mdi-music-note-plus",
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
