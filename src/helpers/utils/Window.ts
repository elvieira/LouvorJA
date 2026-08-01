export default {
  open(url: string, target?: string, features?: string): Window | null {
    if (url.startsWith("/")) {
      url = (import.meta.env.BASE_URL ?? "/") + url.slice(1);
    }
    return window.open(url, target, features);
  },
};
