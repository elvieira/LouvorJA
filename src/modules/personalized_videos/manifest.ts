import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  development: false,
  id: "personalized_videos",
  name: "Vídeos Personalizados",
  version: "1.0.0",
  description: "Adicione seus próprios links de vídeos do YouTube para tocar durante o culto.",
  author: "railsonmonteiro",
  category: "online_collection",
  icon: "mdi-playlist-plus",
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
