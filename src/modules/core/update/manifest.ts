import type { ModuleManifest } from "@/types/module";
import Index from "./interface/Index.vue";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

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
  translations: { pt, es },
  translationKey: "update",
  components: {
    interface: Index,
  },
};

export default manifest;
