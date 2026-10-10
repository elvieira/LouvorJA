/* eslint-disable @typescript-eslint/no-explicit-any */
import $dev from "@/helpers/config/Dev";
import $appdata from "@/helpers/config/AppData";
import $userdata from "@/helpers/config/UserData";
import $datetime from "@/helpers/utils/DateTime";
import $path from "@/helpers/utils/Path";
import $alert from "@/helpers/ui/Alert";
import $snackbar from "@/helpers/ui/Snackbar";
import $modules from "@/helpers/core/Modules";
import $database from "@/helpers/services/Database";
import $history from "@/helpers/services/History";
import $popup from "@/helpers/ui/Popup";
import Telemetry from "@/helpers/services/Telemetry";

export default {
  _sessionId: 0,

  async open(params: any) {
    const currentSession = ++this._sessionId;

    if (typeof params !== "object") {
      params = { id_music: params };
    }
    $dev.write("open media", params);

    if ($appdata.get("modules.external_media.filePath")) {
      const confirmed = await new Promise((resolve) => {
        $alert.yesno({
          text: "Uma mídia está em reprodução. Deseja encerrá-la e reproduzir esta música?",
          translate: false,
        }, (res) => resolve(res === "yes"));
      });
      if (!confirmed) return false;
      if (this._sessionId !== currentSession) return false;
      
      $appdata.set("modules.external_media.filePath", "");
      $appdata.set("modules.external_media.show", false);
    }

    if (!params.fromQueue && $appdata.get("modules.media.show_queue")) {
      $appdata.set("modules.media.show_queue", false);
    }

    const mode = params.mode ? params.mode : "no_audio";
    const currentMode = $appdata.get("modules.media.config.mode");
    const isSameSong = params.id_music === $appdata.get("modules.media.id_music");
    const isExternal = typeof params.id_music === "string" && params.id_music.startsWith("slja:");

    // Músicas externas (.slja) sempre reiniciam do slide 1 — não faz sentido "retomar"
    // uma apresentação, além de garantir que o conteúdo recém-salvo seja recarregado.
    if (!isExternal && isSameSong && mode === currentMode) {
      this.maximize();
      return true;
    }

    let savedTime = 0;
    // Capturados antes do clearVariables() (que zera esses campos) para permitir reaproveitar
    // os dados/URLs externos em trocas de modo (Cantado/Playback/Sem Áudio) que não reenviam externalData.
    const existingExternalAudioUrl = $appdata.get("modules.media.external_audio_url") || "";
    const existingExternalInstrumentalUrl = $appdata.get("modules.media.external_instrumental_url") || "";
    const existingData = isSameSong && isExternal ? $appdata.get("modules.media.data") : null;

    let audio = this.getElement();
    // const volume = $appdata.get("modules.media.config.volume") / 100;
    const fadeAudioEnabled = $userdata.get("modules.media.fade_audio") !== false;

    if (isSameSong && !isExternal) {
      savedTime = audio.currentTime;
      if (fadeAudioEnabled && !audio.paused && audio.volume > 0) {
        this.fadeOut(audio, 1000).catch(() => { });
      } else {
        audio.pause();
      }

      this.switchActiveElement();
      audio = this.getElement();
    } else {
      this.stopAudio();
      const isCurrentlyFullscreen = $appdata.get("modules.media.config.fullscreen") === true;
      const userExitedFullscreen = $appdata.get("modules.media.user_exited_fullscreen") === true;
      const keepFullscreen = Boolean(params.fromQueue && isCurrentlyFullscreen && !userExitedFullscreen);
      this.clearVariables(keepFullscreen);
      audio = this.getElement();
    }

    const id_music = params.id_music;
    const isCurrentlyMinimized = this.isMinimized() || !$appdata.get("modules.media.show");
    const minimized = params.minimized !== undefined
      ? params.minimized
      : (params.fromQueue ? isCurrentlyMinimized : false);
    const id_album = params.id_album ? params.id_album : null;


    $appdata.set("modules.media.loading", true);

    const data = params.externalData
      ? params.externalData
      : isSameSong && isExternal
        ? existingData
        : await $database.get<any>(`music_${id_music}`);
    if (this._sessionId !== currentSession) return false;
    if (data === null) {
      this.close(true);
      return false;
    }

    if (!isSameSong || isExternal) {
      $appdata.set("modules.media.data", data);
      $appdata.set("modules.media.id_music", id_music);
      $appdata.set("modules.media.id_album", id_album);
      $appdata.set("modules.media.config.slide_index", 0);
      $appdata.set("modules.media.config.title", data.name);
      this.setAlbumInfo(id_album);
      $appdata.set("modules.media.config.last_slide", this.slides().length);
      $appdata.set("modules.media.times", []);
    }

    // Restaura/atualiza as URLs externas (.slja) mesmo em modos sem áudio (ex.: Sem Áudio),
    // para que voltar depois para Cantado/Playback ainda encontre o arquivo correto.
    if (isExternal) {
      const resolvedExternalAudioUrl = params.externalData ? (params.externalAudioUrl || "") : existingExternalAudioUrl;
      const resolvedExternalInstrumentalUrl = params.externalData ? (params.externalInstrumentalUrl || "") : existingExternalInstrumentalUrl;
      $appdata.set("modules.media.external_audio_url", resolvedExternalAudioUrl);
      $appdata.set("modules.media.external_instrumental_url", resolvedExternalInstrumentalUrl);
    }

    if (!params.fromQueue) {
      $appdata.set("modules.media.user_exited_fullscreen", false);
      this.initQueue();
      const queue = $appdata.get("modules.media.queue");
      queue.items = [{
        id_music,
        mode: mode === "instrumental" && !data.has_instrumental_music ? "audio" : mode,
        name: data.name,
        subtitle: this.getSubtitleFromData(data, id_album),
        url_image: data.url_image || "",
        id_album,
      }];
      queue.currentIndex = 0;
      $appdata.set("modules.media.queue", queue);
    }



    const minimizePlayer = $userdata.get("modules.config.slide_minimize_player") === true;
    const slideFullscreen = $userdata.get("modules.config.slide_fullscreen") !== false;
    const slideMonitors = $userdata.get("modules.config.slide_monitor") || [];
    const disableIfExtended = $userdata.get("modules.config.slide_disable_main_if_extended") !== false;

    let hasExtended = false;
    if (window.electronAPI && window.electronAPI.getDisplays) {
      const displays = await window.electronAPI.getDisplays();
      if (displays && displays.length > 1) {
        const primary = displays.find((d: any) => d.isPrimary) || displays[0];
        const extendedSelected = slideMonitors.filter((m: any) => m !== (primary as any).id);
        hasExtended = extendedSelected.length > 0;
      }
    }
    
    const userExitedFullscreen = $appdata.get("modules.media.user_exited_fullscreen") === true;
    const willGoFullscreen = slideFullscreen && !(disableIfExtended && hasExtended) && !userExitedFullscreen;
    
    let shouldMaximize = true;
    
    if (minimized) {
      shouldMaximize = false;
    } else if (minimizePlayer && !willGoFullscreen) {
      shouldMaximize = false;
    }

    if (params.startPaused) {
      // Show the footer bar but hide the mini player popup - it will appear when the user presses play
      $appdata.set("modules.media.is_queue_standby", true);
      this.minimize();
      $appdata.set("modules.media.show_mini_player", false);
    } else {
      $appdata.set("modules.media.is_queue_standby", false);
      if (shouldMaximize) {
        this.maximize();
      } else {
        this.minimize();
      }
    }

    if (mode === "audio" || mode === "instrumental") {
      //Será executado com áudio... cria o elemento de audio
      const audio = this.getElement();
      const volume = this.getVolume();
      $appdata.set("modules.media.config.volume", volume);
      audio.volume = volume / 100;

      this.pause(true);
      if (!isSameSong || isExternal) {
        audio.currentTime = 0;
      }

      const slides = this.slides();
      let useInstrumental = mode === "instrumental";
      
      if (useInstrumental) {
        const hasInstrumentalTiming = slides.some((item: any) => $datetime.toNumber(item.instrumental_time) > 0);
        if (!hasInstrumentalTiming) {
          useInstrumental = false;
        }
      }

      //Grava os tempos dos slides
      $appdata.set(
        "modules.media.times",
        slides.map((item: any) => {
          const t = useInstrumental ? item.instrumental_time : item.time;
          return $datetime.toNumber(t);
        }),
      );

      const urlPath = mode === "audio" ? data.url_music : data.url_instrumental_music;

      const targetAudioUrl = isExternal
        ? (mode === "audio"
          ? $appdata.get("modules.media.external_audio_url")
          : $appdata.get("modules.media.external_instrumental_url")) || ""
        : $path.file(urlPath);

      // Interceptação Offline (Desktop) — não aplicável a músicas externas (arquivos .slja locais)
      if (!isExternal && window.electronAPI && window.electronAPI.isElectron) {
        let isDownloadedCollection = false;
        const dla = ((await window.electronAPI.getLocalDb("dla")) as string[]) || [];

        if (data.albums) {
          for (const album of data.albums) {
            if (dla.includes(album.id_album)) {
              isDownloadedCollection = true;
              break;
            }
          }
        }
        if (!isDownloadedCollection && data.categories) {
          const hymnal = data.categories.find((item: string) => item.startsWith("hymnal."));
          if (hymnal) {
            const hType = hymnal.split(".")[1] === "1996" ? "hymnal_1996" : "hymnal";
            if (dla.includes(hType)) {
              isDownloadedCollection = true;
            }
          }
        }

        const imagesToPreload = new Set<string>();
        if (data.url_image) imagesToPreload.add(data.url_image);
        if (data.lyric) {
          Object.values<any>(data.lyric).forEach((slide) => {
            if (slide.url_image) imagesToPreload.add(slide.url_image);
          });
        }

        const relativeMusicPath = urlPath.replace(/^\/(musics|images|covers)\//, "");
        const localMusic = await window.electronAPI.checkMedia("music", relativeMusicPath);
        const missingMusic = !localMusic;
        
        const missingImages: { type: string; file: string }[] = [];
        for (const imgUrl of imagesToPreload) {
          const type = imgUrl.startsWith("/covers/") ? "covers" : "slides";
          const relImg = imgUrl.replace(/^\/(musics|images|covers)\//, "");
          const localImg = await window.electronAPI.checkMedia(type, relImg);
          if (!localImg) {
            missingImages.push({ type, file: relImg });
          }
        }

        if (missingMusic || missingImages.length > 0) {
          if (isDownloadedCollection) {
            const { default: $snackbar } = await import("@/helpers/ui/Snackbar");
            $snackbar.show({ text: "Aviso: Arquivos ausentes. Baixando e recuperando mídia...", color: "warning", timeout: -1, loading: true });
            
            if (missingMusic && window.electronAPI.downloadMedia) {
              await window.electronAPI.downloadMedia("", "music", relativeMusicPath);
            }
            if (missingImages.length > 0 && window.electronAPI.downloadMedia) {
              for (const missingImg of missingImages) {
                await window.electronAPI.downloadMedia("", missingImg.type, missingImg.file);
              }
            }
            
            $snackbar.hide();
          } else if (missingMusic) {
            // Bloqueio Offline Estrito apenas se a música faltar e NÃO estiver numa coletânea baixada
            this.close(true);
            $appdata.set("modules.media.loading", false);
            const { default: $alert } = await import("@/helpers/ui/Alert");
            $alert.error({
              text: "Essa música ainda não foi baixada. Acesse a Biblioteca Local para baixá-la.",
              translate: false,
            });
            return false; // Interrompe a execução completamente
          }
        }

        // Pré-carregamento das imagens em memória
        for (const imgUrl of imagesToPreload) {
          const img = new Image();
          img.src = $path.file(imgUrl);
        }

        $dev.write("Mídia carregada/verificada com sucesso", targetAudioUrl);
      }

      $appdata.set("modules.media.config.audio", targetAudioUrl);

      // Atribuição Direta (Desktop/Strict Offline)
      audio.src = targetAudioUrl;
      audio.load();
      $appdata.set("modules.media.config.lazy", false);
      $appdata.set("modules.media.loading", false);

      const duration = $appdata.get("modules.media.config.duration") || 0;
      
      // If we are reopening the exact same song, but it was already at the end, we should rewind it
      const shouldRewind = savedTime >= duration - 0.5;

      if (isSameSong && savedTime > 0 && !shouldRewind) {
        audio.currentTime = savedTime;
        if (!params.startPaused) {
          if (fadeAudioEnabled) {
            this.fadeIn(audio, volume / 100, 1000).catch(() => { });
          } else {
            this.play();
          }
        } else {
          this.pause();
        }
      } else {
        audio.currentTime = 0;
        if (!params.startPaused) {
          this.play();
        } else {
          this.pause();
        }
      }
    } else {
      $appdata.set("modules.media.config.audio", "");
      $appdata.set("modules.media.loading", false);
    }

    $appdata.set("modules.media.config.mode", mode);

    // Registrar reprodução no histórico
    const albumInfo = data.albums && data.albums.length > 0
      ? (id_album ? data.albums.find((a: any) => a.id_album === id_album) : data.albums[0])
      : null;
    $history.addSongPlay({
      id_music,
      name: data.name,
      album_name: albumInfo ? albumInfo.name : "",
      duration: data.duration || "0:00",
    });

    try {
      const subtitle = this.getSubtitleFromData(data, id_album);
      const displayName = subtitle ? `${data.name} (${subtitle})` : data.name;

      const isExternalSong = Boolean(data.is_external || isExternal);

      Telemetry.track("song_played", {
        id_music,
        name: displayName,
        song_title: data.name,
        subtitle: subtitle || "",
        album_name: albumInfo ? albumInfo.name : "",
        duration: data.duration || "0:00",
        mode,
        is_external: isExternalSong,
      });

      Telemetry.startSongPlay({
        id_music,
        song_title: data.name,
        subtitle: subtitle || "",
        album_name: albumInfo ? albumInfo.name : "",
        audio_mode: mode,
        is_external: isExternalSong,
        total_slides: this.slides().length,
      });
    } catch {
      // ignore
    }

    if (albumInfo) {
      let collectionId = albumInfo.id_album;
      let collectionType = "album";

      const hymnal = data.categories?.filter((item: string) => item.startsWith("hymnal."))[0];
      if (hymnal) {
        collectionId = hymnal.split(".")[1];
        collectionType = "module";
      }

      $history.addRecentCollection({
        id: collectionId,
        type: collectionType,
        name: collectionType === "module" ? (collectionId === "hymnal" ? "Hinário Adventista" : "Hinário Adventista 1996") : albumInfo.name,
        icon: collectionType === "module" ? "mdi-music" : "mdi-music-box-multiple",
        url_image: albumInfo.url_image,
      });
    }

    // Projeção Automática no Monitor Estendido
    if (window.electronAPI && window.electronAPI.getDisplays) {
      const displays = await window.electronAPI.getDisplays();
      if (displays && displays.length > 1) {
        let selectedMonitors = $userdata.get("modules.config.slide_monitor");
        if (!Array.isArray(selectedMonitors)) {
          selectedMonitors = selectedMonitors ? [selectedMonitors] : [];
        }

        const primary = displays.find((d: any) => d.isPrimary) || displays[0];

        // Remove primary from selected monitors to avoid covering controls
        selectedMonitors = selectedMonitors.filter((m: any) => m !== (primary as any).id);

        // Tela de Retorno (Stage Monitor)
        const stageMonitorEnabled = $userdata.get("modules.config.stage_monitor_enabled");
        const stageMonitorDisplay = $userdata.get("modules.config.stage_monitor_display");
        const isDisplayInSlideMonitors = selectedMonitors.includes(stageMonitorDisplay);

        // Se o monitor foi configurado para retorno e está ativo em múltiplas telas,
        // remove da projeção de slides comum para não sobrepor janelas
        if (stageMonitorEnabled && stageMonitorDisplay && isDisplayInSlideMonitors) {
          selectedMonitors = selectedMonitors.filter((m: any) => m !== stageMonitorDisplay);
        }

        if (selectedMonitors.length > 0) {
          if (!params.startPaused) {
            await $popup.syncMonitors(selectedMonitors, "media", true);
          }
        }

        // Abrir Tela de Retorno (Stage Monitor) se habilitada e ativa em múltiplas telas
        if (stageMonitorEnabled && stageMonitorDisplay && isDisplayInSlideMonitors && !params.startPaused) {
          await $popup.openStageMonitor(stageMonitorDisplay);
        }
      }
    }
    
    this.syncStreaming();
    return true;
  },

  // Reproduz um arquivo .slja local a partir do seu caminho, reconstruindo os dados
  // externos necessários. Usado por telas que só têm o id_music (ex.: "Músicas mais tocadas"),
  // sem acesso ao item original da Coletânea Personalizada.
  async playExternalSlja(filePath: string, mode: "audio" | "instrumental" | "no_audio" = "audio") {
    const electronAPI = window.electronAPI as any;
    if (!electronAPI?.readSljaZip) return false;
    const data = await electronAPI.readSljaZip(filePath);
    if (!data) {
      $alert.error({ text: "modules.media.alerts.not_loaded", translate: true });
      return false;
    }

    const toLocalFileUrl = (rawPath: string | null): string => {
      if (!rawPath) return "";
      const normalized = rawPath.replace(/\\/g, "/");
      const prefix = normalized.startsWith("/") ? "local://app" : "local://app/";
      return `${prefix}${normalized}`;
    };
    const escapeHtml = (raw: string): string =>
      (raw || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
    const secondsToHms = (totalSeconds: number | null): string => {
      const total = Math.max(0, Math.floor(totalSeconds || 0));
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    const [firstSlide, ...remainingSlides] = data.slides;
    const lyric: Record<string, any> = {};
    remainingSlides.forEach((s: any, index: number) => {
      const timeHms = secondsToHms(s.time);
      lyric[`s${index}`] = {
        lyric: escapeHtml(s.text),
        aux_lyric: escapeHtml(s.auxText),
        show_slide: 1,
        order: index,
        time: timeHms,
        instrumental_time: timeHms,
        url_image: s.image ? toLocalFileUrl(s.image) : undefined,
        image_position: 50,
        fontSize: s.fontSize,
        fontColor: s.fontColor,
        auxFontSize: s.auxFontSize,
        auxFontColor: s.auxFontColor,
      };
    });

    const titleFromFirstSlide = firstSlide?.text?.trim();
    const externalData = {
      name: titleFromFirstSlide || data.name,
      url_image: firstSlide?.image ? toLocalFileUrl(firstSlide.image) : undefined,
      image_position: 50,
      lyric,
      albums: [],
      categories: [],
      duration: "0:00",
      instrumental_duration: "0:00",
      has_instrumental_music: !!data.instrumentalPath,
    };

    let playMode = mode === "instrumental" ? "instrumental" : mode === "no_audio" ? "no_audio" : "audio";
    if (playMode === "audio" && !data.audioPath) {
      playMode = data.instrumentalPath ? "instrumental" : "no_audio";
    }
    await this.open({
      id_music: `slja:${filePath}`,
      mode: playMode,
      externalData,
      externalAudioUrl: data.audioPath ? toLocalFileUrl(data.audioPath) : null,
      externalInstrumentalUrl: data.instrumentalPath ? toLocalFileUrl(data.instrumentalPath) : null,
    });

    if (playMode === "audio" || playMode === "instrumental") {
      // A capa (índice 0) sempre começa em 0s. Se um slide sem sincronia manual
      // também ficar em 0s (ou empatar com o tempo anterior), o cálculo de "qual
      // slide mostrar agora" (times.filter(t <= current).length - 1) pula direto
      // pra ele, pulando a capa visualmente. Garantimos ordem estritamente
      // crescente pra evitar esse empate.
      const preciseTimes: number[] = [0];
      remainingSlides.forEach((s: any) => {
        const raw = typeof s.time === "number" ? s.time : 0;
        const last = preciseTimes[preciseTimes.length - 1];
        preciseTimes.push(raw <= last ? last + 0.001 : raw);
      });
      $appdata.set("modules.media.times", preciseTimes);
    }
    return true;
  },

  async syncMonitors() {
    if (window.electronAPI && window.electronAPI.getDisplays) {
      const displays = await window.electronAPI.getDisplays();
      if (displays && displays.length > 1) {
        let selectedMonitors = $userdata.get("modules.config.slide_monitor");
        if (!Array.isArray(selectedMonitors)) {
          selectedMonitors = selectedMonitors ? [selectedMonitors] : [];
        }

        const primary = displays.find((d: any) => d.isPrimary) || displays[0];
        selectedMonitors = selectedMonitors.filter((m: any) => m !== (primary as any).id);

        const stageMonitorEnabled = $userdata.get("modules.config.stage_monitor_enabled");
        const stageMonitorDisplay = $userdata.get("modules.config.stage_monitor_display");
        if (stageMonitorEnabled && stageMonitorDisplay) {
          selectedMonitors = selectedMonitors.filter((m: any) => m !== stageMonitorDisplay);
        }

        const isMediaActive = $appdata.get("modules.media.id_music") !== null || $appdata.get("modules.media.show");

        await $popup.syncMonitors(selectedMonitors, "media", isMediaActive);
      }
    }
  },

  async syncStageMonitor() {
    if (window.electronAPI && window.electronAPI.getDisplays) {
      const displays = await window.electronAPI.getDisplays();
      if (displays && displays.length > 1) {
        const stageMonitorEnabled = $userdata.get("modules.config.stage_monitor_enabled");
        const stageMonitorDisplay = $userdata.get("modules.config.stage_monitor_display");
        let slideMonitors = $userdata.get("modules.config.slide_monitor") || [];
        if (!Array.isArray(slideMonitors)) {
          slideMonitors = slideMonitors ? [slideMonitors] : [];
        }
        const isDisplayInSlideMonitors = slideMonitors.includes(stageMonitorDisplay);
        const isMediaActive = $appdata.get("modules.media.id_music") !== null || $appdata.get("modules.media.show");

        if (!stageMonitorEnabled || !stageMonitorDisplay || !isDisplayInSlideMonitors || !isMediaActive) {
          $popup.closeStageMonitor();
        } else {
          const currentStageWindow: any = $appdata.get("stage_monitor_window");
          if (currentStageWindow && !currentStageWindow.closed && currentStageWindow.monitorId !== stageMonitorDisplay) {
            $popup.closeStageMonitor();
          }
        }

        // Sincroniza também a projeção normal de slides para que o monitor
        // volte para a projeção de slides comum (ou saia dela) instantaneamente
        await this.syncMonitors();

        if (stageMonitorEnabled && stageMonitorDisplay && isDisplayInSlideMonitors && isMediaActive) {
          const currentStageWindow: any = $appdata.get("stage_monitor_window");
          if (!currentStageWindow || currentStageWindow.closed || currentStageWindow.monitorId !== stageMonitorDisplay) {
            await $popup.openStageMonitor(stageMonitorDisplay);
          }
        }
      }
    }
  },

  close(force = false) {
    //Se force for true, fechamento forçado. Sem diálogo de confirmação!
    if (!force) {
      $alert.yesno("modules.media.alerts.close", (btn: any) => {
        if (btn === "yes") {
          this.close(true);
        }
      });
      return;
    }

    const sessionToClose = this._sessionId;

    // Se uma nova música já começou a abrir/carregar enquanto esta fechava, não interfira!
    if (this._sessionId !== sessionToClose) {
      return;
    }

    this.stopAudio();
    try {
      Telemetry.endSongPlay("closed");
    } catch {
      // ignore
    }
    this.clearVariables();
    $appdata.set("modules.media.show", false);
    $appdata.set("modules.media.minimized", false);
    $appdata.set("modules.media.config.fullscreen", false);
    $appdata.set("modules.media.user_exited_fullscreen", false);
    $appdata.set("modules.media.is_queue_standby", false);
    $appdata.set("modules.media.show_mini_player", true);

    // Fechar a projeção se estiver aberta
    if ($appdata.get("popup_module") === "media") {
      $popup.exit();
    }
    // Fechar a tela de retorno
    $popup.closeStageMonitor();

    this.clearQueue();
  },

  async openLyric(params: any) {
    if (params === null || params === undefined) {
      params = {
        id_music: $appdata.get("modules.media.id_music"),
        id_album: $appdata.get("modules.media.id_album"),
      };
    } else if (typeof params !== "object") {
      params = { id_music: params };
    }
    $dev.write("open lyric", params);

    const id_music = params.id_music;
    const id_album = params.id_album ? params.id_album : null;
    const highlight = params.highlight ? String(params.highlight).trim() : null;

    $appdata.set("modules.lyric.loading", true);

    const data = await $database.get<any>(`music_${id_music}`);
    if (data === null) {
      this.closeLyric();
      return;
    }

    $appdata.set("modules.lyric.data", data);

    $appdata.set("modules.lyric.id_music", id_music);
    $appdata.set("modules.lyric.id_album", id_album);
    $appdata.set("modules.lyric.config.title", data.name);
    $appdata.set("modules.lyric.highlight", highlight);

    this.setAlbumInfo(id_album, "lyric");

    $appdata.set("modules.lyric.show", true);
    $appdata.set("modules.lyric.loading", false);
  },
  closeLyric() {
    $dev.write("close lyric");
    $appdata.set("modules.lyric.show", false);

    $appdata.set("modules.lyric.data", {});
    $appdata.set("modules.lyric.id_music", null);
    $appdata.set("modules.lyric.id_album", null);
    $appdata.set("modules.lyric.config.title", null);
    $appdata.set("modules.lyric.highlight", null);
    $appdata.set("modules.lyric.loading", false);
  },

  async openAlbum(id_album: any) {
    $dev.write("open album", id_album);

    $appdata.set("modules.album.loading", true);

    const data = await $database.get<any>(`album_${id_album}`);
    if (data === null) {
      this.closeAlbum();
      return;
    }

    $appdata.set("modules.album.data", data);

    const hymnal = data.categories.filter((item: string) =>
      item.startsWith("hymnal."),
    )[0];
    if (hymnal) {
      $modules.open(hymnal.split(".")[1]);
      return;
    }

    $appdata.set("modules.album.id_album", id_album);
    $appdata.set("modules.album.show", true);
    $appdata.set("modules.album.loading", false);
  },
  closeAlbum() {
    $dev.write("close album");
    $appdata.set("modules.album.show", false);

    $appdata.set("modules.album.data", {});
    $appdata.set("modules.album.id_album", null);
    $appdata.set("modules.album.loading", false);
  },

  async openAudio(params: any) {
    if (typeof params !== "object") {
      params = { id_music: params };
    }
    $dev.write("open audio", params);

    const id_music = params.id_music;
    const mode = params.mode ? params.mode : "audio";

    $appdata.set("loading", true);

    const data = await $database.get<any>(`music_${id_music}`);
    if (data === null) {
      $appdata.set("loading", false);
      return;
    }

    const url =
      mode === "instrumental" ? data.url_instrumental_music : data.url_music;

    window.open($path.file(url), "_blank");

    $appdata.set("loading", false);
  },

  stopAudio() {
    const audioA = this.getElement("a");
    const audioB = this.getElement("b");
    try {
      audioA.pause();
    } catch {
      // Ignora erro ao pausar
    }
    try {
      audioB.pause();
    } catch {
      // Ignora erro ao pausar
    }
    audioA.removeAttribute("src");
    audioB.removeAttribute("src");
    try {
      audioA.load();
    } catch {
      // Ignora erro ao recarregar
    }
    try {
      audioB.load();
    } catch {
      // Ignora erro ao recarregar
    }
    $appdata.set("modules.media.config.is_paused", true);
  },

  clearVariables(keepFullscreen = false) {
    if (typeof window !== "undefined" && window.electronAPI?.streamingClearSlide) {
      window.electronAPI.streamingClearSlide();
    }
    $appdata.set("modules.media.data", {});
    $appdata.set("modules.media.id_music", null);
    $appdata.set("modules.media.external_audio_url", "");
    $appdata.set("modules.media.external_instrumental_url", "");
    $appdata.set("modules.media.config.title", "");
    $appdata.set("modules.media.config.subtitle", "");
    $appdata.set("modules.media.config.track", 0);
    $appdata.set("modules.media.config.image", "");
    $appdata.set("modules.media.config.slide_index", 0);
    $appdata.set("modules.media.config.last_slide", 0);
    $appdata.set("modules.media.config.audio", "");
    $appdata.set("modules.media.config.lazy", false);
    $appdata.set("modules.media.config.current_time", 0);
    $appdata.set("modules.media.config.duration", 0);
    $appdata.set("modules.media.config.progress", 0);
    $appdata.set("modules.media.config.slide_progress", 0);
    $appdata.set("modules.media.config.buffered", 0);
    $appdata.set("modules.media.config.volume", this.getVolume());
    $appdata.set("modules.media.config.is_paused", false);
    $appdata.set("modules.media.config.is_fading", false);
    if (!keepFullscreen) {
      $appdata.set("modules.media.config.fullscreen", false);
    }
  },

  minimize() {
    $appdata.set("modules.media.show", false);
    $appdata.set("modules.media.minimized", true);
    $appdata.set("modules.media.user_exited_fullscreen", true);
    if (!$appdata.get("modules.media.is_queue_standby")) {
      $appdata.set("modules.media.show_mini_player", true);
    }
  },

  maximize() {
    $appdata.set("modules.media.show", true);
    $appdata.set("modules.media.minimized", false);
  },

  isMinimized() {
    return $appdata.get("modules.media.minimized", false);
  },

  isLoading() {
    return $appdata.get("modules.media.loading", false);
  },

  config() {
    return $appdata.get("modules.media.config");
  },

  slides(): any[] {
    const data = $appdata.get("modules.media.data");
    const id_music = $appdata.get("modules.media.id_music");
    if (!data || !id_music || !data.name) return [];
    const showTitle = $userdata.get("modules.config.slide_show_title") !== false;

    let prev_image = data.url_image;
    let prev_image_position = data.image_position;

    const lyricsSlides = Object.values<any>(data.lyric || {})
      .filter((lyric) => lyric.show_slide === 1)
      .sort((a, b) => a.order - b.order)
      .map((lyric) => {
        if (lyric.url_image) {
          prev_image = lyric.url_image;
          prev_image_position = lyric.image_position;
        }
        return {
          ...(lyric as object),
          cover: false,
          lyric: lyric.lyric ? lyric.lyric.replace(/[\r\n]+/g, "<br>") : "",
          url_image: prev_image,
          image_position: prev_image_position,
        };
      });

    const id_album = $appdata.get("modules.media.id_album");
    const subtitle = $appdata.get("modules.media.config.subtitle") || this.getSubtitleFromData(data, id_album);

    return [
      {
        lyric: showTitle ? data.name : "",
        aux_lyric: showTitle ? (subtitle || "") : "",
        cover: true,
        time: "00:00:00",
        instrumental_time: "00:00:00",
        url_image: data.url_image,
        image_position: data.image_position,
      },
      ...lyricsSlides,
    ];
  },

  slide() {
    const slides = this.slides() ?? [];
    const index = $appdata.get("modules.media.config.slide_index");
    return slides[index];
  },

  syncStreaming() {
    if (typeof window !== "undefined" && window.electronAPI?.streamingPushSlide) {
      const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
      if (!hasMedia) {
        window.electronAPI.streamingClearSlide?.();
        return;
      }

      const slide = this.slide();
      const slides = this.slides() || [];
      const config = this.config();
      const slideIndex = config?.slide_index ?? 0;
      const nextSlide = slides[slideIndex + 1];

      if (!slide) {
        window.electronAPI.streamingClearSlide?.();
        return;
      }

      window.electronAPI.streamingPushSlide({
        type: "media",
        title: config?.title || slide?.lyric || "",
        subtitle: config?.subtitle || slide?.aux_lyric || "",
        author: config?.author || "",
        slideIndex,
        totalSlides: slides.length,
        isCover: slide.cover === true,
        currentLyric: slide.lyric || "",
        auxLyric: slide.aux_lyric || "",
        nextLyric: nextSlide ? nextSlide.lyric || "" : "",
        nextAuxLyric: nextSlide ? nextSlide.aux_lyric || "" : "",
        isNextCover: nextSlide ? nextSlide.cover === true : false,
        image: slide.url_image || null,
        imagePosition: slide.image_position,
        slideSettings: {
          customBg: $userdata.get("modules.config.slide_custom_bg") || false,
          bgColor: $userdata.get("modules.config.slide_bg_color") || "#000000",
          bgImage: $userdata.get("modules.config.slide_bg_image") || null,
          fontColor: $userdata.get("modules.config.slide_font_color") || "#FFFFFF",
          fontWeight: $userdata.get("modules.config.slide_font_weight") || "700",
          align: $userdata.get("modules.config.slide_align") || "Centro",
          removeTextBg: $userdata.get("modules.config.slide_remove_text_bg") || false,
        },
        isPaused: $appdata.get("modules.media.config.is_paused") === true,
        volume: this.getVolume(),
        updatedAt: Date.now(),
      });
    }
  },

  goToSlide(index: number) {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) {
      return;
    }
    const last_slide = $appdata.get("modules.media.config.last_slide");

    if (index > last_slide - 1) {
      index = last_slide - 1;
    }
    if (index < 0) {
      index = 0;
    }

    const duration = $appdata.get("modules.media.config.duration");
    const audio = $appdata.get("modules.media.config.audio");

    if (duration > 0 && audio !== "") {
      const times = $appdata.get("modules.media.times");
      this.goToTime(times[index] || 0);
    } else {
      $appdata.set("modules.media.config.slide_index", index);
    }
    this.syncStreaming();

    try {
      Telemetry.recordSlide(index);
    } catch {
      // ignore
    }
  },
  goToTime(time: number) {
    const audio = this.getElement();
    const duration = $appdata.get("modules.media.config.duration");
    if (time === undefined || time < 0) {
      time = 0;
    } else if (time > duration) {
      time = duration;
    }
    audio.currentTime = time;
  },
  advanceTime(time = 10) {
    const duration = $appdata.get("modules.media.config.duration");
    const audio = $appdata.get("modules.media.config.audio");
    const current_time = $appdata.get("modules.media.config.current_time");

    if (duration > 0 && audio !== "") {
      this.goToTime(current_time + time);
    }
  },

  play() {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) {
      return;
    }
    $appdata.set("modules.media.is_queue_standby", false);
    // Restore mini player popup if it was hidden (e.g. loaded via addToQueue with startPaused)
    if ($appdata.get("modules.media.show_mini_player") === false) {
      $appdata.set("modules.media.show_mini_player", true);
    }
    this.syncMonitors();
    this.pause(false);
  },
  pause(bool = true, callback?: () => void) {
    const audio = this.getElement();

    if (bool) {
      audio.pause();
      $appdata.set("modules.media.config.is_paused", bool);
      this.syncStreaming();
      if (callback) callback();
    } else {
      audio.play().catch((e: unknown) => {
        const errorMsg = e instanceof Error ? e.message : String(e || "");
        if (
          errorMsg.includes("interrupted by a call to pause") ||
          (e instanceof DOMException && e.name === "AbortError") ||
          (typeof e === "object" && e !== null && (e as { name?: string }).name === "AbortError")
        ) {
          // Chamada de play interrompida intencionalmente por pause, ignorar sem exibir alerta
          return;
        }
        if (errorMsg.includes("NotSupportedError") || errorMsg.includes("network") || errorMsg.includes("failed")) {
          const currentMode = $appdata.get("modules.media.config.mode");
          const musicData = $appdata.get("modules.media.data");
          let file = "";
          if (currentMode === "audio") file = musicData.url_music;
          else if (currentMode === "instrumental") file = musicData.url_instrumental_music;
          
          if (file) {
            $snackbar.show({ text: "Aviso: Arquivo ausente. Baixando e recuperando...", color: "warning", timeout: 4000 });
            if (window.electronAPI && window.electronAPI.downloadMedia) {
              window.electronAPI.downloadMedia("", "music", file).then(() => {
                this.open($appdata.get("modules.media.id_music"));
              });
              return;
            }
          }
        }

        $alert.error(
          {
            text: "modules.media.alerts.not_loaded",
            error: errorMsg,
          },
          (resp: any, a?: any) => {
            if (a) {
              this.open($appdata.get("modules.media.id_music"));
            }
          },
        );
      });
      const volume = this.getVolume() / 100;
      audio.volume = volume;
      $appdata.set("modules.media.config.is_paused", bool);
      this.syncStreaming();
      if (callback) callback();
    }
  },

  firstSlide() {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) return;
    this.goToSlide(0);
  },
  prevSlide() {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) return;
    const slide_index = $appdata.get("modules.media.config.slide_index");
    this.goToSlide(slide_index - 1);
  },
  nextSlide() {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) return;
    const slide_index = $appdata.get("modules.media.config.slide_index");
    this.goToSlide(slide_index + 1);
  },
  lastSlide() {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) return;
    const last_slide = $appdata.get("modules.media.config.last_slide");
    this.goToSlide(last_slide - 1);
  },
  playPause() {
    const hasMedia = Boolean($appdata.get("modules.media.id_music") || $appdata.get("modules.media.data")?.name);
    if (!hasMedia) {
      return false;
    }
    const audio = this.getElement();
    const isAudioPaused = (audio && audio.src && audio.src !== window.location.href) ? audio.paused : false;
    const isConfigPaused = $appdata.get("modules.media.config.is_paused") === true;
    const isPaused = isAudioPaused || isConfigPaused;

    if (isPaused) {
      this.play();
    } else {
      this.pause(true);
    }
    this.syncStreaming();
    return !isPaused;
  },
  getVolume(): number {
    const appVol = $appdata.get("modules.media.config.volume");
    if (typeof appVol === "number" && !isNaN(appVol)) {
      return appVol;
    }
    const userVol = $userdata.get("modules.media.volume");
    if (typeof userVol === "number" && !isNaN(userVol)) {
      return userVol;
    }
    return 100;
  },
  setVolume(val: number) {
    const clampedVal = Math.max(0, Math.min(100, Math.round(val)));
    const audio = this.getElement();
    audio.volume = clampedVal / 100;

    const audioA = document.getElementById("__audio_a") as HTMLAudioElement | null;
    const audioB = document.getElementById("__audio_b") as HTMLAudioElement | null;
    if (audioA) audioA.volume = clampedVal / 100;
    if (audioB) audioB.volume = clampedVal / 100;

    $appdata.set("modules.media.config.volume", clampedVal);
    $userdata.set("modules.media.volume", clampedVal);
    this.syncStreaming();
  },
  volumeUp(step = 5) {
    const current = this.getVolume();
    const next = Math.min(100, current + step);
    this.setVolume(next);
    return next;
  },
  volumeDown(step = 5) {
    const current = this.getVolume();
    const next = Math.max(0, current - step);
    this.setVolume(next);
    return next;
  },
  toogleVolume() {
    let volume = this.getVolume();
    volume = volume < 100 ? 100 : 0;
    this.setVolume(volume);
  },

  fullscreen(value = true) {
    $appdata.set("modules.media.config.fullscreen", value);
    if (!value) {
      $appdata.set("modules.media.user_exited_fullscreen", true);
    } else {
      $appdata.set("modules.media.user_exited_fullscreen", false);
    }
  },

  getSubtitleFromData(data: any, id_album?: any): string {
    if (!data) return "";
    if (data.albums && Array.isArray(data.albums) && data.albums.length > 0) {
      let album = null;
      if (id_album) {
        album = data.albums.find((item: any) => String(item.id_album) === String(id_album));
      }
      if (!album && data.albums.length === 1) {
        album = data.albums[0];
      } else if (!album && data.albums.length > 1) {
        const hymnalCategory = data.categories?.find((c: string) => c.startsWith("hymnal."));
        if (hymnalCategory) {
          const is1996 = hymnalCategory.includes("1996");
          album =
            data.albums.find((a: any) =>
              a.type === "hymnal" && (is1996 ? /1996/.test(a.name || "") : !/1996/.test(a.name || "")),
            ) ||
            data.albums.find((a: any) => a.type === "hymnal") ||
            data.albums.slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];
        } else {
          const primaryHymnal = $userdata.get("primary_hymnal") || "none";
          if (primaryHymnal === "hymnal_1996") {
            album = data.albums.find((a: any) => a.type === "hymnal" && a.name?.includes("1996"));
          } else if (primaryHymnal === "hymnal") {
            album = data.albums.find((a: any) => a.type === "hymnal" && !a.name?.includes("1996"));
          }
          if (!album) {
            album =
              data.albums.find((a: any) => a.type === "hymnal") ||
              data.albums.slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];
          }
        }
      }

      if (album) {
        let track = album.track ?? album.pivot?.track ?? data.track ?? 0;
        if (!track && data.albums) {
          const matchingWithTrack = data.albums.find(
            (a: any) => (a.id_album === album.id_album || a.type === "hymnal") && (a.track || a.pivot?.track),
          );
          if (matchingWithTrack) {
            track = matchingWithTrack.track ?? matchingWithTrack.pivot?.track ?? 0;
          }
        }
        if (typeof track === "string") {
          const parsed = parseInt(track, 10);
          track = isNaN(parsed) ? 0 : parsed;
        }

        const isHymnal =
          album.type === "hymnal" ||
          (album.name && /hin[aá]rio|himnario/i.test(album.name)) ||
          (data.categories && data.categories.some((c: string) => c.startsWith("hymnal.")));

        if (isHymnal && track > 0) {
          return `${track} - ${album.name}`;
        }
        return album.name || "";
      }
    }
    return data.subtitle || data.collectionName || "";
  },

  setAlbumInfo(id_album: any, module = "media") {
    const data = $appdata.get(`modules.${module}.data`);
    if (!data) {
      $appdata.set(`modules.${module}.config.subtitle`, "");
      $appdata.set(`modules.${module}.config.track`, 0);
      $appdata.set(`modules.${module}.config.image`, "");
      return;
    }

    let album = null;
    if (data.albums && Array.isArray(data.albums) && data.albums.length > 0) {
      if (id_album) {
        album = data.albums.find((item: any) => String(item.id_album) === String(id_album));
      }
      if (!album && data.albums.length === 1) {
        album = data.albums[0];
      } else if (!album && data.albums.length > 1) {
        const hymnalCategory = data.categories?.find((c: string) => c.startsWith("hymnal."));
        if (hymnalCategory) {
          const is1996 = hymnalCategory.includes("1996");
          album =
            data.albums.find((a: any) =>
              a.type === "hymnal" && (is1996 ? /1996/.test(a.name || "") : !/1996/.test(a.name || "")),
            ) ||
            data.albums.find((a: any) => a.type === "hymnal") ||
            data.albums.slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];
        } else {
          const primaryHymnal = $userdata.get("primary_hymnal") || "none";
          if (primaryHymnal === "hymnal_1996") {
            album = data.albums.find((a: any) => a.type === "hymnal" && a.name?.includes("1996"));
          } else if (primaryHymnal === "hymnal") {
            album = data.albums.find((a: any) => a.type === "hymnal" && !a.name?.includes("1996"));
          }
          if (!album) {
            album =
              data.albums.find((a: any) => a.type === "hymnal") ||
              data.albums.slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];
          }
        }
      }
    }

    const formattedSubtitle = this.getSubtitleFromData(data, id_album);
    let track = album?.track ?? album?.pivot?.track ?? data.track ?? 0;
    if (!track && data.albums) {
      const matchingWithTrack = data.albums.find(
        (a: any) => (a.id_album === album?.id_album || a.type === "hymnal") && (a.track || a.pivot?.track),
      );
      if (matchingWithTrack) {
        track = matchingWithTrack.track ?? matchingWithTrack.pivot?.track ?? 0;
      }
    }
    if (typeof track === "string") {
      const parsed = parseInt(track, 10);
      track = isNaN(parsed) ? 0 : parsed;
    }

    $appdata.set(`modules.${module}.config.subtitle`, formattedSubtitle);
    $appdata.set(`modules.${module}.config.track`, track);
    $appdata.set(`modules.${module}.config.image`, album?.url_image || data.url_image || "");
  },

  timeUpdate() {
    const duration_db =
      $appdata.get("modules.media.config.mode") === "audio"
        ? $appdata.get("modules.media.data.duration", "00:00")
        : $appdata.get("modules.media.data.instrumental_duration", "00:00");

    const audio = this.getElement();
    const current_time = isNaN(audio.currentTime) ? 0 : audio.currentTime;
    const duration =
      isNaN(audio.duration) || !isFinite(audio.duration)
        ? $datetime.toNumber(duration_db)
        : audio.duration;
    const progress = duration <= 0 ? 0 : (current_time / duration) * 100;
    let buffered = 0;

    $appdata.set("modules.media.config.current_time", current_time);
    $appdata.set("modules.media.config.duration", duration);
    $appdata.set("modules.media.config.progress", progress);

    if (!$appdata.get("modules.media.config.lazy")) {
      buffered = 100;
    } else {
      buffered = 0;
      const audio_buffered = audio.buffered; // Obter intervalos de buffer carregados
      if (audio_buffered.length > 0) {
        buffered = (audio_buffered.end(0) / audio.duration) * 100;
      }
    }

    $appdata.set("modules.media.config.buffered", buffered);

    const times = $appdata.get("modules.media.times");

    const slide_index =
      times && times?.length
        ? times.filter((time: number) => time <= current_time).length - 1
        : 0;
    const prevIndex = $appdata.get("modules.media.config.slide_index");
    const nextIndex = slide_index <= 0 ? 0 : slide_index;
    $appdata.set("modules.media.config.slide_index", nextIndex);
    if (prevIndex !== nextIndex) {
      this.syncStreaming();
      try {
        Telemetry.recordSlide(nextIndex);
      } catch {
        // ignore
      }
    }

    const start_time = times && times?.length ? times[slide_index] : 0;
    const end_time =
      times && times?.length ? times[slide_index + 1] || duration : duration;
    const slide_progress =
      ((current_time - start_time) / (end_time - start_time)) * 100;
    $appdata.set("modules.media.config.slide_progress", slide_progress);

    this.checkTime();
  },
  checkTime() {
    if ($appdata.get("modules.media.loading")) return;
    const is_paused = $appdata.get("modules.media.config.is_paused");
    const current_time = $appdata.get("modules.media.config.current_time");
    const duration = $appdata.get("modules.media.config.duration");
    if (!is_paused && current_time >= duration && duration > 0) {
      const loopMode = $appdata.get("modules.media.config.loop") || "none";
      if (loopMode === "track" || loopMode === true) {
        this.goToTime(0);
        this.play();
      } else {
        try {
          Telemetry.endSongPlay("completed");
        } catch {
          // ignore
        }
        this.playNext();
      }
    }
  },
  async fadeOut(audio: HTMLAudioElement, durationMs = 1000) {
    return new Promise<void>((resolve) => {
      const startVolume = audio.volume;
      if (startVolume <= 0 || audio.paused) return resolve();

      const step = startVolume / (durationMs / 50);
      const interval = setInterval(() => {
        if (audio.volume - step > 0) {
          audio.volume -= step;
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  },
  async fadeIn(audio: HTMLAudioElement, targetVolume: number, durationMs = 1000) {
    return new Promise<void>((resolve) => {
      audio.volume = 0;
      audio.play().catch(() => { });
      $appdata.set("modules.media.config.is_paused", false);

      const step = targetVolume / (durationMs / 50);
      const interval = setInterval(() => {
        if (audio.volume + step < targetVolume) {
          audio.volume += step;
        } else {
          audio.volume = targetVolume;
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  },
  switchActiveElement() {
    const active = $appdata.get("modules.media.config.active_audio") || "a";
    $appdata.set("modules.media.config.active_audio", active === "a" ? "b" : "a");
  },
  getElement(forceId: string | null = null): HTMLAudioElement {
    const active = forceId || $appdata.get("modules.media.config.active_audio") || "a";
    const id = `__audio_${active}`;

    let el = document.getElementById(id) as HTMLAudioElement | null;
    if (!el) {
      el = document.createElement("audio");
      el.setAttribute("id", id);
      el.setAttribute("preload", "auto");
      el.volume = this.getVolume() / 100;
      document.body.appendChild(el);

      el.addEventListener("timeupdate", () => {
        const currentActive = $appdata.get("modules.media.config.active_audio") || "a";
        if (el?.id === `__audio_${currentActive}`) {
          this.timeUpdate();
        }
      });
      el.addEventListener("progress", () => {
        const currentActive = $appdata.get("modules.media.config.active_audio") || "a";
        if (el?.id === `__audio_${currentActive}`) {
          this.timeUpdate();
        }
      });
      el.addEventListener("ended", () => {
        if (!el || !el.src || el.src === window.location.href) return;
        if ($appdata.get("modules.media.loading")) return;
        const currentActive = $appdata.get("modules.media.config.active_audio") || "a";
        if (el.id === `__audio_${currentActive}`) {
          try {
            const currentData = $appdata.get("modules.media.data");
            const currentAlbumId = $appdata.get("modules.media.id_album");
            const subtitle = this.getSubtitleFromData(currentData, currentAlbumId);
            const displayName = subtitle ? `${currentData?.name} (${subtitle})` : (currentData?.name || "");

            Telemetry.track("song_completed", {
              id_music: $appdata.get("modules.media.id_music"),
              name: displayName,
              song_title: currentData?.name || "",
              subtitle: subtitle || "",
            });
            Telemetry.endSongPlay("completed");
          } catch {
            // ignore
          }

          const loopMode = $appdata.get("modules.media.config.loop") || "none";
          
          if (loopMode === "track" || loopMode === true) { // keep true for legacy compatibility
            this.goToTime(0);
            this.play();
          } else {
            this.playNext();
          }
        }
      });
    }
    el.setAttribute("autoplay", "true");
    return el;
  },

  // --- Queue Methods ---
  isShuffle(): boolean {
    const current = $appdata.get("modules.media.config.shuffle");
    if (typeof current === "boolean") {
      return current;
    }
    const saved = $userdata.get("modules.media.config.shuffle");
    const val = typeof saved === "boolean" ? saved : false;
    $appdata.set("modules.media.config.shuffle", val);
    return val;
  },
  toggleShuffle(force?: boolean): boolean {
    const nextVal = typeof force === "boolean" ? force : !this.isShuffle();
    $appdata.set("modules.media.config.shuffle", nextVal);
    $userdata.set("modules.media.config.shuffle", nextVal);

    const queue = $appdata.get("modules.media.queue");
    if (queue && queue.items && queue.items.length > 0) {
      if (nextVal) {
        const curr = queue.currentIndex >= 0 ? queue.currentIndex : 0;
        queue.shuffleHistory = [curr];
        queue.historyIndex = 0;
      } else {
        queue.shuffleHistory = [];
        queue.historyIndex = -1;
      }
      $appdata.set("modules.media.queue", queue);
    }
    return nextVal;
  },
  initQueue() {
    if (!$appdata.get("modules.media.queue")) {
      $appdata.set("modules.media.queue", { items: [], currentIndex: -1, shuffleHistory: [], historyIndex: -1 });
    }
  },
  async playAll(musics: any[], mode: string = "audio", id_album: number | null = null, albumImage: string = "") {
    let filteredMusics = musics;
    if (mode === "instrumental") {
      filteredMusics = musics.filter((m: any) => m.has_instrumental_music === 1 || m.has_instrumental_music === true);
      
      if (filteredMusics.length === 0) {
        import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
          $snackbar.show({ text: "modules.media.alerts.no_instrumental_in_album", color: "warning", timeout: 3000 });
        });
        return;
      } else if (filteredMusics.length < musics.length) {
        import("@/helpers/ui/Snackbar").then(({ default: $snackbar }) => {
          $snackbar.show({ text: "modules.media.alerts.some_instrumental_omitted", color: "info", timeout: 4000 });
        });
      }
    }

    $appdata.set("modules.media.user_exited_fullscreen", false);
    this.initQueue();
    const queue = $appdata.get("modules.media.queue");
    
    // Set queue to the musics array
    queue.items = filteredMusics.map((music: any) => ({
      id_music: music.id_music,
      mode,
      name: music.name,
      subtitle: "", // will be filled when opened
      url_image: music.url_image || albumImage || "",
      id_album,
    }));
    
    const isShuffle = this.isShuffle();
    const startIndex = (isShuffle && queue.items.length > 1)
      ? Math.floor(Math.random() * queue.items.length)
      : 0;
    queue.currentIndex = startIndex;
    queue.shuffleHistory = queue.items.length > 0 ? [startIndex] : [];
    queue.historyIndex = queue.items.length > 0 ? 0 : -1;
    $appdata.set("modules.media.queue", queue);
    
    // Play the item
    if (queue.items.length > 0) {
      this.playFromQueue(startIndex);
    }
  },
  async addToQueue(item: { id_music: number, mode: string }) {
    this.initQueue();
    const queue = $appdata.get("modules.media.queue");
    
    const data: any = await $database.get(`music_${item.id_music}`);
    
    if (data) {
      const queueAlbumId = data.albums && data.albums.length > 0 ? data.albums[0].id_album : null;
      const queueItem = {
        id_music: item.id_music,
        mode: item.mode,
        name: data.name,
        subtitle: this.getSubtitleFromData(data, queueAlbumId),
        url_image: data.url_image,
        id_album: queueAlbumId,
      };
      
      queue.items.push(queueItem);
      $appdata.set("modules.media.queue", queue);
      $snackbar.show({ text: "modules.media.queue.added", color: "success", timeout: 3000 });
      
      if (!$appdata.get("modules.media.id_music")) {
        this.open({
          id_music: queueItem.id_music,
          mode: queueItem.mode,
          id_album: queueItem.id_album,
          fromQueue: true,
          minimized: true,
          startPaused: true,
        });
        $appdata.set("modules.media.queue_highlight", true);
      }
    }
  },
  removeFromQueue(index: number) {
    const queue = $appdata.get("modules.media.queue");
    if (queue && queue.items[index]) {
      queue.items.splice(index, 1);

      if (Array.isArray(queue.shuffleHistory)) {
        queue.shuffleHistory = queue.shuffleHistory
          .filter((i: number) => i !== index)
          .map((i: number) => (i > index ? i - 1 : i));
        if (queue.historyIndex >= queue.shuffleHistory.length) {
          queue.historyIndex = queue.shuffleHistory.length - 1;
        }
      }

      if (index < queue.currentIndex) {
        queue.currentIndex--;
      } else if (index === queue.currentIndex) {
        // Current item removed, play the new one at this index (or stop if it was the last)
        this.playNext(true);
      }
      $appdata.set("modules.media.queue", queue);
    }
  },
  clearQueue() {
    $appdata.set("modules.media.queue", { items: [], currentIndex: -1, shuffleHistory: [], historyIndex: -1 });
  },
  reorderQueue(fromIndex: number, toIndex: number) {
    const queue = $appdata.get("modules.media.queue");
    if (queue) {
      const item = queue.items.splice(fromIndex, 1)[0];
      queue.items.splice(toIndex, 0, item);
      
      const remap = (idx: number) => {
        if (idx === fromIndex) return toIndex;
        if (fromIndex < toIndex && idx > fromIndex && idx <= toIndex) return idx - 1;
        if (fromIndex > toIndex && idx >= toIndex && idx < fromIndex) return idx + 1;
        return idx;
      };

      if (Array.isArray(queue.shuffleHistory)) {
        queue.shuffleHistory = queue.shuffleHistory.map(remap);
      }

      // Update currentIndex if affected
      if (queue.currentIndex === fromIndex) {
        queue.currentIndex = toIndex;
      } else if (fromIndex < queue.currentIndex && toIndex >= queue.currentIndex) {
        queue.currentIndex--;
      } else if (fromIndex > queue.currentIndex && toIndex <= queue.currentIndex) {
        queue.currentIndex++;
      }
      
      $appdata.set("modules.media.queue", queue);
    }
  },
  playNext(stayOnCurrentIndex = false) {
    if ($appdata.get("modules.media.loading")) return;
    const queue = $appdata.get("modules.media.queue");
    if (!queue || queue.items.length === 0) {
      this.markNaturalEnd();
      this.close(true);
      return;
    }

    if (stayOnCurrentIndex) {
      const idx = queue.currentIndex >= 0 && queue.currentIndex < queue.items.length ? queue.currentIndex : 0;
      this.playFromQueue(idx);
      return;
    }

    const isShuffle = this.isShuffle();
    if (isShuffle && queue.items.length > 1) {
      if (!Array.isArray(queue.shuffleHistory)) {
        queue.shuffleHistory = queue.currentIndex >= 0 ? [queue.currentIndex] : [];
        queue.historyIndex = queue.shuffleHistory.length - 1;
      }

      // If user navigated backwards previously with playPrev, advance in history first
      if (queue.historyIndex >= 0 && queue.historyIndex < queue.shuffleHistory.length - 1) {
        queue.historyIndex++;
        const targetIndex = queue.shuffleHistory[queue.historyIndex];
        if (targetIndex >= 0 && targetIndex < queue.items.length) {
          $appdata.set("modules.media.queue", queue);
          this.playFromQueue(targetIndex);
          return;
        }
      }

      // Find all unplayed indices in the queue
      const playedSet = new Set(queue.shuffleHistory);
      const unplayed: number[] = [];
      for (let i = 0; i < queue.items.length; i++) {
        if (!playedSet.has(i)) {
          unplayed.push(i);
        }
      }

      if (unplayed.length > 0) {
        const nextIndex = unplayed[Math.floor(Math.random() * unplayed.length)];
        queue.shuffleHistory.push(nextIndex);
        queue.historyIndex = queue.shuffleHistory.length - 1;
        $appdata.set("modules.media.queue", queue);
        this.playFromQueue(nextIndex);
        return;
      }

      // All items in the queue have been played in this shuffle cycle!
      const loopMode = $appdata.get("modules.media.config.loop") || "none";
      if (loopMode === "queue") {
        // Reset shuffle history for next cycle, avoiding repeating the song that just played
        const candidates: number[] = [];
        for (let i = 0; i < queue.items.length; i++) {
          if (i !== queue.currentIndex) {
            candidates.push(i);
          }
        }
        const nextIndex = candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : 0;
        queue.shuffleHistory = [nextIndex];
        queue.historyIndex = 0;
        $appdata.set("modules.media.queue", queue);
        this.playFromQueue(nextIndex);
        return;
      }
      this.markNaturalEnd();
      this.close(true);
      return;
    }

    // Normal sequential playback
    let nextIndex = queue.currentIndex + 1;

    if (nextIndex >= queue.items.length || nextIndex < 0) {
      const loopMode = $appdata.get("modules.media.config.loop") || "none";
      if (loopMode === "queue" && queue.items.length > 0) {
        nextIndex = 0; // Loop back to start of queue
      } else {
        // Reached the end of queue or invalid
        this.markNaturalEnd();
        this.close(true);
        return;
      }
    }

    this.playFromQueue(nextIndex);
  },
  playPrev() {
    if ($appdata.get("modules.media.loading")) return;
    const queue = $appdata.get("modules.media.queue");
    if (!queue || queue.items.length === 0) return;

    const isShuffle = this.isShuffle();
    if (isShuffle && Array.isArray(queue.shuffleHistory) && queue.shuffleHistory.length > 0) {
      if (queue.historyIndex > 0) {
        queue.historyIndex--;
        const prevIndex = queue.shuffleHistory[queue.historyIndex];
        if (prevIndex >= 0 && prevIndex < queue.items.length) {
          $appdata.set("modules.media.queue", queue);
          this.playFromQueue(prevIndex);
          return;
        }
      }
      this.goToTime(0);
      return;
    }

    let prevIndex = queue.currentIndex - 1;
    if (prevIndex < 0) {
      const loopMode = $appdata.get("modules.media.config.loop") || "none";
      if (loopMode === "queue") {
        prevIndex = queue.items.length - 1;
      } else {
        prevIndex = 0;
      }
    }

    this.playFromQueue(prevIndex);
  },
  toggleBlackout() {
    const current = $appdata.get("projection_blackout") === true;
    $appdata.set("projection_blackout", !current);
    if (!current) {
      if (typeof window !== "undefined" && window.electronAPI?.streamingClearSlide) {
        window.electronAPI.streamingClearSlide();
      }
    } else {
      this.syncStreaming();
    }
  },
  // Contador que só sobe quando a faixa termina naturalmente e não há mais nada
  // pra tocar em seguida (nem no loop, nem na fila própria do $media) — diferente
  // de um fechamento manual do player. Outros módulos usam isso pra saber a hora
  // certa de avançar pro próximo item de uma fila de reprodução própria.
  markNaturalEnd() {
    try {
      Telemetry.endSongPlay("completed");
    } catch {
      // ignore
    }
    $appdata.set("modules.media.config.natural_end_seq", ($appdata.get("modules.media.config.natural_end_seq") || 0) + 1);
  },
  playFromQueue(index: number) {
    const queue = $appdata.get("modules.media.queue");
    if (queue && queue.items[index]) {
      queue.currentIndex = index;

      const isShuffle = this.isShuffle();
      if (isShuffle) {
        if (!Array.isArray(queue.shuffleHistory)) {
          queue.shuffleHistory = [index];
          queue.historyIndex = 0;
        } else {
          const currHistoryItem = queue.historyIndex >= 0 ? queue.shuffleHistory[queue.historyIndex] : -1;
          if (currHistoryItem !== index) {
            if (queue.historyIndex >= 0 && queue.historyIndex < queue.shuffleHistory.length - 1) {
              queue.shuffleHistory = queue.shuffleHistory.slice(0, queue.historyIndex + 1);
            }
            queue.shuffleHistory.push(index);
            queue.historyIndex = queue.shuffleHistory.length - 1;
          }
        }
      }

      $appdata.set("modules.media.queue", queue);
      const item = queue.items[index];
      this.open({ id_music: item.id_music, mode: item.mode, id_album: item.id_album, fromQueue: true });
    }
  },
  playOnlineVideo(video: { id: string; name: string; channelName?: string; image?: string; isMuted?: boolean }) {
    if ($appdata.get("modules.media.id_music")) {
      this.close(true);
    }
    $appdata.set("modules.external_media.filePath", `youtube:${video.id}`);
    $appdata.set("modules.external_media.title", video.name);
    $appdata.set("modules.external_media.subtitle", video.channelName || "Coletânea Online");
    $appdata.set("modules.external_media.image", video.image || "");
    $appdata.set("modules.external_media.minimized", false);
    $appdata.set("modules.external_media.show", true);
    const currentVol = $appdata.get("modules.external_media.config.volume") ?? ($userdata.get("modules.external_media.volume") ?? 100);
    $appdata.set("modules.external_media.config", {
      is_paused: false,
      current_time: 0,
      progress: 0,
      duration: 0,
      volume: video.isMuted ? 0 : currentVol,
    });
  },
  async playExternalFile(item: { name: string; filePathAudio?: string | null; filePathInstrumental?: string | null; custom_collection_name?: string }, mode: "audio" | "instrumental" | "no_audio" = "audio") {
    const rawPath = mode === "instrumental" ? item.filePathInstrumental : item.filePathAudio;
    if (!rawPath) return;

    if (/\.(slja|sja|lja)$/i.test(rawPath)) {
      await this.playExternalSlja(rawPath, mode);
      return;
    }

    if ($appdata.get("modules.media.id_music")) {
      this.close(true);
    }
    const ext = rawPath.split(".").pop()?.toLowerCase() || "";
    const isAudio = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext);

    $appdata.set("modules.external_media.filePath", rawPath);
    $appdata.set("modules.external_media.title", item.name);
    $appdata.set("modules.external_media.subtitle", mode === "instrumental" ? "Playback" : mode === "no_audio" ? "Sem Áudio" : (item.custom_collection_name || ""));
    $appdata.set("modules.external_media.image", "");
    $appdata.set("modules.external_media.minimized", isAudio);
    $appdata.set("modules.external_media.show", !isAudio);
    const currentVol = $appdata.get("modules.external_media.config.volume") ?? ($userdata.get("modules.external_media.volume") ?? 100);
    $appdata.set("modules.external_media.config", {
      is_paused: false,
      current_time: 0,
      progress: 0,
      duration: 0,
      volume: mode === "no_audio" ? 0 : currentVol,
    });
  },
};
