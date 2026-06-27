import $appdata from "@/helpers/AppData";
import $window from "@/helpers/Window";

export default {
  async open(params) {
    if (typeof params !== "object") {
      params = { module: params };
    }

    let popup = $appdata.get("popup");
    if (popup && !popup.closed) {
      popup.focus();
    } else {
      let features = "width=800,height=600";
      if (params.fullscreen) {
        features += ",fullscreen=yes";
      }
      popup = $window.open("/popup", "PopupWindow", features);
    }
    $appdata.set("popup_module", params.module);
    $appdata.set("popup", popup);
  },
  async exit() {
    let popup = $appdata.get("popup");
    if (popup && !popup.closed) {
      popup.close();
    }
    $appdata.set("popup_module", "");
    $appdata.set("popup", null);
  },
};
