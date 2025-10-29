<template>
  <AppSystemBar />
  
  <!-- Nova Sidebar -->
  <AppSidebar v-model="sidebarOpen" />

  <AppAlert />

  <!-- Container principal com margem para sidebar -->
  <div class="main-container" :class="{ 'sidebar-open': sidebarOpen }">
    <v-main class="bg-main">
      <!-- Módulos aparecem dentro do v-main -->
      <AppModules />
      
      <!-- Router view para Home e outras páginas -->
      <router-view @toggle-sidebar="toggleSidebar" />
      
      <!-- TrayArea mantido (área de minimizados) -->
      <AppTrayArea />
    </v-main>

    <AppFooter />
  </div>
</template>

<script>
import AppSystemBar from "@/layout/SystemBar.vue";
import AppFooter from "@/layout/Footer.vue";
import AppSidebar from "@/layout/Sidebar.vue";
import AppModules from "@/layout/Modules.vue";
import AppAlert from "@/layout/Alert.vue";
import AppTrayArea from "@/layout/TrayArea.vue";

export default {
  name: "MainPage",
  components: {
    AppSystemBar,
    AppFooter,
    AppSidebar,
    AppModules,
    AppAlert,
    AppTrayArea,
  },
  data() {
    return {
      sidebarOpen: false,
    };
  },
  mounted() {
    //Carregar os dados salvos
    this.$userdata.load();

    //Carrega o tema
    const theme = this.$userdata.get("theme");
    if (theme !== "") {
      this.$vuetify.theme.global.name = theme;
    }
    this.$appdata.set("is_dark", this.$vuetify.theme.global.current.dark);

    //Carrega o idioma
    const lang = this.$userdata.get("language");
    if (lang !== "") {
      this.$i18n.locale = lang;
    } else {
      this.$userdata.set("language", this.$i18n.locale);
    }

    //Checa se está em modo de desenvolvimento
    const is_dev = import.meta.env.VITE_APP_MODE === "development";
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
        this.$vuetify.display.platform.ios,
    );

    if (this.$vuetify.display.platform.electron) {
      this.$appdata.set("is_desktop", true);
    } else {
      this.$appdata.set("is_desktop", false);
      this.$appdata.set("is_online", true);
    }

    window.addEventListener("message", (event) => {
      if (event.origin === window.location.origin) {
        if (event.data === "mounted") {
          const popup = this.$appdata.get("popup");
          if (popup) {
            const data = this.$appdata.getFlatten();
            Object.keys(data).map((item) => {
              popup.postMessage(
                { param: item, value: data[item] },
                window.location.origin,
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
      setTimeout(() => {
        //self.$media.open({ id_music: 112, mode: "audio", minimized: false });
        //self.$modules.open("clock");
        //self.$modules.open("collections");
        //self.$media.openAlbum(9);
      }, 100);
    }
    /*********************************************************************/
    /*********************************************************************/
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
  },
};
</script>

<style scoped>
/* Container principal com margem para sidebar */
.main-container {
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Mobile: sem margem (sidebar em overlay) */
@media (max-width: 1024px) {
  .main-container {
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
</style>
