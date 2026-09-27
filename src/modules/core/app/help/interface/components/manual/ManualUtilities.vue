<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="manual-section">
    <p class="mb-6" v-html="t('utilities.intro')" />

    <!-- Relógio -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-clock-outline" class="mr-2" size="22" />
      {{ t('utilities.clock_title') }}
    </h3>
    <p class="mb-4" v-html="t('utilities.clock_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <span v-html="t('utilities.clock_styles')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.clock_digital')" />
          <li v-html="t('utilities.clock_analog')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('utilities.clock_formats')" />
      <li class="mb-2" v-html="t('utilities.clock_custom')" />
      <li class="mb-2" v-html="t('utilities.clock_projection')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Cronômetro -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-timer-outline" class="mr-2" size="22" />
      {{ t('utilities.timer_title') }}
    </h3>
    <p class="mb-4" v-html="t('utilities.timer_p1')" />
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('utilities.timer_modes')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.timer_progressive')" />
          <li v-html="t('utilities.timer_regressive')" />
          <li v-html="t('utilities.timer_sabbath')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.timer_controls')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.timer_btn_controls')" />
          <li v-html="t('utilities.timer_quick_adjust')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.timer_features')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.timer_always_active')" />
          <li v-html="t('utilities.timer_negative')" />
          <li v-html="t('utilities.timer_visual_alert')" />
          <li v-html="t('utilities.timer_audio_alert')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('utilities.timer_visual_custom')" />
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Sorteio -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary d-flex align-center">
      <v-icon icon="mdi-ticket-confirmation" class="mr-2" size="22" />
      {{ t('utilities.giveaway_title') }}
    </h3>
    <p class="mb-4" v-html="t('utilities.giveaway_p1')" />
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-3">
        <span v-html="t('utilities.giveaway_modes')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.giveaway_names')" />
          <li v-html="t('utilities.giveaway_numbers')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.giveaway_dynamic')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.giveaway_anim')" />
          <li v-html="t('utilities.giveaway_duration')" />
        </ul>
      </li>
      <li class="mb-3">
        <span v-html="t('utilities.giveaway_history')" />
        <ul class="mt-1 pl-4" style="list-style-type: circle;">
          <li v-html="t('utilities.giveaway_columns')" />
          <li v-html="t('utilities.giveaway_options')" />
        </ul>
      </li>
      <li class="mb-2" v-html="t('utilities.giveaway_projection')" />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualUtilities",
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.help.manual.${key}`, params);
    },
  },
});
</script>
