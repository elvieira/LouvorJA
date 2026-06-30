import $alert from "@/helpers/Alert";
import $path from "@/helpers/Path";
import $dev from "@/helpers/Dev";
import $storage from "@/helpers/Storage";

const isDesktop = !!(window.electronAPI && window.electronAPI.isElectron);

export default {
  async get(file) {
    try {
      const cache_name = `db:${file}`;
      const cache = $storage.get(cache_name, null, "session");

      if (cache) {
        $dev.write("Lendo BD do cache", file);
        return cache;
      }

      if (isDesktop) {
        const localData = await window.electronAPI.getLocalDb(file);
        if (localData) {
          $dev.write("Lendo BD do disco local (Offline)", file);
          $storage.set(cache_name, localData, "session");
          return localData;
        }
        $dev.write("BD local não encontrado, baixando e salvando:", file);
      }

      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      $dev.write("Abrindo BD", `${$path.db(`/${file}`)}?${date}`);
      const response = await fetch(`${$path.db(`/${file}`)}?${date}`, {
        headers: {
          "Api-Token": import.meta.env.VITE_API_TOKEN,
        },
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      $dev.write("Salvando BD em cache", file);
      $storage.set(cache_name, data, "session");

      if (isDesktop) {
        await window.electronAPI.saveLocalDb(file, data);
        $dev.write("BD salvo no disco local para acesso offline:", file);
      }

      return data;
    } catch (error) {
      $alert.error({ text: "messages.file_database_not_found", error });
      return null;
    }
  },
};
