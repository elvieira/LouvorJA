<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-4" v-html="t('intro.p1')" />
    <p class="mb-4" v-html="t('intro.p2')" />
    <p v-html="t('intro.p3')" />
    
    <v-alert
      type="success"
      variant="tonal"
      class="rounded-xl mt-8"
      border="start"
      elevation="0"
    >
      <p class="font-weight-bold mb-1" style="font-size: 1.05rem;">
        {{ t('intro.tip_title') }}
      </p>
      <div v-html="t('intro.tip_desc')" />
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualIntro",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
