import $appdata from "@/helpers/AppData";
import $userdata from "@/helpers/UserData";
import $window from "@/helpers/Window";
import { markRaw } from "vue";

function splitPopups() {
  const popups = ($appdata.get("popups") || []).filter(p => !p.closed);
  return {
    mainPopups: popups.filter(p => p.role !== "return"),
    returnPopups: popups.filter(p => p.role === "return"),
  };
}

function isReturnContentActive() {
  return (
    $appdata.get("modules.media.id_music") != null ||
    !!$appdata.get("modules.bible.data.text")
  );
}

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
    const { mainPopups, returnPopups } = splitPopups();
    mainPopups.forEach(popup => popup.close());
    $appdata.set("popup_module", "");
    $appdata.set("popups", returnPopups);
  },
  async syncMonitors(monitors, moduleName = "media", forceOpen = false) {
    const split = splitPopups();
    const { returnPopups } = split;
    let { mainPopups } = split;

    mainPopups.forEach(popup => {
      if (popup.monitorId && !monitors.includes(popup.monitorId)) {
        popup.close();
      }
    });
    mainPopups = mainPopups.filter(p => !p.closed);

    if ($appdata.get("popup_module") === moduleName || forceOpen) {
      for (const monitorId of monitors) {
        const existing = mainPopups.find(p => p.monitorId === monitorId);
        if (!existing || existing.closed) {
          const features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
          const newPopup = $window.open("#/popup", `PopupWindow_${monitorId}`, features);
          newPopup.monitorId = monitorId;
          mainPopups.push(markRaw(newPopup));
        }
      }
      if (monitors.length > 0) {
        $appdata.set("popup_module", moduleName);
      } else if (mainPopups.length === 0) {
        $appdata.set("popup_module", "");
      }
    }

    $appdata.set("popups", [...mainPopups, ...returnPopups]);
    if (mainPopups.length > 0) {
      $appdata.set("popup", mainPopups[0]);
    }
  },
  async syncReturnMonitor(monitorId) {
    const { mainPopups, returnPopups } = splitPopups();
    const enabled = !!monitorId && isReturnContentActive();

    if (!enabled) {
      returnPopups.forEach(popup => popup.close());
      $appdata.set("popups", mainPopups);
      return;
    }

    let keep = returnPopups.find(popup => popup.monitorId === monitorId);
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

    $appdata.set("popups", [...mainPopups, keep]);
  },
  async projectModule(moduleName) {
    let selectedMonitors = [];
    if (window.electronAPI && window.electronAPI.getDisplays) {
      const displays = await window.electronAPI.getDisplays();
      if (displays && displays.length > 1) {
        let configMonitors = $userdata.get("modules.config.slide_monitor");
        if (!Array.isArray(configMonitors)) {
          configMonitors = configMonitors ? [configMonitors] : [];
        }
        const primary = displays.find(d => d.isPrimary) || displays[0];
        selectedMonitors = configMonitors.filter(m => m !== primary.id);
      }
    }

    if (selectedMonitors.length > 0) {
      await this.syncMonitors(selectedMonitors, moduleName, true);
    } else {
      const fullscreen = $userdata.get("modules.config.slide_fullscreen") !== false;
      await this.open({ module: moduleName, fullscreen });
    }
  },
  async exitReturn() {
    const { mainPopups, returnPopups } = splitPopups();
    returnPopups.forEach(popup => popup.close());
    $appdata.set("popups", mainPopups);
  },
};
