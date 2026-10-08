<template>
  <v-app id="app-container">
    <AppTitlebar v-if="!isPopupWindow" />
    <AppAlert v-if="!isPopupWindow" />
    <AppSnackbar v-if="!isPopupWindow" />
    <FirstBootLoader v-if="!isPopupWindow" @boot-complete="isAppReady = true" />
    <template v-if="isAppReady">
      <AppLoading v-if="!isPopupWindow" />
      <v-btn
        v-show="false"
        v-shortkey="['ctrl', 'alt', 'd']"
        @shortkey="handleKeydown()"
      />
      <router-view />
    </template>
  </v-app>
</template>

<script>
import AppLoading from "@/layout/Loading.vue";
import FirstBootLoader from "@/layout/FirstBootLoader.vue";
import AppTitlebar from "@/layout/Titlebar.vue";
import AppAlert from "@/layout/Alert.vue";
import AppSnackbar from "@/layout/Snackbar.vue";
import { openFavorites } from "@/helpers/services/Favorites";
import { fetchWithFallback } from "@/helpers/services/Api";


export default {
  name: "App",
  components: {
    AppLoading,
    FirstBootLoader,
    AppTitlebar,
    AppAlert,
    AppSnackbar,
  },
  data() {
    const isPopup = typeof window !== "undefined" && (window.location.href.includes("popup") || window.location.href.includes("stage-monitor"));
    return {
      isAppReady: isPopup,
      isPopupWindow: isPopup,
      lastEscTime: 0,
    };
  },
  watch: {
    isAppReady(newVal) {
      if (newVal && !this.isPopupWindow) {
        this.initBackgroundTasks();
      }
    },
  },
  created() {
    this.$userdata.load();
    const savedVolume = this.$userdata.get("modules.media.volume");
    if (typeof savedVolume === "number" && !isNaN(savedVolume)) {
      this.$appdata.set("modules.media.config.volume", savedVolume);
    }
    const theme = this.$userdata.get("theme");
    if (theme !== "") {
      this.$vuetify.theme.global.name = theme;
    }
  },
  async mounted() {
    window.addEventListener("keydown", this.handleGlobalKeydown);
    
    if (!this.isPopupWindow) {
      if (window.electronAPI && window.electronAPI.isElectron) {
        const currentLang = this.$i18n.locale || "pt";
        const isComplete = await window.electronAPI.getLocalDb(`sfbc_${currentLang}`);
        if (isComplete && isComplete.complete) {
          this.isAppReady = true;
        }
      } else {
        this.isAppReady = true;
      }

      if (this.isAppReady) {
        this.initBackgroundTasks();
      }

      if (window.electronAPI) {
        if (window.electronAPI.onMenuAction) {
          window.electronAPI.onMenuAction((action, payload) => {
            this.handleMenuAction(action, payload);
          });
        }
        if (window.electronAPI.onCycleModuleGroup) {
          window.electronAPI.onCycleModuleGroup((groupKey) => {
            this.cycleModuleGroup(groupKey);
          });
        }
      }
    }
  },
  unmounted() {
    window.removeEventListener("keydown", this.handleGlobalKeydown);
  },
  methods: {
    initBackgroundTasks() {
      if (this._backgroundTasksInitialized) return;
      this._backgroundTasksInitialized = true;

      if (window.electronAPI && window.electronAPI.getDisplays) {
        window.electronAPI.getDisplays().then(displays => {
          this.$appdata.set("system_displays", displays);
        });
        
        if (window.electronAPI.onDisplaysChanged) {
          window.electronAPI.onDisplaysChanged(async () => {
            const displays = await window.electronAPI.getDisplays();
            this.$appdata.set("system_displays", displays);
            
            if (displays.length === 1) {
              const { default: $popup } = await import("@/helpers/ui/Popup");
              $popup.exit();
            }
          });
        }
      }

      // Auto-iniciar Servidor de Streaming (se configurado) e registrar ações remotas
      if (window.electronAPI && window.electronAPI.streamingStart) {
        const autoStart = this.$userdata.get("modules.streaming.autostart") === true;
        if (autoStart) {
          const savedPort = this.$userdata.get("modules.streaming.port");
          const port = savedPort && Number(savedPort) !== 7070 ? Number(savedPort) : 7071;
          const host = this.$userdata.get("modules.streaming.host") || "0.0.0.0";
          const token = this.$userdata.get("modules.streaming.token") || "";
          window.electronAPI.streamingStart({ port, host, token }).catch((err) => {
            console.error("[Streaming] Erro ao auto-iniciar servidor:", err);
          });
        }
      }

      if (window.electronAPI && window.electronAPI.onStreamingRemoteAction) {
        window.electronAPI.onStreamingRemoteAction(async (data) => {
          const { action, params } = data;
          if (action === "song-slides") {
            const hasMedia = Boolean(this.$appdata.get("modules.media.id_music") || this.$appdata.get("modules.media.data")?.name);
            if (params.action === "close") {
              const force = params.force === "true";
              this.$media.close(force);
            } else if (hasMedia) {
              if (params.action === "next") {
                this.$media.nextSlide();
              } else if (params.action === "previous") {
                this.$media.prevSlide();
              }
            }
          } else if (action === "play-pause") {
            const hasMedia = Boolean(this.$appdata.get("modules.media.id_music") || this.$appdata.get("modules.media.data")?.name);
            if (hasMedia) {
              this.$media.playPause();
            }
          } else if (action === "close-media") {
            const force = params.force === "true";
            this.$media.close(force);
          } else if (action === "keyboard") {
            const key = Number(params.key);
            const hasMedia = Boolean(this.$appdata.get("modules.media.id_music") || this.$appdata.get("modules.media.data")?.name);
            if (key === 39 && hasMedia) this.$media.nextSlide();
            else if (key === 37 && hasMedia) this.$media.prevSlide();
            else if (key === 38) this.$media.volumeUp();
            else if (key === 40) this.$media.volumeDown();
            else if (key === 32 && hasMedia) this.$media.playPause();
            else if (key === 27) {
              const force = params.force === "true";
              this.$media.close(force);
            }
          } else if (action === "volume") {
            if (params.action === "up") this.$media.volumeUp();
            else if (params.action === "down") this.$media.volumeDown();
            else if (params.value !== undefined) this.$media.setVolume(Number(params.value));
          } else if (action === "open-song") {
            const songId = Number(params.id);
            if (songId) {
              const tag = params.tag;
              let mode = "audio";
              if (params.mode) {
                mode = params.mode;
              } else if (tag === "2" || tag === "playback" || tag === "instrumental") {
                mode = "instrumental";
              } else if (tag === "3" || tag === "no_audio" || tag === "sem_audio") {
                mode = "no_audio";
              }
              this.$media.open({ id_music: songId, mode });
            }
          }
        });
      }
      
      // Inicia a sincronização silenciosa em background (se necessária)
      setTimeout(async () => {
        // Verificação de atualização do Banco de Dados
        if (window.electronAPI) {
          try {
            const response = await fetchWithFallback("/params?type=env");
            const text = await response.text();
            const dbVersionMatch = text.match(/db_version=(\d+)/);
            if (dbVersionMatch && dbVersionMatch[1]) {
              const remoteVersion = parseInt(dbVersionMatch[1], 10);
              const localConfig = await window.electronAPI.getLocalDb("config");
              const localVersion = (localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version) 
                ? parseInt(localConfig?.data?.version_number || localConfig?.version_number || localConfig?.db_version, 10) 
                : (window.electronAPI.getDatabaseVersion ? await window.electronAPI.getDatabaseVersion() : 0);
              
              this.$appdata.set("modules.sync.db_version_local", localVersion);
              this.$appdata.set("modules.sync.db_version_remote", remoteVersion);
              if (remoteVersion > localVersion) {
                this.$appdata.set("modules.sync.db_update_available", true);
              } else {
                this.$appdata.set("modules.sync.db_update_available", false);
              }
            }
          } catch (e) {
            console.error("Erro ao verificar versão do banco em background:", e);
          }
        }

        // Auto-healing e validação de arquivos ausentes
        if (window.electronAPI && window.electronAPI.validateInstallation) {
          const { getAllDevAvatars, recoverMissingAvatars, checkAndRefreshAvatars } = await import("@/helpers/services/Developers");
          const devAvatars = getAllDevAvatars();
          const missing = await window.electronAPI.validateInstallation(undefined, devAvatars.map(d => d.filename));
          if (missing && missing.totalMissing > 0) {
            const { default: $snackbar } = await import("@/helpers/ui/Snackbar");
            $snackbar.show({ text: `Recuperando ${missing.totalMissing} arquivos ausentes...`, loading: true, timeout: -1, color: "orange-darken-2" });
            
            // 1. Repara os .bin primeiro localmente
            if (missing.missingBins.length > 0) {
              await window.electronAPI.repairSysdata(missing.missingBins);
            }
            
            // 2. Baixa mídias ausentes via HTTP(S) (com fallback FTP interno)
            if (missing.missingCovers.length > 0) {
              for (const file of missing.missingCovers) await window.electronAPI.downloadMedia("", "covers", file);
            }
            if (missing.missingMusic.length > 0) {
              for (const file of missing.missingMusic) await window.electronAPI.downloadMedia("", "music", file);
            }
            if (missing.missingImages.length > 0) {
              for (const file of missing.missingImages) await window.electronAPI.downloadMedia("", "slides", file);
            }
            // 3. Baixa avatares dos desenvolvedores ausentes
            if (missing.missingAvatars && missing.missingAvatars.length > 0) {
              await recoverMissingAvatars(missing.missingAvatars);
            }
            
            // Adiciona um pequeno atraso para que o usuário consiga ler a mensagem de recuperação
            await new Promise(resolve => setTimeout(resolve, 1500));
            $snackbar.show({ text: "Todos os arquivos foram recuperados com sucesso!", color: "success", timeout: 3000 });
          } else {
            // Se nenhum arquivo estiver ausente, executa a verificação periódica de avatares (7 a 15 dias)
            checkAndRefreshAvatars();
          }
        } else {
          import("@/helpers/services/Developers").then(mod => mod.checkAndRefreshAvatars());
        }
      }, 5000);
    },
    handleKeydown() {
      console.log("click ");
      this.$dev.toogle();
    },
    cycleModuleGroup(groupKey) {
      const moduleGroup = this.$appdata.get(`module_group.${groupKey}`) || {};
      const modules = moduleGroup.modules || [];
      const language = this.$userdata.get("language") || "pt";
      const isDev = this.$appdata.get("is_dev");

      const visibleModules = modules.filter(id => {
        const mod = this.$appdata.get(`modules.${id}`);
        if (!mod) return false;
        if (mod.language && mod.language !== language) return false;
        if (mod.development && !isDev) return false;
        return true;
      });

      if (visibleModules.length === 0) return;

      const activeIndex = visibleModules.findIndex(id => this.$appdata.get(`modules.${id}.show`));
      const nextIndex = activeIndex !== -1 ? (activeIndex + 1) % visibleModules.length : 0;
      this.$modules.open(visibleModules[nextIndex]);
    },
    handleMenuAction(action, payload) {
      if (action === "play-pause") {
        this.$media.playPause();
      } else if (action === "next-slide") {
        this.$media.nextSlide();
      } else if (action === "prev-slide") {
        this.$media.prevSlide();
      } else if (action === "first-slide") {
        this.$media.firstSlide();
      } else if (action === "last-slide") {
        this.$media.lastSlide();
      } else if (action === "toggle-projection") {
        const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
        this.$media.fullscreen(!isFullscreen);
      } else if (action === "toggle-blackout") {
        this.$media.toggleBlackout();
      } else if (action === "toggle-audio-mode") {
        const hasInstrumental = !!this.$appdata.get("modules.media.data.url_instrumental_music");
        if (hasInstrumental) {
          const currentMode = this.$appdata.get("modules.media.config.mode") || "audio";
          const targetMode = currentMode === "instrumental" ? "audio" : "instrumental";
          const idMusic = this.$appdata.get("modules.media.id_music");
          const minimized = this.$appdata.get("modules.media.minimized");
          if (idMusic) {
            this.$media.open({ id_music: idMusic, mode: targetMode, minimized });
          }
        }
      } else if (action === "toggle-mute") {
        this.$media.toogleVolume();
      } else if (action === "toggle-queue") {
        this.$appdata.set("modules.media.show_queue", !this.$appdata.get("modules.media.show_queue"));
      } else if (action === "cycle-group") {
        this.cycleModuleGroup(payload);
      }
    },
    handleGlobalKeydown(e) {
      if (this.isPopupWindow) {
        return;
      }

      const isMac = Boolean(window.electronAPI && window.electronAPI.isMac) || (
        typeof navigator !== "undefined" && (
          navigator.userAgent.includes("Mac") || (navigator.platform && navigator.platform.includes("Mac"))
        )
      );

      // No Mac: Command+Q (⌘Q) encerra a aplicação com segurança (mesmo se estiver digitando em campo de texto)
      if (isMac && e.metaKey && !e.ctrlKey && (e.code === "KeyQ" || e.key?.toLowerCase() === "q")) {
        e.preventDefault();
        if (window.electronAPI?.windowControl) {
          window.electronAPI.windowControl("close");
        } else {
          window.close();
        }
        return;
      }

      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) {
        return;
      }

      // No Mac: estritamente Command (metaKey) e NUNCA Ctrl
      // No Windows e Linux: estritamente Ctrl (ctrlKey) e NUNCA Command/Windows key
      const isModifier = isMac ? (e.metaKey && !e.ctrlKey) : (e.ctrlKey && !e.metaKey);

      // 1. ESC / Duplo ESC (Fechar Mídia / Sair com ou sem confirmação)
      if (e.code === "Escape") {
        const popupModule = this.$appdata.get("popup_module");
        const externalMediaOpen = this.$appdata.get("modules.external_media.show");
        const isMediaActive = this.$appdata.get("modules.media.show") && !this.$appdata.get("modules.media.minimized");
        const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
        const isAnyMediaPlaying = isMediaActive || isFullscreen || externalMediaOpen || popupModule;

        if (isAnyMediaPlaying) {
          const now = Date.now();
          const isAlertShowing = this.$appdata.get("alert.show");
          const isDoubleEsc = (now - this.lastEscTime < 600) || isAlertShowing;
          this.lastEscTime = now;

          if (isDoubleEsc) {
            e.preventDefault();
            if (isAlertShowing) {
              this.$appdata.set("alert.show", false);
            }
            this.$media.close(true);
            if (externalMediaOpen) {
              this.$appdata.set("modules.external_media.show", false);
              this.$appdata.set("modules.external_media.minimized", false);
              this.$appdata.set("modules.external_media.filePath", null);
            }
            if (popupModule) {
              import("@/helpers/ui/Popup").then(({ default: $popup }) => {
                $popup.exit();
              });
            }
            this.lastEscTime = 0;
            return;
          }

          // Primeiro ESC: solicita confirmação de segurança
          e.preventDefault();
          if (externalMediaOpen || popupModule === "external_media") {
            const performClose = () => {
              this.$appdata.set("modules.external_media.show", false);
              this.$appdata.set("modules.external_media.minimized", false);
              this.$appdata.set("modules.external_media.filePath", null);
              if (popupModule) {
                import("@/helpers/ui/Popup").then(({ default: $popup }) => {
                  $popup.exit();
                });
              }
            };
            this.$alert.yesno({
              title: externalMediaOpen ? null : "alert.exit_projection_title",
              text: externalMediaOpen ? "modules.external_media.alerts.close" : "alert.exit_projection_text",
              translate: true,
            }, (btn) => {
              if (btn === "yes") performClose();
            });
          } else if (isMediaActive || isFullscreen) {
            this.$media.close();
          } else if (popupModule) {
            import("@/helpers/ui/Popup").then(({ default: $popup }) => {
              $popup.exit();
            });
          }
          return;
        }
      }

      // 2. Navegação entre Módulos do Sistema e Controles Globais via Ctrl/Cmd
      if (isModifier) {
        if (e.code === "KeyD" || e.key?.toLowerCase() === "d" || (e.shiftKey && (e.code === "KeyF" || e.key?.toLowerCase() === "f"))) {
          e.preventDefault();
          openFavorites();
          return;
        }
        if (e.code === "Digit1" || e.code === "Numpad1" || e.key === "1") {
          e.preventDefault();
          this.$modules.open("home");
          return;
        }
        if (e.code === "Digit2" || e.code === "Numpad2" || e.key === "2") {
          e.preventDefault();
          this.cycleModuleGroup("musics");
          return;
        }
        if (e.code === "Digit3" || e.code === "Numpad3" || e.key === "3") {
          e.preventDefault();
          this.$modules.open("bible");
          return;
        }
        if (e.code === "Digit4" || e.code === "Numpad4" || e.key === "4") {
          e.preventDefault();
          this.cycleModuleGroup("utilities");
          return;
        }
        if (e.code === "Digit5" || e.code === "Numpad5" || e.key === "5") {
          e.preventDefault();
          this.cycleModuleGroup("online_collection");
          return;
        }
        if (e.code === "Digit6" || e.code === "Numpad6" || e.key === "6") {
          e.preventDefault();
          this.cycleModuleGroup("personalized");
          return;
        }
        if (e.code === "Digit7" || e.code === "Numpad7" || e.key === "7") {
          e.preventDefault();
          this.$modules.open("liturgy");
          return;
        }
        if (e.code === "KeyL" || e.key?.toLowerCase() === "l") {
          e.preventDefault();
          this.$appdata.set("modules.sync.view", "library");
          this.$modules.open("sync");
          return;
        }
        if (e.code === "KeyH" || e.key?.toLowerCase() === "h") {
          e.preventDefault();
          this.$modules.open("help");
          this.$appdata.set("modules.help.action", "open-about");
          return;
        }
        if (e.code === "Comma" || e.key === ",") {
          e.preventDefault();
          this.$modules.open("config");
          return;
        }

        // Fila de reprodução (Windows/Linux: Ctrl+Q | Mac: Control+Q ou Cmd+Shift+Q)
        if (e.code === "KeyQ" || e.key?.toLowerCase() === "q") {
          if (isMac && !e.shiftKey) {
            return;
          }
          e.preventDefault();
          this.$appdata.set("modules.media.show_queue", !this.$appdata.get("modules.media.show_queue"));
          return;
        }

        // Alternar modo de áudio (Cantado ↔ Instrumental)
        if (e.code === "KeyT" || e.key?.toLowerCase() === "t") {
          e.preventDefault();
          const hasInstrumental = !!this.$appdata.get("modules.media.data.url_instrumental_music");
          if (hasInstrumental) {
            const currentMode = this.$appdata.get("modules.media.config.mode") || "audio";
            const targetMode = currentMode === "instrumental" ? "audio" : "instrumental";
            const idMusic = this.$appdata.get("modules.media.id_music");
            const minimized = this.$appdata.get("modules.media.minimized");
            if (idMusic) {
              this.$media.open({ id_music: idMusic, mode: targetMode, minimized });
            }
          }
          return;
        }

        // Silenciar áudio (Mute / Unmute)
        if (e.code === "KeyM" || e.key?.toLowerCase() === "m") {
          e.preventDefault();
          this.$media.toogleVolume();
          return;
        }

        // Controle de Volume
        if (e.code === "ArrowUp") {
          e.preventDefault();
          this.$media.volumeUp(5);
          return;
        }
        if (e.code === "ArrowDown") {
          e.preventDefault();
          this.$media.volumeDown(5);
          return;
        }

        // Faixa seguinte / anterior da fila de reprodução
        if (e.code === "ArrowRight") {
          e.preventDefault();
          this.$media.playNext();
          return;
        }
        if (e.code === "ArrowLeft") {
          e.preventDefault();
          this.$media.playPrev();
          return;
        }

        // Blackout da Projeção
        if (e.code === "Period" || e.key === ".") {
          e.preventDefault();
          this.$media.toggleBlackout();
          return;
        }

        // Projeção Tela Cheia
        if (e.code === "Enter" || e.code === "NumpadEnter") {
          e.preventDefault();
          const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
          this.$media.fullscreen(!isFullscreen);
          return;
        }
      }

      // No Mac: se pressionar Control+Q (^Q), também alterna a fila de reprodução
      if (isMac && e.ctrlKey && !e.metaKey && (e.code === "KeyQ" || e.key?.toLowerCase() === "q")) {
        e.preventDefault();
        this.$appdata.set("modules.media.show_queue", !this.$appdata.get("modules.media.show_queue"));
        return;
      }

      // 3. F1 - Manual de Uso
      if (e.key === "F1") {
        e.preventDefault();
        this.$modules.open("help");
        this.$appdata.set("modules.help.action", "open-manual");
        return;
      }

      // F11 - Tela Cheia / Projeção
      if (e.key === "F11") {
        e.preventDefault();
        const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
        this.$media.fullscreen(!isFullscreen);
        return;
      }

      // 4. Controles de Mídia sem Modificador (Play/Pause, Slides, etc.)
      const isFullscreen = this.$appdata.get("modules.media.config.fullscreen");
      const isMediaModuleOpen = this.$appdata.get("modules.media.show");
      const isMinimized = this.$appdata.get("modules.media.minimized");
      const isMediaActive = isFullscreen || (isMediaModuleOpen && !isMinimized);
      const hasMediaLoaded = Boolean(this.$appdata.get("modules.media.id_music") || this.$appdata.get("modules.media.data")?.name);
      const hasNoModifiers = !e.ctrlKey && !e.metaKey && !e.altKey;

      if ((e.code === "Space" && hasNoModifiers) || (isModifier && (e.code === "KeyP" || e.key?.toLowerCase() === "p"))) {
        if (hasMediaLoaded) {
          e.preventDefault();
          this.$media.playPause();
          return;
        }
      }

      if (isMediaActive || hasMediaLoaded) {
        if (hasNoModifiers && (e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "PageDown")) {
          e.preventDefault();
          this.$media.nextSlide();
        } else if (hasNoModifiers && (e.code === "ArrowLeft" || e.code === "ArrowUp" || e.code === "PageUp")) {
          e.preventDefault();
          this.$media.prevSlide();
        } else if (hasNoModifiers && e.code === "Home") {
          e.preventDefault();
          this.$media.firstSlide();
        } else if (hasNoModifiers && e.code === "End") {
          e.preventDefault();
          this.$media.lastSlide();
        } else if (hasNoModifiers && (e.code === "KeyF" || e.key?.toLowerCase() === "f")) {
          e.preventDefault();
          this.$media.fullscreen(!isFullscreen);
        } else if (hasNoModifiers && (e.code === "KeyM" || e.key?.toLowerCase() === "m")) {
          e.preventDefault();
          this.$media.minimize();
        }
      }
    },
  },
};
</script>

<style>
#app-container > div {
  height: 100vh;
}
</style>
