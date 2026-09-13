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
  isClosing?: boolean;
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

    popups = popups.filter((p) => !p.closed && !p.isClosing);

    if (formattedParams.monitorId) {
      const existing = popups.find((p) => p.monitorId === formattedParams.monitorId);
      if (existing && !existing.closed && !existing.isClosing) {
        existing.focus();
      } else {
        let features = `width=800,height=600,monitor=${formattedParams.monitorId}`;
        if (formattedParams.fullscreen) features += ",fullscreen=yes";
        const newPopup = $window.open("#/popup", `PopupWindow_${formattedParams.monitorId}_${Date.now()}`, features) as CustomWindow | null;
        if (newPopup) {
          newPopup.monitorId = formattedParams.monitorId;
          popups.push(markRaw(newPopup) as unknown as CustomWindow);
        }
      }
    } else {
      if (popups.length > 0 && !popups[0].closed && !popups[0].isClosing) {
        popups[0].focus();
      } else {
        let features = "width=800,height=600";
        if (formattedParams.fullscreen) features += ",fullscreen=yes";
        const newPopup = $window.open("#/popup", `PopupWindow_${Date.now()}`, features) as CustomWindow | null;
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
        popup.isClosing = true;
        popup.postMessage("close", "*");
        try {
          popup.close();
        } catch {
          // Ignora erro se a janela já estiver fechada
        }
      }
    });
    $appdata.set("popup_module", "");
    $appdata.set("popups", []);
    $appdata.set("popup", null);
    this.closeStageMonitor();
  },
  
  async syncMonitors(monitors: Array<string | number>, moduleName: string = "media", forceOpen: boolean = false) {
    let popups: CustomWindow[] = $appdata.get("popups") || [];
    popups = popups.filter((p) => !p.closed && !p.isClosing);

    const closingPopups: CustomWindow[] = [];
    popups.forEach((popup) => {
      if (popup.monitorId && !monitors.includes(popup.monitorId)) {
        popup.isClosing = true;
        popup.postMessage("close", "*");
        try {
          popup.close();
        } catch {
          // Ignora erro se a janela já estiver fechada
        }
        closingPopups.push(popup);
      }
    });

    popups = popups.filter((p) => !p.closed && !closingPopups.includes(p) && !p.isClosing);

    if ($appdata.get("popup_module") === moduleName || forceOpen) {
      for (const monitorId of monitors) {
        const existing = popups.find((p) => p.monitorId === monitorId);
        if (!existing || existing.closed || existing.isClosing) {
          const features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
          const newPopup = $window.open("#/popup", `PopupWindow_${monitorId}_${Date.now()}`, features) as CustomWindow | null;
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

  async openStageMonitor(monitorId: string | number) {
    const stageWindow: CustomWindow | null = $appdata.get("stage_monitor_window") || null;

    // Se já existe uma janela aberta no mesmo monitor, focar nela; se mudou de monitor ou está fechando, fecha e abre no novo
    if (stageWindow && !stageWindow.closed && !stageWindow.isClosing) {
      if (stageWindow.monitorId === monitorId) {
        stageWindow.focus();
        return;
      }
      this.closeStageMonitor();
    }

    const features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
    const newWindow = $window.open("#/stage-monitor", `StageMonitor_${monitorId}_${Date.now()}`, features) as CustomWindow | null;
    if (newWindow) {
      newWindow.monitorId = monitorId;
      $appdata.set("stage_monitor_window", markRaw(newWindow));
    }
  },

  closeStageMonitor() {
    const stageWindow: CustomWindow | null = $appdata.get("stage_monitor_window") || null;
    if (stageWindow && !stageWindow.closed) {
      stageWindow.isClosing = true;
      stageWindow.postMessage("close", "*");
      try {
        stageWindow.close();
      } catch {
        // Ignora erro se a janela já estiver fechada
      }
    }
    $appdata.set("stage_monitor_window", null);
  },
};
