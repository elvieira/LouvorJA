<template>
  <v-card rounded="lg" width="340" class="pa-4 notice-panel">
    <div class="d-flex align-center mb-3">
      <v-icon size="18" color="primary" class="mr-2">
        mdi-bullhorn
      </v-icon>
      <span class="text-subtitle-1 font-weight-bold" style="color: var(--sidebar-text);">Aviso</span>
    </div>

    <div class="d-flex flex-wrap ga-2 mb-3">
      <v-chip
        v-for="preset in presets"
        :key="preset"
        size="small"
        variant="tonal"
        color="primary"
        @click="text = preset"
      >
        {{ preset }}
      </v-chip>
    </div>

    <v-textarea
      v-model="text"
      label="Texto do aviso"
      rows="2"
      auto-grow
      variant="outlined"
      density="compact"
      hide-details
      class="mb-3"
    />

    <div class="d-flex flex-column ga-1 mb-4">
      <v-checkbox
        v-model="targets"
        label="Tela principal"
        value="main"
        density="compact"
        color="primary"
        hide-details
      />
      <v-checkbox
        v-model="targets"
        label="Tela de retorno"
        value="return"
        density="compact"
        color="primary"
        hide-details
      />
    </div>

    <div class="d-flex justify-space-between">
      <v-btn
        variant="text"
        :disabled="!isActive"
        @click="remove()"
      >
        Remover
      </v-btn>
      <v-btn
        color="primary"
        :disabled="!text || targets.length === 0"
        @click="show()"
      >
        Mostrar
      </v-btn>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "NoticeTriggerComponent",
  data: () => ({
    text: "",
    targets: ["main", "return"],
    presets: [
      "Carro com o farol aceso",
      "Compareça à recepção",
      "Silêncio, por favor",
    ],
  }),
  computed: {
    isActive() {
      return !!this.$appdata.get("notice.visible");
    },
  },
  methods: {
    show() {
      this.$popup.showNotice({ text: this.text, targets: this.targets });
    },
    remove() {
      this.$popup.hideNotice();
    },
  },
};
</script>

<style scoped>
.notice-panel {
  background: var(--card-bg) !important;
  color: var(--sidebar-text) !important;
  border: 1px solid var(--border-color);
}
</style>
