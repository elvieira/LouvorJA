/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppState } from "./state";

export default {
  setData(state: AppState, data: any[]) {
    const value = data.pop();
    const param = data.join(".");

    const keys = param.split(".");
    let current: any = state;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  },

  addElementArray(state: AppState, data: any[]) {
    const value = data.pop();
    const param = data.join(".");

    const keys = param.split(".");
    let current: any = state;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]].push(value);
  },
  removeElementArray(state: AppState, data: any[]) {
    const value = data.pop();
    const param = data.join(".");

    const keys = param.split(".");
    let current: any = state;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = current[keys[keys.length - 1]].filter(
      (item: any) => item !== value,
    );
  },
};
