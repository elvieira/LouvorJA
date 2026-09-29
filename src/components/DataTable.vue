<template>
  <v-table
    ref="tableRoot"
    fixed-header
    density="compact"
    class="__table-data"
  >
    <template #bottom>
      <v-progress-linear
        v-if="loading && !hideLoading"
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
import OnlineCollections from "@/helpers/services/OnlineCollections";

const fileDbCache = new Map<string, any[]>();

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
  hideLoading?: boolean;
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
  hideLoading: true,
});

const emit = defineEmits(["update:modelValue"]);

const database = useDatabase();
const stringHelper = useString();
const userdata = useUserData();
const { t } = useI18n();

const downloadedAlbums = shallowRef<string[]>([]);
const all_data = shallowRef<any[]>([]);
const custom_musics = shallowRef<any[]>([]);
const online_musics = shallowRef<any[]>([]);
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

  const step = limit.value === 0 ? 25 : 15;
  limit.value += step;
  data.value = filter_data.value.slice(0, limit.value);
  loading.value = false;

  nextTick(() => {
    if (!props.hasScroll && !hasVisibleScrollbar() && data.value.length < filter_data.value.length) {
      if (limit.value >= 50) return;
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

const loadCustomMusics = (localMusicsList: any[] = []) => {
  const collections = userdata.get("modules.custom_collection.list") || [];
  const result: any[] = [];
  
  const localMap = new Map<number, any>();
  localMusicsList.forEach((m: any) => {
    if (m.id_music) localMap.set(Number(m.id_music), m);
  });

  collections.forEach((col: any) => {
    if (!col || !Array.isArray(col.songs)) return;
    col.songs.forEach((song: any) => {
      if (song.type === "internal") {
        const found = localMap.get(Number(song.id_music));
        result.push({
          id: `custom_${col.id}_${song.id_music}`,
          id_music: Number(song.id_music),
          name: found ? found.name : `Música #${song.id_music}`,
          duration: found ? found.duration : 0,
          has_instrumental_music: found ? found.has_instrumental_music : 0,
          lyric: found ? found.lyric : "",
          is_custom_collection: true,
          custom_collection_name: col.name,
          custom_collection_id: col.id,
          subtitle: col.name,
          albums: [{ name: col.name, type: "custom_collection" }],
        });
      } else if (song.type === "external") {
        result.push({
          id: `custom_ext_${col.id}_${song.id}`,
          id_music: `custom_ext_${col.id}_${song.id}`,
          name: song.name,
          duration: 0,
          has_instrumental_music: Boolean(song.filePathInstrumental),
          lyric: "",
          filePathAudio: song.filePathAudio,
          filePathInstrumental: song.filePathInstrumental,
          is_custom_collection: true,
          is_external_song: true,
          custom_collection_name: col.name,
          custom_collection_id: col.id,
          subtitle: col.name,
          albums: [{ name: col.name, type: "custom_collection" }],
        });
      }
    });
  });

  return result;
};

const loadOnlineMusics = async (locale: string) => {
  try {
    const videos = await OnlineCollections.getAllVideos(locale);
    return videos.map((v) => ({
      id: `online_${v.id}`,
      id_music: `online_${v.id}`,
      name: v.name,
      video_id: v.id,
      channel_name: v.channelName || "Coletânea Online",
      image: v.image,
      is_online_collection: true,
      has_instrumental_music: false,
      subtitle: v.channelName || "Coletânea Online",
      albums: [{ name: v.channelName || "Coletânea Online", type: "online_collection" }],
      duration: 0,
    }));
  } catch (e) {
    console.error("Erro ao carregar vídeos online:", e);
    return [];
  }
};

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

  const isMusicsFile = props.file.endsWith("_musics");
  const hasLocalFilters = Boolean(
    props.searchableFields?.name || 
      props.searchableFields?.albums || 
      props.searchableFields?.lyric,
  );
  const hasCustomFilter = Boolean(props.searchableFields?.custom_collection);
  const hasOnlineFilter = Boolean(props.searchableFields?.online_collection);

  let sourceItems = all_data.value;
  if (isMusicsFile) {
    const combined: any[] = [];
    if (hasLocalFilters || (!hasCustomFilter && !hasOnlineFilter)) {
      combined.push(...all_data.value);
    }
    if (hasCustomFilter) {
      combined.push(...custom_musics.value);
    }
    if (hasOnlineFilter) {
      combined.push(...online_musics.value);
    }
    sourceItems = combined;
  }
  
  filter_data.value = sourceItems
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
          if (key === "online_collection") {
            if (!item.is_online_collection) return false;
            return stringHelper.matchesSearch(item.name || "", props.search || "") || 
              stringHelper.matchesSearch(item.subtitle || "", props.search || "");
          }
          if (key === "custom_collection") {
            if (!item.is_custom_collection) return false;
            return stringHelper.matchesSearch(item.name || "", props.search || "") || 
              stringHelper.matchesSearch(item.subtitle || "", props.search || "");
          }
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
            (item.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          )
          : (item.name || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .startsWith(props.letter));

      let globalFilterCondition = true;
      if (!item.is_online_collection && !item.is_custom_collection && (props.file === "pt_musics" || props.file === "es_musics")) {
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
                const hymnalKey = album.name?.includes("1996") ? `hymnal_1996_${locale}` : `hymnal_${locale}`;
                if (downloadedAlbums.value.includes(hymnalKey)) {
                  hasDownloadedCollection = true;
                  break;
                }
              } else {
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

    const getNumScore = (item: any) => {
      if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numValue)) return 2;
      if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numValue)) return 1;
      return 0;
    };

    const getTextScore = (item: any) => {
      let maxScore = 0;
      for (const key of currentSearchable) {
        let strVal = "";
        if (key === "online_collection") {
          strVal = item.is_online_collection ? `${item.name} ${item.subtitle || ""}` : "";
        } else if (key === "custom_collection") {
          strVal = item.is_custom_collection ? `${item.name} ${item.subtitle || ""}` : "";
        } else {
          strVal = item[key] ? getFieldValueAsString(item[key]) : "";
        }
        if (!strVal) continue;
        const cleanItem = stringHelper.clean(strVal);
        
        const baseScore = (key === "name" || item.is_online_collection || item.is_external_song) ? 2 : 0;
        
        if (cleanItem.startsWith(value)) {
          maxScore = Math.max(maxScore, baseScore + 2);
        } else if (cleanItem.includes(` ${value}`)) {
          maxScore = Math.max(maxScore, baseScore + 1);
        } else if (cleanItem.includes(value)) {
          maxScore = Math.max(maxScore, baseScore);
        }
      }
      return maxScore;
    };

    const scoreMap = new Map<any, number>();
    for (let i = 0; i < filter_data.value.length; i++) {
      const item = filter_data.value[i];
      scoreMap.set(item, isNumeric ? getNumScore(item) : getTextScore(item));
    }

    filter_data.value.sort((a, b) => {
      const scoreDiff = (scoreMap.get(b) || 0) - (scoreMap.get(a) || 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return stringHelper.sort(a[props.sortBy || "name"], b[props.sortBy || "name"]);
    });
  }

  paginateData();
};

