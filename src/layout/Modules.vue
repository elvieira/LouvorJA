<template>
  <div v-if="import_modules">
    <component
      :is="loadModuleComponent(module)"
      v-for="module in modules"
      :key="module.id"
    />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

export default defineComponent({
  name: "ModulesLayout",
  data() {
    return {
      // Cache de componentes para evitar recriação em cada re-render
      componentCache: {} as Record<string, any>,
    };
  },
  computed: {
    modules(): Record<string, any> {
      return this.$modules.get();
    },
    import_modules(): boolean {
      return this.$appdata.get("import_modules");
    },
  },
  methods: {
    loadModuleComponent(module: any) {
      // Retorna do cache se já foi carregado, evitando remount
      if (this.componentCache[module.id]) {
        return this.componentCache[module.id];
      }

      const comp = defineAsyncComponent(() => {
        // Encontra o componente em qualquer subdiretório de modules usando import.meta.glob
        const moduleComponents = import.meta.glob("@/modules/**/interface/Index.vue");
        const match = Object.keys(moduleComponents).find(path => path.endsWith(`/${module.id}/interface/Index.vue`));
        
        if (match) {
          return moduleComponents[match]() as Promise<any>;
        } 
        return Promise.reject(new Error(`Module component ${module.id} not found`)).catch((e: Error) => {
          this.$alert.error({
            text: "messages.error_import_module",
            error: e,
          });
          return null;
        });
        
      });

      this.componentCache[module.id] = comp;
      return comp;
    },
  },
});
</script>
