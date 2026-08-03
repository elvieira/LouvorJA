<template>
  <v-dialog
    v-model="visible"
    scrollable
    persistent
    :width="w_width"
    :height="w_height"
    :theme="dark ? 'dark' : ''"
    attach=".v-main"
    contained
    :eager="eager"
  >
    <v-card :color="color ? color : ''">
      <slot name="toolbar">
        <div
          class="d-flex flex-no-wrap align-stretch flex-row justify-space-between"
        >
          <div
            v-if="icon"
            class="d-flex align-center"
            style="margin-left: 20px"
          >
            <v-icon :icon="icon" />
          </div>
          <v-avatar
            v-if="image && $vuetify.display.width > 500"
            class="ma-1"
            :size="imageSize ? imageSize : 65"
            rounded="0"
          >
            <v-img :src="image" />
          </v-avatar>
          <div
            class="flex-grow-1 d-flex flex-column justify-center text-truncate"
          >
            <v-card-title
              v-if="title"
              class="py-0 my-0"
              :class="titleClass ? titleClass : 'text-h5 font-weight-light'"
            >
              {{ title }}
            </v-card-title>
            <v-card-subtitle v-if="subtitle" class="pb-1">
              {{ subtitle }}
            </v-card-subtitle>
          </div>
          <div class="d-flex flex-row flex-nowrap align-start">
            <slot name="system_buttons" />
            <v-btn
              v-if="minimizable"
              class="ms-2"
              icon
              variant="text"
              size="small"
              @click="minimize()"
            >
              <v-icon>mdi-minus</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                open-delay="300"
                content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                Minimizar
              </v-tooltip>
            </v-btn>
            <v-btn
              v-if="closable"
              class="ms-2"
              icon
              variant="text"
              size="small"
              @click="close()"
            >
              <v-icon>mdi-close</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                open-delay="300"
                content-class="modern-glass-menu elevation-0 font-weight-medium text-white"
              >
                Fechar
              </v-tooltip>
            </v-btn>
          </div>
        </div>
      </slot>

      <v-card-title v-if="$slots.header">
        <slot name="header" />
      </v-card-title>
      <v-card-text
        ref="container"
        class="d-flex align-stretch overflow-hidden pa-0 ma-0"
      >
        <div
          v-if="$slots.left"
          :style="`height:${container_height}px;${slotLeftStyle};`"
          :class="slotLeftClass"
        >
          <slot name="left" />
        </div>
        <div
          ref="main_container"
          class="flex-grow-1 overflow-auto"
          :class="{ 'pa-5': !compact, 'pa-0': compact, 'ma-0': compact }"
          @scroll="scroll"
        >
          <slot />
        </div>
        <div
          v-if="$slots.right"
          :style="`height:${container_height}px;${slotRightStyle};`"
          :class="slotRightClass"
        >
          <slot name="right" />
        </div>
      </v-card-text>

      <v-card-actions
        v-if="$slots.footer"
        :class="{ 'pa-0': compact_footer, 'ma-0': compact_footer }"
      >
        <slot name="footer" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
/* eslint-disable vue/prop-name-casing */
import { ref, computed, watch, onMounted } from "vue";
import { useDisplay } from "vuetify";

defineOptions({ name: "DialogWindow" });

const props = withDefaults(defineProps<{
  modelValue?: boolean;
  scrollPos?: number;
  title?: string;
  subtitle?: string;
  icon?: string;
  image?: string;
  compact?: boolean;
  compact_footer?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  titleClass?: string;
  dark?: boolean;
  index?: boolean | number | string;
  size?: string;
  imageSize?: number;
  color?: string;
  slotLeftClass?: string;
  slotRightClass?: string;
  slotLeftStyle?: string | Record<string, any>;
  slotRightStyle?: string | Record<string, any>;
  eager?: boolean;
}>(), {
  modelValue: false,
  scrollPos: 0,
  title: "",
  subtitle: "",
  icon: "",
  image: "",
  compact: false,
  compact_footer: false,
  closable: false,
  minimizable: false,
  titleClass: "",
  dark: false,
  index: false,
  size: "",
  imageSize: 0,
  color: "",
  slotLeftClass: "",
  slotRightClass: "",
  slotLeftStyle: "",
  slotRightStyle: "",
  eager: false,
});

const emit = defineEmits(["update:modelValue", "close", "minimize", "scroll", "hasScroll", "resize"]);

const display = useDisplay();

const container_height = ref(0);
const container = ref<any>(null);
const main_container = ref<any>(null);

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const compact_screen = computed(() => display.width.value <= 600);
const compact_height = computed(() => display.height.value <= 600);

const w_width = computed(() => {
  return compact_screen.value
    ? "100%"
    : props.size === "small"
      ? "500px"
      : props.size === "large"
        ? "95%"
        : "90%";
});

const w_height = computed(() => {
  return compact_screen.value || compact_height.value
    ? "100%"
    : props.size === "small"
      ? "550px"
      : "90%";
});

const close = () => {
  emit("close");
};

const minimize = () => {
  emit("minimize");
};

const scroll = () => {
  if (!main_container.value) return;
  const data: any = {};
  data.scroll_top = main_container.value.scrollTop;
  data.client_height = main_container.value.clientHeight;
  data.scroll_height = main_container.value.scrollHeight;
  data.scroll_bottom = data.scroll_height - data.scroll_top - data.client_height;
  emit("scroll", data);
};

const checkScroll = () => {
  if (main_container.value) {
    const div = main_container.value;
    const hasScroll = div.scrollHeight > div.clientHeight;
    emit("hasScroll", hasScroll);
  } else {
    emit("hasScroll", false);
  }
};

const windowResize = () => {
  const el = container.value?.$el;
  if (!el) {
    return;
  }

  const data = {
    container_width: el.clientWidth,
    container_height: el.clientHeight,
  };
  container_height.value = el.clientHeight;
  emit("resize", data);
};

let resizeObserver: ResizeObserver | null = null;

const listenerResize = (active: boolean) => {
  if (active && visible.value) {
    if (container.value) {
      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          checkScroll();
        });
      }
      resizeObserver.observe(container.value.$el);
      window.addEventListener("resize", windowResize);
      windowResize();
    } else {
      setTimeout(() => {
        listenerResize(active);
        checkScroll();
      }, 10);
    }
  } else {
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener("resize", windowResize);
  }
};

watch(visible, () => {
  listenerResize(visible.value);
});

watch(() => props.index, () => {
  checkScroll();
  windowResize();
});

watch(() => props.scrollPos, (value) => {
  if (main_container.value) {
    main_container.value.scrollTo({
      top: value,
      behavior: "smooth",
    });
  }
});

onMounted(() => {
  if (visible.value) {
    listenerResize(visible.value);
  }
});
</script>
