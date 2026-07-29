import $appdata from "@/helpers/AppData";
import $window from "@/helpers/Window";
import { markRaw } from "vue";

export default {
  async open(params) {
    if (typeof params !== "object") {
      params = { module: params };
    }

    let popups = $appdata.get("popups") || [];

    popups = popups.filter(p => !p.closed);

    if (params.monitorId) {
      const existing = popups.find(p => p.monitorId === params.monitorId);
      if (existing && !existing.closed) {
        existing.focus();
      } else {
        let features = `width=800,height=600,monitor=${params.monitorId}`;
        if (params.fullscreen) features += ",fullscreen=yes";
        const newPopup = $window.open("#/popup", `PopupWindow_${params.monitorId}`, features);
        newPopup.monitorId = params.monitorId;
        popups.push(markRaw(newPopup));
      }
    } else {
      if (popups.length > 0 && !popups[0].closed) {
        popups[0].focus();
      } else {
        let features = "width=800,height=600";
        if (params.fullscreen) features += ",fullscreen=yes";
        popups = [markRaw($window.open("#/popup", "PopupWindow", features))];
      }
    }

    $appdata.set("popup_module", params.module);
    $appdata.set("popups", popups);
    if (popups.length > 0) {
      $appdata.set("popup", popups[0]);
    }
  },
  async exit() {
    const popups = $appdata.get("popups") || [];
    const returnPopups = [];
    popups.forEach(popup => {
      if (popup.role === "return") {
        returnPopups.push(popup);
        return;
      }
      if (popup && !popup.closed) {
        popup.close();
      }
    });
    $appdata.set("popup_module", "");
    $appdata.set("popups", returnPopups.filter(p => !p.closed));
  },
  async syncMonitors(monitors, moduleName = "media", forceOpen = false) {
    let popups = $appdata.get("popups") || [];
    popups = popups.filter(p => !p.closed);

    popups.forEach(popup => {
      if (popup.role !== "return" && popup.monitorId && !monitors.includes(popup.monitorId)) {
        popup.close();
      }
    });

    popups = popups.filter(p => !p.closed);

    if ($appdata.get("popup_module") === moduleName || forceOpen) {
      for (const monitorId of monitors) {
        const existing = popups.find(p => p.role !== "return" && p.monitorId === monitorId);
        if (!existing || existing.closed) {
          const features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
          const newPopup = $window.open("#/popup", `PopupWindow_${monitorId}`, features);
          newPopup.monitorId = monitorId;
          popups.push(markRaw(newPopup));
        }
      }
      const mainPopups = popups.filter(p => p.role !== "return");
      if (monitors.length > 0) {
        $appdata.set("popup_module", moduleName);
      } else if (mainPopups.length === 0) {
        $appdata.set("popup_module", "");
      }
    }

    $appdata.set("popups", popups);
    const mainPopup = popups.find(p => p.role !== "return");
    if (mainPopup) {
      $appdata.set("popup", mainPopup);
    }
  },
  async syncReturnMonitor(monitorId, enabled) {
    let popups = $appdata.get("popups") || [];
    popups = popups.filter(p => !p.closed);

    const otherPopups = popups.filter(p => p.role !== "return");
    const returnPopups = popups.filter(p => p.role === "return");

    if (!enabled || !monitorId) {
      returnPopups.forEach(popup => popup.close());
      $appdata.set("popups", otherPopups);
      return;
    }

    let keep = returnPopups.find(popup => popup.monitorId === monitorId && !popup.closed);
    returnPopups.forEach(popup => {
      if (popup !== keep) {
        popup.close();
      }
    });

    if (!keep) {
      const features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
      const newPopup = $window.open("#/popup?role=return", `PopupReturnWindow_${monitorId}`, features);
      newPopup.monitorId = monitorId;
      newPopup.role = "return";
      keep = markRaw(newPopup);
    }

    $appdata.set("popups", [...otherPopups, keep]);
  },
  async exitReturn() {
    const popups = $appdata.get("popups") || [];
    const otherPopups = [];
    popups.forEach(popup => {
      if (popup.role === "return") {
        if (popup && !popup.closed) {
          popup.close();
        }
      } else {
        otherPopups.push(popup);
      }
    });
    $appdata.set("popups", otherPopups);
  },
};
