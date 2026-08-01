<template>
  <div class="pa-4 pb-2" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600;">
        {{ t('available') }}
        <v-chip size="x-small" color="primary" class="ml-2 font-weight-bold">
          {{ availableNames.length }}
        </v-chip>
      </h3>
    </div>
    
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

    <div v-if="drawMode === 'numbers'" class="d-flex flex-column" style="gap: 12px; margin-bottom: 8px;">
      <div class="d-flex align-center" style="gap: 8px;">
        <v-text-field
          v-model="numMin"
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
          v-model="numMax"
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
        @click="generateNumberRange"
      >
        {{ t('generate_numbers') }}
      </v-btn>
    </div>
  </div>
  <div class="flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 0;">
    <div v-if="availableNames.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-8">
      <v-icon size="40" class="mb-2">
        mdi-account-group-outline
      </v-icon>
      <div class="text-body-2 font-weight-medium">
        {{ t('empty_list') }}
      </div>
    </div>
    <v-list v-else density="compact" class="bg-transparent pa-0">
      <v-list-item
        v-for="(name, index) in availableNames"
        :key="index"
        class="rounded-lg mb-1"
        :class="{ 'opacity-30 text-decoration-line-through': drawnNames.includes(name) }"
      >
        <v-list-item-title class="font-weight-medium">
          {{ name }}
        </v-list-item-title>
        <template #append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="removeName(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>
  <div class="pa-3" style="border-top: 1px solid var(--border-color, rgba(0,0,0,0.05));">
    <v-btn
      block
      variant="tonal"
      color="error"
      class="text-none font-weight-bold"
      @click="clearList"
    >
      {{ t('clear_list') }}
    </v-btn>
  </div>
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
  }),
  computed: {
    moduleId(): string {
      return manifest.id;
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
        const lines = text.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
        
        let addedCount = 0;
        const newArr = [...this.availableNames];
        lines.forEach((line: string) => {
          if (!newArr.includes(line)) {
            newArr.push(line);
            addedCount++;
          }
        });
        
        this.$emit("update:availableNames", newArr);
        event.target.value = ""; // reset input
        
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
      if (isNaN(min) || isNaN(max) || min >= max || max - min > 100000) {
        return;
      }
      const newArr: string[] = [];
      for (let i = min; i <= max; i++) {
        newArr.push(i.toString());
      }
      this.$emit("update:availableNames", newArr);
      this.$emit("clear:history");
    },
    clearList() {
      this.$emit("update:availableNames", []);
    },
  },
});
</script>
