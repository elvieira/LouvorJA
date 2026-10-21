<template>
  <v-dialog
    v-model="isOpen"
    max-width="760"
    :theme="isDark ? 'dark' : 'light'"
    content-class="legal-modal-dialog-wrapper"
    transition="fade-transition"
    :z-index="100005"
    @keydown.esc="isOpen = false"
  >
    <v-card class="legal-modal-card overflow-hidden" width="100%">
      <v-card-text class="pa-0 d-flex flex-column legal-card-container">
        <!-- Header -->
        <div class="legal-modal-header">
          <div class="d-flex align-center header-left-wrap">
            <div class="legal-header-icon-wrap mr-3">
              <v-icon size="26" class="legal-header-icon">
                mdi-scale-balance
              </v-icon>
            </div>
            <div>
              <h2 class="legal-modal-title">
                {{ doc.modalTitle }}
              </h2>
              <p class="legal-modal-subtitle mb-0">
                {{ doc.modalSubtitle }}
              </p>
            </div>
          </div>

          <div class="header-actions d-flex align-center">
            <!-- Language Switcher -->
            <div class="lang-toggle-pill d-flex align-center mr-2">
              <button
                type="button"
                class="lang-pill-btn"
                :class="{ active: currentLang === 'pt' }"
                @click="currentLang = 'pt'"
              >
                PT
              </button>
              <button
                type="button"
                class="lang-pill-btn"
                :class="{ active: currentLang === 'es' }"
                @click="currentLang = 'es'"
              >
                ES
              </button>
            </div>

            <v-btn
              variant="text"
              size="small"
              icon
              class="header-close-btn"
              @click="isOpen = false"
            >
              <v-icon size="20">
                mdi-close
              </v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="legal-tabs-wrapper px-6 pt-1">
          <div class="legal-tabs-track d-flex align-center">
            <button
              v-for="tab in doc.tabs"
              :key="tab.id"
              type="button"
              class="legal-tab-item"
              :class="{ 'is-active': activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <v-icon size="18" class="mr-2">
                {{ tab.icon }}
              </v-icon>
              <span>{{ tab.title }}</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="legal-scroll-area flex-grow-1">
          <transition name="fade-fast" mode="out-in">
            <div :key="activeTab + '_' + currentLang" class="legal-tab-content">
              <!-- Summary Callout -->
              <div v-if="currentTabObj" class="legal-summary-callout mb-4 d-flex align-start">
                <v-icon size="20" class="mr-3 summary-icon">
                  mdi-information-outline
                </v-icon>
                <div class="summary-text">
                  {{ currentTabObj.summary }}
                </div>
              </div>

              <!-- Sections List -->
              <div
                v-for="section in currentTabObj?.sections || []"
                :key="section.id"
                class="legal-section-block mb-4"
              >
                <h3 class="legal-section-title mb-2">
                  {{ section.title }}
                </h3>

                <p v-if="section.text" class="legal-section-text mb-2">
                  {{ section.text }}
                </p>

                <ul v-if="section.bullets && section.bullets.length" class="legal-bullets-list">
                  <li
                    v-for="(bullet, bIdx) in section.bullets"
                    :key="bIdx"
                    class="legal-bullet-item mb-1"
                  >
                    <v-icon size="14" class="bullet-dot mr-2">
                      mdi-check-circle-outline
                    </v-icon>
                    <span>{{ bullet }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { LEGAL_DOCS, type LegalDocumentLocale, type LegalTab } from "@/constants/legal";

export default defineComponent({
  name: "LegalModal",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    initialTab: {
      type: String as PropType<"terms" | "privacy" | "copyright">,
      default: "terms",
    },
    defaultLocale: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      activeTab: this.initialTab as "terms" | "privacy" | "copyright",
      currentLang: "pt" as "pt" | "es",
    };
  },
  computed: {
    isOpen: {
      get(): boolean {
        return this.modelValue;
      },
      set(val: boolean) {
        this.$emit("update:modelValue", val);
      },
    },
    isDark(): boolean {
      const themeVal = (this as any).$userdata?.get?.("theme");
      if (themeVal === "light") return false;
      if (themeVal === "dark") return true;
      if (typeof this.$vuetify !== "undefined" && this.$vuetify.theme?.global?.name) {
        return this.$vuetify.theme.global.name === "dark";
      }
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return true;
    },
    doc(): LegalDocumentLocale {
      return LEGAL_DOCS[this.currentLang] || LEGAL_DOCS.pt;
    },
    currentTabObj(): LegalTab | undefined {
      return this.doc.tabs.find((t) => t.id === this.activeTab) || this.doc.tabs[0];
    },
  },
  watch: {
    modelValue(val: boolean) {
      if (val) {
        this.activeTab = this.initialTab;
        this.initLang();
      }
    },
    initialTab(tab: "terms" | "privacy" | "copyright") {
      this.activeTab = tab;
    },
  },
  mounted() {
    this.initLang();
  },
  methods: {
    initLang() {
      if (this.defaultLocale && (this.defaultLocale === "pt" || this.defaultLocale === "es")) {
        this.currentLang = this.defaultLocale as "pt" | "es";
        return;
      }
      const locale = this.$i18n?.locale || "pt";
      this.currentLang = locale.startsWith("es") ? "es" : "pt";
    },
  },
});
</script>

