<template>
  <v-slide-y-reverse-transition>
    <div v-if="module?.show" class="module-full-page dashboard-home d-flex flex-column">
      <div class="search-header pb-0 flex-shrink-0" style="padding-top: 24px; padding-left: 24px; padding-right: 24px; display: flex; align-items: center;">
        <MenuToggleButton style="margin-right: 16px;" @toggle-sidebar="toggleSidebar" />
        <div class="d-flex align-center mr-auto">
          <div class="module-icon-box d-flex align-center justify-center mr-4">
            <v-icon :icon="module.icon" size="24" />
          </div>
          <h2 class="section-title mb-0" style="color: var(--sidebar-text); font-size: 24px; font-weight: 600;">
            {{ t('title') }}
          </h2>
        </div>
      </div>

      <div class="content-main">
        <div class="text-container">
          <div class="text-toolbar">
            <div class="toolbar-group">
              <v-btn icon="mdi-format-bold" size="x-small" variant="text" @click="exec('bold')" />
              <v-btn icon="mdi-format-italic" size="x-small" variant="text" @click="exec('italic')" />
              <v-btn icon="mdi-format-underline" size="x-small" variant="text" @click="exec('underline')" />
              <v-btn icon="mdi-format-strikethrough" size="x-small" variant="text" @click="exec('strikeThrough')" />
            </div>
            <div class="toolbar-group">
              <v-btn icon="mdi-format-align-left" size="x-small" variant="text" @click="exec('justifyLeft')" />
              <v-btn icon="mdi-format-align-center" size="x-small" variant="text" @click="exec('justifyCenter')" />
              <v-btn icon="mdi-format-align-right" size="x-small" variant="text" @click="exec('justifyRight')" />
            </div>
            <div class="toolbar-group">
              <input type="color" style="width: 28px; height: 28px; border: none; cursor: pointer; background: transparent;" title="Cor do texto" @input="exec('foreColor', $event.target.value)">
              <input type="color" style="width: 28px; height: 28px; border: none; cursor: pointer; background: transparent;" title="Cor de fundo" @input="exec('hiliteColor', $event.target.value)">
            </div>
            <div class="toolbar-group">
              <select v-model="fontSize" style="height: 28px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--sidebar-text); padding: 0 4px; font-size: 12px;" @change="exec('fontSize', fontSize)">
                <option value="">T</option>
                <option v-for="n in 7" :key="n" :value="n">T{{ n }}</option>
              </select>
            </div>
            <div class="toolbar-group">
              <v-btn icon="mdi-undo" size="x-small" variant="text" @click="exec('undo')" />
              <v-btn icon="mdi-redo" size="x-small" variant="text" @click="exec('redo')" />
              <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="clearText" />
            </div>
            <v-spacer />
            <div class="toolbar-group">
              <v-btn icon="mdi-content-save" size="x-small" variant="text" @click="saveDraft" />
            </div>
          </div>

          <div class="text-editor-area">
            <div
              ref="editor"
              class="text-editor"
              contenteditable="true"
              data-placeholder="Digite o texto para projeção..."
              @input="onInput"
            />
          </div>

          <div class="text-projection-actions">
            <span class="text-caption" style="color: var(--sidebar-text-secondary);">
              {{ t('projection_ready') }}
            </span>
            <LScreenBtn module="text" />
          </div>
        </div>
      </div>
    </div>
  </v-slide-y-reverse-transition>
</template>

<script>
import manifest from "../manifest.json";
import MenuToggleButton from "@/components/MenuToggleButton.vue";
import LScreenBtn from "@/components/buttons/Screen.vue";

export default {
  name: manifest.id,
  components: { MenuToggleButton, LScreenBtn },
  data() {
    return {
      manifest,
      fontSize: "",
    };
  },
  computed: {
    module_id() { return manifest.id; },
    module() { return this.$modules.get(this.module_id); },
  },
  watch: {
    "module.show": {
      handler(val) {
        if (val) this.loadDraft();
      },
      immediate: true,
    },
  },
  methods: {
    t(text) {
      return this.$t("modules." + this.module_id + "." + text);
    },
    toggleSidebar() {
      const mainEl = document.querySelector(".main-container");
      if (mainEl) mainEl.dispatchEvent(new CustomEvent("toggle-sidebar"));
    },
    exec(command, value) {
      document.execCommand(command, false, value || null);
      this.$refs.editor.focus();
      this.onInput();
    },
    onInput() {
      if (!this.$refs.editor) return;
      var html = this.$refs.editor.innerHTML;
      this.$appdata.set("modules." + this.module_id + ".projection", { html: html });
    },
    clearText() {
      if (!confirm(this.t("clear_confirm"))) return;
      this.$refs.editor.innerHTML = "";
      this.onInput();
    },
    saveDraft() {
      if (!this.$refs.editor) return;
      var html = this.$refs.editor.innerHTML;
      this.$userdata.set("modules." + this.module_id + ".draft", html);
    },
    loadDraft() {
      var draft = this.$userdata.get("modules." + this.module_id + ".draft");
      if (draft && this.$refs.editor) {
        this.$refs.editor.innerHTML = draft;
        this.onInput();
      } else if (this.$refs.editor) {
        this.$refs.editor.innerHTML = "";
        this.onInput();
      }
    },
  },
  mounted() {
    this.loadDraft();
  },
};
</script>

<style lang="scss">
@use "@/assets/styles/pages/text.scss";
</style>
