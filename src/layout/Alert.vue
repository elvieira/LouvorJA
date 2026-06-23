<template>
  <v-dialog
    v-model="alert.show"
    max-width="450"
    persistent
    :theme="$theme.primary()"
    content-class="modern-alert-dialog-wrapper"
  >
    <v-card :color="alert.color" class="modern-alert-card rounded-xl">
      <v-card-title v-if="alert.title" class="pt-6 px-6">
        <div v-if="alert.translate" v-html="$t(alert.title)" />
        <div v-else v-html="alert.title" />
      </v-card-title>
      <v-card-text v-if="alert.text" class="px-6 pb-2 pt-2">
        <div v-if="alert.translate" v-html="$t(alert.text)" class="alert-text-content" />
        <div v-else v-html="alert.text" class="alert-text-content" />
        <small v-if="alert.error" class="text-error mt-2 d-block" v-html="alert.error" />
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-2 d-flex justify-end" style="gap: 12px;">
        <v-spacer></v-spacer>
        <v-btn
          v-for="(btn, index) in alert.buttons"
          :key="index"
          :color="btn.color ? btn.color : 'primary'"
          @click="clickBtn(btn.value)"
          :variant="btn.color === 'error' ? 'tonal' : 'flat'"
          class="modern-alert-btn px-6"
          height="40"
        >
          {{ $t(btn.text) }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AlertLayout",
  computed: {
    alert: function () {
      return this.$appdata.get("alert");
    },
  },
  methods: {
    clickBtn(value) {
      this.$appdata.set("alert.value", value);
      this.$appdata.set("alert.show", false);
    },
  },
};
</script>

<style lang="scss">
.modern-alert-dialog-wrapper {
  backdrop-filter: blur(5px);
}

.modern-alert-card {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid var(--glass-border) !important;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;

  .v-card-title {
    font-weight: 600;
    font-size: 1.25rem;
    color: var(--glass-text);
    padding-bottom: 8px !important;
  }

  .alert-text-content {
    font-size: 1.05rem;
    color: var(--glass-text-secondary);
    line-height: 1.6;
  }

  .modern-alert-btn {
    font-weight: 600;
    letter-spacing: 0.5px;
    border-radius: 10px;
    text-transform: none;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
}
</style>
