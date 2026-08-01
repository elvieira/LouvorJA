import type { ModuleManifest } from "@/types/module";
import Index from "./interface/Index.vue";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

const manifest: ModuleManifest = {
  active: true,
  id: "sync",
  name: "Biblioteca Local",
  version: "1.0.0",
  description: "Sincronização de mídia offline.",
  author: "louvorja",
  category: null,
  icon: "mdi-library",
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
  translationKey: "sync",
  components: {
    interface: Index,
  },
};

export default manifest;
