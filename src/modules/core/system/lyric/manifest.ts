import type { ModuleManifest } from "@/types/module";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

const manifest: ModuleManifest = {
  active: true,
  id: "lyric",
  name: "Letra",
  version: "2.0.0",
  description: "Módulo de exibição de letras. Apresenta o texto sincronizado da música atual em reprodução no player ativo. (função $media.openLyric)",
  author: "maycorolbuche",
  category: null,
  icon: "mdi-text",
  showInMainMenu: false,
  development: false,
  system: false,
  overlay: true,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  moduleOptions: {
    size: "small",
  },
  translations: { pt, es },
  translationKey: "lyric",
};

export default manifest;
