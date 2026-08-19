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
        <div class="d-flex justify-end" style="flex: 0 0 auto;">
          <v-switch
            :model-value="modelValue"
            :color="switchColor"
            inset
            hide-details
            class="font-weight-medium mt-0 pt-0"
            style="flex: none;"
            @update:model-value="$emit('update:modelValue', $event)"
          />
        </div>
      </template>

      <template v-else-if="type === 'select'">
        <v-menu :close-on-content-click="true" location="bottom end">
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
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

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  icon: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  type?: "button" | "switch" | "select";
  modelValue?: string | number | boolean;
  buttonText?: string;
  buttonColor?: string;
  buttonVariant?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
  buttonElevation?: number | string;
  switchColor?: string;
  items?: any[];
  itemTitle?: string;
  itemValue?: string;
}>(), {
  iconColor: "primary",
  type: "button",
  modelValue: undefined,
  buttonText: "",
  buttonColor: "primary",
  buttonVariant: "tonal",
  buttonElevation: 0,
  switchColor: "primary",
  items: () => [],
  itemTitle: "title",
  itemValue: "value",
});

defineEmits(["action", "update:modelValue"]);

const normalizedItems = computed(() => {
  return props.items.map(item => {
    if (typeof item === "object") {
      return {
        title: item[props.itemTitle],
        value: item[props.itemValue],
      };
    }
    return {
      title: String(item),
      value: item,
    };
  });
});

const selectedItemLabel = computed(() => {
  const selected = normalizedItems.value.find(item => item.value === props.modelValue);
  return selected ? selected.title : String(props.modelValue || "");
});
</script>
