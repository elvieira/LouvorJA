<template>
  <div class="sorteio-popup">
    <div v-if="projection" class="sorteio-popup-content">
      <div class="sorteio-popup-name">{{ projection.name }}</div>
    </div>
  </div>
</template>

<script>
import manifest from "../manifest.json";

export default {
  name: "PopupSorteioPage",
  data() {
    return {
      manifest,
    };
  },
  computed: {
    /* COMPUTEDS OBRIGATORIOS - INICIO */
    /* NAO MODIFICAR */
    module_id() {
      return manifest.id;
    },
    module() {
      return this.$modules.get(this.module_id);
    },
    /* COMPUTEDS OBRIGATORIOS - FIM */

    projection() {
      return this.$appdata.get("modules.sorteio.projection");
    },
  },
};
</script>

<style scoped>
.sorteio-popup {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.sorteio-popup-content {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.sorteio-popup-name {
  font-size: 6rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 4px 20px rgba(0, 151, 215, 0.4);
  word-break: break-word;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
