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
      <div
        class="logo-container"
        :title="$t('sidebar.home')"
        @click="navigateTo('home')"
      >
        <img src="/ico/favicon.svg" alt="LouvorJA" class="logo-svg" />
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
      <div v-if="!isCollapsed" class="nav-item close-item">
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

      <!-- Reorganized main navigation items -->
      <template v-for="item in navItems" :key="item.key">
        <!-- Discrete separator before dev module -->
        <div
          v-if="item.key === 'dev'"
          class="sidebar-dev-divider"
        />

        <!-- Direct module (Bible, Liturgy, Dev, etc.) -->
        <div
          v-if="item.isDirectModule"
          class="nav-item main-item"
          :class="{ active: currentModule === item.moduleId }"
        >
          <a href="#" class="nav-link" @click.prevent="openModule(item.moduleId)">
            <v-icon class="nav-icon">
              {{ item.icon }}
            </v-icon>
            <span class="nav-text">{{ $t(item.title) }}</span>
          </a>
        </div>

        <!-- Group with dropdown (Musics, Special Collections, Utilities) -->
        <div
          v-else-if="item.isGroup"
          class="nav-item main-item"
          :class="{ 'group-active': isGroupActive(item.group) && (!submenuOpen[item.key] || isCollapsed) }"
        >
          <a href="#" class="nav-link" @click.prevent="toggleSubmenu(item.key)">
            <v-icon class="nav-icon">
              {{ item.icon }}
            </v-icon>
            <span class="nav-text">{{ $t(item.title) }}</span>
            <v-icon class="nav-arrow" :class="{ expanded: submenuOpen[item.key] }">
              mdi-chevron-right
            </v-icon>
          </a>
          <div class="nav-submenu" :class="{ expanded: submenuOpen[item.key] }">
            <template v-for="(moduleId, modIdx) in item.group.modules" :key="moduleId">
              <div
                v-if="hasDividerBefore(item.group, moduleId, modIdx)"
                class="nav-submenu-divider"
              />
              <div
                v-if="shouldShowModule(moduleId)"
                class="nav-item"
                :class="{ active: currentModule === moduleId }"
              >
                <a
                  href="#"
                  class="nav-link"
                  @click.prevent="openModule(moduleId)"
                >
                  <span class="nav-text">{{ getModuleTitle(moduleId) }}</span>
                </a>
              </div>
            </template>
          </div>
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div v-if="isDesktop" class="nav-item footer-item" :class="{ active: currentModule === 'sync' }">
        <a href="#" class="nav-link" @click.prevent="openLocalLibrary">
          <v-icon 
            class="nav-icon"
            size="18"
          >
            mdi-library-outline
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.local_library") }}</span>
          
          <div 
            v-if="isDownloading"
            class="v-icon"
            style="position: relative; margin-left: auto; width: 18px; height: 18px;"
          >
            <v-icon 
              class="mdi-spin" 
              color="primary"
              size="18"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            >
              mdi-loading
            </v-icon>
            <v-icon 
              color="primary"
              size="10"
              style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;"
            >
              mdi-arrow-down
            </v-icon>
          </div>
        </a>
      </div>
      
      <div v-if="hasAnyUpdateAvailable" class="nav-item footer-item update-item" :class="{ 'pulse-animation': (updateStatus === 'available' || dbUpdateAvailable) && currentModule !== 'update', active: currentModule === 'update' }">
        <a 
          href="#" 
          class="nav-link" 
          @click.prevent="openUpdateModule"
        >
          <v-icon class="nav-icon" size="18">{{ updateIcon }}</v-icon>
          <span class="nav-text">{{ $t("sidebar.update_available") }}</span>
        </a>
      </div>
      
      <div 
        v-if="currentModule !== 'home'" 
        class="nav-item footer-item notifications-item" 
        :class="{
          'pulse-urgent': hasUrgentNotifications,
          'pulse-high': !hasUrgentNotifications && hasHighNotifications,
          'pulse-animation': !hasUrgentNotifications && !hasHighNotifications && hasUnreadNotifications,
        }"
      >
        <a href="#" class="nav-link" @click.prevent="openNotifications">
          <div class="nav-icon-wrapper position-relative d-inline-flex align-center justify-center">
            <v-icon 
              class="nav-icon"
              size="18" 
              :color="
                hasUrgentNotifications
                  ? 'error'
                  : hasHighNotifications
                    ? 'warning'
                    : hasUnreadNotifications
                      ? 'primary'
                      : ''
              "
            >
              {{
                hasUrgentNotifications
                  ? 'mdi-bell-alert'
                  : hasHighNotifications
                    ? 'mdi-bell-alert-outline'
                    : hasUnreadNotifications
                      ? 'mdi-bell'
                      : 'mdi-bell-outline'
              }}
            </v-icon>
            <span 
              v-if="hasUnreadNotifications" 
              class="sidebar-unread-badge"
              :class="{
                'badge-urgent': hasUrgentNotifications,
                'badge-high': !hasUrgentNotifications && hasHighNotifications,
              }"
            >
              {{ unreadNotificationsCount }}
            </span>
          </div>
          <span class="nav-text">Notificações</span>
        </a>
      </div>

      <div class="nav-item footer-item" :class="{ active: currentModule === 'help' }">
        <a href="#" class="nav-link" @click.prevent="openModule('help')">
          <v-icon class="nav-icon" size="18">
            mdi-help-circle-outline
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.help") }}</span>
        </a>
      </div>
      <div class="nav-item footer-item" :class="{ active: currentModule === 'config' }">
        <a href="#" class="nav-link" @click.prevent="openModule('config')">
          <v-icon class="nav-icon" size="18">
            mdi-cog-outline
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.settings") }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  unreadCount,
  hasUnread,
  hasUrgentUnread,
  hasHighUnread,
  toggleNotificationsPanel,
} from "@/helpers/services/Notifications";

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
      // Só reflete navegação feita pela própria sidebar — trocar de módulo pela
      // OpenTabsBar (ou qualquer outro caminho) não deve mudar o item destacado aqui.
      sidebarSelectedModule: "home" as string,
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
    isAppUpdateAvailable(): boolean {
      return ["available", "downloading", "ready"].includes(this.updateStatus);
    },
    hasAnyUpdateAvailable(): boolean {
      return this.isAppUpdateAvailable || this.dbUpdateAvailable;
    },
    updateIcon(): string {
      if (this.isAppUpdateAvailable && this.dbUpdateAvailable) {
        return "mdi-sync";
      }
      if (this.dbUpdateAvailable) {
        return "mdi-database-refresh";
      }
      return "mdi-cloud-download";
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
      const syncShow = (this as any).$appdata.get("modules.sync.show");
      if (syncShow) {
        return "sync";
      }
      const updateShow = (this as any).$appdata.get("modules.update.show");
      if (updateShow) {
        return "update";
      }
      const active = (this as any).$appdata.get("active_module");
      if (active) {
        return active;
      }
      const modules = (this as any).$appdata.get("modules") || {};
      const overlays = ["album", "media", "lyric", "sync", "update", "external_media"];
      for (const [key, module] of Object.entries(modules)) {
        if ((module as any).show && !overlays.includes(key)) {
          return key;
        }
      }
      return this.sidebarSelectedModule || "home";
    },
    moduleGroups(): Record<string, any> {
      const groups = (this as any).$appdata.get("module_group") || {};
      const result: Record<string, any> = {};
      
      const groupIcons: Record<string, string> = {
        musics: "mdi-play",
        special_collections: "mdi-playlist-star",
        online_collection: "mdi-web",
        bible: "mdi-book-cross",
        utilities: "mdi-plus-circle",
        personalized: "mdi-star-outline",
      };

      for (const [key, group] of Object.entries(groups)) {
        if (this.language === "es" && key === "musics") continue;
        if ((group as any).modules && (group as any).modules.length > 0) {
          result[key] = {
            ...(group as any),
            icon: (group as any).icon || groupIcons[key] || "mdi-folder",
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
    navItems(): Array<any> {
      const groups = (this as any).$appdata.get("module_group") || {};
      const allModules = (this as any).$appdata.get("modules") || {};
      
      const groupIcons: Record<string, string> = {
        musics: "mdi-play",
        special_collections: "mdi-playlist-star",
        online_collection: "mdi-web",
        bible: "mdi-book-cross",
        utilities: "mdi-plus-circle",
        personalized: "mdi-star-outline",
      };

      const orderedKeys = [
        "musics",
        "bible",
        "utilities",
        "special_collections",
        "liturgy",
        "dev",
      ];

      const items: Array<any> = [];

      for (const key of orderedKeys) {
        if (groups[key]) {
          if (this.language === "es" && key === "musics") continue;
          const grp = groups[key];
          if (key === "bible") {
            if (this.shouldShowModule("bible")) {
              items.push({
                key: "bible",
                isGroup: false,
                isDirectModule: true,
                moduleId: "bible",
                title: grp.title,
                icon: grp.icon || groupIcons[key] || "mdi-book-cross",
              });
            }
          } else if (grp.modules && grp.modules.length > 0) {
            items.push({
              key,
              isGroup: true,
              isDirectModule: false,
              group: {
                ...grp,
                icon: grp.icon || groupIcons[key] || "mdi-folder",
              },
              title: grp.title,
              icon: grp.icon || groupIcons[key] || "mdi-folder",
            });
          }
        } else if (allModules[key]) {
          const mod = allModules[key];
          if (mod.showInMainMenu && this.shouldShowModule(key)) {
            items.push({
              key,
              isGroup: false,
              isDirectModule: true,
              moduleId: key,
              title: mod.title,
              icon: mod.icon,
            });
          }
        }
      }

      // Add any remaining individual modules
      const handledKeys = new Set(orderedKeys);
      for (const [key, mod] of Object.entries(allModules)) {
        if (!handledKeys.has(key) && (mod as any).showInMainMenu && this.shouldShowModule(key)) {
          let inGroup = false;
          for (const grp of Object.values(groups)) {
            if ((grp as any).modules?.includes(key)) {
              inGroup = true;
              break;
            }
          }
          if (!inGroup) {
            items.push({
              key,
              isGroup: false,
              isDirectModule: true,
              moduleId: key,
              title: (mod as any).title,
              icon: (mod as any).icon,
            });
          }
        }
      }

      return items;
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
    hasUnreadNotifications(): boolean {
      return hasUnread.value;
    },
    unreadNotificationsCount(): number {
      return unreadCount.value;
    },
    hasUrgentNotifications(): boolean {
      return hasUrgentUnread.value;
    },
    hasHighNotifications(): boolean {
      return hasHighUnread.value;
    },
  },
  watch: {
    currentModule: {
      immediate: true,
      handler(newModule) {
        this.syncSubmenuForModule(newModule);
      },
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.syncSubmenuForModule(this.currentModule);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    syncSubmenuForModule(moduleId: string | null) {
      if (!moduleId) return;
      const groups = (this as any).$appdata.get("module_group") || {};
      let foundGroup: string | null = null;
      for (const [key, group] of Object.entries(groups)) {
        if (key === "bible") continue;
        if (this.language === "es" && key === "musics") continue;
        if ((group as any)?.modules && Array.isArray((group as any).modules) && (group as any).modules.includes(moduleId)) {
          foundGroup = key;
          break;
        }
      }
      if (foundGroup) {
        const updated: Record<string, boolean> = {};
        for (const key of Object.keys(this.submenuOpen)) {
          updated[key] = false;
        }
        updated[foundGroup] = true;
        this.submenuOpen = updated;
      } else {
        const updated: Record<string, boolean> = {};
        for (const key of Object.keys(this.submenuOpen)) {
          updated[key] = false;
        }
        this.submenuOpen = updated;
      }
    },
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
      toggleNotificationsPanel(false);
      if (route === "home") {
        (this as any).$modules.open("home");
        this.sidebarSelectedModule = "home";
      }
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
    openModule(moduleId: string) {
      toggleNotificationsPanel(false);
      (this as any).$modules.open(moduleId);
      this.sidebarSelectedModule = moduleId;
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
    openLocalLibrary() {
      (this as any).$appdata.set("modules.sync.view", "library");
      this.openModule("sync");
    },
    openDbUpdate() {
      this.openUpdateModule();
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
    hasVisibleModules(moduleIds: string[]): boolean {
      if (!Array.isArray(moduleIds)) return false;
      return moduleIds.some((id) => this.shouldShowModule(id));
    },
    hasDividerBefore(group: any, moduleId: string, modIdx?: number | string): boolean {
      if (!group || !Array.isArray(group.dividers)) return false;
      if (!group.dividers.includes(moduleId)) return false;
      if (!this.shouldShowModule(moduleId)) return false;
      const index = typeof modIdx === "number" ? modIdx : Number(modIdx ?? (group.modules || []).indexOf(moduleId));
      const prevModules = (group.modules || []).slice(0, index);
      return prevModules.some((id: string) => this.shouldShowModule(id));
    },
    getModuleTitle(moduleId: string): string {
      const module = (this as any).$appdata.get(`modules.${moduleId}`);
      return module ? (this as any).$t(module.title) : moduleId;
    },
    openUpdateModule() {
      (this as any).$modules.open("update");
      this.sidebarSelectedModule = "update";
    },
    openNotifications() {
      toggleNotificationsPanel(true);
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
  },
});
</script>

<style lang="scss">
.sidebar-unread-badge {
  position: absolute;
  top: 2px;
  right: 3px;
  background-color: var(--accent-blue, #0097d7);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  border-radius: 10px;
  padding: 0 4px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  border: 2px solid var(--sidebar-bg, #10141d);
  pointer-events: none;
  z-index: 2;

  &.badge-high {
    background-color: #f59e0b !important;
  }

  &.badge-urgent {
    background-color: #ef4444 !important;
  }
}

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
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.06);
  border-right: 1px solid var(--sidebar-border);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-collapsed {
    width: var(--sidebar-collapsed-width);

    .logo-text, .nav-text {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.15s ease !important;
      flex-shrink: 0 !important;
    }

    .nav-arrow {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.15s ease !important;
      position: absolute !important;
      right: 12px !important;
    }

    .nav-submenu {
      display: none !important;
    }

    .sidebar-header {
      height: 84px;
      padding: 0;
      justify-content: center;

      .sidebar-pin-btn {
        opacity: 0 !important;
        pointer-events: none !important;
      }

      .logo-container {
        justify-content: center;
      }
    }

    .sidebar-nav-main {
      .nav-item.close-item {
        display: none !important;
      }

      .sidebar-dev-divider {
        margin: 6px 18px !important;
        opacity: 0.4 !important;
      }

      .nav-item,
      .nav-item.main-item {
        margin: 4px 14px !important;
        height: 44px !important;
        min-width: 44px !important;
        min-height: 44px !important;
        border-radius: 10px !important;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start !important;
        position: relative;
        overflow: hidden;

        .nav-link {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          justify-content: flex-start !important;
          gap: 0 !important;

          .nav-icon {
            width: 44px !important;
            min-width: 44px !important;
            max-width: 44px !important;
            height: 44px !important;
            font-size: 20px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            margin: 0 !important;
          }
        }

        &:hover {
          background: var(--sidebar-hover);
          border-radius: 10px !important;
        }

        &.active,
        &.group-active {
          height: 44px !important;
          min-width: 44px !important;
          min-height: 44px !important;
          margin: 4px 14px !important;
          border-radius: 10px !important;
          background: rgba(0, 155, 226, 0.12) !important;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
            bottom: 8px;
            width: 3.5px;
            border-radius: 0 4px 4px 0;
            background: var(--accent-blue);
            display: block !important;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 8px 0 12px 0;

      .nav-item {
        margin: 3px 18px !important;
        height: 36px !important;
        min-width: 36px !important;
        min-height: 36px !important;
        border-radius: 9px !important;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: flex-start !important;
        position: relative;
        overflow: hidden;

        .nav-link {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          justify-content: flex-start !important;
          gap: 0 !important;

          .nav-icon,
          .nav-icon-wrapper {
            width: 36px !important;
            min-width: 36px !important;
            max-width: 36px !important;
            height: 36px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            margin: 0 !important;

            .nav-icon {
              font-size: 18px !important;
              min-width: 18px !important;
              width: 18px !important;
              height: 18px !important;
              margin: 0 !important;
            }
          }
        }

        &:hover {
          background: var(--sidebar-hover);
          border-radius: 9px !important;
        }

        &.active {
          height: 36px !important;
          min-width: 36px !important;
          min-height: 36px !important;
          margin: 3px 18px !important;
          border-radius: 9px !important;
          background: rgba(0, 155, 226, 0.12) !important;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 6px;
            bottom: 6px;
            width: 3px;
            border-radius: 0 3px 3px 0;
            background: var(--accent-blue);
            display: block !important;
          }
        }

        &.update-item:not(.active) {
          margin: 3px 18px !important;
          background: rgba(0, 151, 215, 0.08) !important;
          border-radius: 9px !important;

          .nav-link {
            background: transparent !important;
          }
        }

        &.notifications-item {
          overflow: visible !important;

          .nav-link {
            overflow: visible !important;
          }
        }
      }
    }
  }

  .logo-text, .nav-text {
    opacity: 1;
    transition: opacity 0.2s ease 0.06s;
    white-space: nowrap;
    overflow: hidden;
    flex-shrink: 0;
  }

  .nav-arrow {
    opacity: 0.7;
    transition: opacity 0.2s ease 0.06s, transform 0.3s ease;
    white-space: nowrap;
  }

  .sidebar-header {
    position: relative;
    width: 100%;
    height: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    transition: height 0.3s ease;
    box-sizing: border-box;

    .sidebar-pin-btn {
      position: absolute;
      top: 16px;
      right: 14px;
      width: 26px;
      height: 26px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 6px;
      color: var(--sidebar-text-secondary);
      opacity: 0.35;
      cursor: pointer;
      transition: opacity 0.25s ease, background-color 0.2s ease, color 0.2s ease;

      &:hover {
        opacity: 1;
        background: var(--sidebar-hover);
        color: var(--accent-blue);
      }

      &.pinned {
        opacity: 0.9;
        color: var(--accent-blue);
      }
    }

    &:hover .sidebar-pin-btn:not(.pinned) {
      opacity: 0.7;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      cursor: pointer;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: scale(1.08);
      }

      &:active {
        transform: scale(0.95);
      }

      .logo-svg {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        filter: drop-shadow(0 3px 12px rgba(0, 155, 226, 0.35));
      }
    }
  }

  .sidebar-nav-main {
    flex: 1;
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    &::before,
    &::after {
      content: '';
      margin: auto;
    }
  }

  .sidebar-footer {
    padding: 8px 0 12px 0;
    border-top: 1px solid var(--sidebar-border);
    background: transparent;

    .nav-item {
      margin: 3px 18px;
      height: 36px;
      min-height: 36px;
      border-radius: 9px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;

      .nav-link {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        padding: 0 10px 0 0;
        text-decoration: none;
        gap: 0;
        color: var(--sidebar-text-secondary);

        .nav-icon,
        .nav-icon-wrapper {
          width: 36px;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin: 0;

          .nav-icon {
            font-size: 18px;
            min-width: 18px;
            color: var(--sidebar-text-secondary);
            opacity: 0.8;
          }
        }

        .nav-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--sidebar-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex-shrink: 0;
          margin-left: 2px;
        }

        &:hover {
          color: var(--sidebar-text);

          .nav-icon,
          .nav-text {
            color: var(--sidebar-text);
            opacity: 1;
          }
        }
      }

      &:hover {
        background: var(--sidebar-hover);
        border-radius: 9px;
      }

      &.active {
        background: rgba(0, 155, 226, 0.12);
        border-radius: 9px;

        .nav-link {
          color: var(--accent-blue);

          .nav-icon,
          .nav-text {
            color: var(--accent-blue);
            opacity: 1;
            font-weight: 600;
          }
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--accent-blue);
          display: block !important;
        }
      }

      &.update-item:not(.active) {
        background: rgba(0, 151, 215, 0.08);
        border-radius: 9px;

        .nav-link {
          background: transparent;

          .nav-icon,
          .nav-text {
            color: var(--accent-blue);
          }
        }
      }

      &.notifications-item {
        overflow: visible !important;

        .nav-link {
          overflow: visible !important;
        }
      }
    }
  }

  .nav-item {
    position: relative;
    margin: 4px 14px;
    border-radius: 10px;
    overflow: hidden;
    
    &.close-item {
      display: none;
      margin-bottom: 8px;
      
      .close-sidebar-btn {
        background: none;
        border: none;
        width: 100%;
        display: flex;
        align-items: center;
        padding: 12px 14px;
        color: var(--accent-blue);
        gap: 12px;
        font-size: 14.5px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 10px;
        
        .nav-icon {
          font-size: 20px;
          min-width: 20px;
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
      margin: 4px 14px;
      min-height: 44px;
      
      > .nav-link {
        display: flex;
        align-items: center;
        height: 44px;
        padding: 0 12px 0 0;
        font-size: 14.5px;
        font-weight: 500;
        text-decoration: none;
        gap: 0;
        color: var(--sidebar-text);
        border-radius: 10px;
        position: relative;
        transition: background-color 0.15s ease, color 0.15s ease;
        
        .nav-icon {
          width: 44px;
          min-width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 20px;
          margin: 0;
          color: var(--sidebar-text-secondary);
          opacity: 0.85;
          transition: color 0.2s ease, opacity 0.2s ease;
        }
        
        .nav-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
          flex-shrink: 0;
          margin-left: 2px;
        }

        .nav-arrow {
          font-size: 16px;
          margin-left: auto;
          flex-shrink: 0;
          color: var(--sidebar-text-secondary);
          transition: transform 0.3s ease, opacity 0.2s ease;
          opacity: 0.7;
          
          &.expanded {
            transform: rotate(90deg);
          }
        }

        &:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text);

          .nav-icon {
            color: var(--sidebar-text);
            opacity: 1;
          }

          .nav-text {
            color: var(--sidebar-text);
          }
        }
      }
    }
    
    &.active {
      > .nav-link {
        background: rgba(0, 155, 226, 0.12);
        border-radius: 10px;
        color: var(--accent-blue);

        .nav-icon {
          color: var(--accent-blue);
          opacity: 1;
        }

        .nav-text {
          color: var(--accent-blue);
          font-weight: 600;
        }

        .nav-arrow {
          color: var(--accent-blue);
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3.5px;
          border-radius: 0 4px 4px 0;
          background: var(--accent-blue);
        }
      }
    }

    &.group-active {
      > .nav-link {
        background: rgba(0, 155, 226, 0.08);
        border-radius: 10px;
        color: var(--sidebar-text);

        .nav-icon {
          color: var(--accent-blue);
          opacity: 1;
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 3.5px;
          border-radius: 0 4px 4px 0;
          background: var(--accent-blue);
          opacity: 0.6;
        }
      }
    }
  }

  .sidebar-dev-divider {
    height: 1px;
    margin: 6px 18px;
    background: var(--sidebar-border, rgba(255, 255, 255, 0.08));
    opacity: 0.6;
    transition: margin 0.3s ease, opacity 0.3s ease;
  }

  .nav-submenu {
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.expanded {
      max-height: 500px;
      padding: 2px 0 4px 0;
    }

    .nav-submenu-divider {
      height: 1px;
      margin: 4px 16px 4px 44px;
      background: var(--sidebar-border, rgba(255, 255, 255, 0.08));
    }
    
    .nav-item {
      margin: 1px 12px 1px 36px !important;
      min-height: 28px !important;
      height: 28px !important;
      border-radius: 6px !important;
      display: flex !important;
      align-items: center !important;
      background: transparent !important;
      overflow: hidden !important;
      
      &.active {
        background: rgba(0, 155, 226, 0.12) !important;

        .nav-link {
          color: var(--accent-blue) !important;
          font-weight: 600 !important;

          .nav-text {
            color: var(--accent-blue) !important;
            font-weight: 600 !important;
          }
        }

        &::before {
          display: none !important;
        }
      }

      .nav-link {
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        height: 28px !important;
        min-height: 28px !important;
        padding: 0 10px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--sidebar-text-secondary) !important;
        border-radius: 6px !important;
        text-decoration: none !important;
        transition: background-color 0.15s ease, color 0.15s ease !important;
        
        .nav-text {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          font-size: 13px !important;
          font-weight: inherit !important;
          color: inherit !important;
        }

        &:hover {
          color: var(--sidebar-text) !important;
          background: var(--sidebar-hover) !important;

          .nav-text {
            color: var(--sidebar-text) !important;
          }
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

.pulse-high {
  animation: pulse-border-high 2s infinite;
}

.pulse-urgent {
  animation: pulse-border-urgent 1.5s infinite;
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

@keyframes pulse-border-high {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

@keyframes pulse-border-urgent {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

@media (max-height: 820px) {
  .dashboard-sidebar {
    .sidebar-header {
      padding: 0;
      height: 68px;

      .logo-container {
        width: 42px;
        height: 42px;

        .logo-svg {
          width: 38px;
          height: 38px;
        }
      }

      .sidebar-pin-btn {
        top: 12px;
        right: 12px;
      }
    }

    .sidebar-nav-main {
      padding: 8px 0;
      gap: 0;

      .nav-item.main-item {
        margin: 2px 14px;
        min-height: 40px;

        > .nav-link {
          height: 40px;

          .nav-icon {
            width: 44px;
            min-width: 44px;
            height: 40px;
            font-size: 19px;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 6px 0 10px 0;

      .nav-item {
        margin: 2px 18px;
        height: 34px;
        min-height: 34px;

        .nav-link {
          height: 34px;

          .nav-icon,
          .nav-icon-wrapper {
            width: 36px;
            min-width: 36px;
            height: 34px;

            .nav-icon {
              font-size: 17px;
              width: 17px;
              height: 17px;
            }
          }
        }
      }
    }

    .sidebar-dev-divider {
      margin: 4px 18px !important;
    }

    .nav-submenu {
      padding: 0;

      &.expanded {
        padding: 1px 0 3px 0;
      }

      .nav-submenu-divider {
        margin: 3px 12px 3px 40px;
      }

      .nav-item {
        margin: 1px 12px 1px 36px !important;
        min-height: 26px !important;
        height: 26px !important;

        .nav-link {
          height: 26px !important;
          min-height: 26px !important;
          font-size: 12px !important;
          padding: 0 8px !important;

          .nav-text {
            font-size: 12px !important;
          }
        }
      }
    }

    &.is-collapsed {
      .sidebar-header {
        height: 68px;
      }

      .sidebar-nav-main {
        .nav-item.close-item {
          display: none !important;
        }

        .nav-item,
        .nav-item.main-item {
          margin: 2px 14px !important;
          height: 40px !important;
          min-width: 44px !important;
          min-height: 40px !important;
          justify-content: flex-start !important;

          .nav-link .nav-icon {
            width: 44px !important;
            height: 40px !important;
          }

          &.active,
          &.group-active {
            height: 40px !important;
            min-width: 44px !important;
            min-height: 40px !important;
            margin: 2px 14px !important;

            &::before {
              top: 7px;
              bottom: 7px;
            }
          }
        }
      }

      .sidebar-footer {
        .nav-item {
          margin: 2px 18px !important;
          height: 34px !important;
          min-width: 36px !important;
          min-height: 34px !important;
          border-radius: 8px !important;
          justify-content: flex-start !important;

          .nav-link {
            .nav-icon,
            .nav-icon-wrapper {
              width: 36px !important;
              min-width: 36px !important;
              height: 34px !important;
            }
          }

          &.active {
            height: 34px !important;
            min-width: 36px !important;
            min-height: 34px !important;
            margin: 2px 18px !important;
            border-radius: 8px !important;

            &::before {
              top: 5px;
              bottom: 5px;
            }
          }

          &.update-item:not(.active) {
            margin: 2px 18px !important;
            min-width: 36px !important;
            height: 34px !important;
            border-radius: 8px !important;
          }
        }
      }
    }
  }
}

@media (max-height: 720px) {
  .dashboard-sidebar {
    .sidebar-header {
      padding: 0;
      height: 56px;

      .logo-container {
        width: 36px;
        height: 36px;

        .logo-svg {
          width: 32px;
          height: 32px;
        }
      }

      .sidebar-pin-btn {
        top: 10px;
        right: 10px;
      }
    }

    .sidebar-nav-main {
      padding: 4px 0;
      gap: 0;

      .nav-item.main-item {
        margin: 1px 14px;
        min-height: 36px;

        > .nav-link {
          height: 36px;

          .nav-icon {
            width: 44px;
            min-width: 44px;
            height: 36px;
            font-size: 18px;
          }
        }
      }
    }

    .sidebar-footer {
      padding: 4px 0 6px 0;

      .nav-item {
        margin: 1px 18px;
        height: 32px;
        min-height: 32px;

        .nav-link {
          height: 32px;

          .nav-icon,
          .nav-icon-wrapper {
            width: 36px;
            min-width: 36px;
            height: 32px;

            .nav-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .sidebar-dev-divider {
      margin: 2px 18px !important;
    }

    .nav-submenu {
      padding: 0;

      &.expanded {
        padding: 1px 0 2px 0;
      }

      .nav-submenu-divider {
        margin: 2px 10px 2px 36px;
      }

      .nav-item {
        margin: 1px 10px 1px 32px !important;
        min-height: 24px !important;
        height: 24px !important;

        .nav-link {
          height: 24px !important;
          min-height: 24px !important;
          font-size: 11px !important;
          padding: 0 6px !important;

          .nav-text {
            font-size: 11px !important;
          }
        }
      }
    }

    &.is-collapsed {
      .sidebar-header {
        height: 56px;
      }

      .sidebar-nav-main {
        .nav-item.close-item {
          display: none !important;
        }

        .nav-item,
        .nav-item.main-item {
          margin: 1px 14px !important;
          height: 36px !important;
          min-width: 44px !important;
          min-height: 36px !important;
          justify-content: flex-start !important;

          .nav-link .nav-icon {
            width: 44px !important;
            height: 36px !important;
          }

          &.active,
          &.group-active {
            height: 36px !important;
            min-width: 44px !important;
            min-height: 36px !important;
            margin: 1px 14px !important;

            &::before {
              top: 5px;
              bottom: 5px;
            }
          }
        }
      }

      .sidebar-footer {
        .nav-item {
          margin: 1px 18px !important;
          height: 32px !important;
          min-width: 36px !important;
          min-height: 32px !important;
          border-radius: 7px !important;
          justify-content: flex-start !important;

          .nav-link {
            .nav-icon,
            .nav-icon-wrapper {
              width: 36px !important;
              min-width: 36px !important;
              height: 32px !important;
            }
          }

          &.active {
            height: 32px !important;
            min-width: 36px !important;
            min-height: 32px !important;
            margin: 1px 18px !important;
            border-radius: 7px !important;

            &::before {
              top: 4px;
              bottom: 4px;
            }
          }

          &.update-item:not(.active) {
            margin: 1px 18px !important;
            min-width: 36px !important;
            height: 32px !important;
            border-radius: 7px !important;
          }
        }
      }
    }
  }
}
</style>
