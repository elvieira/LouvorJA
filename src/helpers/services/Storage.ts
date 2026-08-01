type StorageType = "local" | "session";

export default {
  set(item: string, data: unknown, type: StorageType = "local") {
    let stringifiedData = data as string;
    if (typeof data === "object") {
      stringifiedData = JSON.stringify(data);
    }
    this.storage(type).setItem(item, stringifiedData);
  },

  get<T = unknown>(item: string, ifnull: T | null = null, type: StorageType = "local"): T | null {
    const data = this.storage(type).getItem(item);

    if (!data) {
      return ifnull;
    }

    if (ifnull === null) {
      let data_parse: unknown;
      try {
        data_parse = JSON.parse(data);
      } catch {
        data_parse = data;
      }
      return data_parse as T;
    } else if (typeof ifnull === "object") {
      return JSON.parse(data) as T;
    } 
    return data as unknown as T;
  },

  remove(item: string, type: StorageType = "local") {
    this.storage(type).removeItem(item);
  },

  removeAll(item: string, type: StorageType = "local") {
    const store = this.storage(type);
    for (let i = store.length - 1; i >= 0; i--) {
      const key = store.key(i);
      if (key && key.split(":")[0] === item) {
        this.remove(key, type);
      }
    }
  },

  storage(type: StorageType = "local"): Storage {
    if (type === "session") {
      return sessionStorage;
    } 
    return localStorage;
  },
};
