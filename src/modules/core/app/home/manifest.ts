import type { ModuleManifest } from "@/types/module";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

const manifest: ModuleManifest = {
  active: true,
  id: "home",
  name: "Página Inicial",
  version: "1.0.0",
  description: "Página Inicial (Dashboard). Visão geral do aplicativo, exibindo coletâneas recentes, atalhos rápidos e músicas mais tocadas.",
  author: "elvieira",
  category: null,
  showInMainMenu: false,
  development: false,
  icon: "mdi-home",
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  system: true,
  overlay: false,
  language: null,
  moduleOptions: null,
  translations: { pt, es },
  translationKey: "home",
};

export default manifest;
