<template>
  <button class="menu-toggle-btn" @click="$emit('toggle-sidebar')" aria-label="Abrir menu">
    <v-icon>mdi-menu</v-icon>
  </button>
</template>

<script>
export default {
  name: "MenuToggleButton"
};
</script>

<style scoped>
.menu-toggle-btn {
  display: none;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
  border-radius: 50%;
  transition: background 0.2s, transform 0.2s;
  color: var(--v-theme-on-surface, #333);
}
.menu-toggle-btn:hover {
  background: rgba(0,0,0,0.07);
  transform: scale(1.05);
}
.menu-toggle-btn:active {
  transform: scale(0.95);
}
@media (max-width: 900px) {
  .menu-toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
