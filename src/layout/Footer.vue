<template>
  <div v-if="!isMediaMinimized && !isExternalMediaMinimized" id="footer-version">
    <span class="version-text">v{{ version }}</span>
  </div>
  <v-footer
    v-else-if="isMediaMinimized"
    id="footer-bar"
    class="pa-0 d-flex flex-column"
    color="primary"
  >
    <LPlayer location="footer" />
  </v-footer>
  <v-footer
    v-else-if="isExternalMediaMinimized"
    id="footer-bar"
    class="pa-0"
    color="primary"
  >
    <ExternalMediaFooterPlayer />
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import packageJson from "../../package.json";

import LPlayer from "@/components/Player.vue";
import ExternalMediaFooterPlayer from "@/components/ExternalMediaFooterPlayer.vue";

export default defineComponent({
  name: "FooterLayout",
  components: {
    LPlayer,
    ExternalMediaFooterPlayer,
  },
  data: () => ({
    db_version: 0 as number,
  }),
  computed: {
    version(): string {
      return `${packageJson.version}.${this.db_version}`;
    },
    isMediaMinimized(): boolean {
      return this.$media.isMinimized();
    },
    isExternalMediaMinimized(): boolean {
      return this.$appdata.get("modules.external_media.minimized") === true && !!this.$appdata.get("modules.external_media.filePath");
    },
  },
  async mounted() {
    await this.loadDBVersion();
  },
  methods: {
    async loadDBVersion() {
      const config = await this.$database.get("config");
      this.db_version = config?.version_number || 0;
    },
  },
});
</script>
<style scoped>
#footer-bar {
  flex: 0 !important;
}

#footer-version {
  position: fixed;
  bottom: 8px;
  left: 0;
  width: var(--sidebar-collapsed-width, 72px);
  text-align: center;
  z-index: 9999;
  pointer-events: none;
}

.version-text {
  display: inline-block;
  color: rgba(255, 255, 255, 0.25);
  font-size: 10px;
  font-weight: 500;
  transition: color 0.3s ease;
}
</style>