<style lang="scss" scoped>
.legal-modal-card {
  background: var(--card-bg, #1a2234) !important;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1)) !important;
  border-radius: 20px !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45) !important;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.legal-card-container {
  height: 85vh;
  max-height: 85vh;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.legal-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px 24px;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  flex-shrink: 0;

  .legal-header-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(0, 151, 215, 0.12);
    border: 1px solid rgba(0, 151, 215, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;

    .legal-header-icon {
      color: var(--accent-blue, #009be2);
    }
  }

  .legal-modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--sidebar-text, #ffffff);
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.2px;
  }

  .legal-modal-subtitle {
    font-size: 0.85rem;
    color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.65));
    margin-top: 2px;
  }
}

.lang-toggle-pill {
  background: rgba(128, 128, 128, 0.15);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 20px;
  padding: 2px;

  .lang-pill-btn {
    border: none;
    background: transparent;
    color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.6));
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--sidebar-text, #ffffff);
    }

    &.active {
      background: var(--accent-blue, #009be2);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(0, 151, 215, 0.35);
    }
  }
}

.header-close-btn {
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.6));
  border-radius: 8px !important;

  &:hover {
    color: var(--sidebar-text, #ffffff);
    background: rgba(255, 255, 255, 0.08);
  }
}

.legal-tabs-wrapper {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));

  .legal-tabs-track {
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .legal-tab-item {
    border: 1px solid transparent;
    background: transparent;
    color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.65));
    font-size: 13px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: var(--sidebar-text, #ffffff);
      background: rgba(128, 128, 128, 0.08);
    }

    &.is-active {
      color: var(--accent-blue, #009be2);
      background: rgba(0, 151, 215, 0.12);
      border-color: rgba(0, 151, 215, 0.3);
    }
  }
}

.legal-scroll-area {
  padding: 20px 24px 28px 24px;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--accent-blue, #009be2);
    border-radius: 8px;
  }
}

.legal-summary-callout {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(0, 151, 215, 0.08);
  border: 1px solid rgba(0, 151, 215, 0.2);

  .summary-icon {
    color: var(--accent-blue, #009be2);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .summary-text {
    font-size: 13px;
    line-height: 1.5;
    color: var(--sidebar-text, #ffffff);
    font-weight: 500;
  }
}

.legal-section-block {
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));

  .legal-section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--sidebar-text, #ffffff);
  }

  .legal-section-text {
    font-size: 13px;
    line-height: 1.6;
    color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.8));
  }

  .legal-bullets-list {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .legal-bullet-item {
    font-size: 13px;
    line-height: 1.55;
    color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.8));
    display: flex;
    align-items: flex-start;

    .bullet-dot {
      color: var(--accent-blue, #009be2);
      flex-shrink: 0;
      margin-top: 3px;
    }
  }
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.15s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
