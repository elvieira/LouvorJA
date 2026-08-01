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

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "DataTableComponent",
  props: {
    modelValue: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    file: { type: String, required: true },
    search: { type: String, default: "" },
    scroll: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
    hasScroll: { type: Boolean, default: false },
    searchableFields: { type: Object as PropType<Record<string, boolean>>, default: () => ({}) },
    filter: { type: Object as PropType<Record<string, boolean>>, default: () => ({}) },
    letter: { type: String, default: "" },
    sortBy: { type: String, default: "" },
  },
  emits: ["update:modelValue"],
  data: () => ({
    all_data: [] as any[],
    filter_data: [] as any[],
    data: [] as any[],
    limit: 0,
    error: null as string | null,
    last_filter: {} as Record<string, any>,
    loading: true,
  }),
  watch: {
    async file() {
      await this.loadData();
    },
    search() {
      this.filterData();
    },
    searchableFields: {
      handler() {
        this.compareFilterData();
      },
      deep: true,
    },
    filter: {
      handler() {
        this.compareFilterData();
      },
      deep: true,
    },
    letter() {
      this.compareFilterData();
    },
    async data() {
      this.$emit("update:modelValue", {
        total_count: this.all_data.length,
        filter_count: this.filter_data.length,
        count: this.data.length,
        data: this.data,
      });
    },
    async scroll() {
      if (
        this.scroll && this.scroll.scroll_bottom !== undefined &&
        this.scroll.scroll_bottom <= 50 &&
        this.data.length < this.filter_data.length
      ) {
        this.paginateData();
      }
    },
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.all_data = [];
      this.filter_data = [];
      this.data = [];
      this.loading = true;

      this.all_data = await this.$database.get(this.file);

      if (!this.all_data) {
        this.error = this.$t("components.datatable.alerts.not_found");
      }

      if (this.sortBy && this.all_data) {
        this.all_data.sort((a, b) =>
          this.$string.sort(a[this.sortBy], b[this.sortBy]),
        );
      }
      this.filterData();
    },
    filterData() {
      if (!this.all_data) {
        this.all_data = [];
      }
      this.limit = 0;
      const value = this.$string.clean(this.search || "");

      const searchable = this.searchableFields
        ? Object.keys(this.searchableFields).filter(
          (key) => this.searchableFields[key] === true,
        )
        : [];
      const filter = this.filter
        ? Object.keys(this.filter).filter((key) => this.filter[key] === true)
        : [];
      
      this.filter_data = this.all_data
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
                return this.$string.clean(item[key]).includes(value);
              }
              return false;
            });
          }
          const filterCondition =
            filter.length === 0 ||
            filter.some((key) => item[key] === true || item[key] === 1);

          const initialLetter =
            this.letter === "" ||
            (this.letter === "#"
              ? /^[^a-zA-Z]/.test(
                item.name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
              )
              : item.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .startsWith(this.letter));

          return searchableCondition && filterCondition && initialLetter;
        })
        .slice();

      if (!isNaN(Number(value)) && value !== "") {
        const numValue = Number(value);
        this.filter_data.sort((a, b) => {
          const getScore = (item: any) => {
            if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista" && Number(al.pivot?.track) === numValue)) return 2;
            if (item.albums?.some((al: any) => al.type === "hymnal" && al.name === "Hinário Adventista 1996" && Number(al.pivot?.track) === numValue)) return 1;
            return 0;
          };
          return getScore(b) - getScore(a);
        });
      }

      this.paginateData();
    },
    paginateData() {
      this.limit += 10;
      this.data = this.filter_data.slice(0, this.limit);
      this.loading = false;

      const self = this;
      setTimeout(() => {
        if (!self.hasScroll && self.data.length < self.filter_data.length) {
          self.paginateData();
        }
      }, 100);
    },

    compareFilterData() {
      const filter = {
        searchableFields: this.searchableFields,
        filter: this.filter,
        letter: this.letter,
      };

      if (JSON.stringify(filter) === JSON.stringify(this.last_filter)) {
        return;
      }

      this.last_filter = filter;

      this.filterData();
    },
  },
});
</script>

<style>
.__table-data .v-table__wrapper {
  overflow: initial !important;
}
</style>
