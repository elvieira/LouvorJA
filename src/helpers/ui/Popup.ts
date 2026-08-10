import $appdata from "@/helpers/config/AppData";
import $window from "@/helpers/utils/Window";
import { markRaw } from "vue";

export interface PopupParams {
  module?: string;
  monitorId?: string | number;
  fullscreen?: boolean;
}

export interface CustomWindow extends Window {
  monitorId?: string | number;
}

export default {
  async open(params: string | PopupParams) {
    let formattedParams: PopupParams;
    if (typeof params !== "object" || params === null) {
      formattedParams = { module: params as string };
    } else {
      formattedParams = params as PopupParams;
    }

    let popups: CustomWindow[] = $appdata.get("popups") || [];

    popups = popups.filter((p) => !p.closed);

    if (formattedParams.monitorId) {
      const existing = popups.find((p) => p.monitorId === formattedParams.monitorId);
      if (existing && !existing.closed) {
        existing.focus();
      } else {
        let features = `width=800,height=600,monitor=${formattedParams.monitorId}`;
        if (formattedParams.fullscreen) features += ",fullscreen=yes";
        const newPopup = $window.open("#/popup", `PopupWindow_${formattedParams.monitorId}`, features) as CustomWindow | null;
        if (newPopup) {
          newPopup.monitorId = formattedParams.monitorId;
          popups.push(markRaw(newPopup) as unknown as CustomWindow);
        }
      }
    } else {
      if (popups.length > 0 && !popups[0].closed) {
        popups[0].focus();
      } else {
        let features = "width=800,height=600";
        if (formattedParams.fullscreen) features += ",fullscreen=yes";
        const newPopup = $window.open("#/popup", "PopupWindow", features) as CustomWindow | null;
        if (newPopup) {
          popups = [markRaw(newPopup) as unknown as CustomWindow];
        }
      }
    }

    $appdata.set("popup_module", formattedParams.module);
    $appdata.set("popups", popups);
    if (popups.length > 0) {
      $appdata.set("popup", popups[0]);
    }
  },
  
  async exit() {
    const popups: CustomWindow[] = $appdata.get("popups") || [];
    popups.forEach((popup) => {
      if (popup && !popup.closed) {
        popup.postMessage("close", "*");
      }
    });
    $appdata.set("popup_module", "");
    $appdata.set("popups", []);
  },
  
  async syncMonitors(monitors: Array<string | number>, moduleName: string = "media", forceOpen: boolean = false) {
    let popups: CustomWindow[] = $appdata.get("popups") || [];
    popups = popups.filter((p) => !p.closed);

    popups.forEach((popup) => {
      if (popup.monitorId && !monitors.includes(popup.monitorId)) {
        popup.postMessage("close", "*");
      }
    });

    popups = popups.filter((p) => !p.closed);

    if ($appdata.get("popup_module") === moduleName || forceOpen) {
      for (const monitorId of monitors) {
        const existing = popups.find((p) => p.monitorId === monitorId);
        if (!existing || existing.closed) {
          const features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
          const newPopup = $window.open("#/popup", `PopupWindow_${monitorId}`, features) as CustomWindow | null;
          if (newPopup) {
            newPopup.monitorId = monitorId;
            popups.push(markRaw(newPopup) as unknown as CustomWindow);
          }
        }
      }
      if (monitors.length > 0) {
        $appdata.set("popup_module", moduleName);
      } else if (popups.length === 0) {
        $appdata.set("popup_module", "");
      }
    }

    $appdata.set("popups", popups);
    if (popups.length > 0) {
      $appdata.set("popup", popups[0]);
    }
  },
};
