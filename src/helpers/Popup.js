import $appdata from "@/helpers/AppData";
import $window from "@/helpers/Window";

export default {
  async open(params) {
    if (typeof params !== "object") {
      params = { module: params };
    }

    let popups = $appdata.get("popups") || [];
    
    // Clear out closed popups
    popups = popups.filter(p => !p.closed);

    // Se houver um monitorId especificado, abrimos um novo popup (ou reutilizamos se já existir naquele monitor)
    // Se não, mantemos o comportamento padrão (apenas 1)
    if (params.monitorId) {
      let existing = popups.find(p => p.monitorId === params.monitorId);
      if (existing && !existing.closed) {
        existing.focus();
      } else {
        let features = `width=800,height=600,monitor=${params.monitorId}`;
        if (params.fullscreen) features += ",fullscreen=yes";
        let newPopup = $window.open("/popup", `PopupWindow_${params.monitorId}`, features);
        newPopup.monitorId = params.monitorId;
        popups.push(newPopup);
      }
    } else {
      // Fallback single popup
      if (popups.length > 0 && !popups[0].closed) {
        popups[0].focus();
      } else {
        let features = "width=800,height=600";
        if (params.fullscreen) features += ",fullscreen=yes";
        popups = [$window.open("/popup", "PopupWindow", features)];
      }
    }

    $appdata.set("popup_module", params.module);
    $appdata.set("popups", popups);
    if (popups.length > 0) {
      $appdata.set("popup", popups[0]);
    }
  },
  async exit() {
    let popups = $appdata.get("popups") || [];
    popups.forEach(popup => {
      if (popup && !popup.closed) {
        popup.close();
      }
    });
    $appdata.set("popup_module", "");
    $appdata.set("popups", []);
  },
  async syncMonitors(monitors, moduleName = 'media', forceOpen = false) {
    let popups = $appdata.get("popups") || [];
    popups = popups.filter(p => !p.closed);
    
    // Close popups that are not in the new `monitors` list
    popups.forEach(popup => {
      if (popup.monitorId && !monitors.includes(popup.monitorId)) {
        popup.close();
      }
    });

    // Clean array
    popups = popups.filter(p => !p.closed);
    
    // Open missing monitors if projection is currently active or forced
    if ($appdata.get("popup_module") === moduleName || forceOpen) {
        for (const monitorId of monitors) {
            let existing = popups.find(p => p.monitorId === monitorId);
            if (!existing || existing.closed) {
                let features = `width=800,height=600,monitor=${monitorId},fullscreen=yes`;
                let newPopup = $window.open("/popup", `PopupWindow_${monitorId}`, features);
                newPopup.monitorId = monitorId;
                popups.push(newPopup);
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
  }
};
