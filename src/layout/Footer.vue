<template>
  <div v-if="!isMediaMinimized && !isExternalMediaMinimized" id="footer-version">
    <span class="version-text">v{{ version }}</span>
  </div>
  <v-footer
    v-else-if="isMediaMinimized"
    id="footer-bar"
    class="pa-0"
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

<script>
import packageJson from "../../package.json";

import LPlayer from "@/components/Player.vue";
import ExternalMediaFooterPlayer from "@/components/ExternalMediaFooterPlayer.vue";

export default {
  name: "FooterLayout",
  components: {
    LPlayer,
    ExternalMediaFooterPlayer,
  },
  data: () => ({
    db_version: 0,
  }),
  computed: {
    version() {
      return `${packageJson.version}.${this.db_version}`;
    },
    isMediaMinimized() {
      return this.$media.isMinimized();
    },
    isExternalMediaMinimized() {
      return this.$appdata.get("modules.external_media.minimized") === true && this.$appdata.get("modules.external_media.filePath");
    },
  },
  async mounted() {
    await this.loadDBVersion();
  },
  methods: {
    async loadDBVersion() {
      const config = await this.$database.get("config");
      this.db_version = config.version_number;
    },
  },
};
</script>

<style scoped>
#footer-bar {
  flex: 0 !important;
}

#footer-version {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1001;
  pointer-events: none;
}

.version-text {
  display: inline-block;
  background: rgba(26, 26, 26, 0.9);
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
</style>

