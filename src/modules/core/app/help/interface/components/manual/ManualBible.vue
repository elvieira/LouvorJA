<template>
  <div class="manual-section">
    <p class="mb-6">
      A aba <strong>Bíblia</strong> do Louvor JA permite a rápida exibição de passagens bíblicas na tela, contando com pesquisa inteligente, seleção múltipla de versos e uma ampla gama de personalização visual para a projeção.
    </p>

    <!-- Exibindo Passagens Bíblicas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Navegação e Versões
    </h3>
    <p class="mb-4">
      Na parte esquerda da tela, você encontra a seleção rápida do <strong>Livro</strong> e <strong>Capítulo</strong>. Ao selecionar um capítulo, todos os versículos dele aparecerão listados no painel central à direita.
    </p>
    <p class="mb-4">
      Para alternar a tradução da Bíblia (ex: Almeida Revista e Atualizada, NVI), basta clicar no botão de <strong>Versão</strong> localizado no canto superior direito e escolher a versão desejada. A passagem em tela atualizará instantaneamente.
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Busca e Múltiplos Versículos -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Busca e Seleção Múltipla
    </h3>
    <p class="mb-4">
      Para exibir a passagem no telão, clique sobre o versículo na lista. Você pode projetar a Bíblia clicando no ícone do monitor na área de pré-visualização ou pressionando a tecla <kbd>F5</kbd>. 
      Você pode selecionar mais de um verso simultaneamente utilizando o campo de <strong>Busca</strong> localizado acima da lista de versículos, digitando a sequência desejada:
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        "<strong>1-3</strong>" - Seleciona do verso 1 ao 3
      </li>
      <li class="mb-2">
        "<strong>1,3</strong>" - Seleciona apenas os versos 1 e 3
      </li>
      <li class="mb-2">
        "<strong>1-3,5</strong>" - Seleciona do verso 1 ao 3, e também o 5
      </li>
    </ul>
    <p class="mb-4">
      Após digitar os versos desejados nesse formato, pressione <kbd>ENTER</kbd> para aplicar a seleção.
    </p>
    <v-alert
      type="info"
      variant="tonal"
      class="mb-6 rounded-lg"
      density="comfortable"
    >
      <strong>Busca por Palavras:</strong> O campo de busca também serve para pesquisar termos. Utilize um asterisco (<strong>*</strong>) para representar qualquer letra ou palavra entre os termos. Exemplo: Ao buscar por "<strong>Deus*terra</strong>", o programa listará passagens contendo as palavras Deus e terra na mesma frase.
    </v-alert>
    <v-alert
      type="success"
      variant="tonal"
      class="mb-6 rounded-lg"
      density="comfortable"
    >
      <strong>Busca Rápida da Bíblia:</strong> Você pode pesquisar e projetar passagens rapidamente de qualquer lugar do programa! Pressione <kbd>CTRL / ⌘</kbd> + <kbd>B</kbd> e siga os passos na tela (Livro > Capítulo > Versículo).
    </v-alert>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Personalização da Projeção -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Personalização da Projeção
    </h3>
    <p class="mb-4">
      O visual da Bíblia que aparece no telão pode ser totalmente adaptado para a sua igreja. Para abrir o painel de <strong>Personalização</strong>, clique no ícone de paleta de cores (<v-icon icon="mdi-palette" size="small" />) localizado na área de pré-visualização.
    </p>
    <p class="mb-4">
      Neste painel exclusivo, você possui o controle visual completo da projeção, incluindo:
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Fundo da Projeção:</strong> Escolha entre diversas cores sólidas pré-definidas ou utilize o seletor livre para escolher o tom exato do fundo.
      </li>
      <li class="mb-2">
        <strong>Texto Principal:</strong> Ajuste o tamanho da fonte do versículo, selecione a cor do texto, e altere o alinhamento (esquerda, centro ou direita) conforme preferir.
      </li>
      <li class="mb-2">
        <strong>Referência:</strong> Modifique de forma independente o tamanho, a cor e a posição (alinhamento) de onde a referência bíblica (Ex: <em>Gênesis 1:1</em>) aparecerá na projeção.
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualBible",
});
</script>
