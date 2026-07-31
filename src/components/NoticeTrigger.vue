<template>
  <div class="notice-trigger">
    <v-menu v-model="menuOpen" :close-on-content-click="false" location="top end">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          size="large"
          :color="isActive ? 'error' : undefined"
          class="notice-trigger-btn elevation-8"
        >
          <v-icon>mdi-bullhorn</v-icon>
          <v-tooltip activator="parent" location="left">
            Avisos
          </v-tooltip>
        </v-btn>
      </template>

      <v-card
        theme="dark"
        rounded="lg"
        width="340"
        class="pa-4"
      >
        <div class="text-subtitle-1 font-weight-bold mb-3">
          Aviso
        </div>

        <div class="d-flex flex-wrap ga-2 mb-3">
          <v-chip
            v-for="preset in presets"
            :key="preset"
            size="small"
            variant="tonal"
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
            hide-details
          />
          <v-checkbox
            v-model="targets"
            label="Tela de retorno"
            value="return"
            density="compact"
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
    </v-menu>
  </div>
</template>

<script>
export default {
  name: "NoticeTriggerComponent",
  data: () => ({
    menuOpen: false,
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
.notice-trigger {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 999;
}
.notice-trigger-btn {
  background: rgba(0, 0, 0, 0.6) !important;
}
</style>
