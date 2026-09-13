/* eslint-disable @typescript-eslint/no-explicit-any */
import store from "@/store";

export default {
  set(param: string, value: any) {
    store.commit("setData", [param, value]);

    const popups = [...(this.get("popups") || [])];
    // Also fallback to single popup just in case
    const singlePopup = this.get("popup");
    if (singlePopup && !popups.includes(singlePopup)) {
      popups.push(singlePopup);
    }
    const stageWindow = this.get("stage_monitor_window");
    if (stageWindow && !stageWindow.closed && !popups.includes(stageWindow)) {
      popups.push(stageWindow);
    }

    if (
      popups.length > 0 &&
      param !== "popup" &&
      param !== "popups" &&
      param !== "is_popup" &&
      param !== "is_fullscreen" &&
      param !== "stage_monitor_window"
    ) {
      const activePopups: Window[] = [];
      popups.forEach((popup: Window) => {
        if (!popup.closed) {
          activePopups.push(popup);
          try {
            popup.postMessage({ param, value }, "*");
          } catch (e) {
            console.log(e);
          }
        }
      });
      
      const regularPopups = activePopups.filter((p: any) => p !== stageWindow);
      if (regularPopups.length !== (this.get("popups") || []).length) {
        this.set("popups", regularPopups);
      }
    }
  },

  get(param?: string, ifnull: any = null): any {
    if (param && !store.getters.exists(param)) {
      return ifnull;
    }

    return store.getters.getData(param);
  },

  getFlatten(): Record<string, any> {
    let data = Object.assign({}, this.get());
    delete data.popup;
    delete data.popups;
    delete data.is_popup;
    delete data.stage_monitor_window;
    try {
      data = JSON.parse(JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao serializar dados no getFlatten:", e);
      for (const k in data) {
        if (typeof data[k] === "object" && data[k] !== null) {
          try {
            JSON.stringify(data[k]);
          } catch {
            delete data[k];
          }
        }
      }
    }
    return this.flatten(data);
  },

  addElement(param: string, value: any) {
    store.commit("addElementArray", [param, value]);
  },

  removeElement(param: string, value: any) {
    store.commit("removeElementArray", [param, value]);
  },

  toogle(param: string) {
    this.set(param, !this.get(param));
  },

  exists(param: string): boolean {
    return store.getters.exists(param);
  },

  flatten(data: Record<string, any>, parent = "", result: Record<string, any> = {}): Record<string, any> {
    for (const key in data) {
      const prop = data[key];
      const newKey = parent ? `${parent}.${key}` : key;
      if (typeof prop === "object" && !Array.isArray(prop) && prop !== null) {
        this.flatten(prop, newKey, result);
      } else {
        result[newKey] = prop;
      }
    }
    return result;
  },
};
