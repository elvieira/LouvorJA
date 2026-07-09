<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <!-- Top Bar -->
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0 mr-4" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600; line-height: 1;">
            {{ t('title') }}
          </h2>
          <v-btn-toggle
            v-model="drawMode"
            mandatory
            color="primary"
            variant="tonal"
            class="rounded-lg"
            style="height: 36px; background: var(--card-bg); box-shadow: inset 0 0 0 1px var(--border-color);"
          >
            <v-btn value="names" class="text-caption font-weight-bold px-3 text-none">
              {{ t('mode_names') }}
            </v-btn>
            <v-btn value="numbers" class="text-caption font-weight-bold px-3 text-none">
              {{ t('mode_numbers') }}
            </v-btn>
          </v-btn-toggle>
        </div>
        
        <div class="search-bar ml-4 d-flex align-center" style="flex: 1; justify-content: flex-end; gap: 12px;">
          <v-btn
            variant="flat"
            color="error"
            rounded="lg"
            class="text-none font-weight-bold"
            prepend-icon="mdi-refresh"
            @click="resetAll"
          >
            {{ t('reset') }}
          </v-btn>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="content-main d-flex" :class="compact ? 'flex-column' : 'flex-row'" style="overflow-x: hidden; padding: 24px; min-height: 0; gap: 24px; flex-grow: 1;">
        <!-- =================== COMPACT TOP ROW (Left + Right) =================== -->
        <div v-if="compact" class="d-flex w-100 flex-grow-1" style="gap: 24px; min-height: 0;">
          <!-- Left Panel -->
          <div class="participants-col d-flex flex-column flex-grow-1" style="width: calc(50% - 12px); min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <!-- PASTE INNER LEFT PANEL -->
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
                  @click="$refs.fileInputCompact.click()"
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
                  ref="fileInputCompact"
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
                @click="availableNames = []"
              >
                {{ t('clear_list') }}
              </v-btn>
            </div>
          </div>

          <!-- Right Panel -->
          <div class="history-col d-flex flex-column flex-grow-1" style="width: calc(50% - 12px); min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <div class="pa-4 pb-2" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
              <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600;">
                {{ t('drawn') }}
                <v-chip size="x-small" color="success" class="ml-2 font-weight-bold">
                  {{ drawnNames.length }}
                </v-chip>
              </h3>
            </div>
            <div class="flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 0;">
              <div v-if="drawnNames.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-8">
                <v-icon size="40" class="mb-2">
                  mdi-history
                </v-icon>
                <div class="text-body-2 font-weight-medium">
                  {{ t('empty_history') }}
                </div>
              </div>
              <v-list v-else density="compact" class="bg-transparent pa-0">
                <v-list-item
                  v-for="(name, index) in reversedDrawnNames"
                  :key="index"
                  class="rounded-lg mb-1"
                  style="background: rgba(var(--v-theme-success), 0.1);"
                >
                  <template #prepend>
                    <v-avatar size="24" color="success" class="mr-3 text-caption font-weight-bold text-white">
                      {{ drawnNames.length - index }}
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold" style="color: var(--sidebar-text);">
                    {{ name }}
                  </v-list-item-title>
                  <template #append>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeDrawn(drawnNames.length - 1 - index)"
                    >
                      <v-icon>mdi-undo</v-icon>
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
                @click="clearHistory"
              >
                {{ t('clear_history') }}
              </v-btn>
            </div>
          </div>
        </div>

        <!-- =================== NORMAL MODE (Left) =================== -->
        <div v-if="!compact" class="participants-col d-flex flex-column flex-shrink-0" style="width: 25%; min-width: 280px; max-width: 320px; height: 100%; min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
          <!-- PASTE INNER LEFT PANEL -->
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
                @click="$refs.fileInput.click()"
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
            <div v-if="availableNames.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-10">
              <v-icon size="48" class="mb-3">
                mdi-account-group-outline
              </v-icon>
              <div class="text-body-1 font-weight-medium">
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
              @click="availableNames = []"
            >
              {{ t('clear_list') }}
            </v-btn>
          </div>
        </div>

        <!-- =================== THE STAGE (Both Modes) =================== -->
        <div class="stage-col d-flex position-relative" :class="compact ? 'flex-row align-center flex-shrink-0' : 'flex-column flex-grow-1 align-center justify-center'" :style="[compact ? { width: '100%', height: '220px' } : { minWidth: '350px', height: '100%', minHeight: '0' }, { background: 'var(--card-bg, #fff)', borderRadius: '24px', boxShadow: 'var(--shadow)', overflow: 'hidden', border: '1px solid var(--border-color, rgba(0,0,0,0.05))' }]">
          <!-- Background decoration -->
          <div class="position-absolute top-0 left-0 w-100 h-100" style="background: linear-gradient(135deg, rgba(0,151,215,0.05) 0%, rgba(0,151,215,0.01) 100%); pointer-events: none;" />

          <div class="position-absolute top-0 right-0 ma-4 d-flex align-center" style="z-index: 2; gap: 8px;">
            <v-btn
              variant="tonal"
              color="primary"
              icon
              size="small"
              style="width: 36px; height: 36px;"
              class="config-palette-btn"
              @click="showConfig = true"
            >
              <v-icon>mdi-palette</v-icon>
              <v-tooltip
                activator="parent"
                location="bottom"
                open-delay="300"
                content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                {{ t('config') }}
              </v-tooltip>
            </v-btn>
            <LScreenBtn module="random" />
          </div>

          <!-- Name Display Area -->
          <div class="text-center px-8 flex-grow-1 d-flex flex-column align-center justify-center" :style="{ zIndex: 1, height: compact ? '100%' : 'auto' }">
            <v-slide-y-transition mode="out-in">
              <div :key="isDrawing ? 'drawing' : currentDisplay" class="draw-text font-weight-black text-center" :style="{ fontSize: 'clamp(2rem, 3.5vw, 4.5rem)', color: isDrawing ? 'var(--sidebar-text-secondary)' : 'var(--accent-blue)', transition: 'color 0.3s', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: isDrawing ? 'none' : '0 4px 20px rgba(0,151,215,0.3)' }">
                {{ currentDisplay || "- - - -" }}
              </div>
            </v-slide-y-transition>
          </div>
          
          <!-- Button Area -->
          <div class="text-center flex-shrink-0 d-flex flex-column align-center justify-center" :class="compact ? 'pb-4 pt-12 px-8 h-100' : 'pa-6 w-100'" style="z-index: 1;">
            <v-btn
              :disabled="availableUndrawnNames.length === 0 || isDrawing"
              :loading="isDrawing"
              color="primary"
              variant="flat"
              rounded="xl"
              size="x-large"
              class="font-weight-bold text-none px-10"
              style="height: 64px; font-size: 1.2rem; box-shadow: 0 8px 24px rgba(0,151,215,0.4);"
              @click="startDraw"
            >
              <v-icon start size="28" class="mr-2">
                mdi-play-circle
              </v-icon>
              {{ t('draw_button') }}
            </v-btn>
            
            <div class="mt-4 opacity-70 text-caption font-weight-medium">
              <span v-if="availableUndrawnNames.length === 0">{{ t('empty_list') }}</span>
              <span v-else-if="!isDrawing">{{ t('ready_to_draw') }}</span>
            </div>
          </div>
        </div>

        <!-- =================== NORMAL MODE (Right) =================== -->
        <div v-if="!compact" class="history-col d-flex flex-column flex-shrink-0" style="width: 25%; min-width: 280px; max-width: 320px; height: 100%; min-height: 0; background: var(--card-bg, #fff); border-radius: 24px; box-shadow: var(--shadow); overflow: hidden; border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
          <div class="pa-4 pb-2" style="border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.05));">
            <h3 style="font-size: 1.1rem; color: var(--sidebar-text); font-weight: 600;">
              {{ t('drawn') }}
              <v-chip size="x-small" color="success" class="ml-2 font-weight-bold">
                {{ drawnNames.length }}
              </v-chip>
            </h3>
          </div>
          <div class="flex-grow-1 px-2 py-2" style="overflow-y: auto; min-height: 0;">
            <div v-if="drawnNames.length === 0" class="d-flex flex-column align-center justify-center h-100 opacity-50 py-10">
              <v-icon size="48" class="mb-3">
                mdi-history
              </v-icon>
              <div class="text-body-1 font-weight-medium">
                {{ t('empty_history') }}
              </div>
            </div>
            <v-list v-else density="compact" class="bg-transparent pa-0">
              <v-list-item
                v-for="(name, index) in reversedDrawnNames"
                :key="index"
                class="rounded-lg mb-1"
                style="background: rgba(var(--v-theme-success), 0.1);"
              >
                <template #prepend>
                  <v-avatar size="24" color="success" class="mr-3 text-caption font-weight-bold text-white">
                    {{ drawnNames.length - index }}
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold" style="color: var(--sidebar-text);">
                  {{ name }}
                </v-list-item-title>
                <template #append>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="removeDrawn(drawnNames.length - 1 - index)"
                  >
                    <v-icon>mdi-undo</v-icon>
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
              @click="clearHistory"
            >
              {{ t('clear_history') }}
            </v-btn>
          </div>
        </div>
      </div>
      
      <ConfigModal v-model="showConfig" :module_id="module_id" />
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";
import ConfigModal from "./components/ConfigModal.vue";
import manifest from "../manifest.json";

