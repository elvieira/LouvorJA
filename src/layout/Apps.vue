<template>
  <!-- Versão adaptada para o home - lista todos os módulos -->
  <div class="dashboard-modules">
    <div class="content-header">
      <MenuToggleButton @toggle-sidebar="toggleSidebar" />
      <h1 class="page-title">Todos os Módulos</h1>
    </div>
    
    <div class="content-main">
      <div class="apps-legacy">
        <v-expansion-panels v-model="panels_active" flat multiple :rounded="false">
          <v-expansion-panel
            v-for="(group, group_key) in module_group"
            :key="group_key"
          >
            <v-expansion-panel-title
              v-if="countModules(group.modules) != 0"
              class="my-0 py-0"
            >
              {{ $t(group.title) }}
            </v-expansion-panel-title>
            <v-expansion-panel-text v-if="countModules(group.modules) != 0">
              <v-container fluid class="my-0 py-0">
                <v-row class="my-0 py-0">
                  <template
                    v-for="(module, module_key) in sortModules(group.modules)"
                    :key="module_key"
                  >
                <v-card
                  v-if="
                    module.language
                      ? module.language == language
                      : !module.development || (is_dev && module.development)
                  "
                  hover
                  :color="
                    module.invalid
                      ? 'error'
                      : module.development
                      ? 'warning'
                      : $theme.primary()
                  "
                  @click="$modules.open(module_key)"
                  class="ma-2"
                  :width="130"
                >
                  <div
                    class="d-flex flex-column align-center justify-center h-100"
                  >
                    <v-avatar class="ma-3" rounded="0" size="40">
                      <v-icon :icon="module.icon" color="#FFFFFF" :size="40" />
                    </v-avatar>
                    <div class="w-100">
                      <v-card-title
                        class="text-caption text-center"
                        style="text-wrap: initial"
                      >
                        {{ module.title ? $t(module.title) : "" }}
                      </v-card-title>
                    </div>
                  </div>
                </v-card>
              </template>
            </v-row>
          </v-container>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
      </div>
    </div>
  </div>
</template>

<script>
import MenuToggleButton from "@/components/MenuToggleButton.vue";

export default {
  name: "AppsLayout",
  components: {
    MenuToggleButton
  },
  data: () => ({
    panels_active: [],

    selectedTheme: "",
    themes: [],
  }),
  watch: {
    module_group() {
      this.panels_active = Object.keys(this.module_group).map((_, key) => key);
    },
  },
  computed: {
    module_group() {
      return Object.entries(this.$modules.getGroups())
        .filter(([, value]) => Object.keys(value.modules).length > 0)
        .reduce((result, [key, value]) => {
          result[key] = value;
          return result;
        }, {});
    },
    is_dev: {
      get() {
        return this.$appdata.get("is_dev");
      },
      set(value) {
        if (!value) {
          this.$appdata.set("is_dev", value);
        }
      },
    },
    language: {
      get() {
        return this.$userdata.get("language");
      },
      set(value) {
        if (!value) {
          this.$userdata.set("language", value);
        }
      },
    },
  },
  methods: {
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    sortModules(modules) {
      //Ordena pelo idioma selecionado
      return this.$modules.sort(modules, this.$t);
    },
    countModules(modules) {
      return Object.keys(modules).filter((key) =>
        !this.is_dev
          ? !modules[key].development || modules[key].development === false
          : true
      ).length;
    },
  },
};
</script>

<style scoped lang="scss">
.dashboard-modules {
  height: 100%;
}

.content-header {
  display: flex;
  align-items: center;
  padding: 16px 0;
  
  .page-title {
    margin: 0;
  }
  
  @media (min-width: 901px) {
    .menu-toggle-btn {
      display: none;
    }
  }
}

.apps-legacy {
  overflow: auto !important;
  width: 100%;
  
  .v-expansion-panels {
    background: transparent;
  }
  
  .v-expansion-panel {
    background: var(--card-bg, #ffffff);
    margin-bottom: 16px;
    border-radius: var(--border-radius, 8px);
    box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.1));
  }
  
  .v-card {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover, 0 4px 16px rgba(0,0,0,0.15));
    }
  }
}
</style>
