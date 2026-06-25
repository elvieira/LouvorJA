import BaseModule from "../../BaseModule";
import manifest from "./manifest.json";

export default class extends BaseModule {
  constructor() {
    // Load translations
    manifest.translations = { pt: {}, es: {} };

    // Load manifest
    super(manifest);
  }

  onInstall() {
    console.log(`${this.manifest.name} installed successfully`);
  }
}
