<template>
  <div style="padding: 16px 24px 20px;">
    <!-- Barra de progresso -->
    <div v-if="updateStatus === 'downloading'" class="mb-4">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption font-weight-medium" style="color: var(--sidebar-text-secondary);">Baixando atualização...</span>
        <span class="text-caption font-weight-bold" style="color: var(--accent-blue);">{{ Math.round(downloadPercent) }}%</span>
      </div>
      <div style="height: 6px; background: rgba(0,151,215,0.1); border-radius: 6px; overflow: hidden;">
        <div 
          style="height: 100%; background: linear-gradient(90deg, #0097d7, #00b4d8); border-radius: 6px; transition: width 0.3s ease;" 
          :style="{ width: downloadPercent + '%' }"
        />
      </div>
    </div>

    <div class="d-flex justify-end" style="gap: 12px;">
      <!-- Botão: Atualizar Agora -->
      <v-btn 
        v-if="updateStatus === 'available'"
        color="primary" 
        variant="flat"
        rounded="lg" 
        class="text-none px-6 font-weight-bold"
        height="44"
        elevation="2"
        prepend-icon="mdi-download"
        @click="$emit('start-download')"
      >
        Atualizar Agora
      </v-btn>
      
      <!-- Botão: Baixando (desabilitado) -->
      <v-btn 
        v-else-if="updateStatus === 'downloading'"
        color="primary" 
        variant="tonal"
        rounded="lg" 
        class="text-none px-6 font-weight-bold"
        height="44"
        disabled
        prepend-icon="mdi-loading mdi-spin"
      >
        Baixando...
      </v-btn>
      
      <!-- Botão: Reiniciar e Instalar -->
      <v-btn 
        v-else-if="updateStatus === 'ready'"
        color="success" 
        variant="flat"
        rounded="lg" 
        class="text-none px-6 font-weight-bold"
        height="44"
        elevation="2"
        prepend-icon="mdi-restart"
        @click="$emit('install-update')"
      >
        Reiniciar e Instalar
      </v-btn>
      
      <!-- Botão: Tentar novamente -->
      <v-btn 
        v-else-if="updateStatus === 'error'"
        color="error" 
        variant="flat"
        rounded="lg" 
        class="text-none px-6 font-weight-bold"
        height="44"
        elevation="2"
        prepend-icon="mdi-refresh"
        @click="$emit('retry-update')"
      >
        Tentar Novamente
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UpdateFooter",
  props: {
    updateStatus: {
      type: String,
      required: true,
    },
    downloadPercent: {
      type: Number,
      default: 0,
    },
  },
  emits: ["start-download", "install-update", "retry-update"],
});
</script>
