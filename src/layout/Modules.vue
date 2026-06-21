<template>
  <div v-if="import_modules">
    <component
      v-for="module in modules"
      :key="module.id"
      :is="loadModuleComponent(module)"
    />
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "ModulesLayout",
  data() {
    return {
      // Cache de componentes para evitar recriação em cada re-render
      componentCache: {},
    };
  },
  computed: {
    modules() {
      return this.$modules.get();
    },
    import_modules() {
      return this.$appdata.get("import_modules");
    },
  },
  methods: {
    loadModuleComponent(module) {
      // Retorna do cache se já foi carregado, evitando remount
      if (this.componentCache[module.id]) {
        return this.componentCache[module.id];
      }

      const comp = defineAsyncComponent(() => {
        // Try to load from modules interface directory
        return import(`@/modules/core/${module.id}/interface/Index.vue`).catch(
          () => {
            // Try to load from CUSTOM module interface directory
            return import(`@/modules/${module.id}/interface/Index.vue`).catch((e) => {
              this.$alert.error({
                text: "messages.error_import_module",
                error: e,
              });

              return null
            });
          }
        );
      });

      this.componentCache[module.id] = comp;
      return comp;
    },
  },
};
</script>
