<template>
  <div class="manual-section">
    <p class="mb-4">
      Bem-vindo ao <strong>Louvor JA</strong>! Este aplicativo foi construído para tornar o momento de louvor mais dinâmico, rápido e confiável, reunindo tudo o que você precisa em um único lugar.
    </p>
    <p class="mb-4">
      Com o Louvor JA, você tem acesso aos hinários completos (1996 e 2022), uma ampla biblioteca de músicas de diversos álbuns e coletâneas, integração com a Bíblia Sagrada, e ferramentas poderosas para organização da liturgia do culto. Tudo isso podendo ser transmitido não apenas para a tela da igreja, mas também diretamente para o seu software de transmissão (como OBS ou VMIX).
    </p>
    <p>
      Neste manual de uso, detalhamos como aproveitar ao máximo cada funcionalidade do programa. Utilize o menu lateral para navegar entre os tópicos ou a barra de pesquisa superior para ir direto ao que procura.
    </p>
    
    <v-alert
      type="success"
      variant="tonal"
      class="rounded-xl mt-8"
      border="start"
      elevation="0"
    >
      <p class="font-weight-bold mb-1" style="font-size: 1.05rem;">
        Dica para iniciantes
      </p>
      Se você está começando agora, recomendamos que explore primeiro a aba de <strong>Músicas e Hinos</strong> para entender como buscar e projetar o conteúdo básico, e em seguida confira a <strong>Liturgia</strong> para aprender a organizar o seu programa!
    </v-alert>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualIntro",
});
</script>
