<template>
  <div style="background: linear-gradient(135deg, rgba(0,151,215,0.15) 0%, rgba(0,151,215,0.05) 100%); padding: 24px 24px 20px;">
    <div class="d-flex align-center justify-space-between">
      <div class="d-flex align-center" style="gap: 12px;">
        <div>
          <div class="text-h6 font-weight-bold" style="color: var(--sidebar-text); line-height: 1.2;">
            {{ updateStatus === 'not-available' ? 'Tudo atualizado!' : 'Nova Versão Disponível' }}
          </div>
          <div class="text-caption mt-1" style="color: var(--sidebar-text-secondary);">
            {{ updateVersion ? 'v' + updateVersion : (updateStatus === 'not-available' ? 'Nenhuma atualização pendente.' : 'Processando informações...') }}
          </div>
        </div>
      </div>
      <v-btn icon variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
        <v-tooltip
          activator="parent"
          location="bottom"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          Fechar
        </v-tooltip>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UpdateHeader",
  props: {
    updateStatus: {
      type: String,
      required: true,
    },
    updateVersion: {
      type: String,
      default: "",
    },
  },
  emits: ["close"],
});
</script>
