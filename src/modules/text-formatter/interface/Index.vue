<template>
  <ModuleContainer ref="moduleContainer" :manifest="manifest">
    <template #header>
      <v-toolbar density="compact">
        <v-spacer />
        <v-btn icon="mdi-content-copy" variant="text" @click="copyOutput()" />
        <v-btn icon="mdi-close-circle" variant="text" color="error" @click="clearAll()" />
      </v-toolbar>
    </template>

    <div class="text-formatter-container pa-4">
      <v-row dense>
        <!-- Input -->
        <v-col cols="12" md="6">
          <v-textarea
            v-model="inputText"
            :label="t('input_label')"
            :placeholder="t('input_placeholder')"
            variant="outlined"
            rows="10"
            auto-grow
            hide-details
          />

          <!-- Stats -->
          <div class="d-flex gap-3 mt-2">
            <v-chip size="small" variant="text">
              {{ t('char_count', { count: charCount }) }}
            </v-chip>
            <v-chip size="small" variant="text">
              {{ t('word_count', { count: wordCount }) }}
            </v-chip>
            <v-chip size="small" variant="text">
              {{ t('line_count', { count: lineCount }) }}
            </v-chip>
          </div>
        </v-col>

        <!-- Output -->
        <v-col cols="12" md="6">
          <div class="output-area" :class="{ 'text-center': centerAlign }">
            <div class="output-label text-caption text-medium-emphasis mb-1">
              {{ t('output_label') }}
            </div>
            <div class="output-content">
              {{ formattedText }}
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Options -->
      <div class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">
          {{ t('options_label') }}
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            :variant="activeFormat === 'uppercase' ? 'flat' : 'outlined'"
            size="small"
            @click="toggleFormat('uppercase')"
          >
            {{ t('uppercase') }}
          </v-btn>
          <v-btn
            :variant="activeFormat === 'lowercase' ? 'flat' : 'outlined'"
            size="small"
            @click="toggleFormat('lowercase')"
          >
            {{ t('lowercase') }}
          </v-btn>
          <v-btn
            :variant="activeFormat === 'capitalize' ? 'flat' : 'outlined'"
            size="small"
            @click="toggleFormat('capitalize')"
          >
            {{ t('capitalize') }}
          </v-btn>
          <v-btn
            :variant="activeFormat === 'sentence' ? 'flat' : 'outlined'"
            size="small"
            @click="toggleFormat('sentence')"
          >
            {{ t('sentence_case') }}
          </v-btn>
          <v-btn
            :variant="activeFormat === 'title' ? 'flat' : 'outlined'"
            size="small"
            @click="toggleFormat('title')"
          >
            {{ t('title_case') }}
          </v-btn>
          <v-btn
            :variant="removeAccents ? 'flat' : 'outlined'"
            size="small"
            color="warning"
            @click="removeAccents = !removeAccents"
          >
            {{ t('remove_accents') }}
          </v-btn>
          <v-btn
            :variant="removeSpaces ? 'flat' : 'outlined'"
            size="small"
            color="warning"
            @click="removeSpaces = !removeSpaces"
          >
            {{ t('remove_extra_spaces') }}
          </v-btn>
          <v-btn
            :variant="reverseText ? 'flat' : 'outlined'"
            size="small"
            color="warning"
            @click="reverseText = !reverseText"
          >
            {{ t('reverse_text') }}
          </v-btn>
          <v-btn
            :variant="centerAlign ? 'flat' : 'outlined'"
            size="small"
            icon="mdi-format-align-center"
            @click="centerAlign = !centerAlign"
          />
        </div>
      </div>
    </div>
  </ModuleContainer>
</template>

<script>
export default {
  name: "TextFormatterModule",
};
</script>

<script setup>
import { ref, computed } from "vue";
import ModuleContainer from "@/layout/ModuleContainer.vue";
import manifest from "../manifest.json";

const moduleContainer = ref(null);
const t = (key, params) => {
  let text = moduleContainer.value?.t(key) || key;
  if (params) {
    Object.keys(params).forEach((k) => {
      text = text.replace(`{${k}}`, params[k]);
    });
  }
  return text;
};

const inputText = ref("");
const activeFormat = ref("uppercase");
const removeAccents = ref(false);
const removeSpaces = ref(false);
const reverseText = ref(false);
const centerAlign = ref(false);

const charCount = computed(() => inputText.value.length);
const wordCount = computed(() => inputText.value.trim().split(/\s+/).filter(Boolean).length);
const lineCount = computed(() => inputText.value.split("\n").length);

function toggleFormat(format) {
  activeFormat.value = activeFormat.value === format ? "" : format;
}

function removeAccentsFn(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

const formattedText = computed(() => {
  let text = inputText.value;
  if (!text) return "";

  if (removeSpaces.value) {
    text = text.replace(/\s+/g, " ").trim();
  }

  if (removeAccents.value) {
    text = removeAccentsFn(text);
  }

  switch (activeFormat.value) {
    case "uppercase":
      text = text.toUpperCase();
      break;
    case "lowercase":
      text = text.toLowerCase();
      break;
    case "capitalize":
      text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      break;
    case "sentence":
      text = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
      break;
    case "title":
      text = capitalizeWords(text.toLowerCase());
      break;
  }

  if (reverseText.value) {
    text = text.split("").reverse().join("");
  }

  return text;
});

function copyOutput() {
  navigator.clipboard.writeText(formattedText.value).catch(() => {
    // Fallback for Electron
    const ta = document.createElement("textarea");
    ta.value = formattedText.value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  });
}

function clearAll() {
  inputText.value = "";
  activeFormat.value = "uppercase";
  removeAccents.value = false;
  removeSpaces.value = false;
  reverseText.value = false;
  centerAlign.value = false;
}
</script>

<style scoped>
.text-formatter-container {
  max-height: 100%;
  overflow-y: auto;
}

.output-area {
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  padding: 16px;
  min-height: 250px;
  background: var(--card-bg, #fff);
}

.output-label {
  color: var(--accent-blue, #0097d7);
}

.output-content {
  font-size: 1.25rem;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>