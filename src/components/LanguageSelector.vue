<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" slim>
        <CountryFlag
          v-if="current_language"
          :country="languages[current_language].flag"
          style="margin: 0; padding: 0"
        />
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(language, key) in languages"
        :key="key"
        @click="changeLanguage(String(key))"
      >
        <template #prepend>
          <CountryFlag
            :country="language.flag"
            style="margin: 0; padding: 0"
          />
        </template>
        <v-list-item-title>
          {{ language.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CountryFlag from "vue-country-flag-next";
import { useAppData, useUserData } from "@/composables/useHelpers";
import { useI18n } from "vue-i18n";

const appdata = useAppData();
const userdata = useUserData();
const { locale } = useI18n();

const languages = computed(() => appdata.get("languages"));
const current_language = computed(() => userdata.get("language"));

const changeLanguage = (language: string) => {
  locale.value = language;
  userdata.set("language", language);
};
</script>
