<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page">
      <div class="content-main">
        <div class="sorteio-container">
          <!-- Left: Input -->
          <div class="sorteio-left">
            <div class="sorteio-card sorteio-input-card">
              <div class="sorteio-card-header">
                <v-icon color="var(--accent-blue)">
                  mdi-account-group
                </v-icon>
                <h3 class="sorteio-card-title">
                  {{ t("title") }}
                </h3>
              </div>

              <!-- Mode Selector -->
              <div class="sorteio-mode-selector">
                <v-btn-toggle v-model="mode" mandatory color="var(--accent-blue)">
                  <v-btn value="names" size="small">
                    <v-icon start>mdi-account-group</v-icon>
                    {{ t("mode_names") }}
                  </v-btn>
                  <v-btn value="numbers" size="small">
                    <v-icon start>mdi-numeric</v-icon>
                    {{ t("mode_numbers") }}
                  </v-btn>
                </v-btn-toggle>
              </div>

              <!-- Names Mode -->
              <div v-if="mode === 'names'" class="sorteio-names-input">
                <v-textarea
                  v-model="participantText"
                  :placeholder="t('add_placeholder')"
                  variant="outlined"
                  rows="6"
                  hide-details
                  auto-grow
                  class="sorteio-textarea"
                  @update:model-value="saveParticipants"
                />
                <div class="sorteio-input-footer">
                  <p class="sorteio-count">
                    {{ t("drawn_count", { n: drawnCount, total: participants.length }) }}
                  </p>
                  <div class="sorteio-card-actions">
                    <v-btn
                      variant="outlined"
                      size="small"
                      prepend-icon="mdi-file-upload"
                      @click="triggerFileLoad"
                    >
                      {{ t("load_file") }}
                    </v-btn>
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".txt"
                      style="display: none"
                      @change="loadFile"
                    />
                    <v-btn
                      variant="text"
                      size="small"
                      color="grey"
                      prepend-icon="mdi-close"
                      @click="clearList"
                    >
                      {{ t("clear_list") }}
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Numbers Mode -->
              <div v-else class="sorteio-numbers-input">
                <div class="sorteio-numbers-fields">
                  <v-text-field
                    v-model.number="minNumber"
                    :label="t('min_number')"
                    type="number"
                    variant="outlined"
                    hide-details
                    class="sorteio-number-field"
                  />
                  <v-text-field
                    v-model.number="maxNumber"
                    :label="t('max_number')"
                    type="number"
                    variant="outlined"
                    hide-details
                    class="sorteio-number-field"
                  />
                </div>
                <p class="sorteio-count">
                  {{ t("range_count", { total: numberRange.length }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Result + History -->
          <div class="sorteio-right">
            <!-- Result card -->
            <div class="sorteio-card sorteio-result-card">
              <div class="sorteio-result-display">
                <div v-if="isRolling" class="rolling-name">
                  {{ currentRollingName }}
                </div>
                <div v-else-if="winner !== null" class="winner-name">
                  {{ winner }}
                </div>
                <div v-else class="no-result">
                  <v-icon
                    size="48"
                    color="grey-lighten-2"
                  >
                    mdi-dice-multiple-outline
                  </v-icon>
                  <p>
                    <span v-if="mode === 'names'">{{ participants.length === 0 ? t("no_participants") : "" }}</span>
                    <span v-else>{{ t("no_range") }}</span>
                  </p>
                </div>
              </div>

              <div class="sorteio-actions">
                <v-btn
                  :disabled="canSort"
                  color="var(--accent-blue)"
                  size="large"
                  prepend-icon="mdi-shuffle-variant"
                  class="sorteio-btn-main"
                  @click="sortear"
                >
                  {{ t("sortear") }}
                </v-btn>

                <div class="sorteio-options">
                  <v-switch
                    v-model="noRepeat"
                    :label="t('no_repeat')"
                    density="compact"
                    hide-details
                    color="var(--accent-blue)"
                    @update:model-value="saveNoRepeat"
                  />
                </div>
              </div>

              <!-- Projection button (standard LouvorJA flow) -->
              <div v-if="winner !== null" class="sorteio-projection-actions">
                <LScreenBtn module="sorteio" />
              </div>
            </div>

            <!-- History card -->
            <div v-if="history.length > 0" class="sorteio-card sorteio-history-card">
              <div class="sorteio-card-header">
                <v-icon color="var(--accent-blue)">
                  mdi-history
                </v-icon>
                <h3 class="sorteio-card-title">
                  {{ t("history") }}
                </h3>
                <v-btn
                  variant="text"
                  size="x-small"
                  color="grey"
                  class="ml-auto"
                  @click="clearHistory"
                >
                  {{ t("clear_history") }}
                </v-btn>
              </div>
              <div class="sorteio-history-list">
                <div
                  v-for="(item, index) in history"
                  :key="index"
                  class="sorteio-history-item"
                >
                  <span class="sorteio-history-number">{{ index + 1 }}</span>
                  <span class="sorteio-history-name">{{ item.name }}</span>
                  <span class="sorteio-history-time">{{ item.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import LScreenBtn from "@/components/buttons/Screen.vue";

export default {
  name: manifest.id,
  components: {
    LScreenBtn,
  },
  data() {
      return {
        manifest,
        participantText: "",
        participants: [],
        winner: null,
        isRolling: false,
        currentRollingName: "",
        noRepeat: false,
        drawnSet: new Set(),
        history: [],

        rollInterval: null,
        mode: "names",
        minNumber: 1,
        maxNumber: 100,
      };
    },
  computed: {
        /* COMPUTEDS OBRIGATORIOS - INICIO */
        /* NAO MODIFICAR */
        module_id() {
          return manifest.id;
        },
        module() {
          return this.$modules.get(this.module_id);
        },
        /* COMPUTEDS OBRIGATORIOS - FIM */

        drawnCount() {
          return this.drawnSet.size;
        },

        numberRange() {
          const min = Math.min(this.minNumber, this.maxNumber);
          const max = Math.max(this.minNumber, this.maxNumber);
          const range = [];
          for (let i = min; i <= max; i++) {
            range.push(i);
          }
          return range;
        },

        canSort() {
          if (this.isRolling) return true;
          if (this.mode === "names") {
            return this.participants.length === 0;
          }
          return this.numberRange.length === 0;
        },
      },
    watch: {
    "module.show": {
      handler(newVal) {
        if (newVal) {
          this.loadSavedData();
        }
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    if (this.rollInterval) {
      clearInterval(this.rollInterval);
    }
  },
  methods: {
    /* METHODS OBRIGATORIOS - INICIO */
    /* NAO MODIFICAR */
    t(text) {
      return this.$t(`modules.${this.module_id}.${text}`);
    },
    /* METHODS OBRIGATORIOS - FIM */

    loadSavedData() {
      try {
        const savedText = this.$userdata.get("sorteio_participants");
        if (savedText) {
          this.participantText = savedText;
          this.participants = savedText
            .split("\n")
            .map((n) => n.trim())
            .filter((n) => n.length > 0);
        }
        const savedRepeat = this.$userdata.get("sorteio_no_repeat");
        if (savedRepeat !== null && savedRepeat !== undefined) {
          this.noRepeat = savedRepeat === true;
        }
        const savedHistory = this.$userdata.get("sorteio_history");
        if (savedHistory && Array.isArray(savedHistory)) {
          this.history = savedHistory;
        }
        const savedWinner = this.$userdata.get("sorteio_winner");
        if (savedWinner) {
          this.winner = savedWinner;
        }
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    },

    saveParticipants() {
      const text = this.participantText;
      this.participants = text
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      this.$userdata.set("sorteio_participants", text);
    },

    saveNoRepeat() {
      this.$userdata.set("sorteio_no_repeat", this.noRepeat);
      if (!this.noRepeat) {
        this.drawnSet = new Set();
      }
    },

    triggerFileLoad() {
      this.$refs.fileInput?.click();
    },

    loadFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.participantText = e.target.result;
        this.saveParticipants();
      };
      reader.readAsText(file);
      event.target.value = "";
    },

    clearList() {
      this.participantText = "";
      this.participants = [];
      this.winner = null;
      this.drawnSet = new Set();
      this.$appdata.set("modules.sorteio.projection", null);
      this.$userdata.set("sorteio_participants", "");
      this.$userdata.set("sorteio_winner", null);
    },

    getAvailableParticipants() {
      if (!this.noRepeat) return [...this.participants];
      return this.participants.filter((p) => !this.drawnSet.has(p));
    },

    sortear() {
          let available = [];
          let totalPool = [];

          if (this.mode === "names") {
            available = this.getAvailableParticipants();
            totalPool = this.participants;
          } else {
            available = this.numberRange.filter((n) => !this.drawnSet.has(n));
            totalPool = this.numberRange;
          }

          if (available.length === 0) {
            this.winner = null;
            this.$userdata.set("sorteio_winner", null);
            return;
          }

          this.isRolling = true;
          this.winner = null;

          const duration = 2000 + Math.random() * 2000;
          const startTime = Date.now();

          this.rollInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= duration) {
              clearInterval(this.rollInterval);
              this.rollInterval = null;

              const index = Math.floor(Math.random() * available.length);
              const chosen = available[index];

              this.winner = chosen;
              this.isRolling = false;
              this.currentRollingName = "";

              if (this.noRepeat) {
                this.drawnSet = new Set([...this.drawnSet, chosen]);
              }

              const now = new Date();
              const timeStr = now.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              this.history = [{ name: chosen, time: timeStr }, ...this.history];
              this.$userdata.set("sorteio_history", this.history);
              this.$userdata.set("sorteio_winner", chosen);

              // Update projection data for popup screen
              this.$appdata.set("modules.sorteio.projection", {
                name: chosen,
              });
            } else {
              const randomIndex = Math.floor(Math.random() * totalPool.length);
              this.currentRollingName = totalPool[randomIndex];
            }
          }, 50);
        },

    clearHistory() {
      this.history = [];
      this.drawnSet = new Set();
      this.winner = null;
      this.$userdata.set("sorteio_history", []);
      this.$userdata.set("sorteio_winner", null);
      this.$appdata.set("modules.sorteio.projection", null);
    },
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/sorteio.scss";
</style>
