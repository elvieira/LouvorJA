<template>
  <div class="manual-section">
    <p class="mb-6">
      Agilize o uso do aplicativo utilizando as teclas de atalho mapeadas. Abaixo, você confere as combinações disponíveis para cada módulo do sistema.
    </p>

    <!-- Geral -->
    <v-card variant="flat" class="rounded-xl mb-6" style="background: rgba(128, 128, 128, 0.04); border: 1px solid rgba(128, 128, 128, 0.1);">
      <v-card-title class="px-5 py-4 d-flex align-center" style="border-bottom: 1px solid rgba(128, 128, 128, 0.1);">
        <v-icon
          icon="mdi-laptop"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold" style="font-size: 1.1rem; color: var(--sidebar-text);">Geral</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent" density="comfortable">
          <tbody>
            <tr>
              <td style="width: 250px;">
                <kbd>ESC</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                Fecha a música
              </td>
            </tr>
            <tr>
              <td><kbd>CTRL</kbd> + <kbd>F</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                Abre a busca de músicas
              </td>
            </tr>
            <tr>
              <td><kbd>F1</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                Abre a tela de ajuda
              </td>
            </tr>
            <tr>
              <td><kbd>F5</kbd> / <kbd>F9</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                Projeta a janela atual (quando disponível o recurso)
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Bíblia -->
    <v-card variant="flat" class="rounded-xl mb-6" style="background: rgba(128, 128, 128, 0.04); border: 1px solid rgba(128, 128, 128, 0.1);">
      <v-card-title class="px-5 py-4 d-flex align-center" style="border-bottom: 1px solid rgba(128, 128, 128, 0.1);">
        <v-icon
          icon="mdi-book-cross"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold" style="font-size: 1.1rem; color: var(--sidebar-text);">Bíblia / Busca Bíblica</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent" density="comfortable">
          <tbody>
            <tr>
              <td style="width: 250px;">
                <kbd>←</kbd> / <kbd>↑</kbd> / <kbd>PgUp</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                Vai para o verso anterior
              </td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> / <kbd>↓</kbd> / <kbd>PgDn</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                Vai para o próximo verso
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Projeção -->
    <v-card variant="flat" class="rounded-xl mb-6" style="background: rgba(128, 128, 128, 0.04); border: 1px solid rgba(128, 128, 128, 0.1);">
      <v-card-title class="px-5 py-4 d-flex align-center" style="border-bottom: 1px solid rgba(128, 128, 128, 0.1);">
        <v-icon
          icon="mdi-monitor"
          color="primary"
          class="mr-3"
          size="small"
        />
        <span class="font-weight-bold" style="font-size: 1.1rem; color: var(--sidebar-text);">Projeção de Música</span>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-table class="bg-transparent" density="comfortable">
          <tbody>
            <tr>
              <td style="width: 250px;">
                <kbd>←</kbd> / <kbd>↑</kbd> / <kbd>PgUp</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                Vai para o slide anterior (ou retrocede o versículo)
              </td>
            </tr>
            <tr>
              <td>
                <kbd>→</kbd> / <kbd>↓</kbd> / <kbd>PgDn</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                Vai para o próximo slide (ou avança o versículo)
              </td>
            </tr>
            <tr>
              <td><kbd>Home</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                Vai para o primeiro slide
              </td>
            </tr>
            <tr>
              <td><kbd>End</kbd></td>
              <td style="color: var(--sidebar-text-secondary);">
                Vai para o último slide
              </td>
            </tr>
            <tr>
              <td>
                <kbd>CTRL</kbd> + <kbd>P</kbd> / <kbd>Espaço</kbd>
              </td>
              <td style="color: var(--sidebar-text-secondary);">
                Pausa a música, ou continua, caso já esteja pausada
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualShortcuts",
});
</script>
