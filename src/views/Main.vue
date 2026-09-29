<template>
  <AppSidebar v-model="sidebarOpen" :is-pinned="sidebarPinned" @update:pinned="onPinnedChange" />

  <div class="main-container" :class="{ 'sidebar-open': sidebarOpen, 'sidebar-unpinned': !sidebarPinned }" @toggle-sidebar="toggleSidebar">
    <v-main class="bg-main">
      <AppModules />
      
      <AppTrayArea />
      <QuickSearchModal v-model="showQuickSearch" />
      <BibleQuickSearchModal v-model="showBibleSearch" />



      <transition name="fade-slide">
        <div 
          v-if="isMinimized && showMiniPlayer" 
          :class="['mini-player-popup', 'elevation-12', 'corner-' + miniplayerCorner]"
          @pointerdown="onMiniPlayerPointerDown"
          @dblclick="maximizePlayer"
        >
          <v-card
            theme="dark"
            rounded="lg"
            class="overflow-hidden bg-black"
            width="320"
          >
            <div class="mini-player-toolbar d-flex justify-end pa-1 position-absolute w-100" style="z-index: 50;">
              <v-btn 
                icon
                size="x-small" 
                variant="flat" 
                color="rgba(0,0,0,0.6)" 
                class="mx-1 hover-btn"
                @click.stop="maximizePlayer" 
              >
                <v-icon>mdi-arrow-expand-all</v-icon>
                <v-tooltip
                  activator="parent"
                  :location="miniplayerCorner.startsWith('top') ? 'bottom' : 'top'"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Maximizar
                </v-tooltip>
              </v-btn>
              <v-btn 
                icon
                size="x-small" 
                variant="flat" 
                color="rgba(0,0,0,0.6)" 
                class="hover-btn"
                @click.stop="showMiniPlayer = false" 
              >
                <v-icon>mdi-minus</v-icon>
                <v-tooltip
                  activator="parent"
                  :location="miniplayerCorner.startsWith('top') ? 'bottom' : 'top'"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Minimizar
                </v-tooltip>
              </v-btn>
            </div>
            <div class="position-relative w-100 bg-black mini-player-content" style="height: 180px; z-index: 1;">
              <LSlide
                v-if="slide"
                :slide_number="config.slide_index"
                :cover="slide.cover == true"
                :text="slide.lyric"
                :aux_text="slide.aux_lyric"
                :image="slide.url_image ? $path.file(slide.url_image) : null"
                :image_position="slide.image_position"
                :all_slides="slides"
                class="w-100 h-100"
              />
              <div v-else class="w-100 h-100 d-flex align-center justify-center text-grey">
                Sem mídia
              </div>
            </div>
          </v-card>
        </div>
      </transition>

      <!-- External Media MiniPlayer -->
      <transition name="fade-slide">
        <div 
          v-if="isExternalMediaMinimized && showExternalMiniPlayer && (isExternalVideo || isExternalYoutube)" 
          :class="['mini-player-popup', 'elevation-12', 'corner-' + miniplayerCorner]"
          @pointerdown="onMiniPlayerPointerDown"
          @dblclick="maximizeExternalPlayer"
        >
          <v-card
            theme="dark"
            rounded="lg"
            class="overflow-hidden bg-black"
            width="320"
          >
            <div class="mini-player-toolbar d-flex justify-end pa-1 position-absolute w-100" style="z-index: 50;">
              <v-btn 
                icon
                size="x-small"
                variant="flat"
                color="rgba(0,0,0,0.6)"
                class="mx-1 hover-btn"
                @click.stop="maximizeExternalPlayer" 
              >
                <v-icon>mdi-arrow-expand-all</v-icon>
                <v-tooltip
                  activator="parent"
                  :location="miniplayerCorner.startsWith('top') ? 'bottom' : 'top'"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Maximizar
                </v-tooltip>
              </v-btn>
              <v-btn
                icon
                size="x-small"
                variant="flat"
                color="rgba(0,0,0,0.6)"
                class="hover-btn"
                @click.stop="showExternalMiniPlayer = false" 
              >
                <v-icon>mdi-minus</v-icon>
                <v-tooltip
                  activator="parent"
                  :location="miniplayerCorner.startsWith('top') ? 'bottom' : 'top'"
                  open-delay="300"
                  content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
                >
                  Minimizar
                </v-tooltip>
              </v-btn>
            </div>
            <div class="position-relative w-100 bg-black mini-player-content" style="height: 180px; z-index: 1;">
              <div
                v-if="isExternalYoutube"
                ref="youtubeMiniPlayerEl"
                class="w-100 h-100"
                style="pointer-events: none;"
              />
              <div
                v-if="isExternalYoutube && (youtubeMiniEnded || youtubeMiniStarting)"
                class="w-100 h-100 position-absolute bg-black"
                style="top: 0; left: 0;"
              />
              <video
                v-else-if="externalFilePath"
                ref="externalMiniPlayerVideo"
                :src="externalFilePath"
                class="w-100 h-100"
                style="object-fit: contain;"
                muted
                @loadedmetadata="syncMiniPlayer"
              />
              <div v-else class="w-100 h-100 d-flex align-center justify-center text-grey">
                Sem mídia
              </div>
            </div>
          </v-card>
        </div>
      </transition>
    </v-main>

    <AppFooter />
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from "vue";
import { loadYoutubeApi } from "@/helpers/services/YoutubeApi";
import AppFooter from "@/layout/Footer.vue";
import AppSidebar from "@/layout/Sidebar.vue";
import AppModules from "@/layout/Modules.vue";
import AppTrayArea from "@/layout/TrayArea.vue";
import LSlide from "@/components/Slide.vue";
import QuickSearchModal from "@/components/QuickSearchModal.vue";
import BibleQuickSearchModal from "@/components/BibleQuickSearchModal.vue";
import $popup from "@/helpers/ui/Popup";

