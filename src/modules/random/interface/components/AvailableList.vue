<template>
  <div class="available-header pa-4 pb-2" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 style="font-size: 1.05rem; color: var(--sidebar-text); font-weight: 700;" class="d-flex align-center">
        {{ t('available') }}
        <v-chip
          size="x-small"
          color="primary"
          variant="tonal"
          class="ml-2 font-weight-bold"
        >
          {{ availableNames.length }}
        </v-chip>
      </h3>
    </div>

    <!-- Modo: Nomes -->
    <div v-if="drawMode === 'names'">
      <v-text-field
        v-model="newName"
        density="compact"
        variant="solo"
        flat
        hide-details
        :placeholder="t('add_name')"
        rounded="lg"
        class="mb-3"
        bg-color="var(--main-bg)"
        @keydown.enter="addName"
      >
        <template #append-inner>
          <v-icon color="primary" class="cursor-pointer" @click="addName">
            mdi-plus
          </v-icon>
        </template>
      </v-text-field>
      <v-btn
        block
        variant="tonal"
        color="primary"
        rounded="lg"
        class="text-none mb-2 font-weight-bold"
        prepend-icon="mdi-file-upload-outline"
        @click="openFileInput"
      >
        {{ t('import_names') }}
        <v-tooltip
          activator="parent"
          location="bottom"
          open-delay="300"
          content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
        >
          {{ t('import_tooltip') }}
        </v-tooltip>
      </v-btn>
      <input
        ref="fileInput"
        type="file"
        accept=".txt"
        style="display: none;"
        @change="handleFileUpload"
      />
    </div>

    <!-- Modo: Números -->
    <div v-if="drawMode === 'numbers'" class="d-flex flex-column" style="gap: 10px; margin-bottom: 8px;">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-text-field
          v-model.number="numMin"
          type="number"
          density="compact"
          variant="solo"
          flat
          hide-details
          :label="t('min_number')"
          rounded="lg"
          bg-color="var(--main-bg)"
        />
        <v-text-field
          v-model.number="numMax"
          type="number"
          density="compact"
          variant="solo"
          flat
          hide-details
          :label="t('max_number')"
          rounded="lg"
          bg-color="var(--main-bg)"
          @keydown.enter="generateNumberRange"
        />
      </div>
      <v-btn
        block
        variant="flat"
        color="primary"
        rounded="lg"
        class="text-none font-weight-bold"
        :disabled="isRangeInvalid"
        @click="generateNumberRange"
      >
        {{ t('generate_numbers') }}
      </v-btn>
    </div>
  </div>

  <!-- Lista de Disponíveis -->
  <div class="available-items flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 80px;">
    <!-- Estado Vazio -->
    <div
      v-if="availableNames.length === 0"
      class="d-flex flex-column align-center justify-center h-100 py-8 text-center px-4"
      style="opacity: 0.6;"
    >
      <v-icon size="40" class="mb-2" color="primary">
        {{ drawMode === 'numbers' ? 'mdi-numeric' : 'mdi-account-group-outline' }}
      </v-icon>
      <div class="text-subtitle-2 font-weight-bold mb-1" style="color: var(--sidebar-text);">
        {{ t('empty_list') }}
      </div>
      <div class="text-caption" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
        {{ t('empty_available_hint') }}
      </div>
    </div>

    <!-- Lista de Participantes -->
    <v-list v-else density="compact" class="bg-transparent pa-0">
      <v-list-item
        v-for="(name, index) in availableNames"
        :key="index"
        class="rounded-lg mb-1"
        :class="{ 'opacity-30 text-decoration-line-through': drawnNames.includes(name) }"
      >
        <v-list-item-title class="font-weight-medium" style="color: var(--sidebar-text);">
          {{ name }}
        </v-list-item-title>
        <template #append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            class="rounded-lg"
            @click="removeName(index)"
          >
            <v-icon size="16">
              mdi-close
            </v-icon>
            <v-tooltip
              activator="parent"
              location="left"
              open-delay="200"
              content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
            >
              {{ t('remove_item') }}
            </v-tooltip>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>

  <!-- Footer com Limpar Lista -->
  <div class="available-footer pa-3" style="border-top: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <v-btn
      block
      variant="tonal"
      color="error"
      class="clear-btn text-none font-weight-bold rounded-lg"
      :disabled="availableNames.length === 0"
      @click="showClearConfirm = true"
    >
      {{ t('clear_list') }}
    </v-btn>
  </div>

  <!-- Diálogo de Confirmação: Limpar Lista -->
  <v-dialog v-model="showClearConfirm" max-width="440">
    <v-card class="rounded-xl pa-5" style="background: var(--card-bg, #ffffff);">
      <div class="d-flex align-center mb-3" style="gap: 12px;">
        <v-avatar color="error" variant="tonal" size="40">
          <v-icon color="error" size="22">
            mdi-alert-outline
          </v-icon>
        </v-avatar>
        <div>
          <h3 class="text-subtitle-1 font-weight-bold mb-0" style="color: var(--sidebar-text);">
            {{ t('confirm_clear_list_title') }}
          </h3>
        </div>
      </div>
      <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
        {{ t('confirm_clear_list_desc') }}
      </p>
      <div class="d-flex justify-end" style="gap: 10px;">
        <v-btn
          variant="tonal"
          class="rounded-lg text-none font-weight-bold"
          @click="showClearConfirm = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          variant="flat"
          color="error"
          class="rounded-lg text-none font-weight-bold"
          @click="confirmClearList"
        >
          {{ t('clear_list') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import manifest from "../../manifest";

export default defineComponent({
  name: "AvailableList",
  props: {
    availableNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    drawnNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    drawMode: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ["update:availableNames", "clear:history"],
  data: () => ({
    newName: "",
    numMin: 1,
    numMax: 100,
    showClearConfirm: false,
  }),
  computed: {
    moduleId(): string {
      return manifest.id;
    },
    isRangeInvalid(): boolean {
      const min = Number(this.numMin);
      const max = Number(this.numMax);
      return isNaN(min) || isNaN(max) || min > max || (max - min) > 10000;
    },
  },
  methods: {
    t(text: string): string {
      return this.$t(`modules.${this.moduleId}.${text}`);
    },
    openFileInput() {
      (this.$refs.fileInput as HTMLElement).click();
    },
    addName() {
      const name = this.newName.trim();
      if (name && !this.availableNames.includes(name)) {
        const newArr = [...this.availableNames, name];
        this.$emit("update:availableNames", newArr);
        this.newName = "";
      }
    },
    removeName(index: number) {
      const newArr = [...this.availableNames];
      newArr.splice(index, 1);
      this.$emit("update:availableNames", newArr);
    },
    handleFileUpload(event: any) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text
          .split(/\r?\n/)
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0);

        let addedCount = 0;
        const newArr = [...this.availableNames];
        lines.forEach((line: string) => {
          if (!newArr.includes(line)) {
            newArr.push(line);
            addedCount++;
          }
        });

        this.$emit("update:availableNames", newArr);
        event.target.value = "";
        console.log(`Imported ${addedCount} names.`);
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsText(file);
    },
    generateNumberRange() {
      const min = parseInt(String(this.numMin), 10);
      const max = parseInt(String(this.numMax), 10);
      if (isNaN(min) || isNaN(max) || min > max || max - min > 10000) {
        return;
      }
      const newArr: string[] = [];
      for (let i = min; i <= max; i++) {
        newArr.push(i.toString());
      }
      this.$emit("update:availableNames", newArr);
      this.$emit("clear:history");
    },
    confirmClearList() {
      this.$emit("update:availableNames", []);
      this.showClearConfirm = false;
    },
  },
});
</script>

<style scoped>
@media (max-height: 800px) {
  .available-header {
    padding: 10px 12px 6px 12px !important;

    h3 {
      font-size: 0.95rem !important;
      margin-bottom: 6px !important;
    }

    .v-input {
      margin-bottom: 6px !important;
    }

    .v-btn {
      margin-bottom: 4px !important;
      min-height: 32px !important;
      height: 32px !important;
      font-size: 0.85rem !important;
    }
  }

  .available-items {
    padding: 4px 6px !important;
  }

  .available-footer {
    padding: 6px 12px !important;

    .clear-btn {
      min-height: 32px !important;
      height: 32px !important;
      font-size: 0.85rem !important;
    }
  }
}
</style>
