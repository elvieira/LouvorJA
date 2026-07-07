import $appdata from "@/helpers/AppData";
import $userdata from "@/helpers/UserData";
import $window from "@/helpers/Window";
import { getPopupRefs, setPopupRefs } from "@/helpers/PopupRegistry";
import {
  captureCurrentBounds,
  getOpenFeatures,
  getPopupSlotId,
  parseSlotIndex,
  requestWindowManagementPermission,
  resolveBoundsForSlot,
  saveSlotBounds,
  scheduleRestoreOnWindow,
} from "@/helpers/PopupLayout";
import { markRaw } from "vue";

const POPUP_COUNT_MIN = 1;
const POPUP_COUNT_MAX = 6;
const POPUP_COUNT_DEFAULT = 2;

function getPopupCount() {
  let count = parseInt($userdata.get("modules.config.popup_count"), 10);
  if (isNaN(count)) count = POPUP_COUNT_DEFAULT;
  return Math.min(POPUP_COUNT_MAX, Math.max(POPUP_COUNT_MIN, count));
}

function persistPopups(popups) {
  const active = setPopupRefs(popups);
  $appdata.set("popups", active.length ? active : null);
  $appdata.set("popup", active.length ? active[0] : null);
  return active;
}

function syncStateTo(popup) {
  if (!popup || popup.closed) return;
  const data = $appdata.getFlatten();
  Object.keys(data).forEach((item) => {
    try {
      popup.postMessage(
        { param: item, value: data[item] },
        window.location.origin,
      );
    } catch (e) {
      console.log(e);
    }
  });
}

function syncStateToAll(popups = getPopupRefs()) {
  popups.forEach(syncStateTo);
}

function scheduleSync(popups = getPopupRefs()) {
  const run = () => syncStateToAll(getPopupRefs().length ? getPopupRefs() : popups);
  run();
  setTimeout(run, 50);
  setTimeout(run, 250);
}

function tagPopupSlot(popup, fallbackIndex) {
  if (!popup || popup.closed) return fallbackIndex;
  if (popup.__popupSlot) return popup.__popupSlot;

  const fromName = parseSlotIndex(popup.name);
  popup.__popupSlot = fromName || fallbackIndex;
  return popup.__popupSlot;
}

function requestBoundsReport(popup) {
  if (!popup || popup.closed) return;
  try {
    popup.postMessage({ action: "report-bounds" }, window.location.origin);
  } catch (e) {
    console.log(e);
  }
}

function saveOpenPopupLayouts() {
  getPopupRefs().forEach((popup, index) => {
    const slotId = getPopupSlotId(tagPopupSlot(popup, index + 1));
    const bounds = captureCurrentBounds(popup);
    if (bounds) saveSlotBounds(slotId, bounds);
  });
}

function ensurePopups() {
  const desiredCount = getPopupCount();
  let popups = getPopupRefs();

  popups.forEach((popup, index) => {
    tagPopupSlot(popup, index + 1);
  });

  if (popups.length > desiredCount) {
    saveOpenPopupLayouts();
    for (let i = desiredCount; i < popups.length; i++) {
      if (popups[i] && !popups[i].closed) {
        requestBoundsReport(popups[i]);
        popups[i].close();
      }
    }
    popups = popups.slice(0, desiredCount);
  }

  for (let i = popups.length + 1; i <= desiredCount; i++) {
    const win = $window.open(
      `/popup?slot=${i}`,
      getPopupSlotId(i),
      getOpenFeatures(i),
    );
    if (win) {
      win.__popupSlot = i;
      popups.push(markRaw(win));
    }
  }

  popups = persistPopups(popups);

  popups.forEach((popup, arrayIndex) => {
    const slot = tagPopupSlot(popup, arrayIndex + 1);
    const entry = resolveBoundsForSlot(getPopupSlotId(slot));
    if (entry) {
      scheduleRestoreOnWindow(popup, entry);
    }
    requestBoundsReport(popup);
  });

  return popups;
}

export default {
  async open(params) {
    if (typeof params != "object") {
      params = { module: params };
    }

    await requestWindowManagementPermission();

    const popups = ensurePopups();

    if (popups.length > 0) {
      popups.forEach((p) => p.focus());
    }

    $appdata.set("popup_module", params.module);
    scheduleSync(popups);
  },
  async exit() {
    saveOpenPopupLayouts();
    $appdata.set("popup_module", "");
  },
  async closeAll() {
    getPopupRefs().forEach((popup, index) => {
      const bounds = captureCurrentBounds(popup);
      if (bounds) {
        saveSlotBounds(getPopupSlotId(tagPopupSlot(popup, index + 1)), bounds);
      }
      if (popup && !popup.closed) {
        popup.close();
      }
    });
    persistPopups([]);
    $appdata.set("popup_module", "");
  },
  syncWindows() {
    const popups = ensurePopups();
    scheduleSync(popups);
    return popups;
  },
  saveSlotBounds(slotId, bounds) {
    saveSlotBounds(slotId, bounds);
  },
  syncStateTo(popup) {
    syncStateTo(popup);
  },
  syncStateToAll() {
    syncStateToAll();
  },
  scheduleSync() {
    scheduleSync();
  },
  getCount() {
    return getPopupCount();
  },
};