export default defineComponent({
  name: "MainPage",
  components: {
    AppFooter,
    AppSidebar,
    AppModules,
    AppTrayArea,
    LSlide,
    QuickSearchModal,
    BibleQuickSearchModal,
  },
  data() {
    return {
      sidebarOpen: false,
      sidebarPinned: false,
      showQuickSearch: false,
      showBibleSearch: false,
      dragState: null as {
        el: HTMLElement;
        startX: number;
        startY: number;
        initialRect: DOMRect;
        currentDeltaX: number;
        currentDeltaY: number;
        hasMoved: boolean;
      } | null,
      snapTimeout: null as any,
      youtubeMiniPlayer: null as any,
      youtubeMiniEnded: false,
      youtubeMiniStarting: false,
      youtubeMiniStartingTimer: null as any,
    };
  },
  computed: {
    miniplayerCorner: {
      get(): "bottom-left" | "bottom-right" | "top-left" | "top-right" {
        const val = this.$userdata.get("modules.media.miniplayer_corner");
        if (val && ["bottom-left", "bottom-right", "top-left", "top-right"].includes(val)) {
          return val;
        }
        return "bottom-left";
      },
      set(val: "bottom-left" | "bottom-right" | "top-left" | "top-right") {
        this.$userdata.set("modules.media.miniplayer_corner", val);
      },
    },
    showMiniPlayer: {
      get(): boolean {
        return this.$appdata.get("modules.media.show_mini_player") !== false;
      },
      set(val: boolean) {
        this.$appdata.set("modules.media.show_mini_player", val);
      },
    },
    showExternalMiniPlayer: {
      get(): boolean {
        return this.$appdata.get("modules.external_media.show_mini_player") !== false;
      },
      set(val: boolean) {
        this.$appdata.set("modules.external_media.show_mini_player", val);
      },
    },
    isMinimized(): boolean {
      return this.$media.isMinimized();
    },
    isExternalMediaMinimized(): boolean {
      return this.$appdata.get("modules.external_media.minimized") === true && !!this.$appdata.get("modules.external_media.filePath");
    },
    externalFilePath(): string {
      const raw = this.$appdata.get("modules.external_media.filePath");
      if (!raw) return "";
      if (window.electronAPI) {
        const prefix = raw.startsWith("/") ? "local://app" : "local://app/";
        return `${prefix}${raw}`;
      }
      return raw;
    },
    isExternalVideo(): boolean {
      const raw = this.$appdata.get("modules.external_media.filePath");
      if (!raw) return false;
      const ext = raw.split(".").pop()?.toLowerCase();
      return !!ext && ["mp4", "mkv", "avi", "mov", "wmv", "webm"].includes(ext);
    },
    isExternalYoutube(): boolean {
      const raw = this.$appdata.get("modules.external_media.filePath") || "";
      return raw.startsWith("youtube:");
    },
    youtubeVideoId(): string {
      const raw = this.$appdata.get("modules.external_media.filePath") || "";
      return raw.startsWith("youtube:") ? raw.slice("youtube:".length) : "";
    },
    externalMediaCurrentTime(): number {
      return this.$appdata.get("modules.external_media.config.current_time");
    },
    externalMediaIsPaused(): boolean {
      return this.$appdata.get("modules.external_media.config.is_paused");
    },
    config(): any {
      return this.$media.config();
    },
    slide(): any {
      return this.$media.slide();
    },
    slides(): any[] {
      return this.$media.slides();
    },
    isSidebarCollapsed(): boolean {
      return !this.sidebarPinned && !this.sidebarOpen;
    },
    showYoutubeMiniPlayer(): boolean {
      return this.isExternalMediaMinimized && this.showExternalMiniPlayer && this.isExternalYoutube;
    },
  },
  watch: {
    externalMediaCurrentTime(val: number) {
      if (this.showExternalMiniPlayer && this.$refs.externalMiniPlayerVideo) {
        const video = this.$refs.externalMiniPlayerVideo as HTMLVideoElement;
        if (!video.seeking && Math.abs(video.currentTime - val) > 0.5) {
          video.currentTime = val;
        }
      }
      if (this.showYoutubeMiniPlayer && this.youtubeMiniPlayer) {
        try {
          const current = this.youtubeMiniPlayer.getCurrentTime?.() || 0;
          if (Math.abs(current - val) > 0.8) {
            this.youtubeMiniPlayer.seekTo(val, true);
          }
        } catch {
          // player ainda não está pronto
        }
      }
    },
    externalMediaIsPaused(val: boolean) {
      if (this.showExternalMiniPlayer && this.$refs.externalMiniPlayerVideo) {
        const video = this.$refs.externalMiniPlayerVideo as HTMLVideoElement;
        if (val) video.pause();
        else video.play().catch((err: any) => {
          console.error("[MiniPlayer] play() failed:", err.message);
        });
      }
      if (this.showYoutubeMiniPlayer && this.youtubeMiniPlayer) {
        try {
          if (val) this.youtubeMiniPlayer.pauseVideo();
          else this.youtubeMiniPlayer.playVideo();
        } catch {
          // player ainda não está pronto
        }
      }
    },
    showExternalMiniPlayer(newVal: boolean) {
      if (newVal) {
        this.$nextTick(() => {
          if (!this.externalMediaIsPaused && this.$refs.externalMiniPlayerVideo) {
            const video = this.$refs.externalMiniPlayerVideo as HTMLVideoElement;
            video.currentTime = this.externalMediaCurrentTime || 0;
            video.play().catch((err: any) => {
              console.error("[MiniPlayer] play() failed:", err.message);
            });
          }
        });
      }
    },
    showYoutubeMiniPlayer(val: boolean) {
      if (val) {
        this.$nextTick(() => {
          this.initYoutubeMiniPlayer();
        });
      } else {
        this.destroyYoutubeMiniPlayer();
      }
    },
    youtubeVideoId(val: string) {
      if (this.showYoutubeMiniPlayer && this.youtubeMiniPlayer && val) {
        this.youtubeMiniEnded = false;
        this.startYoutubeMiniIntroCover();
        this.youtubeMiniPlayer.loadVideoById(val);
      }
    },
    isMinimized(val: boolean) {
      if (val) {
        // Only auto-show mini player if the music is actually playing (not paused from addToQueue)
        const isPaused = this.$appdata.get("modules.media.config.is_paused");
        if (!isPaused) {
          this.showMiniPlayer = true;
        }
      }
    },
    isSidebarCollapsed: {
      immediate: true,
      handler(val: boolean) {
        if (val) {
          document.body.classList.add("sidebar-collapsed");
        } else {
          document.body.classList.remove("sidebar-collapsed");
        }
      },
    },
    isExternalMediaMinimized(val: boolean) {
      if (val && (this.isExternalVideo || this.isExternalYoutube)) {
        this.showExternalMiniPlayer = true;
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", this.onGlobalSearchShortcut);

    this.closeAllModules();

    this.$userdata.load();

    const theme = this.$userdata.get("theme");
    if (theme !== "") {
      (this as any).$vuetify.theme.global.name = theme;
    }
    this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);

    const lang = this.$userdata.get("language");
    if (lang !== "") {
      this.$i18n.locale = lang;
    } else {
      this.$userdata.set("language", this.$i18n.locale);
    }

    const is_dev = import.meta.env.VITE_APP_MODE === "development";
    this.$appdata.set("is_dev", is_dev);

    // beforeunload foi removido para usar o diálogo customizado de fechamento no Titlebar

    this.$appdata.set(
      "is_mobile",
      this.$vuetify.display.platform.android ||
        this.$vuetify.display.platform.ios,
    );

    if (this.$vuetify.display.platform.electron) {
      this.$appdata.set("is_desktop", true);
    } else {
      this.$appdata.set("is_desktop", false);
      this.$appdata.set("is_online", true);
    }

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.origin === window.location.origin || event.origin === "file://" || event.origin === "null") {
        if (event.data === "mounted") {
          const popupSource = event.source as Window;
          if (popupSource) {
            try {
              const data = this.$appdata.getFlatten();
              Object.keys(data).map((item) => {
                try {
                  popupSource.postMessage(
                    { param: item, value: data[item] },
                    "*",
                  );
                } catch (err) {
                  console.error("Falha ao enviar param para o popup:", item, err);
                }
              });
            } catch (err) {
              console.error("Erro ao obter dados para o popup:", err);
            }
          }
        } else if (event.data === "escape-pressed") {
          if (this.$appdata.get("popup_module") === "external_media") {
            this.$alert.yesno({
              title: "alert.exit_projection_title",
              text: "alert.exit_projection_text",
              translate: true,
            }, (resp: unknown) => {
              if (resp === "yes") {
                $popup.exit();
              }
            });
          } else {
            $popup.exit();
          }
        }
      }
    });

    /*********************************************************************/
    /*********************************************************************/
    /* ********************* PROVISORIO ******************************** */
    if (is_dev) {
      //const self = this;
      setTimeout(() => {
        //self.$media.open({ id_music: 112, mode: "audio", minimized: false });
        //self.$modules.open("clock");
        //self.$modules.open("collections");
        //self.$media.openAlbum(9);
      }, 100);
    }
    /*********************************************************************/
    /*********************************************************************/

    if (window.electronAPI && window.electronAPI.isElectron) {
      window.electronAPI.onNavigateModule((moduleId: string) => {
        this.$modules.open(moduleId);
      });
      window.electronAPI.onNavigateRoute((routeName: string) => {
        if (routeName === "help") {
          this.$modules.open("help");
        } else if (routeName === "manual") {
          this.$modules.open("help");
          this.$appdata.set("modules.help.action", "open-manual");
        } else if (routeName === "about") {
          this.$modules.open("help");
          this.$appdata.set("modules.help.action", "open-about");
        } else if (routeName === "quick-search") {
          this.showQuickSearch = true;
        } else if (routeName === "bible-search") {
          this.showBibleSearch = true;
        }
      });
      if (window.electronAPI.onOpenExternalSong) {
        window.electronAPI.onOpenExternalSong((filePath: string) => {
          this.handleExternalSong(filePath);
        });
      }
      if (window.electronAPI.getInitialFileToOpen) {
        window.electronAPI.getInitialFileToOpen().then((filePath) => {
          if (filePath) {
            this.handleExternalSong(filePath);
          }
        });
      }
    }

    window.addEventListener("dragover", this.onWindowDragOver);
    window.addEventListener("drop", this.onWindowDrop);

    const savedPinned = this.$userdata.get("sidebar_pinned");
    if (savedPinned !== undefined && savedPinned !== null) {
      this.sidebarPinned = savedPinned;
    }
    document.addEventListener("sidebar-pinned-changed", (e: any) => {
      this.sidebarPinned = e.detail;
    });

    if (this.showYoutubeMiniPlayer) {
      this.$nextTick(() => {
        this.initYoutubeMiniPlayer();
      });
    }
  },
  unmounted() {
    window.removeEventListener("keydown", this.onGlobalSearchShortcut);
    window.removeEventListener("pointermove", this.onMiniPlayerPointerMove);
    window.removeEventListener("pointerup", this.onMiniPlayerPointerUp);
    window.removeEventListener("pointercancel", this.onMiniPlayerPointerUp);
    window.removeEventListener("dragover", this.onWindowDragOver);
    window.removeEventListener("drop", this.onWindowDrop);
    if (this.snapTimeout) {
      clearTimeout(this.snapTimeout);
      this.snapTimeout = null;
    }
    this.destroyYoutubeMiniPlayer();
  },
  methods: {
    async handleExternalSong(filePath: string) {
      if (!filePath) return;
      this.showQuickSearch = false;
      this.showBibleSearch = false;
      try {
        await this.$media.playExternalSlja(filePath);
      } catch (err) {
        console.error("Erro ao reproduzir música externa:", err);
      }
    },
    onWindowDragOver(e: DragEvent) {
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    },
    onWindowDrop(e: DragEvent) {
      if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return;
      const file = e.dataTransfer.files[0];
      const filePath = window.electronAPI?.getPathForFile ? window.electronAPI.getPathForFile(file) : (file as any).path;
      if (filePath && /\.(slja|sja|lja)$/i.test(filePath)) {
        e.preventDefault();
        e.stopPropagation();
        this.handleExternalSong(filePath);
      }
    },
    onPinnedChange(val: boolean) {
      this.sidebarPinned = val;
      this.$userdata.set("sidebar_pinned", val);
      // Keeps the "Fixar Barra Lateral" switch in Settings in sync when the
      // sidebar's own pin button is used instead.
      document.querySelector(".main-container")?.dispatchEvent(new CustomEvent("sidebar-pinned-changed", { bubbles: true, detail: val }));
    },
    onGlobalSearchShortcut(e: KeyboardEvent) {
      const isMac = Boolean((window as any)?.electronAPI?.isMac) || (
        typeof navigator !== "undefined" && (
          navigator.userAgent.includes("Mac") || (navigator.platform && navigator.platform.includes("Mac"))
        )
      );
      const isModifier = isMac ? (e.metaKey && !e.ctrlKey) : (e.ctrlKey && !e.metaKey);

      if (isModifier && e.key.toLowerCase() === "f") {
        e.preventDefault();
        this.showQuickSearch = true;
      } else if (isModifier && e.key.toLowerCase() === "b") {
        e.preventDefault();
        this.showBibleSearch = true;
      } else if (e.key === "F1") {
        e.preventDefault();
        this.$modules.open("help");
        this.$appdata.set("modules.help.action", "open-manual");
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    syncMiniPlayer() {
      const video = this.$refs.externalMiniPlayerVideo as HTMLVideoElement;
      if (video) {
        const currentTime = this.$appdata.get("modules.external_media.config.current_time") || 0;
        video.currentTime = currentTime;
        
        const isPaused = this.$appdata.get("modules.external_media.config.is_paused");
        if (!isPaused) {
          video.play().catch(e => console.log("MiniPlayer play error:", e));
        }
      }
    },
    closeAllModules() {
      const modules = this.$appdata.get("modules") || {};
      for (const key of Object.keys(modules)) {
        this.$appdata.set(`modules.${key}.show`, false);
      }
      if (this.$appdata.get("modules.home")) {
        this.$appdata.set("modules.home.show", true);
      }
    },
    maximizePlayer() {
      this.$media.maximize();
      this.showMiniPlayer = false;
    },
    maximizeExternalPlayer() {
      this.$appdata.set("modules.external_media.show", true);
      this.$appdata.set("modules.external_media.minimized", false);
      this.showExternalMiniPlayer = false;
    },
    onMiniPlayerPointerDown(e: PointerEvent) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest(".v-btn") || target.closest(".hover-btn")) {
        return;
      }
      const popupEl = (e.currentTarget as HTMLElement).closest(".mini-player-popup") as HTMLElement;
      if (!popupEl) return;

      if (this.snapTimeout) {
        clearTimeout(this.snapTimeout);
        this.snapTimeout = null;
      }

      popupEl.style.transition = "none";
      popupEl.style.transform = "";

      const initialRect = popupEl.getBoundingClientRect();

      this.dragState = {
        el: popupEl,
        startX: e.clientX,
        startY: e.clientY,
        initialRect,
        currentDeltaX: 0,
        currentDeltaY: 0,
        hasMoved: false,
      };

      popupEl.classList.add("is-dragging");
      document.body.style.userSelect = "none";
      try {
        popupEl.setPointerCapture(e.pointerId);
      } catch (_e) {
        // Pointer capture may not be supported or allowed for this pointer type
      }

      window.addEventListener("pointermove", this.onMiniPlayerPointerMove);
      window.addEventListener("pointerup", this.onMiniPlayerPointerUp);
      window.addEventListener("pointercancel", this.onMiniPlayerPointerUp);
    },
    onMiniPlayerPointerMove(e: PointerEvent) {
      if (!this.dragState) return;

      const dx = e.clientX - this.dragState.startX;
      const dy = e.clientY - this.dragState.startY;

      if (!this.dragState.hasMoved && Math.hypot(dx, dy) > 3) {
        this.dragState.hasMoved = true;
      }

      if (!this.dragState.hasMoved) return;

      const parentEl = this.dragState.el.parentElement || document.body;
      const parentRect = parentEl.getBoundingClientRect();
      const initialRect = this.dragState.initialRect;

      // Boundaries inside parent container with 8px margin
      const minDeltaX = parentRect.left - initialRect.left + 8;
      const maxDeltaX = parentRect.right - initialRect.right - 8;
      const minDeltaY = parentRect.top - initialRect.top + 8;
      const maxDeltaY = parentRect.bottom - initialRect.bottom - 8;

      const clampedDx = Math.max(minDeltaX, Math.min(maxDeltaX, dx));
      const clampedDy = Math.max(minDeltaY, Math.min(maxDeltaY, dy));

      this.dragState.currentDeltaX = clampedDx;
      this.dragState.currentDeltaY = clampedDy;

      this.dragState.el.style.transform = `translate3d(${clampedDx}px, ${clampedDy}px, 0)`;
    },
    onMiniPlayerPointerUp(e: PointerEvent) {
      if (!this.dragState) return;

      window.removeEventListener("pointermove", this.onMiniPlayerPointerMove);
      window.removeEventListener("pointerup", this.onMiniPlayerPointerUp);
      window.removeEventListener("pointercancel", this.onMiniPlayerPointerUp);
      document.body.style.userSelect = "";

      const { el, initialRect, currentDeltaX, currentDeltaY, hasMoved } = this.dragState;

      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_e) {
        // Pointer capture release may fail if pointer is already released
      }
      el.classList.remove("is-dragging");

      if (!hasMoved) {
        this.dragState = null;
        return;
      }

      const parentEl = el.parentElement || document.body;
      const parentRect = parentEl.getBoundingClientRect();

      const currentLeft = initialRect.left + currentDeltaX;
      const currentTop = initialRect.top + currentDeltaY;
      const centerX = currentLeft + initialRect.width / 2;
      const centerY = currentTop + initialRect.height / 2;
      const parentCenterX = parentRect.left + parentRect.width / 2;
      const parentCenterY = parentRect.top + parentRect.height / 2;

      const isLeft = centerX < parentCenterX;
      const isTop = centerY < parentCenterY;
      const newCorner = isTop ? (isLeft ? "top-left" : "top-right") : (isLeft ? "bottom-left" : "bottom-right");

      const droppedRect = { left: currentLeft, top: currentTop };

      this.miniplayerCorner = newCorner;
      this.$userdata.set("modules.media.miniplayer_corner", newCorner);

      // FLIP animation to smoothly glide into the corner
      el.style.transform = "";
      el.style.transition = "none";

      this.$nextTick(() => {
        const newRect = el.getBoundingClientRect();
        const invertX = droppedRect.left - newRect.left;
        const invertY = droppedRect.top - newRect.top;

        el.style.transition = "none";
        el.style.transform = `translate3d(${invertX}px, ${invertY}px, 0)`;

        // Force reflow
        void el.offsetHeight;

        el.style.transition = "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)";
        el.style.transform = "translate3d(0, 0, 0)";

        this.snapTimeout = setTimeout(() => {
          el.style.transition = "";
          el.style.transform = "";
          this.snapTimeout = null;
        }, 350);
      });

      this.dragState = null;
    },
    startYoutubeMiniIntroCover() {
      this.youtubeMiniStarting = true;
      if (this.youtubeMiniStartingTimer) clearTimeout(this.youtubeMiniStartingTimer);
      this.youtubeMiniStartingTimer = setTimeout(() => {
        this.youtubeMiniStarting = false;
      }, 1200);
    },

    async initYoutubeMiniPlayer() {
      if (this.youtubeMiniPlayer || !this.youtubeVideoId) return;
      const container = this.$refs.youtubeMiniPlayerEl as HTMLElement;
      if (!container) return;
      const YT = await loadYoutubeApi();
      // O player pode ter sido fechado/trocado enquanto a API carregava.
      if (!this.showYoutubeMiniPlayer) return;
      this.youtubeMiniEnded = false;
      this.startYoutubeMiniIntroCover();
      this.youtubeMiniPlayer = markRaw(new YT.Player(container, {
        videoId: this.youtubeVideoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          cc_load_policy: 0,
        },
        events: {
          onReady: () => {
            if (!this.youtubeMiniPlayer) return;
            this.youtubeMiniPlayer.mute();
            try {
              this.youtubeMiniPlayer.setOption("captions", "track", {});
            } catch {
              // ignora se o módulo de legendas não existir nessa versão do player
            }
            this.youtubeMiniPlayer.seekTo(this.externalMediaCurrentTime || 0, true);
            if (this.externalMediaIsPaused) {
              this.youtubeMiniPlayer.pauseVideo();
            } else {
              this.youtubeMiniPlayer.playVideo();
            }
          },
          onApiChange: () => {
            try {
              this.youtubeMiniPlayer?.setOption?.("captions", "track", {});
            } catch {
              // ignora se o módulo de legendas não existir nessa versão do player
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              this.youtubeMiniEnded = false;
            } else if (event.data === 0) {
              this.youtubeMiniEnded = true;
            }
          },
        },
      }));
    },
    destroyYoutubeMiniPlayer() {
      if (this.youtubeMiniPlayer) {
        try {
          this.youtubeMiniPlayer.destroy();
        } catch {
          // ignora se já estiver destruído
        }
        this.youtubeMiniPlayer = null;
      }
      this.youtubeMiniEnded = false;
      this.youtubeMiniStarting = false;
      clearTimeout(this.youtubeMiniStartingTimer);
    },
  },
});
</script>

