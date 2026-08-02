<template>
  <div class="d-flex align-center justify-space-between">
    <div class="d-flex align-center">
      <v-icon :color="iconColor" class="mr-3" size="24">
        {{ icon }}
      </v-icon>
      <div>
        <h3 class="font-weight-bold" style="color: var(--sidebar-text); font-size: 1.1rem; line-height: 1.2;">
          {{ title }}
        </h3>
        <div class="text-caption" style="color: var(--sidebar-text-secondary);">
          {{ subtitle }}
        </div>
      </div>
    </div>
    
    <slot name="action">
      <template v-if="type === 'button'">
        <v-btn
          v-if="buttonText"
          :variant="buttonVariant"
          :color="buttonColor"
          :elevation="buttonElevation"
          class="rounded-lg text-none font-weight-bold px-4"
          height="40"
          @click="$emit('action')"
        >
          {{ buttonText }}
        </v-btn>
      </template>

      <template v-else-if="type === 'switch'">
        <v-switch
          :model-value="modelValue"
          :color="switchColor"
          inset
          hide-details
          class="font-weight-medium"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </template>

      <template v-else-if="type === 'select'">
        <v-menu :close-on-content-click="true" location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="tonal"
              color="primary"
              rounded="lg"
              class="text-none px-4"
              style="height: 44px; min-width: 140px;"
            >
              <div class="d-flex align-center justify-space-between w-100">
                <span class="text-truncate font-weight-bold text-body-2 mr-2">
                  {{ selectedItemLabel }}
                </span>
                <v-icon size="small">
                  mdi-menu-down
                </v-icon>
              </div>
            </v-btn>
          </template>
          <v-card class="mt-1" rounded="lg" style="background: var(--card-bg); box-shadow: var(--shadow); border: 1px solid var(--border-color); min-width: 140px;">
            <v-list class="py-1" bg-color="transparent">
              <v-list-item
                v-for="(item, i) in normalizedItems"
                :key="i"
                :active="item.value === modelValue"
                color="primary"
                class="mx-1 rounded-lg mb-1"
                style="min-height: 36px;"
                @click="$emit('update:modelValue', item.value)"
              >
                <span class="text-body-2 font-weight-bold">{{ item.title }}</span>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "SettingsActionRow",
  props: {
    icon: { type: String, required: true },
    iconColor: { type: String, default: "primary" },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    
    // Type of control
    type: {
      type: String as PropType<"button" | "switch" | "select">,
      default: "button",
    },
    
    // V-model for switch or select
    modelValue: { type: [String, Number, Boolean], default: undefined },
    
    // Button props
    buttonText: { type: String, default: "" },
    buttonColor: { type: String, default: "primary" },
    buttonVariant: { 
      type: String as PropType<"flat" | "text" | "elevated" | "tonal" | "outlined" | "plain">, 
      default: "tonal", 
    },
    buttonElevation: { type: [Number, String], default: 0 },
    
    // Switch props
    switchColor: { type: String, default: "primary" },
    
    // Select props
    items: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    itemTitle: { type: String, default: "title" },
    itemValue: { type: String, default: "value" },
  },
  emits: ["action", "update:modelValue"],
  computed: {
    normalizedItems(): Array<{ title: string; value: any }> {
      return this.items.map(item => {
        if (typeof item === "object") {
          return {
            title: item[this.itemTitle],
            value: item[this.itemValue],
          };
        }
        return {
          title: String(item),
          value: item,
        };
      });
    },
    selectedItemLabel(): string {
      const selected = this.normalizedItems.find(item => item.value === this.modelValue);
      return selected ? selected.title : String(this.modelValue || "");
    },
  },
});
</script>
