import { BrowserWindow, screen } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import { userDataPath } from "../config/constants";

export interface SavedWindowState {
  enabled: boolean;
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const windowStatePath = path.join(userDataPath, "window-state.json");

const DEFAULT_STATE: SavedWindowState = {
  enabled: false,
  width: 1300,
  height: 900,
  isMaximized: false,
};

export function loadWindowState(): SavedWindowState {
  try {
    if (fs.existsSync(windowStatePath)) {
      const raw = fs.readFileSync(windowStatePath, "utf8");
      const data = JSON.parse(raw);
      return {
        enabled: !!data.enabled,
        x: typeof data.x === "number" ? data.x : undefined,
        y: typeof data.y === "number" ? data.y : undefined,
        width: typeof data.width === "number" ? Math.max(data.width, 920) : DEFAULT_STATE.width,
        height: typeof data.height === "number" ? Math.max(data.height, 760) : DEFAULT_STATE.height,
        isMaximized: !!data.isMaximized,
      };
    }
  } catch (e) {
    console.error("Error loading window state:", e);
  }
  return { ...DEFAULT_STATE };
}

export function isPositionVisible(x: number, y: number, width: number, height: number): boolean {
  try {
    const displays = screen.getAllDisplays();
    return displays.some((display) => {
      const b = display.bounds;
      const overlapX = Math.max(0, Math.min(x + width, b.x + b.width) - Math.max(x, b.x));
      const overlapY = Math.max(0, Math.min(y + height, b.y + b.height) - Math.max(y, b.y));
      return overlapX >= 100 && overlapY >= 100;
    });
  } catch {
    return true;
  }
}

let saveTimeout: NodeJS.Timeout | null = null;

export function saveWindowState(win: BrowserWindow): void {
  if (win.isDestroyed()) return;

  const current = loadWindowState();
  if (!current.enabled) return;

  if (win.isMaximized()) {
    current.isMaximized = true;
  } else if (!win.isMinimized()) {
    const bounds = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
    current.x = bounds.x;
    current.y = bounds.y;
    current.width = bounds.width;
    current.height = bounds.height;
    current.isMaximized = false;
  }

  try {
    fs.writeFileSync(windowStatePath, JSON.stringify(current, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving window state:", e);
  }
}

export function debounceSaveWindowState(win: BrowserWindow, delay = 500): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveWindowState(win);
  }, delay);
}

export function getRememberWindowBounds(): boolean {
  return loadWindowState().enabled;
}

export function setRememberWindowBounds(enabled: boolean, win?: BrowserWindow): boolean {
  const current = loadWindowState();
  current.enabled = enabled;

  if (enabled && win && !win.isDestroyed()) {
    if (win.isMaximized()) {
      current.isMaximized = true;
    } else if (!win.isMinimized()) {
      const bounds = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
      current.x = bounds.x;
      current.y = bounds.y;
      current.width = bounds.width;
      current.height = bounds.height;
      current.isMaximized = false;
    }
  }

  try {
    fs.writeFileSync(windowStatePath, JSON.stringify(current, null, 2), "utf8");
  } catch (e) {
    console.error("Error updating window state setting:", e);
  }

  return current.enabled;
}

export function setupWindowStateTracker(win: BrowserWindow): void {
  const onBoundsChange = () => {
    debounceSaveWindowState(win);
  };

  win.on("resize", onBoundsChange);
  win.on("move", onBoundsChange);

  win.on("maximize", () => {
    debounceSaveWindowState(win, 100);
  });

  win.on("unmaximize", () => {
    debounceSaveWindowState(win, 100);
  });

  win.on("close", () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveWindowState(win);
  });
}