<style scoped>
.main-container {
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
}

.main-container.sidebar-unpinned {
  margin-left: var(--sidebar-collapsed-width);
}

.main-container.sidebar-unpinned :deep(.menu-toggle-btn) {
  display: none !important;
}

@media (max-width: 1024px) {
  .main-container:not(.sidebar-unpinned) {
    margin-left: 0 !important;
  }
}

main {
  display: flex !important;
  flex: auto !important;
  align-items: stretch !important;
  --v-layout-top: 0 !important;
  padding-top: 0 !important;
  overflow: hidden !important;
  position: relative !important;
}

.mini-player-popup {
  position: absolute;
  z-index: 1000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-drag: none;
}

.mini-player-popup.is-dragging {
  cursor: grabbing !important;
  box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 0 2px rgba(var(--v-theme-primary), 0.5) !important;
  z-index: 1002;
}

.mini-player-popup.is-dragging .mini-player-content {
  pointer-events: none;
}

.mini-player-popup img,
.mini-player-popup video {
  -webkit-user-drag: none;
  user-select: none;
}

.mini-player-popup.corner-bottom-left {
  bottom: 16px;
  left: 16px;
  top: auto;
  right: auto;
}

.mini-player-popup.corner-bottom-right {
  bottom: 16px;
  right: 16px;
  top: auto;
  left: auto;
}

.mini-player-popup.corner-top-left {
  top: 16px;
  left: 16px;
  bottom: auto;
  right: auto;
}

.mini-player-popup.corner-top-right {
  top: 16px;
  right: 16px;
  bottom: auto;
  left: auto;
}

.mini-player-toolbar {
  opacity: 0;
  transition: opacity 0.25s ease;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  padding-bottom: 20px !important;
  pointer-events: auto !important;
  z-index: 50 !important;
}

.mini-player-popup:hover .mini-player-toolbar,
.mini-player-popup:focus-within .mini-player-toolbar,
.mini-player-popup.is-dragging .mini-player-toolbar {
  opacity: 1;
}

.hover-btn {
  transition: all 0.2s;
  pointer-events: auto !important;
  cursor: pointer !important;
}

.hover-btn:hover {
  background: rgba(255,255,255,0.2) !important;
  color: white !important;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
