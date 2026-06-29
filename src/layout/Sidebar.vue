<template>
  <!-- Overlay para fechar sidebar em mobile -->
  <div
    v-if="isOpen && isMobile"
    class="sidebar-overlay"
    @click="closeSidebar"
  />

  <!-- Sidebar -->
  <div class="dashboard-sidebar" :class="{ open: isOpen }">
    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/ico/favicon.svg" alt="LouvorJA" class="logo-svg" />
        <div class="logo-text">
          <span class="logo-title">LOUVOR JA</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation (centralized) -->
    <nav class="sidebar-nav-main">
      <!-- Botão de fechar integrado na navegação (mobile) -->
      <div class="nav-item close-item">
        <button class="close-sidebar-btn" @click="closeSidebar">
          <v-icon class="nav-icon">
            mdi-arrow-left
          </v-icon>
          <span class="nav-text">Fechar menu</span>
        </button>
      </div>
      
      <!-- Página Inicial -->
      <div class="nav-item main-item" :class="{ active: currentModule === 'home' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('home')">
          <v-icon class="nav-icon">
            mdi-home
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.home") }}</span>
        </a>
      </div>

      <!-- Módulos agrupados por categoria -->
      <template v-for="(group, groupKey) in moduleGroups" :key="groupKey">
        <!-- Grupo Bible: sem submenu, abre direto -->
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
        
        <!-- Outros grupos: com submenu -->
        <div 
          v-else 
          class="nav-item main-item"
          :class="{ 'group-active': isGroupActive(group) && !submenuOpen[groupKey] }"
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

      <!-- Módulos individuais (sem grupo) -->
      <template v-for="(module, moduleKey) in individualModules" :key="moduleKey">
        <div
          v-if="shouldShowModule(moduleKey)"
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

    <!-- Footer Navigation -->
    <div class="sidebar-footer">
      <div v-if="isDesktop" class="nav-item" :class="{ active: currentModule === 'sync' }">
        <a href="#" class="nav-link" @click.prevent="openModule('sync')">
          <v-icon 
            class="nav-icon" 
            :color="currentModule === 'sync' ? '' : 'primary'"
          >
            mdi-library
          </v-icon>
          <span class="nav-text font-weight-bold" :style="{ color: currentModule === 'sync' ? '' : 'var(--accent-blue)' }">Biblioteca Local</span>
          
          <div 
            v-if="isDownloading"
            class="v-icon"
            style="position: relative; margin-left: auto; width: 22px; height: 22px;"
          >
            <v-icon 
              class="mdi-spin" 
              :color="currentModule === 'sync' ? '' : 'primary'"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            >
              mdi-loading
            </v-icon>
            <v-icon 
              :color="currentModule === 'sync' ? '' : 'primary'"
              size="12"
              style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;"
            >
              mdi-arrow-down
            </v-icon>
          </div>
        </a>
      </div>
      
      <div class="nav-item" :class="{ active: currentRoute === 'help' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('help')">
          <v-icon class="nav-icon">
            mdi-help-circle
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.help") }}</span>
        </a>
      </div>
      <div class="nav-item" :class="{ active: currentModule === 'theme' }">
        <a href="#" class="nav-link" @click.prevent="openModule('theme')">
          <v-icon class="nav-icon">
            mdi-cog
          </v-icon>
          <span class="nav-text">{{ $t("sidebar.settings") }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardSidebar",
  components: {
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      submenuOpen: {},
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    isOpen: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    isMobile() {
      return this.windowWidth <= 1024;
    },
    isDesktop() {
      return window.electronAPI && window.electronAPI.isElectron;
    },
    currentRoute() {
      return this.$route.name?.toLowerCase() || "";
    },
    currentModule() {
      // Detecta qual módulo está aberto
      const modules = this.$appdata.get("modules") || {};
      const overlays = ["album", "media", "lyric"];
      
      // Se a sincronização (que é um overlay visual) estiver aberta, ela ganha prioridade na barra lateral
      if (modules['sync']?.show) {
        return 'sync';
      }
      
      for (const [key, module] of Object.entries(modules)) {
        if (module.show && !overlays.includes(key) && key !== 'sync') {
          return key;
        }
      }
      return null;
    },
    moduleGroups() {
      const groups = this.$appdata.get("module_group") || {};
      const result = {};
      
      // Adicionar ícones aos grupos
      const groupIcons = {
        musics: "mdi-play",
        bible: "mdi-book",
        utilities: "mdi-plus-circle",
      };

      for (const [key, group] of Object.entries(groups)) {
        if (group.modules && group.modules.length > 0) {
          result[key] = {
            ...group,
            icon: groupIcons[key] || "mdi-folder",
          };
        }
      }

      return result;
    },
    individualModules() {
      const allModules = this.$appdata.get("modules") || {};
      const groups = this.$appdata.get("module_group") || {};
      const groupedModuleIds = new Set();
      
      // Coletar IDs dos módulos que estão em grupos
      Object.values(groups).forEach((group) => {
        if (group.modules) {
          group.modules.forEach((id) => groupedModuleIds.add(id));
        }
      });
      
      // Retornar apenas módulos que não estão em nenhum grupo
      const result = {};
      for (const [key, module] of Object.entries(allModules)) {
        if (!groupedModuleIds.has(key) && module.showInMainMenu) {
          result[key] = module;
        }
      }
      
      return result;
    },
    language() {
      return this.$userdata.get("language");
    },
    isDev() {
      return this.$appdata.get("is_dev");
    },
    isDownloading() {
      return this.$appdata.get("sync_is_downloading") === true;
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
    closeSidebar() {
      this.isOpen = false;
    },

    navigateTo(route) {
      if (route === "home") {
        this.$modules.open("home");
      }
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
    openModule(moduleId) {
      this.$modules.open(moduleId);
      if (this.isMobile) {
        this.closeSidebar();
      }
    },
    toggleSubmenu(submenu) {
      const isCurrentlyOpen = this.submenuOpen[submenu];
      let wasAnyOtherOpen = false;
      
      // Fecha todos os submenus primeiro
      Object.keys(this.submenuOpen).forEach(key => {
        if (key !== submenu && this.submenuOpen[key]) {
          wasAnyOtherOpen = true;
        }
        this.submenuOpen[key] = false;
      });
      
      clearTimeout(this.submenuTimeout);
      
      // Se o submenu clicado não estava aberto, abre ele agora
      if (!isCurrentlyOpen) {
        if (wasAnyOtherOpen) {
          this.submenuTimeout = setTimeout(() => {
            this.submenuOpen[submenu] = true;
          }, 300); // Tempo da transição CSS
        } else {
          this.submenuOpen[submenu] = true;
        }
      }
    },
    isGroupActive(group) {
      if (!group || !group.modules) return false;
      return group.modules.includes(this.currentModule);
    },
    shouldShowModule(moduleId) {
      const module = this.$appdata.get(`modules.${moduleId}`);
      if (!module) return false;
      
      // Verifica idioma
      if (module.language && module.language !== this.language) {
        return false;
      }
      
      // Verifica modo desenvolvimento
      if (module.development && !this.isDev) {
        return false;
      }
      
      return true;
    },
    getModuleTitle(moduleId) {
      const module = this.$appdata.get(`modules.${moduleId}`);
      return module ? this.$t(module.title) : moduleId;
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/layout/sidebar.scss";
</style>
