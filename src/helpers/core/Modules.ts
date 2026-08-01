/* eslint-disable @typescript-eslint/no-explicit-any */
import $dev from "@/helpers/config/Dev";
import $appdata from "@/helpers/config/AppData";
import $media from "@/helpers/services/Media";


export default {
  open(id: string) {
    if (!this.check(id)) {
      console.error(`Módulo ${id} não encontrado!`);
      return;
    }

    const mediaShow = $appdata.get("modules.media.show");
    const mediaMinimized = $appdata.get("modules.media.minimized", false);
    if (mediaShow && !mediaMinimized) {
      $media.minimize();
    }

    const extMediaShow = $appdata.get("modules.external_media.show");
    const extMediaMinimized = $appdata.get("modules.external_media.minimized", false);
    if (extMediaShow && !extMediaMinimized) {
      $appdata.set("modules.external_media.config.request_action", { action: "minimize", time: Date.now() });
    }

    const modules = $appdata.get("modules") || {};
    const moduleToOpen = modules[id];
    const isOverlay = moduleToOpen?.manifest?.overlay === true;

    if (!isOverlay) {
      for (const key of Object.keys(modules)) {
        if (key !== id && modules[key].show) {
          $appdata.set(`modules.${key}.show`, false);
          if (key !== "home") {
            this.removeTray(key);
          }
        }
      }
    }

    $dev.write("open", id);
    $appdata.set(`modules.${id}.show`, true);
  },
  close(id: string) {
    if (!this.check(id)) {
      console.error(`Módulo ${id} não encontrado!`);
      return;
    }
    $dev.write("close", id);
    $appdata.set(`modules.${id}.show`, false);

    this.removeTray(id);

    const modules = $appdata.get("modules") || {};
    const hasActive = Object.keys(modules).some((key) => modules[key].show);
    if (!hasActive && this.check("home")) {
      $appdata.set("modules.home.show", true);
    }
  },
  minimize(id: string) {
    if (!this.check(id)) {
      console.error(`Módulo ${id} não encontrado!`);
      return;
    }
    if ($appdata.get(`modules.${id}.title`, "") === "") {
      console.error(`Módulo ${id} não possui a prorpiedade "title"!`);
      return;
    }
    if ($appdata.get(`modules.${id}.icon`, "") === "") {
      console.error(`Módulo ${id} não possui a prorpiedade "icon"!`);
      return;
    }
    $dev.write("minimize", id);
    $appdata.set(`modules.${id}.show`, false);

    this.addTray(id);
  },
  get(list: any = null): any {
    if (list === null) {
      return $appdata.get("modules");
    }

    if (typeof list === "string") {
      return $appdata.get(`modules.${list}`);
    }

    if (!list || list.length <= 0) {
      return {};
    }

    try {
      return {
        ...Object.fromEntries(
          list.map((module: string) => {
            return [
              module,
              $appdata.get(`modules.${module}`)
                ? { id: module, ...$appdata.get(`modules.${module}`) }
                : {
                  invalid: true,
                  title: "modules.invalid.title",
                  icon: "mdi-alert-circle-outline",
                },
            ];
          }),
        ),
      };
    } catch {
      return {};
    }
  },
  addTray(id: string) {
    if (!this.check(id)) {
      console.error(`Módulo ${id} não encontrado!`);
      return;
    }
    $appdata.addElement("tray_area.modules", id);
  },
  removeTray(id: string) {
    if (!this.check(id)) {
      console.error(`Módulo ${id} não encontrado!`);
      return;
    }
    $appdata.removeElement("tray_area.modules", id);
  },
  getTray(): any {
    return this.get($appdata.get("tray_area.modules"));
  },
  setTray(data: any) {
    return $appdata.set("tray_area.modules", data);
  },

  getMenu(): any {
    return this.get($appdata.get("menu.modules"));
  },

  getGroups(): any {
    const module_group = JSON.parse(
      JSON.stringify($appdata.get("module_group") || {}),
    );
    Object.keys(module_group).forEach((key) => {
      if (module_group[key].modules?.length <= 0) {
        module_group[key].modules = {};
      }

      module_group[key].modules = this.get(module_group[key].modules || []);
    });
    return module_group;
  },

  check(id: string): boolean {
    return $appdata.exists(`modules.${id}`);
  },

  sort(modules: any, $t: any): any {
    return Object.entries(modules)
      .sort(([k1, v1], [k2, v2]) => {
        if (k1 === "dev" && k2 !== "dev") return 1;
        if (k2 === "dev" && k1 !== "dev") return -1;

        const t1 = (v1 as any)?.title ? $t((v1 as any).title).toLowerCase() : "";
        const t2 = (v2 as any)?.title ? $t((v2 as any).title).toLowerCase() : "";
        return t1.localeCompare(t2);
      })
      .reduce((acc: any, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  },
};
