/* eslint-disable @typescript-eslint/no-explicit-any */
// @/helpers/core/ModuleTypes.ts
export const ModuleManifest = {
  create(options: any) {
    // Add validation
    const required = ["id", "name", "version"];
    for (const field of required) {
      if (!options[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      id: options.id,
      name: options.name,
      version: options.version,
      description: options.description,
      author: options.author,
      category: options.category || "misc",
      icon: options.icon,
      minAppVersion: options.minAppVersion || "1.0.0",
      dependencies: options.dependencies || [],
      permissions: options.permissions || [],
    };
  },
};

export class BaseModule {
  manifest: any;
  config: any;

  constructor(manifest: any) {
    this.manifest = manifest;
    this.config = manifest.config || {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async install(app: any, context: any) {
    // Abstract method to be implemented by specific Modules
    throw new Error("Module must implement install method");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uninstall(context: any) {
    // Optional uninstall method
  }

  getConfig() {
    return this.config;
  }

  setConfig(config: any) {
    this.config = { ...this.config, ...config };
  }

  // Utility methods for module developers
  registerComponent(app: any, component: any, name?: string) {
    app.component(name || component.name, component);
  }

  registerRoute(router: any, route: any) {
    router.addRoute(route);
  }

  registerStoreModule(store: any, module: any) {
    store.registerModule(this.manifest.id, module);
  }
}
