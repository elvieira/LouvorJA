<template>
  <v-navigation-drawer
    v-model="show"
    :location="$vuetify.display.width < 600 ? 'bottom' : undefined"
    temporary
  >
    <v-list :base-color="$theme.primary()" nav>
      <template
        v-for="(module, module_key) in sortModules(menu_modules)"
        :key="module_key"
      >
        <v-list-item
          v-if="
            module.language
              ? module.language == language
              : !module.development || (is_dev && module.development)
          "
          :prepend-icon="module.icon"
          @click="
            $appdata.toogle('menu.show');
            $modules.open(module_key);
          "
        >
          <v-list-item-title>{{ $t(module.title) }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MenuLayout",
  computed: {
    show: {
      get(): boolean {
        return this.$appdata.get("menu.show");
      },
      set(value: boolean) {
        if (!value) {
          this.$appdata.toogle("menu.show");
        }
      },
    },
    menu_modules(): Record<string, any> {
      return this.$modules.getMenu();
    },
    modules(): Record<string, any> {
      return this.$appdata.get("modules");
    },
    is_dev: {
      get(): boolean {
        return this.$appdata.get("is_dev");
      },
      set(value: boolean) {
        if (!value) {
          this.$appdata.set("is_dev", value);
        }
      },
    },
    language: {
      get(): string {
        return this.$userdata.get("language");
      },
      set(value: string) {
        if (!value) {
          this.$userdata.set("language", value);
        }
      },
    },
  },
  methods: {
    sortModules(modules: Record<string, any>) {
      return this.$modules.sort(modules, this.$t);
    },
  },
});
</script>
