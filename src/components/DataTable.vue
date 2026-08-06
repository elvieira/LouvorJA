<template>
  <v-table
    fixed-header
    loading
    density="compact"
    class="__table-data"
  >
    <template #bottom>
      <v-progress-linear
        v-if="loading"
        :color="$theme.primary()"
        indeterminate
      />
      <v-alert
        v-if="error"
        type="error"
        :text="error"
        variant="tonal"
        border="start"
        class="ma-2"
      />
    </template>
    <slot />
  </v-table>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, onMounted } from "vue";
import { useDatabase, useString } from "@/composables/useHelpers";
import { useI18n } from "vue-i18n";

const props = withDefaults(defineProps<{
  modelValue?: Record<string, any>;
  file: string;
  search?: string;
  scroll?: Record<string, any>;
  hasScroll?: boolean;
  searchableFields?: Record<string, boolean>;
  filter?: Record<string, boolean>;
  letter?: string;
  sortBy?: string;
}>(), {
  modelValue: () => ({}),
  search: "",
  scroll: () => ({}),
  hasScroll: false,
  searchableFields: () => ({}),
  filter: () => ({}),
  letter: "",
  sortBy: "",
});

const emit = defineEmits(["update:modelValue"]);

const database = useDatabase();
const stringHelper = useString();
const { t } = useI18n();

const all_data = shallowRef<any[]>([]);
const filter_data = shallowRef<any[]>([]);
const data = shallowRef<any[]>([]);
const limit = ref(0);
const error = ref<string | null>(null);
const last_filter = ref<Record<string, any>>({});
const loading = ref(true);

const paginateData = () => {
  limit.value += 10;
  data.value = filter_data.value.slice(0, limit.value);
  loading.value = false;

  setTimeout(() => {
    if (!props.hasScroll && data.value.length < filter_data.value.length) {
      paginateData();
    }
  }, 100);
};

const filterData = () => {
  if (!all_data.value) {
    all_data.value = [];
  }
  limit.value = 0;
  const value = stringHelper.clean(props.search || "");

  const searchable = props.searchableFields
    ? Object.keys(props.searchableFields).filter(
      (key) => props.searchableFields[key] === true,
    )
    : [];
  const filterKeys = props.filter
    ? Object.keys(props.filter).filter((key) => props.filter[key] === true)
    : [];
  
  filter_data.value = all_data.value
    .filter((item) => {
      const isPureNumber = !isNaN(Number(value)) && value !== "";
      let searchableCondition = false;
      
      if (searchable.length === 0 || value === "") {
        searchableCondition = true;
      } else if (isPureNumber) {
        searchableCondition = searchable.some((key) => {
          if (!isNaN(Number(item[key])) && item[key] !== null && item[key] !== "") {
            return Number(item[key]) === Number(value);
          }
          return false;
        }) || (item.albums && item.albums.some((al: any) => al.type === "hymnal" && Number(al.pivot?.track) === Number(value)));
      } else {
        searchableCondition = searchable.some((key) => {
          if (isNaN(Number(item[key])) || item[key] === null) {
            return stringHelper.clean(item[key]).includes(value);
          }
          return false;
        });
      }
      const filterCondition =
        filterKeys.length === 0 ||
        filterKeys.some((key) => item[key] === true || item[key] === 1);

      const initialLetter =
        props.letter === "" ||
        (props.letter === "#"
          ? /^[^a-zA-Z]/.test(
            item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          )
          : item.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .startsWith(props.letter));

      return searchableCondition && filterCondition && initialLetter;
    })
    .slice();

  if (!isNaN(Number(value)) && value !== "") {
    const numValue = Number(value);
    filter_data.value.sort((a, b) => {
      const getScore = (item: any) => {
        if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numValue)) return 2;
        if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numValue)) return 1;
        return 0;
      };
      return getScore(b) - getScore(a);
    });
  }

  paginateData();
};

const loadData = async () => {
  all_data.value = [];
  filter_data.value = [];
  data.value = [];
  loading.value = true;

  all_data.value = await database.get(props.file);

  if (!all_data.value) {
    error.value = t("components.datatable.alerts.not_found");
  }

  if (props.sortBy && all_data.value) {
    all_data.value.sort((a, b) =>
      stringHelper.sort(a[props.sortBy], b[props.sortBy]),
    );
  }
  filterData();
};

const compareFilterData = () => {
  const currentFilter = {
    searchableFields: props.searchableFields,
    filter: props.filter,
    letter: props.letter,
  };

  if (JSON.stringify(currentFilter) === JSON.stringify(last_filter.value)) {
    return;
  }

  last_filter.value = currentFilter;
  filterData();
};

watch(() => props.file, async () => {
  await loadData();
});

watch(() => props.search, () => {
  filterData();
});

watch(() => props.searchableFields, () => {
  compareFilterData();
}, { deep: true });

watch(() => props.filter, () => {
  compareFilterData();
}, { deep: true });

watch(() => props.letter, () => {
  compareFilterData();
});

watch(data, () => {
  emit("update:modelValue", {
    total_count: all_data.value.length,
    filter_count: filter_data.value.length,
    count: data.value.length,
    data: data.value,
  });
});

watch(() => props.scroll, () => {
  if (
    props.scroll && props.scroll.scroll_bottom !== undefined &&
    props.scroll.scroll_bottom <= 50 &&
    data.value.length < filter_data.value.length
  ) {
    paginateData();
  }
});

onMounted(async () => {
  // Yield thread to allow entry transitions to play smoothly before parsing large datasets
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  await loadData();
});
</script>

<style>
.__table-data .v-table__wrapper {
  overflow: initial !important;
}
</style>
