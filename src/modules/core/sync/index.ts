import BaseModule from "@/modules/BaseModule";
import manifest from "./manifest";

export default class SyncModule extends BaseModule {
  constructor() {
    super(manifest);
  }

  onInstall() {
    console.log(`${manifest.name} installed successfully`);
  }
}
