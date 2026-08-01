/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppState } from "./state";

export default {
  getData: (state: AppState) => (data = ""): any => {
    if (!data) return state;

    const keys = data.split(".");
    let result: any = state;

    for (const key of keys) {
      if (result) {
        result = result[key];
      } else {
        return undefined;
      }
    }

    return result;
  },

  exists: (state: AppState) => (data: string): boolean => {
    const keys = data.split(".");
    let current: any = state;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    return current[keys[keys.length - 1]] !== undefined;
  },
};
