<template>
  <v-table
    ref="tableRoot"
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
import { ref, shallowRef, watch, onMounted, nextTick } from "vue";
import { useDatabase, useString, useUserData } from "@/composables/useHelpers";
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
  initialLimit?: number;
}>(), {
  modelValue: () => ({}),
  search: "",
  scroll: () => ({}),
  hasScroll: false,
  searchableFields: () => ({}),
  filter: () => ({}),
  letter: "",
  sortBy: "",
  initialLimit: undefined,
});

const emit = defineEmits(["update:modelValue"]);

const database = useDatabase();
const stringHelper = useString();
const userdata = useUserData();
const { t } = useI18n();

const downloadedAlbums = shallowRef<string[]>([]);
const all_data = shallowRef<any[]>([]);
const filter_data = shallowRef<any[]>([]);
const data = shallowRef<any[]>([]);
const limit = ref(0);
const error = ref<string | null>(null);
const last_filter = ref<Record<string, any>>({});
const loading = ref(true);
const tableRoot = ref<any>(null);
const showingAll = ref(false);

// Modules pass `scroll`/`hasScroll` via their own scroll wrapper, but that
// wiring isn't reliable for every layout. Detecting overflow on our own
// wrapper lets us stop auto-filling as soon as the list actually needs a
// scrollbar, regardless of whether the parent's props are wired up.
const hasVisibleScrollbar = () => {
  const wrapper = tableRoot.value?.$el?.querySelector(".v-table__wrapper") as HTMLElement | undefined;
  return !!wrapper && wrapper.scrollHeight > wrapper.clientHeight + 1;
};

const paginateData = () => {
  if (props.initialLimit && !showingAll.value) {
    limit.value = Math.min(props.initialLimit, filter_data.value.length);
    data.value = filter_data.value.slice(0, limit.value);
    loading.value = false;
    return;
  }

  limit.value += 10;
  data.value = filter_data.value.slice(0, limit.value);
  loading.value = false;

  nextTick(() => {
    if (!props.hasScroll && !hasVisibleScrollbar() && data.value.length < filter_data.value.length) {
      paginateData();
    }
  });
};

const loadAll = () => {
  showingAll.value = true;
  limit.value = filter_data.value.length;
  data.value = filter_data.value.slice();
};

const collapseToLimit = () => {
  showingAll.value = false;
  limit.value = Math.min(props.initialLimit ?? filter_data.value.length, filter_data.value.length);
  data.value = filter_data.value.slice(0, limit.value);
};

const getFilteredData = () => filter_data.value;

defineExpose({ loadAll, collapseToLimit, getFilteredData });

const filterData = () => {
  if (!all_data.value) {
    all_data.value = [];
  }
  limit.value = 0;
  showingAll.value = false;
  const value = stringHelper.clean(props.search || "");

  const searchable = props.searchableFields
    ? Object.keys(props.searchableFields).filter(
      (key) => props.searchableFields[key] === true,
    )
    : [];
  const filterKeys = props.filter
    ? Object.keys(props.filter).filter((key) => props.filter[key] === true)
    : [];
  
  const getFieldValueAsString = (rawValue: any): string => {
    if (Array.isArray(rawValue)) {
      return rawValue.map((v: any) => v.name || v.id || String(v)).join(" ");
    } else if (typeof rawValue === "object" && rawValue !== null) {
      return rawValue.name || rawValue.id || String(rawValue);
    }
    return String(rawValue || "");
  };
  
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
          const strVal = getFieldValueAsString(item[key]);
          return stringHelper.matchesSearch(strVal, props.search || "");
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

      let globalFilterCondition = true;
      if (props.file === "pt_musics" || props.file === "es_musics") {
        const hideUndownloaded = userdata.get("hide_undownloaded") === true;
        const primaryHymnal = userdata.get("primary_hymnal") || "none";
        const locale = props.file.split("_")[0]; // "pt" ou "es"

        if (hideUndownloaded) {
          let hasDownloadedCollection = false;
          let hasAnyCollection = false;

          if (item.albums && item.albums.length > 0) {
            hasAnyCollection = true;
            for (const album of item.albums) {
              if (album.type === "hymnal") {
                // DLA salva hinários como "hymnal_pt", "hymnal_1996_pt"
                const hymnalKey = album.name?.includes("1996") ? `hymnal_1996_${locale}` : `hymnal_${locale}`;
                if (downloadedAlbums.value.includes(hymnalKey)) {
                  hasDownloadedCollection = true;
                  break;
                }
              } else {
                // DLA salva álbuns normais pelo id numérico
                if (downloadedAlbums.value.includes(album.id_album)) {
                  hasDownloadedCollection = true;
                  break;
                }
              }
            }
          }

          if (hasAnyCollection && !hasDownloadedCollection) {
            globalFilterCondition = false;
          }
        }

        if (globalFilterCondition && primaryHymnal !== "none") {
          if (item.albums && item.albums.some((a: any) => a.type === "hymnal")) {
            const isInPrimaryHymnal = item.albums.some((a: any) => {
              if (a.type !== "hymnal") return false;
              if (primaryHymnal === "hymnal_1996") {
                return a.name?.includes("1996");
              }
              return a.name && !a.name.includes("1996");
            });
            if (!isInPrimaryHymnal) {
              globalFilterCondition = false;
            }
          }
        }
      }

      return searchableCondition && filterCondition && initialLetter && globalFilterCondition;
    })
    .slice();

  if (value !== "") {
    const isNumeric = !isNaN(Number(value));
    const numValue = Number(value);
    const currentSearchable = searchable.length > 0 ? searchable : ["name"];

    filter_data.value.sort((a, b) => {
      if (isNumeric) {
        const getNumScore = (item: any) => {
          if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numValue)) return 2;
          if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numValue)) return 1;
          return 0;
        };
        const numScoreA = getNumScore(a);
        const numScoreB = getNumScore(b);
        if (numScoreA !== numScoreB) return numScoreB - numScoreA;
      }

      const getTextScore = (item: any) => {
        let maxScore = 0;
        for (const key of currentSearchable) {
          if (!item[key]) continue;
          const strVal = getFieldValueAsString(item[key]);
          const cleanItem = stringHelper.clean(strVal);
          
          const baseScore = key === "name" ? 2 : 0;
          
          if (cleanItem.startsWith(value)) {
            maxScore = Math.max(maxScore, baseScore + 2);
          } else if (cleanItem.includes(` ${value}`)) {
            maxScore = Math.max(maxScore, baseScore + 1);
          }
        }
        return maxScore;
      };

      const scoreA = getTextScore(a);
      const scoreB = getTextScore(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return stringHelper.sort(a[props.sortBy || "name"], b[props.sortBy || "name"]);
    });
  }

  paginateData();
};

const loadData = async () => {
  all_data.value = [];
  filter_data.value = [];
  data.value = [];
  loading.value = true;

  if (window.electronAPI && window.electronAPI.isElectron) {
    downloadedAlbums.value = ((await window.electronAPI.getLocalDb("dla")) as string[]) || [];
  }

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
    showing_all: showingAll.value,
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
