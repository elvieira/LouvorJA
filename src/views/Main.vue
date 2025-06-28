<template>
  <!-- Componentes de sistema que devem continuar -->
  <AppSystemBar />
  <AppModules />
  <AppAlert />

  <!-- Novo Layout Dashboard -->
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <Sidebar @navigate="handleNavigation" />
    
    <!-- Área Principal -->
    <div class="dashboard-content">
      <!-- Renderiza o componente baseado na navegação -->
      <Home v-if="currentView === 'home'" />
      <Apps v-else-if="currentView === 'modules'" />
      
      <!-- Placeholder para outras páginas -->
      <div v-else class="content-placeholder">
        <div class="content-header">
          <h1 class="page-title">{{ getPageTitle() }}</h1>
        </div>
        <div class="content-main">
          <v-alert type="info" variant="tonal">
            Página "{{ currentView }}" em desenvolvimento
          </v-alert>
        </div>
      </div>
    </div>
  </div>

  <!-- Componentes de sistema (posicionados de forma absoluta) -->
  <!-- Tray Area (módulos minimizados) -->
  <AppTrayArea />

  <AppFooter />
</template>

<script>
import AppSystemBar from "@/layout/SystemBar.vue";
import AppFooter from "@/layout/Footer.vue";
import AppModules from "@/layout/Modules.vue";
import AppAlert from "@/layout/Alert.vue";
import Apps from "@/layout/Apps.vue";
import AppTrayArea from "@/layout/TrayArea.vue";
import DashboardSidebar from "@/components/Sidebar.vue";
import DashboardHome from "@/components/Home.vue";

export default {
  name: "MainPage",
  components: {
    AppSystemBar,
    AppFooter,
    AppModules,
    AppAlert,
    Apps,
    AppTrayArea,
    Sidebar: DashboardSidebar,
    Home: DashboardHome,
  },
  data() {
    return {
      currentView: 'home' // 'home', 'modules', 'favorites', 'help', 'settings'
    }
  },
  methods: {
    handleNavigation(page) {
      this.currentView = page;
    },
    
    getPageTitle() {
      const titles = {
        'home': 'Dashboard',
        'modules': 'Módulos',
        'favorites': 'Favoritos',
        'help': 'Ajuda e Sobre',
        'settings': 'Configurações'
      };
      return titles[this.currentView] || 'Página';
    }
  },
  mounted() {
    //Carregar os dados salvos
    this.$userdata.load();

    //Carrega o tema
    let theme = this.$userdata.get("theme");
    if (theme != "") {
      this.$vuetify.theme.global.name = theme;
    }
    this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);

    //Carrega o idioma
    let lang = this.$userdata.get("language");
    if (lang != "") {
      this.$i18n.locale = lang;
    } else {
      this.$userdata.set("language", this.$i18n.locale);
    }

    //Checa se está em modo de desenvolvimento
    let is_dev = import.meta.env.VITE_APP_MODE == "development";
    this.$appdata.set("is_dev", is_dev);

    if (!is_dev) {
      //Prevenir REFRESH
      window.addEventListener("beforeunload", (event) => {
        event.preventDefault();
        event.returnValue = "";
      });
    }

    //Checa as plataformas
    this.$appdata.set(
      "is_mobile",
      this.$vuetify.display.platform.android ||
        this.$vuetify.display.platform.ios
    );

    if (this.$vuetify.display.platform.electron) {
      this.$appdata.set("is_desktop", true);
    } else {
      this.$appdata.set("is_desktop", false);
      this.$appdata.set("is_online", true);
    }

    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin) {
        if (event.data == "mounted") {
          const popup = this.$appdata.get("popup");
          if (popup) {
            const data = this.$appdata.getFlatten();
            Object.keys(data).map((item) => {
              popup.postMessage(
                { param: item, value: data[item] },
                window.location.origin
              );
            });
            //popup.postMessage({ all: data }, window.location.origin);
          }
        }
      }
    });

    /*********************************************************************/
    /*********************************************************************/
    /* ********************* PROVISORIO ******************************** */
    if (is_dev) {
      //const self = this;
      setTimeout(function () {
        //self.$media.open({ id_music: 112, mode: "audio", minimized: false });
        //self.$modules.open("clock");
        //self.$modules.open("collections");
        //self.$media.openAlbum(9);
      }, 100);
    }
    /*********************************************************************/
    /*********************************************************************/
  },
};
</script>

<style>
main {
  display: flex !important;
  flex: auto !important;
  align-items: stretch !important;
  --v-layout-top: 0 !important;
  padding-top: 0 !important;
  overflow: auto !important;
  width: 100% !important;
  max-width: 100vw !important;
}

.dashboard-layout {
  width: 100% !important;
  max-width: 100% !important;
}
</style>
