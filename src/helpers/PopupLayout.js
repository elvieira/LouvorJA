import $storage from "@/helpers/Storage";

const STORAGE_KEY = "louvorja_popup_layout";

const POPUP_WIDTH = 800;
const POPUP_HEIGHT = 600;
const POPUP_BASE_LEFT = 80;
const POPUP_BASE_TOP = 40;
const POPUP_OFFSET_X = 60;
const POPUP_OFFSET_Y = 60;

const RESTORE_DELAYS_MS = [0, 50, 150, 300, 600, 1000, 2000];

export function getPopupSlotId(index) {
  return `PopupWindow${index}`;
}

export function parseSlotIndex(slotId) {
  const match = /^PopupWindow(\d+)$/.exec(slotId || "");
  return match ? parseInt(match[1], 10) : null;
}

export function getLayout() {
  return $storage.get(STORAGE_KEY, {}) || {};
}

export function getLayoutEntry(slotId) {
  const entry = getLayout()[slotId];
  if (!entry) return null;
  return normalizeBounds(entry, true);
}

export function getDefaultBounds(index) {
  return {
    left: POPUP_BASE_LEFT + (index - 1) * POPUP_OFFSET_X,
    top: POPUP_BASE_TOP + (index - 1) * POPUP_OFFSET_Y,
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
  };
}

function normalizeBounds(bounds, keepScreen = false) {
  if (!bounds) return null;
  const left = Number(bounds.left);
  const top = Number(bounds.top);
  const width = Number(bounds.width);
  const height = Number(bounds.height);
  if ([left, top, width, height].some((n) => Number.isNaN(n))) return null;
  if (width < 200 || height < 150) return null;

  const normalized = {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
    height: Math.round(height),
  };

  if (keepScreen) {
    const screenLeft = Number(bounds.screenLeft);
    const screenTop = Number(bounds.screenTop);
    if (!Number.isNaN(screenLeft) && !Number.isNaN(screenTop)) {
      normalized.screenLeft = Math.round(screenLeft);
      normalized.screenTop = Math.round(screenTop);
      if (!Number.isNaN(Number(bounds.screenWidth))) {
        normalized.screenWidth = Math.round(Number(bounds.screenWidth));
      }
      if (!Number.isNaN(Number(bounds.screenHeight))) {
        normalized.screenHeight = Math.round(Number(bounds.screenHeight));
      }
    }
  }

  return normalized;
}

export function resolveBounds(index) {
  const saved = getLayoutEntry(getPopupSlotId(index));
  return saved || getDefaultBounds(index);
}

export function resolveBoundsForSlot(slotId) {
  const index = parseSlotIndex(slotId);
  if (!index) return null;
  return getLayoutEntry(slotId) || getDefaultBounds(index);
}

function enrichWithScreen(targetWindow, bounds) {
  const scr = targetWindow.screen;
  if (!scr || !bounds) return bounds;

  return {
    ...bounds,
    screenLeft: Math.round(scr.availLeft ?? scr.left ?? 0),
    screenTop: Math.round(scr.availTop ?? scr.top ?? 0),
    screenWidth: Math.round(scr.availWidth ?? scr.width ?? 0),
    screenHeight: Math.round(scr.availHeight ?? scr.height ?? 0),
  };
}

export function saveSlotBounds(slotId, bounds) {
  if (!slotId) return;
  const normalized = normalizeBounds(bounds, true);
  if (!normalized) return;

  const layout = getLayout();
  const current = layout[slotId];
  if (
    current &&
    current.left === normalized.left &&
    current.top === normalized.top &&
    current.width === normalized.width &&
    current.height === normalized.height &&
    current.screenLeft === normalized.screenLeft &&
    current.screenTop === normalized.screenTop
  ) {
    return;
  }

  layout[slotId] = normalized;
  $storage.set(STORAGE_KEY, layout);
}

export function captureCurrentBounds(targetWindow = window) {
  const bounds = normalizeBounds({
    left: targetWindow.screenX,
    top: targetWindow.screenY,
    width: targetWindow.outerWidth,
    height: targetWindow.outerHeight,
  });
  if (!bounds) return null;
  return enrichWithScreen(targetWindow, bounds);
}

function isOnSavedScreen(targetWindow, entry) {
  if (entry.screenLeft === undefined || entry.screenTop === undefined) {
    return true;
  }
  const scr = targetWindow.screen;
  if (!scr) return true;
  return (
    Math.round(scr.availLeft ?? scr.left ?? 0) === entry.screenLeft &&
    Math.round(scr.availTop ?? scr.top ?? 0) === entry.screenTop
  );
}

async function findSavedScreen(entry) {
  if (!("getScreenDetails" in window)) return null;
  if (entry.screenLeft === undefined) return null;

  try {
    const details = await window.getScreenDetails();
    return (
      details.screens.find(
        (screen) =>
          Math.round(screen.availLeft) === entry.screenLeft &&
          Math.round(screen.availTop) === entry.screenTop,
      ) || null
    );
  } catch (e) {
    return null;
  }
}

export async function applyBounds(targetWindow, entry) {
  const bounds = normalizeBounds(entry, true);
  if (!targetWindow || targetWindow.closed || !bounds) return;

  try {
    targetWindow.resizeTo(bounds.width, bounds.height);
    targetWindow.moveTo(bounds.left, bounds.top);

    if (!isOnSavedScreen(targetWindow, bounds)) {
      const screen = await findSavedScreen(bounds);
      if (screen) {
        const left = Math.max(
          screen.availLeft,
          Math.min(bounds.left, screen.availLeft + screen.availWidth - bounds.width),
        );
        const top = Math.max(
          screen.availTop,
          Math.min(bounds.top, screen.availTop + screen.availHeight - bounds.height),
        );
        targetWindow.moveTo(left, top);
        targetWindow.resizeTo(bounds.width, bounds.height);
      } else {
        targetWindow.moveTo(bounds.left, bounds.top);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

export function getOpenFeatures(index) {
  const bounds = resolveBounds(index);
  return `width=${bounds.width},height=${bounds.height}`;
}

export function scheduleRestoreOnWindow(targetWindow, entry) {
  if (!targetWindow || targetWindow.closed || !entry) return;

  RESTORE_DELAYS_MS.forEach((delay) => {
    setTimeout(() => {
      if (targetWindow.closed) return;
      applyBounds(targetWindow, entry);
    }, delay);
  });
}

export async function requestWindowManagementPermission() {
  if (!("getScreenDetails" in window)) return;
  try {
    await window.getScreenDetails();
  } catch (e) {
    console.log(e);
  }
}

export function resetLayout() {
  $storage.remove(STORAGE_KEY);
}
