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
import { useAppData, useUserData, useAlert } from "@/composables/useHelpers";
import { useI18n } from "vue-i18n";

const appdata = useAppData();
const userdata = useUserData();
const alert = useAlert();
const { t } = useI18n();

const languages = computed(() => appdata.get("languages"));
const current_language = computed(() => userdata.get("language"));

const changeLanguage = async (val: string) => {
  if (!val || val === current_language.value) return;

  const isElectron = typeof window !== "undefined" && !!((window as any).electronAPI && (window as any).electronAPI.isElectron);

  if (isElectron) {
    try {
      const dbExists = await (window as any).electronAPI.checkDatabaseExists(val);
      if (dbExists) {
        alert.yesno(
          {
            title: t("alert.msg_lang_title"),
            text: t("alert.msg_lang_reload"),
            translate: false,
          },
          (resp: any) => {
            if (resp === "yes") {
              userdata.set("language", val);
              window.location.reload();
            }
          },
        );
        return;
      }
    } catch (err) {
      console.error("Erro ao verificar DB existente", err);
    }

    alert.yesno(
      {
        title: t("alert.msg_lang_title"),
        text: t("alert.msg_lang_download"),
        translate: false,
      },
      async (resp: any) => {
        if (resp === "yes") {
          window.sessionStorage.setItem("pending_language", val);
          if ((window as any).electronAPI?.clearSysData) {
            await (window as any).electronAPI.clearSysData(val);
          }
          window.location.reload();
        }
      },
    );
  } else {
    alert.yesno(
      {
        title: t("alert.msg_lang_title"),
        text: t("alert.msg_lang_reload"),
        translate: false,
      },
      (resp: any) => {
        if (resp === "yes") {
          userdata.set("language", val);
          window.location.reload();
        }
      },
    );
  }
};
</script>
