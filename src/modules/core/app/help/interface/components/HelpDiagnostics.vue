<template>
  <div class="diagnostics-container h-100 d-flex flex-column pb-4">
    <v-card
      class="settings-card rounded-xl flex-grow-1 overflow-hidden d-flex flex-column"
      flat
      style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color);"
    >
      <!-- Top Header Area -->
      <div
        class="d-flex align-center justify-between py-4 px-6 flex-shrink-0 flex-wrap gap-2"
        style="border-bottom: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.01);"
      >
        <div class="d-flex align-center">
          <v-btn
            class="mr-4"
            icon="mdi-arrow-left"
            size="small"
            variant="tonal"
            color="primary"
            @click="$emit('back')"
          />
          <div
            class="d-flex align-center justify-center rounded-circle pa-2 mr-3"
            style="background: rgba(0, 151, 215, 0.1);"
          >
            <v-icon
              color="primary"
              icon="mdi-text-box-search-outline"
              size="22"
            />
          </div>
          <div>
            <h3
              class="font-weight-bold mb-0"
              style="color: var(--sidebar-text); font-size: 1.25rem; letter-spacing: -0.01em; line-height: 1.2;"
            >
              {{ $t('modules.help.diagnostics.title') }}
            </h3>
            <span
              class="text-caption"
              style="color: var(--sidebar-text-secondary);"
            >
              {{ $t('modules.help.diagnostics.subtitle') }}
            </span>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <v-tabs
          v-model="activeTab"
          color="var(--accent-blue)"
          density="compact"
          class="ml-auto"
        >
          <v-tab value="logs" class="text-none">
            <v-icon start icon="mdi-console-line" size="18" />
            {{ $t('modules.help.diagnostics.tab_logs') }}
          </v-tab>
          <v-tab value="system" class="text-none">
            <v-icon start icon="mdi-laptop" size="18" />
            {{ $t('modules.help.diagnostics.tab_system') }}
          </v-tab>
        </v-tabs>
      </div>

      <!-- Main Content Area -->
      <div class="flex-grow-1 overflow-hidden d-flex flex-column">
        <!-- TAB 1: LOGS DO PROGRAMA -->
        <div v-if="activeTab === 'logs'" class="h-100 d-flex flex-column pa-4 overflow-hidden">
          <!-- Terminal Console Logs Box -->
          <div
            ref="logContainerRef"
            class="log-terminal flex-grow-1 rounded-xl pa-3 overflow-y-auto"
            style="background: #0d1117; border: 1px solid rgba(255, 255, 255, 0.08); font-family: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace; font-size: 0.8rem; line-height: 1.5;"
          >
            <div v-if="logs.length === 0" class="h-100 d-flex flex-column align-center justify-center text-center pa-8">
              <v-icon
                icon="mdi-text-box-remove-outline"
                size="48"
                color="grey"
                class="mb-3"
                style="opacity: 0.4;"
              />
              <span class="text-body-2" style="color: var(--sidebar-text-secondary);">
                {{ $t('modules.help.diagnostics.no_logs') }}
              </span>
            </div>

            <div
              v-for="entry in logs"
              :key="entry.id"
              class="log-line py-1 px-2 rounded mb-1 d-flex flex-column"
              :class="`log-${entry.level}`"
            >
              <div class="d-flex align-start flex-wrap gap-2">
                <!-- Timestamp -->
                <span class="log-time" style="color: #6e7681; user-select: none;">
                  {{ formatLogTime(entry.timestamp) }}
                </span>

                <!-- Level Badge -->
                <span
                  class="log-badge font-weight-bold px-1 rounded text-uppercase"
                  :class="`badge-${entry.level}`"
                  style="font-size: 0.7rem; letter-spacing: 0.04em;"
                >
                  {{ entry.level }}
                </span>

                <!-- Source Badge -->
                <span
                  class="log-source px-1 rounded text-uppercase"
                  style="font-size: 0.7rem; background: rgba(255, 255, 255, 0.08); color: #8b949e;"
                >
                  {{ entry.source }}
                </span>

                <!-- Message -->
                <span class="log-msg flex-grow-1" style="color: #c9d1d9; word-break: break-word;">
                  {{ entry.message }}
                </span>
              </div>

              <!-- Optional Details / Stack Trace -->
              <div
                v-if="entry.details"
                class="log-details mt-1 pa-2 rounded"
                style="background: rgba(0, 0, 0, 0.4); color: #8b949e; font-size: 0.75rem; white-space: pre-wrap; word-break: break-word;"
              >
                {{ entry.details }}
              </div>
            </div>
          </div>

          <!-- Status Footer -->
          <div class="d-flex align-center justify-space-between px-2 pt-2 text-caption" style="color: var(--sidebar-text-secondary);">
            <span>
              {{ $t('modules.help.diagnostics.total_logs', { count: logs.length }) }}
            </span>
          </div>
        </div>

        <!-- TAB 2: INFORMAÇÕES DO SISTEMA -->
        <div v-else-if="activeTab === 'system'" class="h-100 overflow-y-auto pa-6">
          <div class="mx-auto d-flex flex-column gap-6" style="max-width: 960px;">
            <!-- Header Bar da Aba de Sistema -->
            <div class="d-flex align-center justify-space-between">
              <div>
                <h4 class="font-weight-bold mb-1" style="color: var(--sidebar-text);">
                  {{ $t('modules.help.diagnostics.tab_system') }}
                </h4>
                <span class="text-caption" style="color: var(--sidebar-text-secondary);">
                  Dados coletados do hardware, ambiente Electron e conectividade do Louvor JA.
                </span>
              </div>

              <div class="d-flex gap-2">
                <v-btn
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-refresh"
                  :loading="loadingDiagnostics"
                  class="text-none"
                  @click="loadDiagnostics"
                >
                  {{ $t('modules.help.diagnostics.refresh') }}
                </v-btn>
                <v-btn
                  variant="flat"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-content-copy"
                  class="text-none"
                  @click="copyFullReport"
                >
                  {{ $t('modules.help.diagnostics.copy_full_report') }}
                </v-btn>
              </div>
            </div>

            <v-progress-linear
              v-if="loadingDiagnostics"
              indeterminate
              color="primary"
              rounded
              height="3"
            />

            <div v-if="diagnostics" class="d-flex flex-column gap-4">
              <v-row dense>
                <!-- 1. Aplicativo & Runtime -->
                <v-col cols="12" md="6">
                  <v-card class="rounded-xl pa-4 h-100" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center mb-3">
                      <v-icon
                        color="primary"
                        icon="mdi-apps"
                        size="20"
                        class="mr-2"
                      />
                      <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.diagnostics.categories.app') }}
                      </span>
                    </div>
                    <div class="d-flex flex-column gap-2 text-caption">
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.version') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">v{{ diagnostics.app.version }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.electron') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">v{{ diagnostics.versions.electron }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.chrome') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">v{{ diagnostics.versions.chrome }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.node') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">v{{ diagnostics.versions.node }}</span>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <!-- 2. Sistema Operacional -->
                <v-col cols="12" md="6">
                  <v-card class="rounded-xl pa-4 h-100" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center mb-3">
                      <v-icon
                        color="primary"
                        :icon="getOsIcon(diagnostics.os.platform)"
                        size="20"
                        class="mr-2"
                      />
                      <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.diagnostics.categories.os') }}
                      </span>
                    </div>
                    <div class="d-flex flex-column gap-2 text-caption">
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.platform') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ diagnostics.os.platform }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.distro') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ diagnostics.os.distro }} {{ diagnostics.os.release }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.arch') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ diagnostics.os.arch }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.uptime') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ formatUptime(diagnostics.os.uptime) }}</span>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <!-- 3. Hardware & CPU -->
                <v-col cols="12" md="6">
                  <v-card class="rounded-xl pa-4 h-100" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center mb-3">
                      <v-icon
                        color="primary"
                        icon="mdi-cpu-64-bit"
                        size="20"
                        class="mr-2"
                      />
                      <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.diagnostics.categories.cpu') }}
                      </span>
                    </div>
                    <div class="d-flex flex-column gap-2 text-caption">
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.cpu_model') }}</span>
                        <span class="font-weight-medium text-truncate ml-2" style="color: var(--sidebar-text); max-width: 220px;" :title="diagnostics.cpu.brand">
                          {{ diagnostics.cpu.brand }}
                        </span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.cpu_cores') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">
                          {{ diagnostics.cpu.physicalCores }} físicos / {{ diagnostics.cpu.cores }} lógicos
                        </span>
                      </div>
                      <div v-if="diagnostics.cpu.speed" class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.cpu_speed') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ diagnostics.cpu.speed }} GHz</span>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <!-- 4. Memória RAM -->
                <v-col cols="12" md="6">
                  <v-card class="rounded-xl pa-4 h-100" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-icon
                          color="primary"
                          icon="mdi-memory"
                          size="20"
                          class="mr-2"
                        />
                        <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                          {{ $t('modules.help.diagnostics.categories.memory') }}
                        </span>
                      </div>
                      <span class="text-caption font-weight-bold" :class="diagnostics.memory.usedPercentage > 85 ? 'text-error' : 'text-primary'">
                        {{ diagnostics.memory.usedPercentage }}%
                      </span>
                    </div>

                    <v-progress-linear
                      :model-value="diagnostics.memory.usedPercentage"
                      :color="diagnostics.memory.usedPercentage > 85 ? 'error' : 'primary'"
                      height="8"
                      rounded
                      class="mb-3"
                    />

                    <div class="d-flex flex-column gap-2 text-caption">
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.mem_total') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ formatBytes(diagnostics.memory.totalBytes) }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.mem_used') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ formatBytes(diagnostics.memory.usedBytes) }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.mem_free') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ formatBytes(diagnostics.memory.freeBytes) }}</span>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <!-- 5. Armazenamento & Bancos de Dados -->
                <v-col cols="12" md="6">
                  <v-card class="rounded-xl pa-4 h-100" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center mb-3">
                      <v-icon
                        color="primary"
                        icon="mdi-database-outline"
                        size="20"
                        class="mr-2"
                      />
                      <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.diagnostics.categories.storage') }}
                      </span>
                    </div>
                    <div class="d-flex flex-column gap-2 text-caption">
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.userdata_size') }}</span>
                        <span class="font-weight-medium" style="color: var(--sidebar-text);">{{ formatBytes(diagnostics.storage.appDataSizeBytes) }}</span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.db_pt') }}</span>
                        <span class="font-weight-medium" :class="diagnostics.storage.databases.pt.exists ? 'text-success' : 'text-warning'">
                          {{ diagnostics.storage.databases.pt.exists ? `Ativo (${diagnostics.storage.databases.pt.version || 'OK'})` : 'Não instalado' }}
                        </span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.db_es') }}</span>
                        <span class="font-weight-medium" :class="diagnostics.storage.databases.es.exists ? 'text-success' : 'text-warning'">
                          {{ diagnostics.storage.databases.es.exists ? `Ativo (${diagnostics.storage.databases.es.version || 'OK'})` : 'Não instalado' }}
                        </span>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <!-- 6. Rede & Conectividade -->
                <v-col cols="12" md="6">
                  <v-card class="rounded-xl pa-4 h-100" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center mb-3">
                      <v-icon
                        color="primary"
                        icon="mdi-wifi"
                        size="20"
                        class="mr-2"
                      />
                      <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.diagnostics.categories.network') }}
                      </span>
                    </div>
                    <div class="d-flex flex-column gap-2 text-caption">
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.internet') }}</span>
                        <span class="font-weight-medium" :class="diagnostics.network.online ? 'text-success' : 'text-error'">
                          <v-icon :icon="diagnostics.network.online ? 'mdi-check-circle' : 'mdi-close-circle'" size="14" start />
                          {{ diagnostics.network.online ? $t('modules.help.diagnostics.labels.online') : $t('modules.help.diagnostics.labels.offline') }}
                        </span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.primary_api') }} (api.louvorja.com.br)</span>
                        <span class="font-weight-medium" :class="diagnostics.network.primaryApiStatus === 'online' ? 'text-success' : 'text-warning'">
                          {{ diagnostics.network.primaryApiStatus === 'online' ? 'Disponível' : 'Indisponível' }}
                        </span>
                      </div>
                      <div class="d-flex justify-space-between py-1 border-bottom-subtle">
                        <span style="color: var(--sidebar-text-secondary);">{{ $t('modules.help.diagnostics.labels.fallback_api') }} (workers.dev)</span>
                        <span class="font-weight-medium" :class="diagnostics.network.fallbackApiStatus === 'online' ? 'text-success' : 'text-warning'">
                          {{ diagnostics.network.fallbackApiStatus === 'online' ? 'Disponível' : 'Indisponível' }}
                        </span>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <!-- 7. Telas e Monitores Detectados -->
                <v-col cols="12">
                  <v-card class="rounded-xl pa-4" flat style="background: var(--card-bg); border: 1px solid var(--border-color);">
                    <div class="d-flex align-center mb-3">
                      <v-icon
                        color="primary"
                        icon="mdi-monitor-multiple"
                        size="20"
                        class="mr-2"
                      />
                      <span class="font-weight-bold text-subtitle-2" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.diagnostics.categories.displays') }} ({{ diagnostics.displays.length }})
                      </span>
                    </div>
                    <v-row dense>
                      <v-col
                        v-for="d in diagnostics.displays"
                        :key="d.id"
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <div class="pa-3 rounded-lg border-subtle d-flex flex-column gap-1 text-caption" style="background: rgba(0, 0, 0, 0.05);">
                          <div class="d-flex align-center justify-space-between">
                            <span class="font-weight-bold" style="color: var(--sidebar-text);">{{ d.label }}</span>
                            <v-chip
                              v-if="d.isPrimary"
                              size="x-small"
                              color="primary"
                              variant="flat"
                              class="font-weight-bold"
                            >
                              Principal
                            </v-chip>
                          </div>
                          <span style="color: var(--sidebar-text-secondary);">
                            Resolução: {{ d.bounds.width }}x{{ d.bounds.height }} (Escala: {{ d.scaleFactor }}x)
                          </span>
                          <span style="color: var(--sidebar-text-secondary); font-size: 0.7rem;">
                            Posição: X={{ d.bounds.x }}, Y={{ d.bounds.y }}
                          </span>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Snackbar de Sucesso -->
    <v-snackbar
      v-model="snackbar"
      :timeout="2500"
      color="success"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-check-circle" class="mr-2" />
        {{ snackbarMessage }}
      </div>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Logger, { FrontendLogEntry } from "@/helpers/services/Logger";

