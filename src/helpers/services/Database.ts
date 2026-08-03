import $alert from "@/helpers/ui/Alert";
import $path from "@/helpers/utils/Path";
import $dev from "@/helpers/config/Dev";
import $storage from "@/helpers/services/Storage";
import $appdata from "@/helpers/config/AppData";

const isDesktop = !!(window.electronAPI && window.electronAPI.isElectron);

export default {
  async get<T = unknown>(file: string): Promise<T | null> {
    try {
      const cache_name = `db:${file}`;
      const cache = $storage.get(cache_name, null, "session");

      if (cache) {
        $dev.write("Lendo BD do cache", file);
        return cache as T;
      }

      if (isDesktop) {
        const localData = await window.electronAPI.getLocalDb(file);
        if (localData) {
          $dev.write("Lendo BD do disco local (Offline)", file);
          $storage.set(cache_name, localData, "session");
          return localData as T;
        }
        $dev.write("BD local não encontrado. Fallback web desabilitado para o desktop:", file);
        throw new Error(`O arquivo '${file}' não foi encontrado localmente. Sincronize o banco de dados novamente.`);
      }

      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const url = `${$path.db(`/${file}`)}?${date}`;
      $dev.write("Abrindo BD", url);
      
      let data: T | null = null;
      let retries = 3;
      let delayMs = 1000;
      
      while (retries > 0) {
        try {
          const response = await fetch(url, {
            headers: {
              "Api-Token": import.meta.env.VITE_API_TOKEN as string,
            },
          });

          if (response.status === 429) {
            $dev.write(`Rate limit 429 em ${file}. Tentando novamente...`, delayMs);
            await new Promise((r) => setTimeout(r, delayMs));
            retries--;
            delayMs *= 1.5;
            continue;
          }

          if (!response.ok) {
            if (response.status >= 500) {
              await new Promise((r) => setTimeout(r, delayMs));
              retries--;
              delayMs *= 1.5;
              continue;
            }
            throw new Error(`Status ${response.status}`);
          }
          
          data = await response.json() as T;
          break; // Sucesso
        } catch (error: unknown) {
          const errMessage = error instanceof Error ? error.message : String(error);
          if (retries > 1 && (errMessage.includes("Failed to fetch") || errMessage.includes("NetworkError"))) {
            await new Promise((r) => setTimeout(r, delayMs));
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
    } catch (error: unknown) {
      if ($appdata.get("system_first_boot_loading") === true) {
        return null;
      }
      const errMessage = error instanceof Error ? error.message : String(error);
      $alert.error({ text: "messages.file_database_not_found", error: errMessage });
      return null;
    }
  },
};
