import type { ModuleManifest } from "@/types/module";
import Index from "./interface/Index.vue";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

const manifest: ModuleManifest = {
  active: true,
  id: "help",
  name: "Ajuda e sobre",
  version: "1.0.0",
  description: "Informações sobre o aplicativo e ajuda.",
  author: "elvieira",
  category: null,
  icon: "mdi-help-circle",
  showInMainMenu: false,
  development: false,
  system: false,
  overlay: false,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  moduleOptions: {
    size: "small",
  },
  translations: { pt, es },
  translationKey: "help",
  components: {
    interface: Index,
  },
};

export default manifest;