export default {
  name: "SorteioPage",
  components: {
    MenuToggleButton,
    LScreenBtn,
    ConfigModal,
  },
  data: () => ({
    defaultConfig: { background: "#ffffff", color: "#0097d7", fontSizePc: 15, textTransform: "none", animationSpeed: "normal" },
    newName: "",
    drawMode: "names",
    numMin: 1,
    numMax: 100,
    availableNames: [],
    drawnNames: [],
    isDrawing: false,
    currentDisplay: "",
    showConfig: false,
    drawInterval: null,
    animationDuration: 3000,
  }),
  computed: {
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$appdata.get(`modules.${this.module_id}`);
    },
    availableUndrawnNames() {
      return this.availableNames.filter(n => !this.drawnNames.includes(n));
    },
    reversedDrawnNames() {
      return [...this.drawnNames].reverse();
    },
    compact() {
      return this.$vuetify.display.width < 1400;
    },
    config() {
      return this.$appdata.get(`modules.${this.module_id}.config`) || this.defaultConfig;
    },
  },
  watch: {
    availableNames: {
      handler(val) {
        this.$appdata.set(`modules.${this.module_id}.data.availableNames`, val);
        this.$userdata.set("sorteio_available", val);
      },
      deep: true,
    },
    drawnNames: {
      handler(val) {
        this.$appdata.set(`modules.${this.module_id}.data.drawnNames`, val);
        this.$userdata.set("sorteio_drawn", val);
      },
      deep: true,
    },
    currentDisplay(val) {
      this.$appdata.set(`modules.${this.module_id}.data.currentDisplay`, val);
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, this.isDrawing);
    },
    isDrawing(val) {
      this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, val);
    },
    drawMode(val) {
      this.resetAll();
    },
  },
  mounted() {
    this.loadState();
    // Pre-populate projection initial state
    this.$appdata.set(`modules.${this.module_id}.data.currentDisplay`, this.currentDisplay);
    this.$appdata.set(`modules.${this.module_id}.data.isDrawing`, this.isDrawing);
  },
  beforeUnmount() {
    if (this.drawInterval) clearInterval(this.drawInterval);
  },
  methods: {
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    },
    loadState() {
      const available = this.$userdata.get("sorteio_available");
      if (available && Array.isArray(available)) this.availableNames = available;
      
      const drawn = this.$userdata.get("sorteio_drawn");
      if (drawn && Array.isArray(drawn)) this.drawnNames = drawn;
    },
    addName() {
      const name = this.newName.trim();
      if (name && !this.availableNames.includes(name)) {
        this.availableNames.push(name);
        this.newName = "";
      }
    },
    removeName(index) {
      this.availableNames.splice(index, 1);
    },
    removeDrawn(index) {
      this.drawnNames.splice(index, 1);
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        
        let addedCount = 0;
        lines.forEach(line => {
          if (!this.availableNames.includes(line)) {
            this.availableNames.push(line);
            addedCount++;
          }
        });
        
        event.target.value = ""; // reset input
        
        // Optional: show alert via $alert if available, or just console log
        console.log(`Imported ${addedCount} names.`);
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsText(file);
    },
    clearHistory() {
      this.drawnNames = [];
      this.currentDisplay = "";
    },
    resetAll() {
      this.availableNames = [];
      this.drawnNames = [];
      this.currentDisplay = "";
    },
    generateNumberRange() {
      const min = parseInt(this.numMin, 10);
      const max = parseInt(this.numMax, 10);
      if (isNaN(min) || isNaN(max) || min >= max || max - min > 100000) {
        return;
      }
      this.availableNames = [];
      this.drawnNames = [];
      this.currentDisplay = "";
      for (let i = min; i <= max; i++) {
        this.availableNames.push(i.toString());
      }
    },
    startDraw() {
      const undrawn = this.availableUndrawnNames;
      if (undrawn.length === 0) return;

      this.isDrawing = true;
      let ticks = 0;
      let maxTicks = 30; // normal
      let intervalTime = 50; // normal

      if (this.config.animationSpeed === "fast") {
        maxTicks = 15;
        intervalTime = 30;
      } else if (this.config.animationSpeed === "slow") {
        maxTicks = 50;
        intervalTime = 80;
      }

      const tick = () => {
        ticks++;
        // Pick random name for animation
        const randIndex = Math.floor(Math.random() * undrawn.length);
        this.currentDisplay = undrawn[randIndex];

        if (ticks < maxTicks) {
          // Slow down animation towards the end
          if (ticks > maxTicks * 0.7) {
            intervalTime += 20;
          }
          this.drawInterval = setTimeout(tick, intervalTime);
        } else {
          // Final Winner
          this.finishDraw(undrawn);
        }
      };
      
      this.drawInterval = setTimeout(tick, intervalTime);
    },
    finishDraw(undrawn) {
      this.isDrawing = false;
      const randIndex = Math.floor(Math.random() * undrawn.length);
      const winner = undrawn[randIndex];
      this.currentDisplay = winner;
      this.drawnNames.push(winner);
      
      // We can add a confetti trigger here if we implement one
    },
  },
};
</script>

<style scoped>
.draw-text {
  line-height: 1.1;
  word-break: break-word;
}
</style>
