import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  active: true,
  development: false,
  id: "timer",
  name: "Cronômetro",
  version: "1.0.0",
  description: "Utilitário de cronômetro progressivo e regressivo.",
  author: "elvieira",
  category: "utilities",
  icon: "mdi-timer-outline",
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
