import type { ModuleManifest } from "@/types/module";
import Index from "./interface/Index.vue";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

const manifest: ModuleManifest = {
  active: true,
  id: "album",
  name: "Álbum",
  version: "2.0.0",
  description: "Reprodutor e visualizador de álbuns. Gerencia a listagem e execução contínua das faixas de um álbum musical.",
  author: "maycorolbuche",
  category: null,
  icon: null,
  showInMainMenu: false,
  development: false,
  system: false,
  overlay: false,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  moduleOptions: null,
  translations: { pt, es },
  translationKey: "album",
  components: {
    interface: Index,
  },
};

export default manifest;
