<template>
  <div class="dashboard-sidebar">
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
      <!-- Botão de fechar integrado na navegação -->
      <div class="nav-item close-item">
        <button class="close-sidebar-btn" @click="closeSidebar">
          <v-icon class="nav-icon">mdi-arrow-left</v-icon>
          <span class="nav-text">Fechar menu</span>
        </button>
      </div>
      
      <!-- Página Inicial -->
      <div class="nav-item main-item" :class="{ active: currentView === 'home' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('home')">
          <v-icon class="nav-icon">mdi-home</v-icon>
          <span class="nav-text">Página Inicial</span>
        </a>
      </div>

      <!-- Álbuns e Coletâneas -->
      <div class="nav-item main-item">
        <a href="#" class="nav-link" @click.prevent="toggleSubmenu('albums')">
          <v-icon class="nav-icon">mdi-play</v-icon>
          <span class="nav-text">Álbuns e Coletâneas</span>
          <v-icon class="nav-arrow" :class="{ expanded: submenuOpen.albums }">
            mdi-chevron-right
          </v-icon>
        </a>
        <div class="nav-submenu" :class="{ expanded: submenuOpen.albums }">
          <div class="nav-item">
            <a href="#" class="nav-link" @click.prevent="openModule('hymnal')">
              <span class="nav-text">Hinário Adventista</span>
            </a>
          </div>
          <div class="nav-item">
            <a href="#" class="nav-link" @click.prevent="openModule('hymnal_1996')">
              <span class="nav-text">Hinário Adventista 1996</span>
            </a>
          </div>
          <div class="nav-item">
            <a href="#" class="nav-link" @click.prevent="openModule('collections')">
              <span class="nav-text">Coletâneas</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Bíblia -->
      <div class="nav-item main-item" :class="{ active: currentView === 'bible' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('bible')">
          <v-icon class="nav-icon">mdi-book</v-icon>
          <span class="nav-text">Bíblia</span>
        </a>
      </div>

      <!-- Favoritos -->
      <div class="nav-item main-item" :class="{ active: currentView === 'favorites' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('favorites')">
          <v-icon class="nav-icon">mdi-heart</v-icon>
          <span class="nav-text">Favoritos</span>
        </a>
      </div>

      <!-- Utilitários -->
      <div class="nav-item main-item">
        <a href="#" class="nav-link" @click.prevent="openModule('clock')">
          <v-icon class="nav-icon">mdi-plus-circle</v-icon>
          <span class="nav-text">Utilitários</span>
        </a>
      </div>
    </nav>

    <!-- Footer Navigation -->
    <div class="sidebar-footer">
      <div class="nav-item" :class="{ active: currentView === 'help' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('help')">
          <v-icon class="nav-icon">mdi-help-circle</v-icon>
          <span class="nav-text">Ajuda e sobre</span>
        </a>
      </div>
      <div class="nav-item" :class="{ active: currentView === 'settings' }">
        <a href="#" class="nav-link" @click.prevent="navigateTo('settings')">
          <v-icon class="nav-icon">mdi-cog</v-icon>
          <span class="nav-text">Configurações</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardSidebar",
  props: {
    currentView: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      submenuOpen: {
        albums: false
      }
    }
  },
  methods: {
    closeSidebar() {
      // Emite evento para fechar a sidebar
      this.$emit('close-sidebar');
    },
    
    navigateTo(page) {
      this.$emit('navigate', page);
    },
    
    openModule(moduleId) {
      // Abre o módulo usando o sistema existente
      this.$modules.open(moduleId);
    },
    
    toggleSubmenu(submenu) {
      this.submenuOpen[submenu] = !this.submenuOpen[submenu];
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/styles/layout/sidebar.scss';
</style>