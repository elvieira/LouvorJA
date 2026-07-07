import $appdata from "@/helpers/AppData";
import $window from "@/helpers/Window";
import { markRaw } from "vue";

const POPUP_COUNT = 3;
const POPUP_WIDTH = 800;
const POPUP_HEIGHT = 600;
const POPUP_BASE_LEFT = 80;
const POPUP_BASE_TOP = 40;
const POPUP_OFFSET_X = 60;
const POPUP_OFFSET_Y = 60;

function getPopupFeatures(index) {
  const left = POPUP_BASE_LEFT + (index - 1) * POPUP_OFFSET_X;
  const top = POPUP_BASE_TOP + (index - 1) * POPUP_OFFSET_Y;
  return `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`;
}

export default {
  async open(params) {
    if (typeof params != "object") {
      params = { module: params };
    }

    let popups = ($appdata.get("popups") || []).filter((p) => p && !p.closed);

    if (popups.length > 0) {
      popups.forEach((p) => p.focus());
    } else {
      popups = [];
      for (let i = 1; i <= POPUP_COUNT; i++) {
        const win = $window.open(
          "/popup",
          `PopupWindow${i}`,
          getPopupFeatures(i),
        );
        if (win) popups.push(markRaw(win));
      }
    }

    $appdata.set("popup_module", params.module);
    $appdata.set("popups", popups);
    if (popups.length > 0) {
      $appdata.set("popup", popups[0]);
    }
  },
  async exit() {
    $appdata.set("popup_module", "");
  },
};
