<template>
  <button aria-label="Abrir menu" class="menu-toggle-btn" @click="$emit('toggle-sidebar')">
    <v-icon>mdi-menu</v-icon>
  </button>
</template>

<script>
export default {
  name: "MenuToggleButton",
  emits: ["toggle-sidebar"],
};
</script>

<style scoped>
.menu-toggle-btn {
  display: none;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  max-width: 40px;
  padding: 8px;
  margin: 20px 16px;
  margin-right: 12px;
  border-radius: 50%;
  transition: background 0.2s, transform 0.2s;
  color: var(--sidebar-text);
}

.menu-toggle-btn:hover {
  background: var(--sidebar-hover);
  transform: scale(1.05);
}

.menu-toggle-btn:active {
  transform: scale(0.95);
}

@media (max-width: 1024px) {
  .menu-toggle-btn {
    display: inline-flex;
    align-items: center;
  }
}
</style>