export default defineComponent({
  name: "HelpDiagnostics",
  props: {
    appVersion: {
      type: String,
      required: true,
    },
  },
  emits: ["back"],
  data() {
    return {
      activeTab: "logs",
      logs: [] as FrontendLogEntry[],
      loadingDiagnostics: false,
      snackbar: false,
      snackbarMessage: "",
      diagnostics: null as any,
    };
  },
  watch: {
    activeTab(newTab) {
      if (newTab === "system" && !this.diagnostics) {
        this.loadDiagnostics();
      }
    },
    logs: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
    },
  },
  async mounted() {
    await this.loadLogs();
    this.loadDiagnostics();

    // Ouve novos logs em tempo real do Electron
    if (window.electronAPI?.onLogEntryAdded) {
      window.electronAPI.onLogEntryAdded((entry: any) => {
        if (entry && entry.id) {
          this.logs.push(entry);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      });
    }
  },
  beforeUnmount() {
    if (window.electronAPI?.removeLogEntryListener) {
      window.electronAPI.removeLogEntryListener();
    }
  },
  methods: {
    async loadLogs() {
      try {
        this.logs = await Logger.getLogs({ limit: 1000 });
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (err) {
        console.error("Erro ao carregar logs:", err);
      }
    },
    async loadDiagnostics() {
      this.loadingDiagnostics = true;
      try {
        this.diagnostics = await Logger.getSystemDiagnostics();
      } catch (err) {
        console.error("Erro ao carregar diagnósticos:", err);
      } finally {
        this.loadingDiagnostics = false;
      }
    },
    scrollToBottom() {
      const el = this.$refs.logContainerRef as HTMLElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
    formatLogTime(isoString: string): string {
      try {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
      } catch {
        return isoString;
      }
    },
    formatBytes(bytes: number): string {
      if (!bytes || bytes <= 0) return "0 B";
      const k = 1024;
      const dm = 2;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },
    formatUptime(seconds: number): string {
      if (!seconds || seconds <= 0) return "0m";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
    },
    getOsIcon(platform: string): string {
      if (platform === "darwin" || platform === "macOS") return "mdi-apple";
      if (platform === "win32" || platform === "Windows") return "mdi-microsoft-windows";
      return "mdi-linux";
    },
    async copyFullReport() {
      const report = {
        generatedAt: new Date().toISOString(),
        diagnostics: this.diagnostics,
        recentLogs: this.logs.slice(-100),
      };
      try {
        await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
        this.showToast("Relatório de diagnóstico copiado!");
      } catch {
        // fallback
      }
    },
    showToast(message: string) {
      this.snackbarMessage = message;
      this.snackbar = true;
    },
  },
});
</script>

<style scoped>
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }

.border-subtle {
  border: 1px solid var(--border-color);
}

.border-bottom-subtle {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-terminal::-webkit-scrollbar {
  width: 8px;
}
.log-terminal::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.badge-info {
  background: rgba(33, 150, 243, 0.2);
  color: #58a6ff;
  border: 1px solid rgba(33, 150, 243, 0.3);
}

.badge-warn {
  background: rgba(255, 152, 0, 0.2);
  color: #e3b341;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.badge-error {
  background: rgba(244, 67, 54, 0.25);
  color: #f85149;
  border: 1px solid rgba(244, 67, 54, 0.4);
}

.badge-debug {
  background: rgba(158, 158, 158, 0.2);
  color: #8b949e;
}

.log-error {
  background: rgba(244, 67, 54, 0.05);
}

.log-warn {
  background: rgba(255, 152, 0, 0.03);
}
</style>
