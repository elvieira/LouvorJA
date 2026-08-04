<template>
  <v-dialog v-model="show" max-width="320" persistent>
    <v-list color="primary" elevation="12" rounded="lg">
      <v-list-item prepend-icon="$louvorja">
        <template #prepend>
          <div class="pe-4">
            <img src="/ico/favicon.svg" :width="32" />
          </div>
        </template>

        {{ $t("alert.wait") }}

        <template #append>
          <v-progress-circular
            color="primary"
            indeterminate="disable-shrink"
            size="16"
            width="2"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoadingLayout",
  computed: {
    show: {
      get(): boolean {
        return this.$appdata.get("loading");
      },
      set(value: boolean) {
        this.$appdata.set("loading", value);
      },
    },
  },
});
</script>
