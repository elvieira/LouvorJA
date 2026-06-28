import store from "@/store";

export default {
  set(param, value) {
    store.commit("setData", [param, value]);

    const popups = this.get("popups") || [];
    // Also fallback to single popup just in case
    const singlePopup = this.get("popup");
    if (singlePopup && !popups.includes(singlePopup)) {
      popups.push(singlePopup);
    }

    if (
      popups.length > 0 &&
      param != "popup" &&
      param != "popups" &&
      param != "is_popup" &&
      param != "is_fullscreen"
    ) {
      let activePopups = [];
      popups.forEach(popup => {
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

  get(param, ifnull = null) {
    if (param && !store.getters.exists(param)) {
      return ifnull;
    }

    return store.getters.getData(param);
  },

  getFlatten() {
    let data = Object.assign({}, this.get());
    delete data.popup;
    delete data.popups;
    delete data.is_popup;
    data = JSON.parse(JSON.stringify(data));
    return this.flatten(data);
  },

  addElement(param, value) {
    store.commit("addElementArray", [param, value]);
  },

  removeElement(param, value) {
    store.commit("removeElementArray", [param, value]);
  },

  toogle(param) {
    this.set(param, !this.get(param));
  },

  exists(param) {
    return store.getters.exists(param);
  },

  flatten(data, parent = "", result = {}) {
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
