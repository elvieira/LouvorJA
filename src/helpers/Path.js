export default {
  db(path) {
    const url = import.meta.env.VITE_URL_DATABASE;
    return url + (path.startsWith('/') ? path : '/' + path);
  },
  file(path) {
    if (window.electronAPI) {
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `local://media/${cleanPath}`;
    }
    const url = import.meta.env.VITE_URL_FILES;
    return url + (path.startsWith('/') ? path : '/' + path);
  },
};
