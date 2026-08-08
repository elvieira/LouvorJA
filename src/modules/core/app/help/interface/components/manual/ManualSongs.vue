<template>
  <div class="manual-section">
    <!-- Página Inicial / Busca Central -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Página Inicial: Busca Central de Músicas e Hinos
    </h3>
    <p class="mb-4">
      A <strong>Página Inicial</strong> é o ambiente central para a busca de hinos e músicas. Lá você pode pesquisar rapidamente qualquer música disponível no programa. Ela possui dois modos de operação que podem ser ajustados nas <strong>Configurações</strong>:
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Modo Foco em Busca:</strong> Se você deseja que a página inicial seja dedicada exclusivamente à pesquisa de músicas, você pode desativar o "Modo Histórico" nas configurações. Ao fazer isso, as opções de coletâneas recentes e músicas mais tocadas serão ocultadas, e a barra de pesquisa ficará centralizada em destaque na tela.
      </li>
      <li class="mb-2">
        <strong>Modo Histórico (Padrão):</strong> Contém no layout as coletâneas recentes e as músicas mais tocadas. Nesse modo, a página inicial continua sendo totalmente funcional para buscas de hinos, com a barra de pesquisa fixada no topo da tela.
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Busca de Hinos -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Busca de Hinos
    </h3>
    <p class="mb-4">
      O programa conta com dois hinários disponíveis no idioma português (e um no idioma espanhol). Para acessar qualquer um dos hinários em português, abra o menu lateral <strong>"Álbuns e Coletâneas"</strong>, onde serão exibidos o <strong>Hinário Adventista</strong> e o <strong>Hinário Adventista 1996</strong>. (No idioma espanhol, o "Himnario Adventista" já aparece de forma independente no menu lateral principal).
    </p>
    <p class="mb-4">
      Ao entrar em qualquer um dos hinários, você verá a lista completa de hinos e uma barra de pesquisa superior. Nela, você pode buscar os hinos de três maneiras (este comportamento é idêntico ao da busca na Página Inicial):
    </p>
    <ul class="mb-4 pl-6" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Número do Hino:</strong> Ao digitar um número, é exibido o hino correspondente. Pressione a tecla <kbd>ENTER</kbd> para executar o hino, ou dê um clique sobre ele na lista.
      </li>
      <li class="mb-2">
        <strong>Nome do Hino:</strong> Você também pode pesquisar pelo título. Ao digitar uma palavra, são listados todos os hinos que a contenham no nome. Ex.: Ao digitar "Jesus", aparecerão opções como "Nasce Jesus", "Saudai o Nome de Jesus", "Jesus é Melhor", etc.
      </li>
      <li>
        <strong>Trecho da Letra (Em Breve):</strong> Estamos implementando a busca por parte da letra! Assim, se você não souber o nome ou o número do hino, mas lembrar de um trecho da canção, poderá pesquisá-lo diretamente pela letra.
      </li>
      <v-alert
        type="info"
        variant="tonal"
        class="mt-4 rounded-lg"
        density="comfortable"
      >
        <strong>Dica:</strong> Ao pesquisar, você pode utilizar o asterisco (<strong>*</strong>) para representar qualquer letra ou palavra entre os termos. Por exemplo: Ao buscar por "<strong>Jesus * Melhor</strong>", o programa traz resultados como "<strong><u>Jesus</u> é <u>Melhor</u></strong>" ou "<strong><u>Jesus</u> meu <u>Melhor</u> Amigo</strong>".
      </v-alert>
    </ul>

    <!-- Busca Rápida / Localizar Músicas -->
    <h3 class="text-h6 font-weight-bold mb-3 mt-6 text-primary">
      Busca Rápida (Localizar Músicas)
    </h3>
    <p class="mb-4">
      O programa conta com um atalho global de Busca Rápida. Pressionando as teclas <kbd>CTRL / ⌘</kbd> + <kbd>F</kbd> a qualquer momento e em qualquer lugar do programa, um pop-up de pesquisa será aberto na tela.
    </p>
    <p class="mb-4">
      Essa busca funciona exatamente com o mesmo poder e comportamento da pesquisa da Página Inicial (permitindo buscar por número, nome ou trecho da letra), garantindo que você consiga encontrar e abrir uma música instantaneamente, sem precisar sair da tela ou do módulo em que você está trabalhando.
    </p>

    <!-- Reprodução de Hinos -->
    <h3 class="text-h6 font-weight-bold mb-3 mt-6 text-primary">
      Reprodução de Hinos
    </h3>
    <p class="mb-2">
      Junto a lista de músicas que aparecem na pesquisa, existem opções que definem a forma como o hino será aberto:
    </p>
    <ul class="mb-4 pl-6" style="color: var(--sidebar-text-secondary);">
      <li class="mb-1">
        <strong>Cantado:</strong> Abre os slides do hino com áudio cantado.
      </li>
      <li class="mb-1">
        <strong>Playback:</strong> Abre os slides do hino com áudio playback.
      </li>
      <li class="mb-1">
        <strong>Sem Áudio:</strong> Abre os slides do hino sem áudio. Neste modo, os tempos ficam desativados, devendo o operador mudar de slide manualmente.
      </li>
      <li class="mb-1">
        <strong>Letra:</strong> Abre uma janela com a letra da música.
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSongs",
});
</script>
