import $db from "@/helpers/Database";
import $path from "@/helpers/Path";

class BackgroundSync {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    if (!window.electronAPI || !window.electronAPI.isElectron) return;
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      
      // 1. Verificar se as capas já foram todas baixadas no passado
      const isComplete = await window.electronAPI.getLocalDb("system_covers_downloaded");
      if (isComplete && isComplete.complete) {
        console.log("[BackgroundSync] Todas as capas já constam como baixadas. Verificação ignorada.");
        this.isRunning = false;
        return;
      }

      console.log("[BackgroundSync] Iniciando verificação de capas ausentes em background...");

      // 2. Extrair a lista de todas as capas
      const categories = await $db.get("pt_categories");
      if (!categories || !Array.isArray(categories)) {
        this.isRunning = false;
        return;
      }

      let allImages = new Set();
      for (const cat of categories) {
        if (cat.albums && Array.isArray(cat.albums)) {
          cat.albums.forEach(a => {
            if (a.url_image) allImages.add(a.url_image);
          });
        }
      }

      const imagesList = Array.from(allImages);
      let missingImages = [];

      // 3. Checar uma a uma para ver se já existe no HD
      console.log(`[BackgroundSync] Verificando ${imagesList.length} capas no disco...`);
      for (const urlImage of imagesList) {
        const imgRelativePath = urlImage.replace(/^\/(musics|images|covers)\//, '');
        const exists = await window.electronAPI.checkMedia('covers', imgRelativePath);
        if (!exists) {
          missingImages.push(urlImage);
        }
      }

      if (missingImages.length === 0) {
        console.log("[BackgroundSync] Nenhuma capa faltando. Salvando flag...");
        await window.electronAPI.saveLocalDb("system_covers_downloaded", { complete: true });
        this.isRunning = false;
        return;
      }

      console.log(`[BackgroundSync] Encontradas ${missingImages.length} capas ausentes. Iniciando download controlado...`);

      // 4. Baixar as capas ausentes com proteção de rate limit (lotes de 5)
      const batchSize = 5;
      for (let i = 0; i < missingImages.length; i += batchSize) {
        if (!navigator.onLine) {
          console.warn("[BackgroundSync] Sem internet. Download pausado.");
          break;
        }

        const batch = missingImages.slice(i, i + batchSize);
        await Promise.all(batch.map(async (urlImage) => {
          const imgFilename = urlImage.split('/').pop();
          const fullUrl = `${$path.file(urlImage)}`;
          await window.electronAPI.downloadMedia(fullUrl, 'covers', imgFilename);
        }));

        // Pequeno atraso para alívio do servidor, mesmo se o Electron já tem Retry
        await new Promise(r => setTimeout(r, 1000));
      }

      // Se passou por tudo e a internet ainda está ok, assume que terminou
      if (navigator.onLine) {
        console.log("[BackgroundSync] Download de capas finalizado com sucesso!");
        await window.electronAPI.saveLocalDb("system_covers_downloaded", { complete: true });
      }

    } catch (e) {
      console.error("[BackgroundSync] Erro na sincronização de background:", e);
    } finally {
      this.isRunning = false;
    }
  }
}

export default new BackgroundSync();
