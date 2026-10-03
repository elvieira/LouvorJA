<template>
  <div class="support-container h-100 d-flex flex-column pb-4">
    <v-card
      class="settings-card rounded-xl flex-grow-1 overflow-hidden d-flex flex-column"
      flat
      style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color);"
    >
      <!-- Top Header Area -->
      <div
        class="d-flex align-center py-6 px-6 flex-shrink-0"
        style="border-bottom: 1px solid var(--border-color); background: rgba(0, 0, 0, 0.01);"
      >
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
            icon="mdi-chat-question"
            size="22"
          />
        </div>
        <div>
          <h3
            class="font-weight-bold mb-0"
            style="color: var(--sidebar-text); font-size: 1.25rem; letter-spacing: -0.01em; line-height: 1.2;"
          >
            {{ $t('modules.help.support.title') }}
          </h3>
          <span
            class="text-caption"
            style="color: var(--sidebar-text-secondary);"
          >
            {{ $t('modules.help.support.subtitle') }}
          </span>
        </div>
      </div>

      <!-- Scrollable Form Area -->
      <div class="overflow-y-auto pa-6 flex-grow-1">
        <div class="mx-auto" style="max-width: 680px;">
          <!-- Pre-modeled Form Card -->
          <v-card
            class="rounded-xl pa-6 pa-sm-8 mb-6"
            flat
            style="background: var(--card-bg); border: 1px solid var(--border-color); position: relative; overflow: hidden;"
          >
            <!-- Subtle decorative gradient header -->
            <div
              style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0097d7, #00c6ff);"
            />

            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
              <v-row dense>
                <!-- Nome -->
                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold mb-1" style="color: var(--sidebar-text);">
                    {{ $t('modules.help.support.name') }}
                  </div>
                  <v-text-field
                    v-model="form.name"
                    :placeholder="$t('modules.help.support.name_placeholder')"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :rules="[rules.required]"
                    class="mb-2"
                  />
                </v-col>

                <!-- E-mail -->
                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold mb-1" style="color: var(--sidebar-text);">
                    {{ $t('modules.help.support.email') }}
                  </div>
                  <v-text-field
                    v-model="form.email"
                    :placeholder="$t('modules.help.support.email_placeholder')"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :rules="[rules.required, rules.email]"
                    class="mb-2"
                  />
                </v-col>

                <!-- Categoria -->
                <v-col cols="12">
                  <div class="text-caption font-weight-bold mb-1" style="color: var(--sidebar-text);">
                    {{ $t('modules.help.support.category') }}
                  </div>
                  <v-select
                    v-model="form.category"
                    :items="categories"
                    item-title="label"
                    item-value="value"
                    prepend-inner-icon="mdi-shape-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :rules="[rules.required]"
                    class="mb-2"
                  />
                </v-col>

                <!-- Assunto -->
                <v-col cols="12">
                  <div class="text-caption font-weight-bold mb-1" style="color: var(--sidebar-text);">
                    {{ $t('modules.help.support.subject') }}
                  </div>
                  <v-text-field
                    v-model="form.subject"
                    :placeholder="$t('modules.help.support.subject_placeholder')"
                    prepend-inner-icon="mdi-format-title"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :rules="[rules.required]"
                    class="mb-2"
                  />
                </v-col>

                <!-- Mensagem -->
                <v-col cols="12">
                  <div class="text-caption font-weight-bold mb-1" style="color: var(--sidebar-text);">
                    {{ $t('modules.help.support.message') }}
                  </div>
                  <v-textarea
                    v-model="form.message"
                    :placeholder="$t('modules.help.support.message_placeholder')"
                    prepend-inner-icon="mdi-message-text-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    rows="4"
                    auto-grow
                    counter="1000"
                    :rules="[rules.required, rules.minLength]"
                    class="mb-2"
                  />
                </v-col>

                <!-- Checkbox Diagnóstico do Sistema -->
                <v-col cols="12" class="pt-2">
                  <v-checkbox
                    v-model="form.includeDiagnostics"
                    color="primary"
                    density="compact"
                    hide-details
                  >
                    <template #label>
                      <span class="text-body-2 font-weight-medium" style="color: var(--sidebar-text);">
                        {{ $t('modules.help.support.include_diagnostics') }}
                      </span>
                    </template>
                  </v-checkbox>
                  <p class="text-caption ml-8 mb-3" style="color: var(--sidebar-text-secondary); line-height: 1.3;">
                    {{ $t('modules.help.support.include_diagnostics_hint') }}
                  </p>

                  <!-- Preview dos dados de diagnóstico quando ativado -->
                  <v-expand-transition>
                    <div v-if="form.includeDiagnostics" class="ml-8 mb-4">
                      <div
                        class="pa-3 rounded-lg text-caption font-mono"
                        style="background: rgba(128, 128, 128, 0.08); border: 1px dashed var(--border-color); color: var(--sidebar-text-secondary);"
                      >
                        <div class="font-weight-bold mb-1 text-primary">
                          <v-icon size="14" class="mr-1">
                            mdi-information-outline
                          </v-icon>
                          {{ $t('modules.help.support.diagnostics_preview') }}
                        </div>
                        <div class="d-flex flex-wrap gap-2" style="gap: 8px;">
                          <v-chip size="x-small" variant="tonal" color="primary">
                            Versão: {{ appVersion }}
                          </v-chip>
                          <v-chip size="x-small" variant="tonal" color="primary">
                            SO: {{ diagnosticInfo.platform }}
                          </v-chip>
                          <v-chip size="x-small" variant="tonal" color="primary">
                            Resolução: {{ diagnosticInfo.screenResolution }}
                          </v-chip>
                          <v-chip
                            v-if="diagnosticInfo.dbVersion"
                            size="x-small"
                            variant="tonal"
                            color="primary"
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
                    size="large"
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
    <v-dialog v-model="showSuccessDialog" max-width="480">
      <v-card class="rounded-xl pa-6 text-center" style="background: var(--card-bg); border: 1px solid var(--border-color);">
        <div class="d-flex justify-center mb-4">
          <div class="rounded-circle d-flex align-center justify-center pa-3" style="background: rgba(0, 151, 215, 0.1);">
            <v-icon size="48" color="primary">
              mdi-check-circle-outline
            </v-icon>
          </div>
        </div>
        <h4 class="text-h6 font-weight-bold mb-2" style="color: var(--sidebar-text);">
          {{ $t('modules.help.support.success_title') }}
        </h4>
        <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary); line-height: 1.5;">
          {{ $t('modules.help.support.notice_desc') }}
        </p>
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
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
      { value: "doubt", label: t("modules.help.support.categories.doubt") },
      { value: "suggestion", label: t("modules.help.support.categories.suggestion") },
      { value: "bug", label: t("modules.help.support.categories.bug") },
      { value: "other", label: t("modules.help.support.categories.other") },
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

      // Monta o payload estruturado pronto para envio
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
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
          : null,
      };

      try {
        /*
         * =========================================================================
         * ESTRUTURA PRE-MODELADA PARA O ENVIO
         * =========================================================================
         * Quando a rota/método de recebimento for definida pela equipe, basta
         * descomentar e configurar o bloco abaixo:
         *
         * Exemplo com API do Louvor JA:
         * const res = await fetch("https://api.louvorja.com.br/support", {
         *   method: "POST",
         *   headers: { "Content-Type": "application/json" },
         *   body: JSON.stringify(payload),
         * });
         * if (!res.ok) throw new Error("Erro na comunicação com o servidor");
         * =========================================================================
         */
        console.log("[LouvorJA Support] Mensagem estruturada:", payload);

        // Simulação com pequeno delay para feedback visual
        await new Promise((resolve) => setTimeout(resolve, 600));

        showSuccessDialog.value = true;

        // Limpa o formulário após a confirmação
        form.name = "";
        form.email = "";
        form.subject = "";
        form.message = "";
        form.category = "doubt";
        formRef.value.resetValidation();
      } catch (err) {
        console.error("Erro ao processar envio do suporte:", err);
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

<style scoped>
.support-container {
  width: 100%;
}
</style>
