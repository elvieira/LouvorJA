<template>
  <div id="footer-version" v-if="!$media.isMinimized()">
    <span class="version-text">v{{ version }}</span>
  </div>
  <v-footer v-else id="footer-bar" class="pa-0" color="primary">
    <l-player location="footer" />
  </v-footer>
</template>

<script>
import packageJson from "../../package.json";

import LPlayer from "@/components/Player.vue";

export default {
  name: "FooterLayout",
  components: {
    LPlayer,
  },
  data: () => ({
    db_version: 0,
  }),
  computed: {
    version() {
      return packageJson.version + "." + this.db_version;
    },
  },
  methods: {
    async loadDBVersion() {
      const config = await this.$database.get("config");
      this.db_version = config.version_number;
    },
  },
  async mounted() {
    await this.loadDBVersion();
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
  border: 1px solid rgba(0, 151, 215, 0.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
</style>
