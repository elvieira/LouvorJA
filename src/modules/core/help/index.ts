import BaseModule from "../../BaseModule";
import manifest from "./manifest";

export default class extends BaseModule {
  constructor() {
    super(manifest);
  }

  onInstall() {
    console.log(`${this.manifest.name} installed successfully`);
  }
}
