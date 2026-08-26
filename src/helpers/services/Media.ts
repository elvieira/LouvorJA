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

export default {
  async open(params: any) {
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
      
      $appdata.set("modules.external_media.filePath", "");
      $appdata.set("modules.external_media.show", false);
    }

    const mode = params.mode ? params.mode : "no_audio";
    const currentMode = $appdata.get("modules.media.config.mode");
    const isSameSong = params.id_music === $appdata.get("modules.media.id_music");

    if (isSameSong && mode === currentMode) {
      this.maximize();
      return true;
    }

    let savedTime = 0;

    let audio = this.getElement();
    // const volume = $appdata.get("modules.media.config.volume") / 100;
    const fadeAudioEnabled = $userdata.get("modules.media.fade_audio") !== false;

    if (isSameSong) {
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
      this.clearVariables();
      audio = this.getElement();
    }

    const id_music = params.id_music;
    const minimized = params.minimized ? params.minimized : false;
    const id_album = params.id_album ? params.id_album : null;


    $appdata.set("modules.media.loading", true);

    const data = await $database.get<any>(`music_${id_music}`);
    if (data === null) {
      this.close(true);
      return false;
    }

    if (!isSameSong) {
      $appdata.set("modules.media.data", data);
      $appdata.set("modules.media.id_music", id_music);
      $appdata.set("modules.media.id_album", id_album);
      $appdata.set("modules.media.config.slide_index", 0);
      $appdata.set("modules.media.config.title", data.name);
      $appdata.set("modules.media.config.last_slide", this.slides().length);
      $appdata.set("modules.media.times", []);
      this.setAlbumInfo(id_album);
    }

    if (!params.fromQueue) {
      this.initQueue();
      const queue = $appdata.get("modules.media.queue");
      queue.items = [{
        id_music,
        mode: mode === "instrumental" && !data.has_instrumental_music ? "audio" : mode,
        name: data.name,
        subtitle: data.albums && data.albums.length > 0 ? data.albums[0].name : "",
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
    
    const willGoFullscreen = slideFullscreen && !(disableIfExtended && hasExtended);
    
    let shouldMaximize = true;
    
    if (minimized) {
      shouldMaximize = false;
    } else if (minimizePlayer && !willGoFullscreen) {
      shouldMaximize = false;
    }

    if (shouldMaximize) {
      this.maximize();
    } else {
      this.minimize();
    }

    if (mode === "audio" || mode === "instrumental") {
      //Será executado com áudio... cria o elemento de audio
      const audio = this.getElement();
      const volume = $appdata.get("modules.media.config.volume");
      audio.volume = volume / 100;

      this.pause(true);
      if (!isSameSong) {
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
      const targetAudioUrl = $path.file(urlPath);

      // Interceptação Offline (Desktop)
      if (window.electronAPI && window.electronAPI.isElectron) {
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

      if (isSameSong && savedTime > 0) {
        audio.currentTime = savedTime;
        if (fadeAudioEnabled) {
          this.fadeIn(audio, volume / 100, 1000).catch(() => { });
        } else {
          this.play();
        }
      } else {
        this.play();
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

        if (selectedMonitors.length > 0) {
          const { default: $popup } = await import("@/helpers/ui/Popup");
          await $popup.syncMonitors(selectedMonitors, "media", true);
        }
      }
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

        const isMediaActive = $appdata.get("modules.media.id_music") !== null;

        const { default: $popup } = await import("@/helpers/ui/Popup");
        await $popup.syncMonitors(selectedMonitors, "media", isMediaActive);
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

    this.stopAudio();
    this.clearVariables();
    $appdata.set("modules.media.show", false);
    $appdata.set("modules.media.minimized", false);

    // Fechar a projeção se estiver aberta
    import("@/helpers/ui/Popup").then(({ default: $popup }) => {
      if ($appdata.get("popup_module") === "media") {
        $popup.exit();
      }
    });

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
    this.pause(true, () => {
      audioA.setAttribute("src", "");
      audioB.setAttribute("src", "");
    });
  },

  clearVariables() {
    $appdata.set("modules.media.data", {});
    $appdata.set("modules.media.id_music", null);
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
    $appdata.set("modules.media.config.volume", 100);
    $appdata.set("modules.media.config.is_paused", false);
    $appdata.set("modules.media.config.is_fading", false);
  },

  minimize() {
    $appdata.set("modules.media.show", false);
    $appdata.set("modules.media.minimized", true);
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

    return [
      {
        lyric: showTitle ? data.name : "",
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

  goToSlide(index: number) {
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
    this.pause(false);
  },
  pause(bool = true, callback?: () => void) {
    const audio = this.getElement();

    if (bool) {
      audio.pause();
      $appdata.set("modules.media.config.is_paused", bool);
      if (callback) callback();
    } else {
      audio.play().catch((e: unknown) => {
        const errorMsg = e instanceof Error ? e.message : String(e || "");
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
      const volume = $appdata.get("modules.media.config.volume") / 100;
      audio.volume = volume;
      if (callback) callback();
      $appdata.set("modules.media.config.is_paused", bool);
    }
  },

  firstSlide() {
    this.goToSlide(0);
  },
  prevSlide() {
    const slide_index = $appdata.get("modules.media.config.slide_index");
    this.goToSlide(slide_index - 1);
  },
  nextSlide() {
    const slide_index = $appdata.get("modules.media.config.slide_index");
    this.goToSlide(slide_index + 1);
  },
  lastSlide() {
    const last_slide = $appdata.get("modules.media.config.last_slide");
    this.goToSlide(last_slide - 1);
  },
  setVolume(val: number) {
    const audio = this.getElement();
    audio.volume = val / 100;
    $appdata.set("modules.media.config.volume", val);
  },
  toogleVolume() {
    let volume = $appdata.get("modules.media.config.volume");
    volume = volume < 100 ? 100 : 0;
    this.setVolume(volume);
  },

  fullscreen(value = true) {
    $appdata.set("modules.media.config.fullscreen", value);
  },

  setAlbumInfo(id_album: any, module = "media") {
    const data = $appdata.get(`modules.${module}.data`);
    if (data.albums.length <= 0) {
      $appdata.set(`modules.${module}.config.subtitle`, "");
      $appdata.set(`modules.${module}.config.track`, 0);
      $appdata.set(`modules.${module}.config.image`, "");
      return;
    }

    let album = null;
    if (id_album) {
      album = data.albums.filter((item: any) => item.id_album === id_album)[0];
    } else if (data.albums.length === 1) {
      album = data.albums[0];
    } else {
      album = data.albums.sort((a: any, b: any) => a.order - b.order)[0];
    }

    if (!album) {
      $appdata.set(`modules.${module}.config.subtitle`, "");
      $appdata.set(`modules.${module}.config.track`, 0);
      $appdata.set(`modules.${module}.config.image`, "");
      return;
    }

    $appdata.set(`modules.${module}.config.subtitle`, album.name);
    $appdata.set(`modules.${module}.config.track`, album.track);
    $appdata.set(`modules.${module}.config.image`, album.url_image);
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
    $appdata.set(
      "modules.media.config.slide_index",
      slide_index <= 0 ? 0 : slide_index,
    );

    const start_time = times && times?.length ? times[slide_index] : 0;
    const end_time =
      times && times?.length ? times[slide_index + 1] || duration : duration;
    const slide_progress =
      ((current_time - start_time) / (end_time - start_time)) * 100;
    $appdata.set("modules.media.config.slide_progress", slide_progress);

    this.checkTime();
  },
  checkTime() {
    const is_paused = $appdata.get("modules.media.config.is_paused");
    const current_time = $appdata.get("modules.media.config.current_time");
    const duration = $appdata.get("modules.media.config.duration");
    if (!is_paused && current_time >= duration && duration > 0) {
      this.playNext();
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
        const currentActive = $appdata.get("modules.media.config.active_audio") || "a";
        if (el?.id === `__audio_${currentActive}`) {
          const isLoop = $appdata.get("modules.media.config.loop") === true;
          if (isLoop) {
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
  initQueue() {
    if (!$appdata.get("modules.media.queue")) {
      $appdata.set("modules.media.queue", { items: [], currentIndex: -1 });
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
    
    queue.currentIndex = 0;
    $appdata.set("modules.media.queue", queue);
    
    // Play the first item
    if (queue.items.length > 0) {
      this.playFromQueue(0);
    }
  },
  async addToQueue(item: { id_music: number, mode: string }) {
    this.initQueue();
    const queue = $appdata.get("modules.media.queue");
    
    const data: any = await $database.get(`music_${item.id_music}`);
    
    if (data) {
      const queueItem = {
        id_music: item.id_music,
        mode: item.mode,
        name: data.name,
        subtitle: data.albums && data.albums.length > 0 ? data.albums[0].name : "",
        url_image: data.url_image,
        id_album: data.albums && data.albums.length > 0 ? data.albums[0].id_album : null,
      };
      
      queue.items.push(queueItem);
      $appdata.set("modules.media.queue", queue);
      $snackbar.show({ text: "modules.media.queue.added", color: "success", timeout: 3000 });
    }
  },
  removeFromQueue(index: number) {
    const queue = $appdata.get("modules.media.queue");
    if (queue && queue.items[index]) {
      queue.items.splice(index, 1);
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
    $appdata.set("modules.media.queue", { items: [], currentIndex: -1 });
  },
  reorderQueue(fromIndex: number, toIndex: number) {
    const queue = $appdata.get("modules.media.queue");
    if (queue) {
      const item = queue.items.splice(fromIndex, 1)[0];
      queue.items.splice(toIndex, 0, item);
      
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
    const queue = $appdata.get("modules.media.queue");
    if (!queue || queue.items.length === 0) {
      this.close(true);
      return;
    }
    
    // Find next valid index
    const nextIndex = stayOnCurrentIndex ? queue.currentIndex : queue.currentIndex + 1;
    if (nextIndex >= queue.items.length || nextIndex < 0) {
      // Reached the end of queue or invalid
      this.close(true);
      return;
    }
    
    this.playFromQueue(nextIndex);
  },
  playFromQueue(index: number) {
    const queue = $appdata.get("modules.media.queue");
    if (queue && queue.items[index]) {
      queue.currentIndex = index;
      $appdata.set("modules.media.queue", queue);
      const item = queue.items[index];
      this.open({ id_music: item.id_music, mode: item.mode, id_album: item.id_album, fromQueue: true });
    }
  },
};