const loadData = async () => {
  loading.value = true;
  emitModelValue();

  if (window.electronAPI && window.electronAPI.isElectron) {
    downloadedAlbums.value = ((await window.electronAPI.getLocalDb("dla")) as string[]) || [];
  }

  if (fileDbCache.has(props.file)) {
    all_data.value = fileDbCache.get(props.file)!;
  } else {
    const fetched = (await database.get(props.file)) as any[] | null;
    all_data.value = fetched || [];
    if (all_data.value && all_data.value.length > 0) {
      fileDbCache.set(props.file, all_data.value);
    }
  }

  if (!all_data.value || all_data.value.length === 0) {
    error.value = t("components.datatable.alerts.not_found");
  }

  if (props.file.endsWith("_musics") && all_data.value) {
    custom_musics.value = loadCustomMusics(all_data.value);
    if (props.searchableFields?.online_collection) {
      if (online_musics.value.length === 0) {
        loadOnlineMusics(props.file.split("_")[0]).then((vids) => {
          online_musics.value = vids;
          filterData();
        });
      }
    }
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

watch(() => props.searchableFields, async () => {
  if (props.file.endsWith("_musics")) {
    if (props.searchableFields?.custom_collection && custom_musics.value.length === 0 && all_data.value) {
      custom_musics.value = loadCustomMusics(all_data.value);
    }
    if (props.searchableFields?.online_collection && online_musics.value.length === 0) {
      online_musics.value = await loadOnlineMusics(props.file.split("_")[0]);
    }
  }
  compareFilterData();
}, { deep: true });

watch(() => props.filter, () => {
  compareFilterData();
}, { deep: true });

watch(() => props.letter, () => {
  compareFilterData();
});

const emitModelValue = () => {
  emit("update:modelValue", {
    total_count: all_data.value.length,
    filter_count: filter_data.value.length,
    count: data.value.length,
    showing_all: showingAll.value,
    data: data.value,
    unformatted_data: filter_data.value,
    loading: loading.value,
  });
};

watch(data, emitModelValue);
watch(loading, emitModelValue);

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
  await loadData();
});
</script>

<style>
.__table-data .v-table__wrapper {
  overflow: initial !important;
}
</style>
