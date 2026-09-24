<template>
  <div class="h-100 pa-4" style="overflow-y: auto;">
    <v-row>
      <!-- STATUS E CONTROLE PRINCIPAL -->
      <v-col cols="12">
        <v-card class="pa-5 modern-card" rounded="xl">
          <div class="d-flex flex-wrap align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-avatar color="primary" class="mr-3" size="44">
                <v-icon color="white">
                  mdi-broadcast
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">
                  Servidor de Transmissão (OBS / vMix)
                </div>
                <div class="text-caption text-medium-emphasis">
                  Transmita letras e versículos bíblicos diretamente para fontes de navegador do OBS Studio, vMix ou dispositivos na rede local.
                </div>
              </div>
            </div>

            <div class="d-flex align-center mt-2 mt-sm-0">
              <v-chip
                :color="isRunning ? 'success' : 'default'"
                class="font-weight-bold mr-3"
                variant="flat"
              >
                <v-icon start size="16">
                  {{ isRunning ? 'mdi-check-circle' : 'mdi-power-standby' }}
                </v-icon>
                {{ isRunning ? 'Servidor Ativo' : 'Desconectado' }}
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

          <v-divider class="my-3 opacity-20" />

          <v-checkbox
            v-model="autoStart"
            label="Iniciar servidor automaticamente ao abrir o LouvorJA"
            color="primary"
            hide-details
            density="compact"
            @update:model-value="saveSettings"
          />
        </v-card>
      </v-col>

      <!-- CONFIGURAÇÕES DE REDE -->
      <v-col cols="12" md="6">
        <v-card class="pa-5 h-100 modern-card" rounded="xl">
          <div class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
            <v-icon class="mr-2" color="primary">
              mdi-network
            </v-icon>
            Configurações de Rede
          </div>

          <v-select
            v-model="selectedHost"
            :items="interfaces"
            item-title="name"
            item-value="ip"
            label="Interface de Rede (IP)"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :disabled="isRunning"
            hide-details
            @update:model-value="saveSettings"
          >
            <template #prepend-inner>
              <v-icon size="20">
                mdi-ip-network
              </v-icon>
            </template>
          </v-select>

          <v-text-field
            v-model.number="port"
            label="Porta do Servidor"
            variant="outlined"
            density="comfortable"
            type="number"
            class="mb-3"
            :disabled="isRunning"
            hide-details
            @update:model-value="saveSettings"
          >
            <template #prepend-inner>
              <v-icon size="20">
                mdi-numeric
              </v-icon>
            </template>
          </v-text-field>

          <v-text-field
            v-model="token"
            label="Token de Segurança (opcional para rede)"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            hide-details
            @update:model-value="saveSettings"
          >
            <template #prepend-inner>
              <v-icon size="20">
                mdi-key
              </v-icon>
            </template>
            <template #append-inner>
              <v-btn
                icon="mdi-refresh"
                variant="text"
                size="small"
                title="Gerar novo token"
                @click="generateToken"
              />
            </template>
          </v-text-field>
          <div class="text-caption text-medium-emphasis">
            Dispositivos conectados na mesma máquina (localhost) conectam-se automaticamente sem necessidade de token.
          </div>
        </v-card>
      </v-col>

      <!-- PRÉVIA DO OVERLAY AO VIVO -->
      <v-col cols="12" md="6">
        <v-card class="pa-5 h-100 modern-card d-flex flex-column" rounded="xl">
          <div class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
            <v-icon class="mr-2" color="primary">
              mdi-television
            </v-icon>
            Prévia do Overlay (OBS)
          </div>
          <div class="text-caption text-medium-emphasis mb-3">
            Simulação da transmissão no momento atual:
          </div>

          <div
            class="flex-grow-1 d-flex flex-column justify-end pa-4 rounded-lg"
            style="background: #111; min-height: 140px; border: 1px dashed rgba(255,255,255,0.15);"
          >
            <div
              v-if="currentLyricText"
              class="pa-3 rounded-lg text-center"
              style="background: rgba(20, 24, 33, 0.9); border: 1px solid rgba(255,255,255,0.15);"
            >
              <div class="text-caption font-weight-bold text-amber mb-1">
                {{ currentTitle || 'Mídia Ativa' }}
              </div>
              <div class="text-body-1 font-weight-bold text-white">
                {{ currentLyricText }}
              </div>
            </div>
            <div v-else class="text-center text-medium-emphasis text-caption pa-4">
              Nenhuma música ou versículo bíblico sendo projetado no momento.
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- LINKS PRONTOS PARA TRANSMISSÃO -->
      <v-col cols="12">
        <v-card class="pa-5 modern-card" rounded="xl">
          <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
            <v-icon class="mr-2" color="primary">
              mdi-link-variant
            </v-icon>
            Links para Transmissão e Dispositivos
          </div>

          <v-row>
            <!-- LINK 1: OBS LOWER THIRD -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4 h-100 rounded-lg">
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="font-weight-bold text-body-1">
                    OBS / vMix — Terço Inferior (Lower-Third)
                  </div>
                  <v-chip size="x-small" color="primary">
                    Recomendado
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis mb-3">
                  Barra semi-transparente ideal para câmeras ao vivo. Adicione como "Fonte de Navegador" (Browser Source) no OBS.
                </div>
                <div class="d-flex align-center gap-2">
                  <v-text-field
                    :model-value="links.overlay"
                    readonly
                    variant="solo-filled"
                    density="compact"
                    hide-details
                    class="font-monospace text-caption flex-grow-1"
                  />
                  <v-btn
                    icon="mdi-content-copy"
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="ml-2"
                    title="Copiar link"
                    @click="copyToClipboard(links.overlay)"
                  />
                  <v-btn
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    title="Abrir no navegador"
                    @click="openUrl(links.overlay)"
                  />
                </div>
              </v-card>
            </v-col>

            <!-- LINK 2: OBS FULLSCREEN -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4 h-100 rounded-lg">
                <div class="font-weight-bold text-body-1 mb-1">
                  OBS / vMix — Tela Cheia (Fullscreen)
                </div>
                <div class="text-caption text-medium-emphasis mb-3">
                  Texto centralizado com fundo alfa transparente nativo para sobreposição completa na tela.
                </div>
                <div class="d-flex align-center gap-2">
                  <v-text-field
                    :model-value="links.overlayFullscreen"
                    readonly
                    variant="solo-filled"
                    density="compact"
                    hide-details
                    class="font-monospace text-caption flex-grow-1"
                  />
                  <v-btn
                    icon="mdi-content-copy"
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="ml-2"
                    title="Copiar link"
                    @click="copyToClipboard(links.overlayFullscreen)"
                  />
                  <v-btn
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    title="Abrir no navegador"
                    @click="openUrl(links.overlayFullscreen)"
                  />
                </div>
              </v-card>
            </v-col>

            <!-- LINK 3: RETORNO DE PALCO (STAGE MONITOR) -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4 h-100 rounded-lg">
                <div class="font-weight-bold text-body-1 mb-1">
                  Retorno de Palco (Stage Monitor Web)
                </div>
                <div class="text-caption text-medium-emphasis mb-3">
                  Página para celular/tablet de músicos e oradores no palco com letra atual e próxima estrofe.
                </div>
                <div class="d-flex align-center gap-2">
                  <v-text-field
                    :model-value="links.stage"
                    readonly
                    variant="solo-filled"
                    density="compact"
                    hide-details
                    class="font-monospace text-caption flex-grow-1"
                  />
                  <v-btn
                    icon="mdi-content-copy"
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="ml-2"
                    title="Copiar link"
                    @click="copyToClipboard(links.stage)"
                  />
                  <v-btn
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    title="Abrir no navegador"
                    @click="openUrl(links.stage)"
                  />
                </div>
              </v-card>
            </v-col>

            <!-- LINK 4: CONTROLE REMOTO -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4 h-100 rounded-lg">
                <div class="font-weight-bold text-body-1 mb-1">
                  Controle Remoto Web
                </div>
                <div class="text-caption text-medium-emphasis mb-3">
                  Acesse pelo smartphone na mesma rede para passar slides, dar play/pause e pesquisar hinos.
                </div>
                <div class="d-flex align-center gap-2">
                  <v-text-field
                    :model-value="links.remote"
                    readonly
                    variant="solo-filled"
                    density="compact"
                    hide-details
                    class="font-monospace text-caption flex-grow-1"
                  />
                  <v-btn
                    icon="mdi-content-copy"
                    variant="tonal"
                    color="primary"
                    size="small"
                    class="ml-2"
                    title="Copiar link"
                    @click="copyToClipboard(links.remote)"
                  />
                  <v-btn
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    title="Abrir no navegador"
                    @click="openUrl(links.remote)"
                  />
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import $snackbar from "@/helpers/ui/Snackbar";

