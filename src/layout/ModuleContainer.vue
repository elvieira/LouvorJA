<template>
  <Window
    v-if="manifest"
    v-model="module.show"
    :title="t('title')"
    :icon="module.icon"
    closable
    minimizable
    :size="manifest?.moduleOptions?.size ?? null"
    @close="close()"
    @minimize="minimize()"
  >
    <template #header>
      <slot name="header" />
    </template>
    <template #left>
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
    </template>

    <template #default>
      <slot />
    </template>
  </Window>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Window from "@/components/Window.vue";

export default defineComponent({
  name: "ModuleContainer",
  components: {
    Window,
  },
  props: {
    manifest: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
  },
  emits: ["show", "close", "minimize"],
  computed: {
    module_id(): string {
      return this.manifest.id;
    },
    module(): any {
      return this.$modules.get(this.module_id);
    },
    show(): boolean {
      return this.module.show;
    },
  },
  watch: {
    show(value: boolean) {
      this.$emit("show", value);
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    close() {
      this.$modules.close(this.module_id);
      this.$emit("close");
    },
    minimize() {
      this.$modules.minimize(this.module_id);
      this.$emit("minimize");
    },
  },
});
</script>
