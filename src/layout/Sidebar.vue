<template>
  <div
    v-if="isOpen && isMobile"
    class="sidebar-overlay"
    @click="closeSidebar"
  />

  <div 
    class="dashboard-sidebar" 
    :class="{ 
      open: isOpen,
      'is-collapsed': isCollapsed,
      'is-pinned': isPinned 
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/ico/favicon.svg" alt="LouvorJA" class="logo-svg" />
        <div class="logo-text">
          <span class="logo-title">{{ $t("app.name").toUpperCase() }}</span>
        </div>
      </div>
      <button
        v-if="!isMobile"
        class="sidebar-pin-btn"
        :class="{ pinned: isPinned }"
        :title="isPinned ? $t('sidebar.unpin') : $t('sidebar.pin')"
        @click="togglePin"
      >
        <v-icon size="16">
          {{ isPinned ? "mdi-pin" : "mdi-pin-outline" }}
        </v-icon>
      </button>
    </div>

    <nav class="sidebar-nav-main">
      <div class="nav-item close-item">
        <button class="close-sidebar-btn" @click="closeSidebar">
          <v-icon class="nav-icon">
            mdi-arrow-left
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.close_menu") }}</span>
        </button>
      </div>
      
      <div class="nav-item main-item" :class="{ active: currentModule === 'home' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('home')">
          <v-icon class="nav-icon">
            mdi-home
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.home") }}</span>
        </a>
      </div>
      
      <!-- In Spanish, Hymnal takes the 2nd place instead of the Musics group -->
      <template v-if="language === 'es' && individualModules['hymnal'] && shouldShowModule('hymnal')">
        <div
          class="nav-item main-item"
          :class="{ active: currentModule === 'hymnal' }"
        >
          <a href="#" class="nav-link" @click.prevent="openModule('hymnal')">
            <v-icon class="nav-icon">
              {{ individualModules['hymnal'].icon }}
            </v-icon>
            <span class="nav-text">{{ $t(individualModules['hymnal'].title) }}</span>
          </a>
        </div>
      </template>

      <template v-for="(group, groupKey) in moduleGroups" :key="groupKey">
        <div
          v-if="groupKey === 'bible'"
          class="nav-item main-item"
          :class="{ active: currentModule === 'bible' }"
        >
          <a href="#" class="nav-link" @click.prevent="openModule('bible')">
            <v-icon class="nav-icon">
              {{ group.icon }}
            </v-icon>
            <span class="nav-text">{{ $t(group.title) }}</span>
          </a>
        </div>
        
        <div 
          v-else 
          class="nav-item main-item"
          :class="{ 'group-active': isGroupActive(group) && (!submenuOpen[groupKey] || isCollapsed) }"
        >
          <a href="#" class="nav-link" @click.prevent="toggleSubmenu(groupKey)">
            <v-icon class="nav-icon">
              {{ group.icon }}
            </v-icon>
            <span class="nav-text">{{ $t(group.title) }}</span>
            <v-icon class="nav-arrow" :class="{ expanded: submenuOpen[groupKey] }">
              mdi-chevron-right
            </v-icon>
          </a>
          <div class="nav-submenu" :class="{ expanded: submenuOpen[groupKey] }">
            <div
              v-for="moduleId in group.modules"
              :key="moduleId"
              class="nav-item"
              :class="{ active: currentModule === moduleId }"
            >
              <a
                v-if="shouldShowModule(moduleId)"
                href="#"
                class="nav-link"
                @click.prevent="openModule(moduleId)"
              >
                <span class="nav-text">{{ getModuleTitle(moduleId) }}</span>
              </a>
            </div>
          </div>
        </div>
      </template>

      <template v-for="(module, moduleKey) in individualModules" :key="moduleKey">
        <div
          v-if="shouldShowModule(moduleKey) && !(language === 'es' && moduleKey === 'hymnal')"
          class="nav-item main-item"
          :class="{ active: currentModule === moduleKey }"
        >
          <a href="#" class="nav-link" @click.prevent="openModule(moduleKey)">
            <v-icon class="nav-icon">
              {{ module.icon }}
            </v-icon>
            <span class="nav-text">{{ $t(module.title) }}</span>
          </a>
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div v-if="isDesktop" class="nav-item" :class="{ active: currentModule === 'sync' && syncView !== 'db_update' }">
        <a href="#" class="nav-link" @click.prevent="openLocalLibrary">
          <v-icon 
            class="nav-icon" 
            :color="currentModule === 'sync' && syncView !== 'db_update' ? '' : 'primary'"
          >
            mdi-library
          </v-icon>
          <span class="nav-text font-weight-bold" :style="{ color: currentModule === 'sync' && syncView !== 'db_update' ? '' : 'var(--accent-blue)' }">{{ $t("sidebar.local_library") }}</span>
          
          <div 
            v-if="isDownloading"
            class="v-icon"
            style="position: relative; margin-left: auto; width: 22px; height: 22px;"
          >
            <v-icon 
              class="mdi-spin" 
              :color="currentModule === 'sync' && syncView !== 'db_update' ? '' : 'primary'"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            >
              mdi-loading
            </v-icon>
            <v-icon 
              :color="currentModule === 'sync' && syncView !== 'db_update' ? '' : 'primary'"
              size="12"
              style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;"
            >
              mdi-arrow-down
            </v-icon>
          </div>
        </a>
      </div>
      
      <div v-if="['available', 'downloading', 'ready'].includes(updateStatus)" class="nav-item update-item" :class="{ 'pulse-animation': updateStatus === 'available' }">
        <a 
          href="#" 
          class="nav-link" 
          style="background: rgba(0, 151, 215, 0.1); border-radius: 8px;"
          @click.prevent="openUpdateModule"
        >
          <v-icon class="nav-icon" color="primary">mdi-cloud-download</v-icon>
          <span class="nav-text font-weight-bold" style="color: var(--accent-blue);">{{ $t("sidebar.update_available") }}</span>
        </a>
      </div>
      
      <div v-if="dbUpdateAvailable" class="nav-item update-item" :class="{ 'pulse-animation': true, active: currentModule === 'sync' && syncView === 'db_update' }">
        <a 
          href="#" 
          class="nav-link" 
          style="background: rgba(var(--v-theme-primary), 0.1); border-radius: 8px;"
          @click.prevent="openDbUpdate"
        >
          <v-icon class="nav-icon" :color="currentModule === 'sync' && syncView === 'db_update' ? '' : 'primary'">mdi-database-refresh</v-icon>
          <span class="nav-text font-weight-bold" :style="{ color: currentModule === 'sync' && syncView === 'db_update' ? '' : 'var(--accent-blue)' }">Atualização Disponível</span>
        </a>
      </div>
      
      <div class="nav-item" :class="{ active: currentModule === 'help' }">
        <a href="#" class="nav-link" @click.prevent="openModule('help')">
          <v-icon class="nav-icon">
            mdi-help-circle
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.help") }}</span>
        </a>
      </div>
      <div class="nav-item" :class="{ active: currentModule === 'config' }">
        <a href="#" class="nav-link" @click.prevent="openModule('config')">
          <v-icon class="nav-icon">
            mdi-cog
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.settings") }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DashboardSidebar",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "update:pinned"],
  data() {
    return {
      isHovered: false,
      submenuOpen: {} as Record<string, boolean>,
      windowWidth: window.innerWidth,
      submenuTimeout: null as any,
    };
  },
  computed: {
    isOpen: {
      get(): boolean {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
    updateStatus(): string {
      return (this as any).$appdata.get("modules.update.status") || "idle";
    },
    syncView(): string {
      return (this as any).$appdata.get("modules.sync.view") || "library";
    },
    dbUpdateAvailable(): boolean {
      return (this as any).$appdata.get("modules.sync.db_update_available") === true;
    },
    isMobile(): boolean {
      return this.windowWidth <= 1024;
    },
    isCollapsed(): boolean {
      return !this.isPinned && !this.isHovered;
    },
    isDesktop(): boolean {
      return !!(window as any).electronAPI?.isElectron;
    },
    currentRoute(): string {
      return ((this as any).$route.name as string)?.toLowerCase() || "";
    },
    currentModule(): string | null {
      const modules = (this as any).$appdata.get("modules") || {};
      const overlays = ["album", "media", "lyric"];
      
      if (modules["sync"]?.show) {
        return "sync";
      }
      
      for (const [key, module] of Object.entries(modules)) {
        if ((module as any).show && !overlays.includes(key) && key !== "sync") {
          return key;
        }
      }
      return null;
    },
    moduleGroups(): Record<string, any> {
      const groups = (this as any).$appdata.get("module_group") || {};
      const result: Record<string, any> = {};
      
      const groupIcons: Record<string, string> = {
        musics: "mdi-play",
        bible: "mdi-book-cross",
        utilities: "mdi-plus-circle",
        personalized: "mdi-star-outline",
      };

      for (const [key, group] of Object.entries(groups)) {
        if (this.language === "es" && key === "musics") continue;
        if ((group as any).modules && (group as any).modules.length > 0) {
          result[key] = {
            ...(group as any),
            icon: groupIcons[key] || "mdi-folder",
          };
        }
      }

      return result;
    },
    individualModules(): Record<string, any> {
      const allModules = (this as any).$appdata.get("modules") || {};
      const groups = (this as any).$appdata.get("module_group") || {};
      const groupedModuleIds = new Set<string>();
      
      Object.entries(groups).forEach(([key, group]: [string, any]) => {
        if (this.language === "es" && key === "musics") return;
        if (group.modules) {
          group.modules.forEach((id: string) => groupedModuleIds.add(id));
        }
      });
      
      const entries = Object.entries(allModules)
        .filter(([key, module]: [string, any]) => !groupedModuleIds.has(key) && module.showInMainMenu)
        .sort(([k1, v1]: [string, any], [k2, v2]: [string, any]) => {
          if (k1 === "dev" && k2 !== "dev") return 1;
          if (k2 === "dev" && k1 !== "dev") return -1;
          
          const t1 = v1?.title ? (this as any).$t(v1.title).toLowerCase() : "";
          const t2 = v2?.title ? (this as any).$t(v2.title).toLowerCase() : "";
          return t1.localeCompare(t2);
        });
        
      const result: Record<string, any> = {};
      for (const [key, module] of entries) {
        result[key] = module;
      }
      
      return result;
    },
    language(): string {
      return (this as any).$userdata.get("language");
    },
    isDev(): boolean {
      return (this as any).$appdata.get("is_dev");
    },
    isDownloading(): boolean {
      return (this as any).$appdata.get("sync_is_downloading") === true;
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    togglePin() {
      this.$emit("update:pinned", !this.isPinned);
    },
    closeSidebar() {
      this.isOpen = false;
    },
    navigateTo(route: string) {
      if (route === "home") {
        (this as any).$modules.open("home");
      }
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
    openModule(moduleId: string) {
      (this as any).$modules.open(moduleId);
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
    openLocalLibrary() {
      (this as any).$appdata.set("modules.sync.view", "library");
      this.openModule("sync");
    },
    openDbUpdate() {
      (this as any).$appdata.set("modules.sync.view", "db_update");
      this.openModule("sync");
    },
    toggleSubmenu(submenu: string) {
      const isCurrentlyOpen = this.submenuOpen[submenu];
      let wasAnyOtherOpen = false;
      
      Object.keys(this.submenuOpen).forEach(key => {
        if (key !== submenu && this.submenuOpen[key]) {
          wasAnyOtherOpen = true;
        }
        this.submenuOpen[key] = false;
      });
      
      clearTimeout(this.submenuTimeout);
      
      if (!isCurrentlyOpen) {
        if (wasAnyOtherOpen) {
          this.submenuTimeout = setTimeout(() => {
            this.submenuOpen[submenu] = true;
          }, 300);
        } else {
          this.submenuOpen[submenu] = true;
        }
      }
    },
    isGroupActive(group: any): boolean {
      if (!group || !group.modules) return false;
      return group.modules.includes(this.currentModule);
    },
    shouldShowModule(moduleId: string): boolean {
      const module = (this as any).$appdata.get(`modules.${moduleId}`);
      if (!module) return false;
      
      if (module.language && module.language !== this.language) {
        return false;
      }
      
      if (module.development && !this.isDev) {
        return false;
      }
      
      return true;
    },
    getModuleTitle(moduleId: string): string {
      const module = (this as any).$appdata.get(`modules.${moduleId}`);
      return module ? (this as any).$t(module.title) : moduleId;
    },
    openUpdateModule() {
      (this as any).$modules.open("update");
    },
  },
});
</script>

<style lang="scss">
.dashboard-sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: calc(100vh - 32px);
  left: 0;
  top: 32px;
  z-index: 9999;
  overflow: hidden;
  border-right: 1px solid var(--sidebar-border);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-collapsed {
    width: var(--sidebar-collapsed-width);

    .logo-text, .nav-text {
      opacity: 0;
      pointer-events: none;
      max-width: 0;
      overflow: hidden;
      margin: 0;
      transition: opacity 0.2s ease, max-width 0.2s ease, margin 0.2s ease;
    }

    .nav-arrow {
      display: none !important;
    }

    .nav-submenu {
      display: none !important;
    }

    .sidebar-header {
      padding: 24px 16px;

      .sidebar-pin-btn {
        opacity: 0;
        pointer-events: none;
      }

      .logo-container {
        gap: 0;
      }
    }

    .nav-item {
      margin: 4px 12px;

      .nav-link {
        padding: 12px;
        justify-content: center;
        gap: 0;

        .nav-icon {
          margin: 0;
        }
      }

      &.active,
      &.group-active {
        width: 44px;
        height: 44px;
        margin: 4px auto;
        border-radius: 50%;

        .nav-link {
          width: 100%;
          height: 100%;
          padding: 0;
        }
      }
    }
  }

  .logo-text, .nav-text, .nav-arrow {
    opacity: 1;
    max-width: 200px;
    transition: opacity 0.3s ease 0.1s, max-width 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }

  .sidebar-header {
    position: relative;
    padding: 24px 24px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: padding 0.3s ease;

    .sidebar-pin-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 6px;
      color: var(--sidebar-text-secondary);
      cursor: pointer;
      transition: var(--transition), opacity 0.2s ease;

      &:hover {
        background: var(--sidebar-hover);
        color: var(--accent-blue);
      }

      &.pinned {
        color: var(--accent-blue);
      }
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      gap: 12px;

      .logo-svg {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
      }

      .logo-text .logo-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--sidebar-text);
        letter-spacing: 0.8px;
        background: linear-gradient(135deg, var(--accent-yellow) 0%, var(--accent-blue) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  .sidebar-nav-main {
    flex: 1;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 2px;
    overflow-y: auto;
    overflow-x: hidden;

    &::before,
    &::after {
      content: '';
      margin: auto;
    }
  }

  .sidebar-footer {
    padding: 16px 0 24px 0;
    border-top: 1px solid var(--sidebar-border);
    background: transparent;
  }

  .nav-item {
    position: relative;
    margin: 4px 16px;
    border-radius: var(--border-radius);
    transition: var(--transition);
    
    &.close-item {
      display: none;
      margin-bottom: 8px;
      
      .close-sidebar-btn {
        background: none;
        border: none;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 10px 16px;
        color: var(--accent-blue);
        gap: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
        border-radius: var(--border-radius);
        
        .nav-icon {
          font-size: 22px;
          min-width: 22px;
          color: var(--accent-blue);
        }
        
        .nav-text {
          flex: 1;
          text-align: left;
          font-weight: 600;
        }
        
        &:hover {
          background: var(--sidebar-hover);
          color: var(--accent-blue-dark);
          
          .nav-icon {
            color: var(--accent-blue-dark);
          }
        }
        
        &:active {
          transform: scale(0.98);
        }
      }
    }
    
    &.main-item {
      margin: 4px 16px;
      
      .nav-link {
        padding: 12px 16px;
        font-size: 15px;
        font-weight: 600;
        
        .nav-icon {
          font-size: 22px;
          min-width: 22px;
          color: var(--accent-blue);
        }
        
        .nav-text {
          font-weight: 600;
        }
      }
    }
    
    &:hover {
      background: var(--sidebar-hover);
      border-radius: var(--border-radius);
    }
    
    &.active {
      background: var(--sidebar-active);
      border-radius: 999px;

      .nav-link {
        color: white;

        .nav-icon {
          color: white;
        }
      }
    }

    &.group-active {
      background: var(--sidebar-active);
      border-radius: 999px;

      .nav-link {
        color: white;

        .nav-icon {
          color: white;
        }
      }
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      color: var(--sidebar-text);
      text-decoration: none;
      gap: 16px;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
      
      .nav-icon {
        font-size: 20px;
        min-width: 20px;
        color: var(--accent-blue);
      }
      
      .nav-text {
        flex: 1;
      }
      
      .nav-arrow {
        font-size: 16px;
        transition: transform 0.3s ease;
        
        &.expanded {
          transform: rotate(90deg);
        }
      }
    }
  }

  .nav-submenu {
    padding-left: 32px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    
    &.expanded {
      max-height: 200px;
    }
    
    .nav-item {
      margin: 1px 0;
      
      &.active .nav-link {
        color: white !important;
      }

      .nav-link {
        padding: 6px 16px;
        font-size: 13px;
        color: var(--sidebar-text-secondary);
        
        &:hover {
          color: var(--sidebar-text);
        }
      }
    }
  }
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

@media (max-width: 1024px) {
  .dashboard-sidebar.is-pinned .nav-item.close-item {
    display: block !important;
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .dashboard-sidebar.is-pinned {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
}

.pulse-animation {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 151, 215, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(0, 151, 215, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 151, 215, 0);
  }
}
</style>
