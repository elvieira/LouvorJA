<template>
  <div class="d-flex flex-column" style="gap: 20px; width: 100%; max-width: 100%; overflow-x: hidden;">
    <!-- 1. STATUS E CONTROLE PRINCIPAL -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex flex-wrap align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="28">
              mdi-broadcast
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('streaming_server_title') }}
              </h3>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                {{ t('streaming_server_desc') }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center mt-3 mt-sm-0">
            <v-chip
              :color="isRunning ? 'success' : 'default'"
              class="font-weight-bold mr-3"
              variant="flat"
            >
              <v-icon start size="16">
                {{ isRunning ? 'mdi-check-circle' : 'mdi-power-standby' }}
              </v-icon>
              {{ isRunning ? t('server_active') : t('server_offline') }}
            </v-chip>

            <v-switch
              v-model="isRunning"
              color="success"
              hide-details
              inset
              :loading="isLoading"
              @update:model-value="toggleServer"
            />
          </div>
        </div>

        <v-divider class="my-5" style="opacity: 0.1;" />

        <SettingsActionRow
          v-model="autoStart"
          icon="mdi-play-network-outline"
          icon-color="primary"
          :title="t('streaming_auto_start')"
          :subtitle="t('streaming_auto_start_desc')"
          type="switch"
          @update:model-value="saveSettings"
        />
      </v-card-text>
    </v-card>

    <!-- 2. CONFIGURAÇÕES DE REDE (FULL-WIDTH CARD) -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <!-- Interface de Rede (Dropdown oficial do programa via SettingsActionRow) -->
        <SettingsActionRow
          v-model="selectedHost"
          icon="mdi-ip-network"
          icon-color="primary"
          :title="t('network_interface')"
          :subtitle="t('network_interface_desc')"
          type="select"
          :items="interfaces"
          item-title="name"
          item-value="ip"
          :button-disabled="isRunning"
          @update:model-value="onHostChange"
        />

        <v-divider class="my-5" style="opacity: 0.1;" />

        <!-- Porta do Servidor -->
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="24">
              mdi-numeric
            </v-icon>
            <div>
              <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                {{ t('server_port') }}
              </h3>
              <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                {{ t('server_port_desc') }}
              </div>
            </div>
          </div>

          <v-text-field
            v-model.number="port"
            type="number"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            :disabled="isRunning"
            style="width: 120px; max-width: 120px;"
            @update:model-value="saveSettings"
          />
        </div>

        <v-divider class="my-5" style="opacity: 0.1;" />

        <!-- Opção: Ativar/Desativar Token de Segurança -->
        <SettingsActionRow
          v-model="useToken"
          icon="mdi-shield-check-outline"
          icon-color="primary"
          :title="t('require_token')"
          :subtitle="t('require_token_desc')"
          type="switch"
          @update:model-value="saveSettings"
        />

        <template v-if="useToken">
          <v-divider class="my-5" style="opacity: 0.1;" />

          <!-- Campo do Token -->
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="24">
                mdi-shield-key-outline
              </v-icon>
              <div>
                <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
                  {{ t('security_token') }}
                </h3>
                <div class="text-caption" style="color: var(--sidebar-text-secondary);">
                  {{ t('security_token_desc') }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center" style="gap: 8px;">
              <v-text-field
                v-model="token"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details
                style="width: 130px; max-width: 130px;"
                class="font-monospace"
                @update:model-value="saveSettings"
              />
              <v-btn
                icon="mdi-refresh"
                variant="tonal"
                color="primary"
                size="small"
                class="rounded-lg"
                :title="t('generate_new_token')"
                @click="generateToken"
              />
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>
    <!-- 3. LINKS PRONTOS PARA TRANSMISSÃO E DISPOSITIVOS -->
    <v-card class="settings-card rounded-xl pa-2" flat style="background: var(--card-bg); box-shadow: var(--shadow);">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" class="mr-3" size="28">
            mdi-link-variant
          </v-icon>
          <div>
            <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
              {{ t('streaming_links_title') }}
            </h3>
            <div class="text-caption" style="color: var(--sidebar-text-secondary);">
              {{ t('streaming_links_desc') }}
            </div>
          </div>
        </div>

        <div class="streaming-links-grid mt-2">
          <!-- LINK 1: OBS LOWER THIRD -->
          <div class="service-link-card pa-4 rounded-xl d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex align-start justify-space-between mb-2" style="gap: 12px;">
                <div class="d-flex align-center" style="min-width: 0; flex: 1 1 auto;">
                  <v-avatar
                    size="38"
                    color="primary"
                    variant="tonal"
                    class="mr-3 rounded-lg flex-shrink-0"
                  >
                    <v-icon size="20">
                      mdi-dock-bottom
                    </v-icon>
                  </v-avatar>
                  <div style="min-width: 0;">
                    <div class="font-weight-bold text-body-1 text-truncate" style="color: var(--sidebar-text); line-height: 1.25;">
                      {{ t('link_lower_third_title') }}
                    </div>
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="primary"
                  variant="flat"
                  class="font-weight-bold flex-shrink-0"
                  style="white-space: nowrap;"
                >
                  {{ t('recommended_badge') }}
                </v-chip>
              </div>

              <div class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
                {{ t('link_lower_third_desc') }}
              </div>
            </div>

            <div>
              <div class="url-pill d-flex align-center px-3 py-2 rounded-lg mb-3">
                <v-icon size="16" class="mr-2" color="primary">
                  mdi-link
                </v-icon>
                <span class="url-text font-monospace text-caption font-weight-medium text-truncate">
                  {{ links.overlay }}
                </span>
              </div>

              <div class="d-flex align-center" style="gap: 8px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="flex-grow-1 text-none font-weight-bold rounded-lg"
                  prepend-icon="mdi-content-copy"
                  height="36"
                  @click="copyToClipboard(links.overlay)"
                >
                  {{ t('copy_link') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  icon="mdi-qrcode"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('qr_code_tooltip')"
                  @click="openQrCode(t('link_lower_third_title'), links.overlay, 'overlay')"
                />
                <v-btn
                  variant="outlined"
                  icon="mdi-open-in-new"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('open_browser_tooltip')"
                  @click="openUrl(links.overlay)"
                />
              </div>
            </div>
          </div>

          <!-- LINK 2: OBS FULLSCREEN -->
          <div class="service-link-card pa-4 rounded-xl d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex align-start justify-space-between mb-2" style="gap: 12px;">
                <div class="d-flex align-center" style="min-width: 0; flex: 1 1 auto;">
                  <v-avatar
                    size="38"
                    color="primary"
                    variant="tonal"
                    class="mr-3 rounded-lg flex-shrink-0"
                  >
                    <v-icon size="20">
                      mdi-fullscreen
                    </v-icon>
                  </v-avatar>
                  <div style="min-width: 0;">
                    <div class="font-weight-bold text-body-1 text-truncate" style="color: var(--sidebar-text); line-height: 1.25;">
                      {{ t('link_fullscreen_title') }}
                    </div>
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="info"
                  variant="tonal"
                  class="font-weight-bold flex-shrink-0"
                  style="white-space: nowrap;"
                >
                  {{ t('projection_player_badge') }}
                </v-chip>
              </div>

              <div class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
                {{ t('link_fullscreen_desc') }}
              </div>
            </div>

            <div>
              <div class="url-pill d-flex align-center px-3 py-2 rounded-lg mb-3">
                <v-icon size="16" class="mr-2" color="primary">
                  mdi-link
                </v-icon>
                <span class="url-text font-monospace text-caption font-weight-medium text-truncate">
                  {{ links.overlayFullscreen }}
                </span>
              </div>

              <div class="d-flex align-center" style="gap: 8px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="flex-grow-1 text-none font-weight-bold rounded-lg"
                  prepend-icon="mdi-content-copy"
                  height="36"
                  @click="copyToClipboard(links.overlayFullscreen)"
                >
                  {{ t('copy_link') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  icon="mdi-qrcode"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('qr_code_tooltip')"
                  @click="openQrCode(t('link_fullscreen_title'), links.overlayFullscreen, 'overlayFullscreen')"
                />
                <v-btn
                  variant="outlined"
                  icon="mdi-open-in-new"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('open_browser_tooltip')"
                  @click="openUrl(links.overlayFullscreen)"
                />
              </div>
            </div>
          </div>

          <!-- LINK 3: RETORNO DE PALCO -->
          <div class="service-link-card pa-4 rounded-xl d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex align-start justify-space-between mb-2" style="gap: 12px;">
                <div class="d-flex align-center" style="min-width: 0; flex: 1 1 auto;">
                  <v-avatar
                    size="38"
                    color="primary"
                    variant="tonal"
                    class="mr-3 rounded-lg flex-shrink-0"
                  >
                    <v-icon size="20">
                      mdi-tablet-dashboard
                    </v-icon>
                  </v-avatar>
                  <div style="min-width: 0;">
                    <div class="font-weight-bold text-body-1 text-truncate" style="color: var(--sidebar-text); line-height: 1.25;">
                      {{ t('link_stage_title') }}
                    </div>
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="secondary"
                  variant="tonal"
                  class="font-weight-bold flex-shrink-0"
                  style="white-space: nowrap;"
                >
                  {{ t('musicians_badge') }}
                </v-chip>
              </div>

              <div class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
                {{ t('link_stage_desc') }}
              </div>
            </div>

            <div>
              <div class="url-pill d-flex align-center px-3 py-2 rounded-lg mb-3">
                <v-icon size="16" class="mr-2" color="primary">
                  mdi-link
                </v-icon>
                <span class="url-text font-monospace text-caption font-weight-medium text-truncate">
                  {{ links.stage }}
                </span>
              </div>

              <div class="d-flex align-center" style="gap: 8px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="flex-grow-1 text-none font-weight-bold rounded-lg"
                  prepend-icon="mdi-content-copy"
                  height="36"
                  @click="copyToClipboard(links.stage)"
                >
                  {{ t('copy_link') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  icon="mdi-qrcode"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('qr_code_tooltip')"
                  @click="openQrCode(t('link_stage_title'), links.stage, 'stage')"
                />
                <v-btn
                  variant="outlined"
                  icon="mdi-open-in-new"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('open_browser_tooltip')"
                  @click="openUrl(links.stage)"
                />
              </div>
            </div>
          </div>

          <!-- LINK 4: CONTROLE REMOTO -->
          <div class="service-link-card pa-4 rounded-xl d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex align-start justify-space-between mb-2" style="gap: 12px;">
                <div class="d-flex align-center" style="min-width: 0; flex: 1 1 auto;">
                  <v-avatar
                    size="38"
                    color="primary"
                    variant="tonal"
                    class="mr-3 rounded-lg flex-shrink-0"
                  >
                    <v-icon size="20">
                      mdi-remote
                    </v-icon>
                  </v-avatar>
                  <div style="min-width: 0;">
                    <div class="font-weight-bold text-body-1 text-truncate" style="color: var(--sidebar-text); line-height: 1.25;">
                      {{ t('link_remote_title') }}
                    </div>
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="success"
                  variant="tonal"
                  class="font-weight-bold flex-shrink-0"
                  style="white-space: nowrap;"
                >
                  {{ t('web_control_badge') }}
                </v-chip>
              </div>

              <div class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
                {{ t('link_remote_desc') }}
              </div>
            </div>

            <div>
              <div class="url-pill d-flex align-center px-3 py-2 rounded-lg mb-3">
                <v-icon size="16" class="mr-2" color="primary">
                  mdi-link
                </v-icon>
                <span class="url-text font-monospace text-caption font-weight-medium text-truncate">
                  {{ links.remote }}
                </span>
              </div>

              <div class="d-flex align-center" style="gap: 8px;">
                <v-btn
                  variant="tonal"
                  color="primary"
                  class="flex-grow-1 text-none font-weight-bold rounded-lg"
                  prepend-icon="mdi-content-copy"
                  height="36"
                  @click="copyToClipboard(links.remote)"
                >
                  {{ t('copy_link') }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  icon="mdi-qrcode"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('qr_code_tooltip')"
                  @click="openQrCode(t('link_remote_title'), links.remote, 'remote')"
                />
                <v-btn
                  variant="outlined"
                  icon="mdi-open-in-new"
                  size="small"
                  class="rounded-lg"
                  style="border-color: var(--border-color); color: var(--sidebar-text);"
                  :title="t('open_browser_tooltip')"
                  @click="openUrl(links.remote)"
                />
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- MODAL DE QR CODE PARA DISPOSITIVOS MÓVEIS -->
    <v-dialog v-model="showQrDialog" max-width="400">
      <v-card class="rounded-xl overflow-hidden" style="background: var(--card-bg); border: 1px solid var(--border-color); box-shadow: var(--shadow);">
        <v-card-title class="d-flex align-center justify-space-between pa-4 pb-2">
          <div class="d-flex align-center text-truncate" style="gap: 10px;">
            <v-avatar
              color="primary"
              variant="tonal"
              size="34"
              class="rounded-lg flex-shrink-0"
            >
              <v-icon size="20">
                mdi-qrcode-scan
              </v-icon>
            </v-avatar>
            <div class="font-weight-bold text-subtitle-1 text-truncate" style="color: var(--sidebar-text);">
              {{ qrDialogTitle }}
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            density="comfortable"
            class="rounded-lg flex-shrink-0"
            style="color: var(--sidebar-text-secondary);"
            @click="showQrDialog = false"
          />
        </v-card-title>

        <v-card-text class="pa-4 pt-1 text-center">
          <div class="text-caption mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
            {{ t('qr_dialog_scan') }}
          </div>

          <!-- CONTAINER DO QR CODE -->
          <div class="d-flex justify-center my-2">
            <div
              class="d-flex align-center justify-center pa-3 rounded-xl"
              style="background: #ffffff; border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0,0,0,0.08); width: 250px; height: 250px;"
            >
              <v-progress-circular
                v-if="isGeneratingQr"
                indeterminate
                color="primary"
                size="36"
              />
              <img
                v-else-if="qrDataUrl"
                :src="qrDataUrl"
                alt="QR Code"
                style="width: 100%; height: 100%; object-fit: contain; display: block;"
              />
              <div v-else class="text-caption text-grey">
                {{ t('qr_error') }}
              </div>
            </div>
          </div>

          <!-- URL E BOTÃO COPIAR RÁPIDO -->
          <div class="url-pill d-flex align-center px-3 py-2 rounded-lg mt-3 text-left">
            <v-icon size="16" class="mr-2" color="primary">
              mdi-link
            </v-icon>
            <span class="url-text font-monospace text-caption font-weight-medium text-truncate flex-grow-1">
              {{ qrDialogUrl }}
            </span>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="x-small"
              class="ml-1 rounded"
              :title="t('copy_link')"
              @click="copyToClipboard(qrDialogUrl)"
            />
          </div>

          <v-alert
            v-if="!isRunning"
            type="info"
            variant="tonal"
            density="compact"
            class="mt-3 rounded-lg text-left text-caption"
            icon="mdi-information-outline"
          >
            {{ t('server_offline_alert') }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0 d-flex justify-end">
          <v-btn
            variant="tonal"
            color="primary"
            class="text-none font-weight-bold rounded-lg px-4"
            prepend-icon="mdi-content-copy"
            @click="copyToClipboard(qrDialogUrl)"
          >
            {{ t('copy_link') }}
          </v-btn>
          <v-btn
            variant="outlined"
            class="text-none rounded-lg px-4"
            style="border-color: var(--border-color); color: var(--sidebar-text);"
            @click="showQrDialog = false"
          >
            {{ t('close_btn') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import QRCode from "qrcode";
import manifest from "../../manifest";
import SettingsActionRow from "@/components/SettingsActionRow.vue";
import $snackbar from "@/helpers/ui/Snackbar";

export default defineComponent({
  name: "ConfigStreaming",
  components: {
    SettingsActionRow,
  },
  data() {
    return {
      isRunning: false,
      isLoading: false,
      autoStart: false,
      port: 7071,
      selectedHost: "0.0.0.0",
      useToken: true,
      token: "",
      interfaces: [] as Array<{ name: string; ip: string; isLocal: boolean }>,
      links: {
        overlay: "http://localhost:7071/overlay",
        overlayFullscreen: "http://localhost:7071/fullscreen",
        stage: "http://localhost:7071/stage",
        remote: "http://localhost:7071/remote",
      },
      showQrDialog: false,
      qrDialogTitle: "",
      qrDialogUrl: "",
      qrDialogKey: "",
      qrDataUrl: "",
      isGeneratingQr: false,
    };
  },
  watch: {
    selectedHost() {
      this.updateLinks();
    },
    port() {
      this.updateLinks();
    },
    useToken() {
      this.saveSettings();
    },
    token() {
      this.updateLinks();
    },
  },
  async mounted() {
    this.loadSettings();
    await this.fetchInterfaces();
    await this.fetchStatus();
  },
  methods: {
    t(key: string, params?: any): string {
      return (this as any).$t(`modules.${manifest.id}.${key}`, params);
    },
    loadSettings() {
      this.autoStart = (this as any).$userdata.get("modules.streaming.autostart") === true;
      const savedPort = (this as any).$userdata.get("modules.streaming.port");
      // Se for 7070 (que colide com AnyDesk) ou não configurada, migra para 7071
      this.port = savedPort && Number(savedPort) !== 7070 ? Number(savedPort) : 7071;
      this.selectedHost = (this as any).$userdata.get("modules.streaming.host") || "0.0.0.0";
      const savedUseToken = (this as any).$userdata.get("modules.streaming.use_token");
      this.useToken = savedUseToken !== undefined ? savedUseToken === true : true;
      this.token = (this as any).$userdata.get("modules.streaming.token") || "";

      if (!this.token) {
        this.generateToken();
      } else {
        this.saveSettings();
      }
    },
    onHostChange(val: string) {
      this.selectedHost = val || "0.0.0.0";
      this.saveSettings();
    },
    saveSettings() {
      (this as any).$userdata.set("modules.streaming.autostart", this.autoStart);
      (this as any).$userdata.set("modules.streaming.port", this.port);
      (this as any).$userdata.set("modules.streaming.host", this.selectedHost);
      (this as any).$userdata.set("modules.streaming.use_token", this.useToken);
      (this as any).$userdata.set("modules.streaming.token", this.token);
      this.updateLinks();
      const effectiveToken = this.useToken ? this.token : "";
      if (window.electronAPI?.streamingSetConfig) {
        window.electronAPI.streamingSetConfig({
          host: this.selectedHost,
          port: this.port,
          token: effectiveToken,
        }).catch((e: any) => console.error("Erro ao sincronizar config com Electron:", e));
      }
    },
    generateToken() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let res = "";
      for (let i = 0; i < 5; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.token = res;
      this.saveSettings();
    },
    async fetchInterfaces() {
      if (window.electronAPI?.streamingGetInterfaces) {
        const list = await window.electronAPI.streamingGetInterfaces();
        this.interfaces = [
          { name: this.t("all_networks"), ip: "0.0.0.0", isLocal: false },
          ...list,
        ];
      } else {
        this.interfaces = [
          { name: this.t("localhost_only"), ip: "127.0.0.1", isLocal: true },
        ];
      }
      this.updateLinks();
    },
    async fetchStatus() {
      if (window.electronAPI?.streamingGetStatus) {
        try {
          const status = await window.electronAPI.streamingGetStatus();
          this.isRunning = status.running;
          if (status.urls && this.isRunning) {
            this.links = {
              overlay: status.urls.overlay,
              overlayFullscreen: status.urls.overlayFullscreen,
              stage: status.urls.stage,
              remote: status.urls.remote,
            };
          } else {
            this.updateLinks();
          }
        } catch (e) {
          console.error("Erro ao obter status do streaming:", e);
        }
      }
    },
    getResolvedHost(): string {
      if (this.selectedHost && this.selectedHost !== "0.0.0.0") {
        return this.selectedHost;
      }
      const found = this.interfaces.find((i) => !i.isLocal && i.ip !== "0.0.0.0");
      return found ? found.ip : "localhost";
    },
    updateLinks() {
      const host = this.getResolvedHost();
      const port = this.port || 7071;
      const base = `http://${host}:${port}`;
      const overlayHost = this.selectedHost === "0.0.0.0" ? "localhost" : host;

      this.links = {
        overlay: `http://${overlayHost}:${port}/overlay`,
        overlayFullscreen: `http://${overlayHost}:${port}/fullscreen`,
        stage: `${base}/stage`,
        remote: `${base}/remote`,
      };

      if (this.showQrDialog && this.qrDialogKey) {
        const activeRawUrl = (this.links as any)[this.qrDialogKey] || this.qrDialogUrl;
        let mobileUrl = this.getMobileUrl(activeRawUrl);
        if (this.useToken && this.token && (this.qrDialogKey === "remote" || this.qrDialogKey === "stage")) {
          const sep = mobileUrl.includes("?") ? "&" : "?";
          mobileUrl += `${sep}token=${encodeURIComponent(this.token)}`;
        }
        this.qrDialogUrl = mobileUrl;
        this.generateQrCode(mobileUrl);
      }
    },
    getMobileUrl(url: string): string {
      const host = this.getResolvedHost();
      if (host && host !== "0.0.0.0" && host !== "127.0.0.1" && host !== "localhost") {
        return url.replace("localhost", host).replace("127.0.0.1", host);
      }
      return url;
    },
    async openQrCode(title: string, url: string, key?: string) {
      this.qrDialogTitle = title;
      this.qrDialogKey = key || "";
      let mobileUrl = this.getMobileUrl(url);
      if (this.useToken && this.token && (key === "remote" || key === "stage")) {
        const sep = mobileUrl.includes("?") ? "&" : "?";
        mobileUrl += `${sep}token=${encodeURIComponent(this.token)}`;
      }
      this.qrDialogUrl = mobileUrl;
      this.showQrDialog = true;
      await this.generateQrCode(mobileUrl);
    },
    async generateQrCode(text: string) {
      if (!text) {
        this.qrDataUrl = "";
        return;
      }
      this.isGeneratingQr = true;
      try {
        this.qrDataUrl = await QRCode.toDataURL(text, {
          width: 260,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
      } catch (err) {
        console.error("Erro ao gerar QR Code:", err);
        this.qrDataUrl = "";
      } finally {
        this.isGeneratingQr = false;
      }
    },
    async toggleServer(active: boolean | null) {
      const shouldStart = !!active;
      this.isLoading = true;
      try {
        if (shouldStart) {
          if (window.electronAPI?.streamingStart) {
            const status = await window.electronAPI.streamingStart({
              port: this.port,
              host: this.selectedHost,
              token: this.useToken ? this.token : "",
            });
            this.isRunning = status.running;
            $snackbar.show({ text: this.t("msg_server_started", { port: this.port }), color: "success" });
          }
        } else {
          if (window.electronAPI?.streamingStop) {
            await window.electronAPI.streamingStop();
            this.isRunning = false;
            $snackbar.show({ text: this.t("msg_server_stopped"), color: "info" });
          }
        }
        await this.fetchStatus();
      } catch (err: any) {
        this.isRunning = false;
        $snackbar.show({ text: this.t("msg_server_error", { error: err.message || err }), color: "error" });
      } finally {
        this.isLoading = false;
      }
    },
    copyToClipboard(text: string) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        $snackbar.show({ text: this.t("msg_link_copied"), color: "success", timeout: 2000 });
      }
    },
    openUrl(url: string) {
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(url);
      } else {
        window.open(url, "_blank");
      }
    },
  },
});
</script>

<style scoped>
.settings-card {
  border-radius: 24px !important;
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.settings-card:hover {
  box-shadow: var(--shadow-hover) !important;
  transform: translateY(-1px);
}

/* GRID DE LINKS */
.streaming-links-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1040px) {
  .streaming-links-grid {
    grid-template-columns: 1fr;
  }
}

/* CARDS DE SERVIÇO / LINKS (SEM FUNDO ESCURECIDO) */
.service-link-card {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 20px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.service-link-card:hover {
  border-color: var(--accent-blue) !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* PÍLULA DE URL DISCRETA */
.url-pill {
  background: rgba(125, 125, 125, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  min-width: 0;
}

.url-text {
  color: var(--sidebar-text);
  min-width: 0;
}


</style>
