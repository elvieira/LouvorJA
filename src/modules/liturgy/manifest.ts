import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  id: "liturgy",
  name: "Liturgia",
  version: "1.0.0",
  description: "Organização do culto. Monte a programação da igreja com músicas, versículos, anotações e mídias na sequência desejada.",
  author: "elvieira",
  category: null,
  icon: "mdi-hands-pray",
  showInMainMenu: true,
  development: false,
  system: false,
  overlay: false,
  language: null,
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
