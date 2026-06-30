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
      const url = `${$path.db(`/${file}`)}?${date}`;
      $dev.write("Abrindo BD", url);
      
      let data = null;
      let retries = 3;
      let delayMs = 1000;
      
      while (retries > 0) {
        try {
          const response = await fetch(url, {
            headers: {
              "Api-Token": import.meta.env.VITE_API_TOKEN,
            },
          });

          if (response.status === 429) {
            $dev.write(`Rate limit 429 em ${file}. Tentando novamente...`, delayMs);
            await new Promise(r => setTimeout(r, delayMs));
            retries--;
            delayMs *= 1.5;
            continue;
          }

          if (!response.ok) {
            if (response.status >= 500) {
              await new Promise(r => setTimeout(r, delayMs));
              retries--;
              delayMs *= 1.5;
              continue;
            }
            throw new Error(`Status ${response.status}`);
          }
          
          data = await response.json();
          break; // Sucesso
        } catch (error) {
          if (retries > 1 && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
            await new Promise(r => setTimeout(r, delayMs));
            retries--;
            delayMs *= 1.5;
            continue;
          }
          throw error;
        }
      }

      if (!data) throw new Error("Falha ao baixar dados após várias tentativas");

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
