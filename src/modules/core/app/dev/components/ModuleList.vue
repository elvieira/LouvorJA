<template>
  <div class="modules-grid">
    <div v-for="(module, key) in modules" :key="key" class="module-card glass-card">
      <div class="module-card-header d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center">
          <v-avatar class="module-avatar mr-3" rounded size="48">
            <v-icon :icon="module.icon || 'mdi-puzzle'" size="28" color="var(--primary)" />
          </v-avatar>
          <div>
            <h3 class="module-title">
              {{ module.manifest.name }}
            </h3>
            <div class="module-subtitle">
              by {{ module.manifest.author }} | v{{ module.manifest.version }}
            </div>
          </div>
        </div>
        <div class="module-badges d-flex flex-column align-end gap-1">
          <v-chip
            color="primary"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            {{ module.manifest.id }}
          </v-chip>
          <v-chip
            v-if="module.manifest.system"
            color="error"
            size="small"
            variant="flat"
            class="font-weight-bold"
          >
            system
          </v-chip>
        </div>
      </div>

      <div class="module-description mb-4">
        {{ module.manifest.description }}
      </div>

      <div v-if="module.manifest.dependencies && module.manifest.dependencies.length > 0" class="module-dependencies mb-4">
        <div class="text-caption text-grey font-weight-bold mb-1">
          Dependencies:
        </div>
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="(dependency, key) in module.manifest.dependencies"
            :key="key"
            color="warning"
            size="small"
            variant="tonal"
          >
            {{ dependency }}
          </v-chip>
        </div>
      </div>

      <v-divider class="mb-3" style="opacity: 0.1" />

      <div class="module-tags d-flex flex-wrap gap-2 mt-auto">
        <v-chip
          v-if="module.manifest.category"
          color="info"
          size="small"
          variant="tonal"
        >
          {{ module.manifest.category }}
        </v-chip>
        <v-chip
          v-else
          color="grey"
          size="small"
          variant="tonal"
        >
          no-category
        </v-chip>
        
        <v-chip
          v-if="module.manifest.development"
          color="error"
          size="small"
          variant="tonal"
        >
          development
        </v-chip>
        
        <v-chip
          v-if="module.manifest.showInMainMenu"
          color="success"
          size="small"
          variant="tonal"
        >
          menu
        </v-chip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModuleList",
  computed: {
    modules() {
      return this.$appdata.get("modules");
    },
  },
};
</script>

<style scoped>
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.module-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
}

.module-avatar {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.module-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sidebar-text);
  margin: 0;
  line-height: 1.2;
}

.module-subtitle {
  font-size: 0.8rem;
  color: var(--sidebar-text-secondary);
  margin-top: 4px;
}

.module-description {
  font-size: 0.95rem;
  color: var(--sidebar-text);
  line-height: 1.5;
  opacity: 0.9;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>
