import type { ModuleManifest } from "@/types/module";
import es from "./lang/es.json";
import pt from "./lang/pt.json";

const manifest: ModuleManifest = {
  id: "musics",
  name: "Músicas",
  version: "2.0.0",
  description: "Biblioteca Geral de Músicas. Módulo responsável pelo gerenciamento de faixas avulsas ou coleções diversas.",
  author: "maycorolbuche",
  category: "musics",
  icon: "mdi-music",
  active: false,
  minAppVersion: "1.0.0",
  dependencies: [
    "media",
    "lyric",
    "album",
  ],
  permissions: [],
  translations: { pt, es },
};

export default manifest;
