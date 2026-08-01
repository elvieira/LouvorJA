import type { ModuleManifest } from "@/types/module";
import pt from "./lang/pt.json";
import es from "./lang/es.json";

const manifest: ModuleManifest = {
  active: true,
  id: "dev",
  name: "Desenvolvedor",
  version: "2.0.0",
  description: "Painel do Desenvolvedor. Ferramenta de diagnóstico que exibe variáveis globais, módulos instalados e configurações em tempo real.",
  author: "maycorolbuche",
  category: null,
  showInMainMenu: true,
  development: true,
  icon: "mdi-code-braces",
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
  system: false,
  overlay: false,
  language: null,
  moduleOptions: null,
  translations: { pt, es },
  translationKey: "dev",
};

export default manifest;
