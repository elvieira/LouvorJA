import BaseModule from "@/modules/BaseModule";
import es from "./lang/es.json";
import pt from "./lang/pt.json";
import manifest from "./manifest";

export default class extends BaseModule {
  constructor() {
    // Load translations
    Object.assign(manifest, { translations: { pt, es } });

    // Load manifest
    super(manifest);
  }

  onInstall() {
    console.log(`${this.manifest.name} installed successfully`);
  }
}