export default defineComponent({
  name: "TabStreaming",
  data() {
    return {
      isRunning: false,
      isLoading: false,
      autoStart: false,
      port: 7070,
      selectedHost: "0.0.0.0",
      token: "",
      interfaces: [] as Array<{ name: string; ip: string; isLocal: boolean }>,
      links: {
        overlay: "http://localhost:7070/overlay",
        overlayFullscreen: "http://localhost:7070/overlay?mode=fullscreen",
        stage: "http://localhost:7070/stage",
        remote: "http://localhost:7070/remote",
      },
    };
  },
  computed: {
    currentLyricText(): string {
      const mediaSlide = (this as any).$media?.slide();
      if (mediaSlide && mediaSlide.lyric) {
        return mediaSlide.lyric;
      }
      const bibleData = (this as any).$appdata?.get("modules.bible.data");
      if (bibleData && bibleData.text) {
        return bibleData.text;
      }
      return "";
    },
    currentTitle(): string {
      const config = (this as any).$media?.config();
      if (config && config.title) {
        return config.title;
      }
      const bibleData = (this as any).$appdata?.get("modules.bible.data");
      if (bibleData && bibleData.scriptural_reference) {
        return bibleData.scriptural_reference;
      }
      return "";
    },
  },
  async mounted() {
    this.loadSettings();
    await this.fetchInterfaces();
    await this.fetchStatus();
  },
  methods: {
    loadSettings() {
      this.autoStart = (this as any).$userdata.get("modules.streaming.autostart") === true;
      this.port = Number((this as any).$userdata.get("modules.streaming.port")) || 7070;
      this.selectedHost = (this as any).$userdata.get("modules.streaming.host") || "0.0.0.0";
      this.token = (this as any).$userdata.get("modules.streaming.token") || "";

      if (!this.token) {
        this.generateToken();
      }
    },
    saveSettings() {
      (this as any).$userdata.set("modules.streaming.autostart", this.autoStart);
      (this as any).$userdata.set("modules.streaming.port", this.port);
      (this as any).$userdata.set("modules.streaming.host", this.selectedHost);
      (this as any).$userdata.set("modules.streaming.token", this.token);
      this.updateLinks();
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
          { name: "Todas as Redes (Padrão 0.0.0.0)", ip: "0.0.0.0", isLocal: false },
          ...list,
        ];
      } else {
        this.interfaces = [
          { name: "Localhost (Apenas este computador)", ip: "127.0.0.1", isLocal: true },
        ];
      }
    },
    async fetchStatus() {
      if (window.electronAPI?.streamingGetStatus) {
        try {
          const status = await window.electronAPI.streamingGetStatus();
          this.isRunning = status.running;
          if (status.urls) {
            this.links = {
              overlay: status.urls.overlay,
              overlayFullscreen: status.urls.overlayFullscreen,
              stage: status.urls.stage,
              remote: status.urls.remote,
            };
          }
        } catch (e) {
          console.error("Erro ao obter status do streaming:", e);
        }
      }
    },
    updateLinks() {
      const host = this.selectedHost === "0.0.0.0"
        ? (this.interfaces.find((i) => !i.isLocal && i.ip !== "0.0.0.0")?.ip || "localhost")
        : this.selectedHost;
      const port = this.port || 7070;
      const base = `http://${host}:${port}`;
      const tokenQuery = this.token ? `?token=${encodeURIComponent(this.token)}` : "";

      this.links = {
        overlay: `http://localhost:${port}/overlay`,
        overlayFullscreen: `http://localhost:${port}/overlay?mode=fullscreen`,
        stage: `${base}/stage${tokenQuery}`,
        remote: `${base}/remote${tokenQuery}`,
      };
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
              token: this.token,
            });
            this.isRunning = status.running;
            $snackbar.show({ text: `Servidor de transmissão iniciado na porta ${this.port}!`, color: "success" });
          }
        } else {
          if (window.electronAPI?.streamingStop) {
            await window.electronAPI.streamingStop();
            this.isRunning = false;
            $snackbar.show({ text: "Servidor de transmissão desconectado.", color: "info" });
          }
        }
        await this.fetchStatus();
      } catch (err: any) {
        this.isRunning = false;
        $snackbar.show({ text: `Erro ao controlar servidor: ${err.message || err}`, color: "error" });
      } finally {
        this.isLoading = false;
      }
    },
    copyToClipboard(text: string) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        $snackbar.show({ text: "Link copiado para a área de transferência!", color: "success", timeout: 2000 });
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
.modern-card {
  background: var(--card-bg, #1a1d27);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
