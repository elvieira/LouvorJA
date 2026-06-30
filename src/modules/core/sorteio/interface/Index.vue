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
          </div>

          <!-- Right: Result + History -->
          <div class="sorteio-right">
            <!-- Result card -->
            <div class="sorteio-card sorteio-result-card">
              <div class="sorteio-result-display">
                <div v-if="isRolling" class="rolling-name">
                  {{ currentRollingName }}
                </div>
                <div v-else-if="winner" class="winner-name">
                  {{ winner }}
                </div>
                <div v-else class="no-result">
                  <v-icon
                    size="48"
                    color="grey-lighten-2"
                  >
                    mdi-dice-multiple-outline
                  </v-icon>
                  <p>{{ participants.length === 0 ? t("no_participants") : "" }}</p>
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

              <!-- Projection buttons -->
              <div v-if="winner" class="sorteio-projection-actions">
                <v-btn
                  v-if="!isProjected"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-projector"
                  @click="projetar"
                >
                  {{ t("projetar") }}
                </v-btn>
                <v-btn
                  v-else
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-projector-off"
                  @click="clearProjection"
                >
                  {{ t("limpar_projecao") }}
                </v-btn>
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

export default {
  name: manifest.id,
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
      isProjected: false,
      rollInterval: null,
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
    canSort() {
      return this.participants.length === 0 || this.isRolling;
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
      this.isProjected = false;
      this.$userdata.set("sorteio_participants", "");
      this.$userdata.set("sorteio_winner", null);
    },

    getAvailableParticipants() {
      if (!this.noRepeat) return [...this.participants];
      return this.participants.filter((p) => !this.drawnSet.has(p));
    },

    sortear() {
      const available = this.getAvailableParticipants();

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

          if (this.isProjected) {
            this.projetar();
          }
        } else {
          const randomIndex = Math.floor(
            Math.random() * this.participants.length
          );
          this.currentRollingName = this.participants[randomIndex];
        }
      }, 50);
    },

    projetar() {
      if (!this.winner) return;
      this.isProjected = true;
      this.$appdata.set("modules.sorteio.projection", {
        name: this.winner,
      });
    },

    clearProjection() {
      this.isProjected = false;
      this.$appdata.set("modules.sorteio.projection", null);
    },

    clearHistory() {
      this.history = [];
      this.drawnSet = new Set();
      this.winner = null;
      this.isProjected = false;
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
