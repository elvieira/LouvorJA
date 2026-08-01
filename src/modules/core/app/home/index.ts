import BaseModule from "@/modules/BaseModule";
import manifest from "./manifest";

export default class HomeModule extends BaseModule {
  constructor() {
    super(manifest);
  }

  onInstall() {
    console.log(`${this.manifest.name} installed successfully`);
  }
}
