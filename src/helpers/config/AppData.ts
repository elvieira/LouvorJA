/* eslint-disable @typescript-eslint/no-explicit-any */
import store from "@/store";

export default {
  set(param: string, value: any) {
    store.commit("setData", [param, value]);

    const popups = this.get("popups") || [];
    // Also fallback to single popup just in case
    const singlePopup = this.get("popup");
    if (singlePopup && !popups.includes(singlePopup)) {
      popups.push(singlePopup);
    }

    if (
      popups.length > 0 &&
      param !== "popup" &&
      param !== "popups" &&
      param !== "is_popup" &&
      param !== "is_fullscreen"
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
      
      if (activePopups.length !== popups.length) {
        this.set("popups", activePopups);
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
    data = JSON.parse(JSON.stringify(data));
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
