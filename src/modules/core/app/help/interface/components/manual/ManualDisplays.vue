<template>
  <div class="manual-section">
    <!-- Projetando Tela -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Projetando em Outro Monitor
    </h3>
    <p class="mb-4">
      Clique no botão "Área Expandida" para projetar o conteúdo da tela para outro monitor. Caso não seja detectado um segundo monitor, o conteúdo é aberto no monitor principal em tela cheia.
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        Após projetar, o ícone muda, indicando que o conteúdo já se encontra projetado.
      </li>
      <li class="mb-2">
        Pressione novamente o botão para recolher, ou use a tecla <kbd>ESC</kbd>.
      </li>
      <li class="mb-2">
        Para alterar o monitor em que a tela será expandida, clique na seta ao lado do botão de Área Expandida e escolha o monitor. A escolha será lembrada na próxima vez.
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Formatação -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Formatação de Conteúdo (Slides)
    </h3>
    <p class="mb-4">
      Clique no botão "Formatar" (na tela de exibição) para abrir um painel lateral onde você pode modificar a fonte, cor, tamanho, disposição e definir uma <strong>imagem de fundo</strong> para a música atual.
    </p>
    <p class="mb-4">
      Para restaurar a formatação original e remover as edições, basta clicar no botão "Restaurar".
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Transmitindo e CSS -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Transmissão para Streaming (OBS / vMix)
    </h3>
    <p class="mb-4">
      O programa permite a transmissão das letras para serviços de streaming, como OBS e VMIX, via camada de navegador (Browser Source).
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      Para ativar, vá até o menu principal e escolha <strong>Transmitir</strong>. Defina o IP (ou clique em "Usar IP da rede") e Porta. Em seguida, clique em "Iniciar Servidor". Em caso de erro, tente mudar a porta.
      Após iniciado, será mostrado um link na tela. Copie este endereço e cole no seu OBS (em um objeto de tipo Navegador).
    </p>
    
    <!-- Dicas de CSS -->
    <v-card variant="tonal" class="rounded-lg mb-6 border-opacity-25 bg-surface-light">
      <v-card-text>
        <p class="font-weight-bold mb-2">
          Formatando a letra no OBS (Estilos CSS)
        </p>
        <p class="mb-3 text-body-2">
          Você pode manipular o CSS no OBS (campo Custom CSS) para alterar fonte, cor e alinhamento:
        </p>
        
        <p class="font-weight-medium text-caption mt-2 mb-1">
          Posicionar a letra no rodapé:
        </p>
        <code class="d-block pa-2 rounded bg-black text-green-accent-2 mb-3">table td { vertical-align: bottom !important; }</code>
        
        <p class="font-weight-medium text-caption mt-2 mb-1">
          Mudar o tamanho da fonte:
        </p>
        <code class="d-block pa-2 rounded bg-black text-green-accent-2 mb-3">* { font-size: 50px !important; }</code>
        
        <p class="font-weight-medium text-caption mt-2 mb-1">
          Mudar cor e fonte:
        </p>
        <code class="d-block pa-2 rounded bg-black text-green-accent-2 mb-1">* { color: red !important; font-family: Arial !important; }</code>
      </v-card-text>
    </v-card>
    
    <v-divider class="my-6 border-opacity-25" />

    <!-- Editor de Slides -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Editor de Slides & Gravação de Tempos
    </h3>
    <p class="mb-4">
      A tela do Editor permite a criação de slides internos do programa (.slja). Nela você adiciona Textos Principais e Auxiliares (texto menor em cima).
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-1">
        <strong>Dividir Slide:</strong> Cada quebra de linha gera um slide. Usar o caractere <code>|</code> gera uma quebra de linha no mesmo slide.
      </li>
      <li class="mb-1">
        <strong>Mesclar Próx. Slide:</strong> Junta o slide atual ao seguinte, mantendo formatação.
      </li>
    </ul>

    <p class="font-weight-medium mb-2">
      Gravando intervalos (Para automação sem clique):
    </p>
    <p class="text-body-2 mb-4" style="color: var(--sidebar-text-secondary);">
      Na aba "Áudio/Gravação", você reproduz o áudio da música (quando houver). Use o botão <strong>Gravar e Avançar</strong> (<kbd>CTRL</kbd> + <kbd>→</kbd>) no ritmo da música para registrar os tempos exatos em que cada slide deve passar automaticamente. Use <strong>Gravar Retroativo</strong> para corrigir pequenos atrasos de 1 segundo.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualDisplays",
});
</script>
