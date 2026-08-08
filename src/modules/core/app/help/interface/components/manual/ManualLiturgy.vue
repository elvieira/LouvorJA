<template>
  <div class="manual-section">
    <p class="mb-6">
      A aba <strong>Liturgia</strong> é o centro de organização do seu culto. Nela você pode montar passo a passo toda a programação, detalhando as músicas, versículos, arquivos de mídia e anotações que serão executados na sequência desejada.
    </p>

    <!-- Liturgias Diárias e Avulsas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Organização por Dias e Liturgias Avulsas
    </h3>
    <p class="mb-4">
      O módulo possui um sistema de abas na barra superior que permite organizar a programação por dias da semana. O sistema automaticamente abre o dia atual (se for sábado, a aba Sábado será a principal).
    </p>
    <p class="mb-4">
      Além dos dias fixos, você pode criar <strong>Liturgias Avulsas</strong> (selecionando o último ícone das abas). Lá é possível criar programações personalizadas e dar nomes a elas (ex: "Semana de Oração", "Casamento"), que ficam salvas permanentemente de forma independente.
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Tipos de Itens -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Tipos de Itens
    </h3>
    <p class="mb-4">
      Para montar sua programação, utilize o botão <strong>"Adicionar Item"</strong>. Existem 6 tipos de itens que podem compor sua liturgia:
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Categoria:</strong> Funciona como um título ou separador (Ex: "Escola Sabatina", "Culto Divino") para organizar blocos da lista visualmente. Não possui ação ao clicar.
      </li>
      <li class="mb-2">
        <strong>Anotação:</strong> Texto simples para descrever um momento da programação (Ex: "Oração Intercessória", "Informativo Mundial").
      </li>
      <li class="mb-2">
        <strong>Música:</strong> Permite pesquisar um hino e já deixar pré-configurado o modo de execução (Cantado, Playback ou Letra). Ao chegar o momento no culto, basta um clique para abrir a música diretamente.
      </li>
      <li class="mb-2">
        <strong>Bíblia:</strong> Escolha um livro, capítulo e verso para leitura. A passagem ficará salva na liturgia para projetá-la com apenas um clique.
      </li>
      <li class="mb-2">
        <strong>Mídia Externa:</strong> Vincule um arquivo do seu computador (vídeo ou áudio). Clicar no item abrirá a mídia no reprodutor de mídia do próprio programa ou a executará.
      </li>
      <li class="mb-2">
        <strong>Link Web:</strong> Insira o endereço de um site. Quando executado, abrirá o seu navegador padrão.
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Funcionalidades da Lista -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Gerenciando a Lista
    </h3>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Reordenar:</strong> Você pode clicar e segurar o ícone de arraste (<v-icon icon="mdi-drag-vertical" size="small" />) ao lado direito de qualquer item para movê-lo para cima ou para baixo na lista.
      </li>
      <li class="mb-2">
        <strong>Marcar como concluído:</strong> Para não se perder, você pode clicar no círculo de marcação à esquerda do item conforme a programação avança, marcando-o como "realizado".
      </li>
      <li class="mb-2">
        <strong>Executar item:</strong> Um clique no botão de reprodução, abrirá automaticamente a música, mídia ou verso bíblico configurado no painel correto, pronto para exibição.
      </li>
      <li class="mb-2">
        <strong>Excluir ou Editar:</strong> Ao passar o mouse sobre um item, surgirão as opções de editar (lápis) e excluir (X) aquele evento.
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Notas do Dia -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Bloco de Notas
    </h3>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      No painel lateral direito da tela de Liturgia (disponível quando a janela não está muito estreita), há um editor de texto formatado exclusivo para anotações do dia. Lá você pode colar roteiros, textos longos para narração, listar os aniversariantes, avisos e outras informações pertinentes ao operador de multimídia que não precisam necessariamente estar na lista cronológica principal.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualLiturgy",
});
</script>
