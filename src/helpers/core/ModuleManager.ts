/* eslint-disable @typescript-eslint/no-explicit-any */
// @/helpers/core/ModuleManager.ts
import $appdata from "@/helpers/config/AppData";
import $dev from "@/helpers/config/Dev";
import $alert from "@/helpers/ui/Alert";

export default {
  modules: new Map<string, any>(),
  manifests: new Map<string, any>(),
  i18n: null as any,

  register(moduleName: string, module: any) {
    if (!this.modules.has(moduleName)) {
      this.modules.set(moduleName, module);
      return true;
    }
    return false;
  },

  async installModule(module: any) {
    try {
      // Auto-configure module
      const manifest = module.manifest;

      if (!manifest.active) {
        if ($appdata.get("is_dev")) {
          //Mostra o alerta somente no modo de desenvolvimento!
          console.warn(`Module ${module.manifest.id} disabled`);
        }
        return;
      }

      // Register module in application's modules
      $appdata.set(`modules.${manifest.id}`, {
        id: manifest.id,
        title: manifest.translationKey || `modules.${manifest.id}.title`,
        icon: manifest.icon || "mdi-puzzle",
        show: false,
        language: manifest.language,
        type: "module",
        showInMainMenu: manifest.showInMainMenu || false,
        development: manifest.development || false,
        ...(manifest.moduleOptions || {}),
        manifest,
      });

      // Add to module groups
      const category = manifest.category;
      if (category) {
        const moduleGroups = $appdata.get("module_group") || {};
        // Add module to category if not already present
        if (!moduleGroups[category].modules.includes(manifest.id)) {
          moduleGroups[category].modules.push(manifest.id);
        }

        // Save updated module groups
        $appdata.set("module_group", moduleGroups);
      }

      // Add to main menu
      const showInMainMenu = manifest.showInMainMenu;
      if (showInMainMenu) {
        const moduleMainMenu = $appdata.get("menu") || {};
        // Add module to main menu if not already present
        if (!moduleMainMenu.modules.includes(manifest.id)) {
          moduleMainMenu.modules.push(manifest.id);
        }
        // Save updated module groups
        $appdata.set("menu", moduleMainMenu);
      }

      // Auto-load translations
      if (manifest.translations) {
        Object.entries(manifest.translations).forEach(
          ([lang, translations]) => {
            if (this.i18n) {
              this.i18n.global.mergeLocaleMessage(lang, {
                modules: { [manifest.id]: translations },
              });
            }
          },
        );
      }

      // Log installation
      $dev.write(
        "module_install",
        manifest.id,
        manifest.development ? "[dev]" : "",
      );

      return true;
    } catch (error) {
      console.error(`Failed to install module ${module.manifest.id}:`, error);
      return false;
    }
  },

  // Remote module installation method
  async installRemoteModule(moduleId: string) {
    try {
      // Fetch module manifest from remote module store
      const manifest = await this.fetchModuleManifest(moduleId);

      // Download module module dynamically
      const ModuleClass = await this.downloadModuleModule(manifest);

      // Create module instance
      const moduleInstance = new ModuleClass();

      // Register and install module
      if (this.register(moduleId, moduleInstance)) {
        await this.installModule(moduleInstance);
        return moduleInstance;
      }

      return null;
    } catch (error) {
      console.error("Remote module installation failed:", error);
      throw error;
    }
  },

  async fetchModuleManifest(_moduleId: string): Promise<any> {
    // Placeholder to make it compile since it's not defined
    return Promise.resolve({});
  },

  async downloadModuleModule(_manifest: any): Promise<any> {
    // Placeholder to make it compile since it's not defined
    return Promise.resolve(class {});
  },

  async init(i18n: any) {
    this.i18n = i18n;

    const modules = import.meta.glob("@/modules/**/index.ts", {
      eager: true,
    }) as any;

    for (const path in modules) {
      const ModuleClass = modules[path].default;
      if (typeof ModuleClass === "function") {
        const module = new ModuleClass();
        const parts = path.split("/");
        if (module?.manifest?.id !== parts[parts.length - 2]) {
          $alert.error({
            text: "messages.misconfigured_module",
            error: path,
          });
        } else {
          await this.installModule(module);
        }
      }
    }

    //Importa as interfaces dos modules
    $appdata.set("import_modules", true);

    // Abre o módulo Home automaticamente na inicialização
    if ($appdata.get("modules.home")) {
      $appdata.set("modules.home.show", true);
    }
  },
};
