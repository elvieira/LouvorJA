import type { ModuleManifest } from "@/types/module";
import es from "./lang/es.json";
import pt from "./lang/pt.json";

const manifest: ModuleManifest = {
  id: "bible",
  name: "Bíblia",
  version: "2.0.0",
  description: "Módulo de estudo e leitura da Bíblia Sagrada. Oferece navegação rápida por livros, capítulos e versículos, com modo de leitura adaptável.",
  author: "maycorolbuche",
  category: "bible",
  icon: "mdi-book-cross",
  minAppVersion: "2.0.0",
  dependencies: [],
  permissions: [],
  translations: { pt, es },
};

export default manifest;
