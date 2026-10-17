<template>
  <div class="support-container h-100 d-flex flex-column pb-4">
    <v-card
      class="settings-card rounded-xl flex-grow-1 overflow-hidden d-flex flex-column"
      flat
      style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color);"
    >
      <!-- Top Header Area -->
      <div class="support-header d-flex align-center py-4 px-6 flex-shrink-0">
        <v-btn
          icon
          size="small"
          variant="text"
          class="modal-nav-icon-btn mr-3"
          @click="$emit('back')"
        >
          <v-icon size="20">
            mdi-arrow-left
          </v-icon>
        </v-btn>
        <div class="header-icon-box mr-3">
          <v-icon
            color="#009fe3"
            icon="mdi-chat-question-outline"
            size="22"
          />
        </div>
        <div>
          <h2 class="modal-title font-weight-bold">
            {{ $t('modules.help.support.title') }}
          </h2>
          <p class="modal-subtitle mb-0">
            {{ $t('modules.help.support.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Scrollable Form Area -->
      <div class="support-scroll-area pa-6 flex-grow-1 overflow-y-auto">
        <div class="mx-auto" style="max-width: 680px;">
          <!-- Pre-modeled Form Card -->
          <v-card
            class="support-form-card pa-6 pa-sm-8 mb-6"
            flat
          >
            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
              <v-row dense>
                <!-- Nome -->
                <v-col cols="12" sm="6">
                  <label class="form-label mb-1.5 d-block">
                    {{ $t('modules.help.support.name') }}
                  </label>
                  <v-text-field
                    v-model="form.name"
                    :placeholder="$t('modules.help.support.name_placeholder')"
                    prepend-inner-icon="mdi-account-outline"
                    variant="solo"
                    flat
                    density="comfortable"
                    rounded="lg"
                    color="primary"
                    :rules="[rules.required]"
                    class="standard-text-input mb-2"
                  />
                </v-col>

                <!-- E-mail -->
                <v-col cols="12" sm="6">
                  <label class="form-label mb-1.5 d-block">
                    {{ $t('modules.help.support.email') }}
                  </label>
                  <v-text-field
                    v-model="form.email"
                    :placeholder="$t('modules.help.support.email_placeholder')"
                    prepend-inner-icon="mdi-email-outline"
                    variant="solo"
                    flat
                    density="comfortable"
                    rounded="lg"
                    color="primary"
                    :rules="[rules.required, rules.email]"
                    class="standard-text-input mb-2"
                  />
                </v-col>

                <!-- Categoria -->
                <v-col cols="12">
                  <label class="form-label mb-1.5 d-block">
                    {{ $t('modules.help.support.category') }}
                  </label>
                  <v-select
                    v-model="form.category"
                    :items="categories"
                    item-title="label"
                    item-value="value"
                    variant="solo"
                    flat
                    color="primary"
                    density="comfortable"
                    rounded="lg"
                    :rules="[rules.required]"
                    class="standard-text-input mb-2"
                    :menu-props="{ contentClass: 'support-category-menu', transition: 'fade-transition', offset: 4 }"
                  >
                    <template #selection="{ item }">
                      <div class="d-flex align-center">
                        <v-icon
                          v-if="item.raw.icon"
                          :icon="item.raw.icon"
                          size="18"
                          class="mr-2 text-primary"
                        />
                        <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
                      </div>
                    </template>
                    <template #item="{ item, props }">
                      <v-list-item
                        v-bind="props"
                        :title="undefined"
                        class="mx-1 rounded-lg mb-1"
                        color="primary"
                        style="min-height: 38px;"
                      >
                        <template v-if="item.raw.icon" #prepend>
                          <v-icon
                            :icon="item.raw.icon"
                            size="18"
                            class="mr-2.5"
                            :color="item.value === form.category ? 'primary' : 'inherit'"
                            style="opacity: 0.85;"
                          />
                        </template>
                        <template #title>
                          <span
                            class="text-body-2 font-weight-medium"
                            :class="item.value === form.category ? 'text-primary' : ''"
                          >
                            {{ item.title }}
                          </span>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <!-- Assunto -->
                <v-col cols="12">
                  <label class="form-label mb-1.5 d-block">
                    {{ $t('modules.help.support.subject') }}
                  </label>
                  <v-text-field
                    v-model="form.subject"
                    :placeholder="$t('modules.help.support.subject_placeholder')"
                    prepend-inner-icon="mdi-format-title"
                    variant="solo"
                    flat
                    density="comfortable"
                    rounded="lg"
                    color="primary"
                    :rules="[rules.required]"
                    class="standard-text-input mb-2"
                  />
                </v-col>

                <!-- Mensagem -->
                <v-col cols="12">
                  <label class="form-label mb-1.5 d-block">
                    {{ $t('modules.help.support.message') }}
                  </label>
                  <v-textarea
                    v-model="form.message"
                    :placeholder="$t('modules.help.support.message_placeholder')"
                    prepend-inner-icon="mdi-message-text-outline"
                    variant="solo"
                    flat
                    density="comfortable"
                    rounded="lg"
                    color="primary"
                    rows="4"
                    auto-grow
                    counter="1000"
                    :rules="[rules.required, rules.minLength]"
                    class="standard-text-input mb-2"
                  />
                </v-col>

                <!-- Checkbox Diagnóstico do Sistema -->
                <v-col cols="12" class="pt-2">
                  <v-checkbox
                    v-model="form.includeDiagnostics"
                    color="primary"
                    density="compact"
                    hide-details
                    class="support-checkbox"
                  >
                    <template #label>
                      <span class="text-body-2 font-weight-medium" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.support.include_diagnostics') }}
                      </span>
                    </template>
                  </v-checkbox>
                  <p class="text-caption ml-8 mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.4;">
                    {{ $t('modules.help.support.include_diagnostics_hint') }}
                  </p>

                  <!-- Preview dos dados de diagnóstico quando ativado -->
                  <v-expand-transition>
                    <div v-if="form.includeDiagnostics" class="ml-8 mb-4">
                      <div class="diagnostics-preview-box pa-3 rounded-lg text-caption font-mono">
                        <div class="d-flex align-center font-weight-bold mb-2 text-primary" style="font-size: 0.8rem;">
                          <v-icon size="16" class="mr-1.5">
                            mdi-information-outline
                          </v-icon>
                          {{ $t('modules.help.support.diagnostics_preview') }}
                        </div>
                        <div class="d-flex flex-wrap" style="gap: 8px;">
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            class="font-weight-medium"
                          >
                            Versão: {{ appVersion }}
                          </v-chip>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            class="font-weight-medium"
                          >
                            SO: {{ diagnosticInfo.platform }}
                          </v-chip>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            class="font-weight-medium"
                          >
                            Resolução: {{ diagnosticInfo.screenResolution }}
                          </v-chip>
                          <v-chip
                            v-if="diagnosticInfo.dbVersion"
                            size="small"
                            variant="tonal"
                            color="primary"
                            class="font-weight-medium"
                          >
                            Banco: v{{ diagnosticInfo.dbVersion }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-col>

                <!-- Botão de Enviar -->
                <v-col cols="12" class="d-flex justify-end pt-2">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    height="44"
                    rounded="lg"
                    class="text-none font-weight-bold px-8"
                    :loading="isSubmitting"
                    prepend-icon="mdi-send"
                  >
                    {{ $t('modules.help.support.send_btn') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </div>
      </div>
    </v-card>

    <!-- Dialog de Feedback / Confirmação -->
    <v-dialog v-model="showSuccessDialog" max-width="440">
      <v-card class="support-success-card pa-6 text-center">
        <div class="d-flex justify-center mb-4">
          <div class="success-icon-box">
            <v-icon size="40" color="primary">
              mdi-check-circle-outline
            </v-icon>
          </div>
        </div>
        <h3 class="modal-title font-weight-bold mb-2" style="font-size: 1.25rem;">
          {{ $t('modules.help.support.success_title') }}
        </h3>
        <p class="modal-subtitle mb-6" style="font-size: 0.875rem; line-height: 1.5;">
          {{ $t('modules.help.support.notice_desc') }}
        </p>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          height="42"
          block
          class="text-none font-weight-bold"
          @click="showSuccessDialog = false"
        >
          OK
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Telemetry, { CLOUD_ENDPOINT, CLOUD_TOKEN, APP_SIGNATURE } from "@/helpers/services/Telemetry";
import $snackbar from "@/helpers/ui/Snackbar";

export default defineComponent({
  name: "HelpSupport",
  props: {
    appVersion: {
      type: String,
      required: true,
    },
  },
  emits: ["back"],
  setup(props) {
    const { t } = useI18n();
    const formRef = ref<any>(null);
    const isFormValid = ref(false);
    const isSubmitting = ref(false);
    const showSuccessDialog = ref(false);

    const form = reactive({
      name: "",
      email: "",
      category: "doubt",
      subject: "",
      message: "",
      includeDiagnostics: true,
    });

    const diagnosticInfo = reactive({
      platform: "Desktop",
      isElectron: false,
      screenResolution: "1920x1080",
      dbVersion: null as number | string | null,
    });

    const categories = computed(() => [
      { value: "doubt", label: t("modules.help.support.categories.doubt"), icon: "mdi-help-circle-outline" },
      { value: "suggestion", label: t("modules.help.support.categories.suggestion"), icon: "mdi-lightbulb-outline" },
      { value: "bug", label: t("modules.help.support.categories.bug"), icon: "mdi-bug-outline" },
      { value: "other", label: t("modules.help.support.categories.other"), icon: "mdi-message-text-outline" },
    ]);

    const rules = {
      required: (v: string) => !!v || t("modules.help.support.validation.required"),
      email: (v: string) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(v) || t("modules.help.support.validation.email_invalid");
      },
      minLength: (v: string) => (v && v.trim().length >= 10) || t("modules.help.support.validation.message_min"),
    };

    onMounted(async () => {
      // Coleta diagnósticos do ambiente de forma segura
      const isElectron = Boolean(window.electronAPI?.isElectron);
      const isMac = Boolean(window.electronAPI?.isMac);
      const isWindows = Boolean(window.electronAPI?.isWindows);

      diagnosticInfo.isElectron = isElectron;
      diagnosticInfo.platform = isMac ? "macOS" : isWindows ? "Windows" : (navigator.platform || "Desktop");
      diagnosticInfo.screenResolution = `${window.screen?.width || 0}x${window.screen?.height || 0}`;

      if (window.electronAPI?.getDatabaseVersion) {
        try {
          const dbVer = await window.electronAPI.getDatabaseVersion();
          diagnosticInfo.dbVersion = dbVer || null;
        } catch {
          // ignore
        }
      }
    });

    const handleSubmit = async () => {
      if (!formRef.value) return;
      const { valid } = await formRef.value.validate();
      if (!valid) return;

      isSubmitting.value = true;

      // Monta o payload estruturado pronto para envio aos serviços em nuvem
      const payload = {
        installation_id: Telemetry.getInstallationId(),
        name: form.name.trim(),
        email: form.email.trim(),
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
        app_version: props.appVersion,
        platform: diagnosticInfo.platform,
        diagnostics: form.includeDiagnostics
          ? {
            appVersion: props.appVersion,
            platform: diagnosticInfo.platform,
            isElectron: diagnosticInfo.isElectron,
            screenResolution: diagnosticInfo.screenResolution,
            databaseVersion: diagnosticInfo.dbVersion,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }
          : {},
      };

      try {
        const response = await fetch(`${CLOUD_ENDPOINT}/rest/v1/support_tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: CLOUD_TOKEN,
            Authorization: `Bearer ${CLOUD_TOKEN}`,
            Prefer: "return=minimal",
            "x-app-signature": APP_SIGNATURE,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorMsg = await response.text();
          throw new Error(`Falha no envio (${response.status}): ${errorMsg}`);
        }

        showSuccessDialog.value = true;

        // Limpa o formulário após a confirmação
        form.name = "";
        form.email = "";
        form.subject = "";
        form.message = "";
        form.category = "doubt";
        formRef.value.resetValidation();
      } catch (err) {
        console.error("Erro ao enviar chamado de suporte:", err);
        $snackbar.show({
          text: t("modules.help.support.send_error"),
          color: "error",
          timeout: 5000,
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      formRef,
      form,
      isFormValid,
      isSubmitting,
      showSuccessDialog,
      categories,
      rules,
      diagnosticInfo,
      handleSubmit,
    };
  },
});
</script>

<!-- Unscoped menu styles for dropdown menu teleported to overlay -->
<style lang="scss">
.support-category-menu {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12)) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  padding: 4px !important;

  .v-list {
    background: transparent !important;
    padding: 0 !important;
    max-height: 220px !important;
    overflow-y: auto !important;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--accent-blue, #009FE3);
      border-radius: 4px;
      transition: background 0.2s ease;
    }
    &::-webkit-scrollbar-thumb:hover,
    &::-webkit-scrollbar-thumb:active {
      background: var(--accent-yellow, #FFC107);
    }
  }

  .v-list-item {
    border-radius: 8px !important;
    min-height: 38px !important;
    padding: 6px 12px !important;
    margin: 2px 0 !important;
    font-size: 0.88rem !important;
    color: var(--sidebar-text-secondary, #94a3b8) !important;
    transition: all 0.15s ease !important;

    &:hover {
      background: rgba(var(--v-theme-on-surface), 0.08) !important;
      color: var(--sidebar-text, #ffffff) !important;
    }

    &--active {
      background: rgba(0, 159, 227, 0.15) !important;
      color: rgb(var(--v-theme-primary)) !important;
      font-weight: 600 !important;
    }
  }
}

:root[data-theme="light"] .support-category-menu,
.v-theme--light .support-category-menu {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15) !important;

  .v-list-item {
    color: #475569 !important;

    &:hover {
      background: #f1f5f9 !important;
      color: #0f172a !important;
    }

    &--active {
      background: rgba(0, 159, 227, 0.12) !important;
      color: #0284c7 !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.support-container {
  width: 100%;
}

.support-header {
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.modal-nav-icon-btn {
  color: var(--sidebar-text-secondary, #94a3b8) !important;
  border-radius: 10px !important;
  width: 36px !important;
  height: 36px !important;
  transition: all 0.2s ease !important;

  &:hover {
    color: var(--sidebar-text, #ffffff) !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(0, 159, 227, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  color: var(--sidebar-text, #ffffff);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 0;
  letter-spacing: -0.01em;
}

.modal-subtitle {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.825rem;
  line-height: 1.3;
}

.support-scroll-area {
  scrollbar-width: thin;
  scrollbar-color: var(--accent-blue, #009FE3) transparent;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--accent-blue, #009FE3);
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover,
    &:active {
      background: var(--accent-yellow, #FFC107);
    }
  }
}

.support-form-card {
  background: var(--ds-surface, rgba(255, 255, 255, 0.03)) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12) !important;
  overflow: hidden;
}

.form-label {
  color: var(--sidebar-text-secondary, #94a3b8);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

:deep(.standard-text-input) {
  .v-field {
    background: var(--card-bg, #30364a) !important;
    border: 1px solid rgba(128, 128, 128, 0.18) !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
    border-radius: 10px !important;
    transition: all 0.2s ease !important;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.4) !important;
    }

    &--focused,
    &.v-field--focused {
      border-color: var(--accent-blue, rgb(var(--v-theme-primary))) !important;
      box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2) !important;
    }

    .v-field__outline {
      display: none !important;
    }

    .v-field__overlay {
      display: none !important;
    }
  }

  .v-field__input,
  input,
  textarea {
    color: var(--sidebar-text, #ffffff) !important;
    font-size: 0.9rem !important;
  }

  .v-field__prepend-inner {
    align-items: center !important;
    align-self: center !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;

    .v-icon {
      color: var(--sidebar-text-secondary, #94a3b8) !important;
      opacity: 0.8 !important;
      transition: color 0.2s ease, opacity 0.2s ease;
    }
  }

  .v-field--focused .v-field__prepend-inner .v-icon {
    color: var(--accent-blue, rgb(var(--v-theme-primary))) !important;
    opacity: 1 !important;
  }

  .v-counter {
    color: var(--sidebar-text-secondary, #94a3b8) !important;
    font-size: 0.75rem !important;
  }
}

:deep(.v-textarea.standard-text-input) {
  .v-field__prepend-inner {
    align-self: flex-start !important;
    padding-top: 10px !important;
  }
}

.diagnostics-preview-box {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px dashed var(--border-color, rgba(255, 255, 255, 0.12));
  color: var(--sidebar-text-secondary, #94a3b8);
}

.support-success-card {
  background: var(--card-bg, #202431) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08)) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45) !important;
  border-radius: 16px !important;
}

.success-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0, 159, 227, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

// Light theme support
:root[data-theme="light"],
.v-theme--light {
  .support-header {
    background: #fafafa;
    border-color: rgba(0, 0, 0, 0.06);
  }

  .modal-nav-icon-btn {
    color: #64748b !important;

    &:hover {
      color: #1e293b !important;
      background: rgba(0, 0, 0, 0.05) !important;
    }
  }

  .modal-title {
    color: #1e293b;
  }

  .modal-subtitle {
    color: #64748b;
  }

  .form-label {
    color: #64748b;
  }

  .support-form-card {
    background: #f8fafc !important;
    border-color: rgba(0, 0, 0, 0.06) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  }

  .standard-text-input {
    :deep(.v-field:not(.v-field--focused)) {
      background: #ffffff !important;
      border-color: rgba(0, 0, 0, 0.12) !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) !important;
    }

    :deep(input),
    :deep(textarea) {
      color: #1e293b !important;
    }
  }

  .diagnostics-preview-box {
    background: #f8fafc;
    border-color: rgba(0, 0, 0, 0.12);
    color: #64748b;
  }

  .support-success-card {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12) !important;
  }
}
</style>

