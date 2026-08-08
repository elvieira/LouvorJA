<template>
  <div class="manual-section">
    <!-- Coletâneas On-line -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Coletâneas On-line
    </h3>
    <p class="mb-4">
      A aba "Coletâneas On-line" permite a execução de vídeos direto do Youtube. Para executar vídeos nesta seção, é necessário conexão com a internet.
    </p>
    <p class="mb-4">
      Nela, há uma seleção de canais para execução de vídeos. Os botões de Atualizar permitem checar por novos conteúdos nesses canais, playlists ou vídeos. Também é possível cadastrar vídeos personalizados, acessando o botão "Vídeos Personalizados".
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Coletâneas Personalizadas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Coletâneas Personalizadas
    </h3>
    <p class="mb-4">
      O programa permite a inserção de atalhos para arquivos personalizados.
    </p>
    
    <p class="font-weight-medium mb-1">
      Adicionando Arquivo / Álbum:
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      Copie o arquivo ou o diretório com <kbd>CTRL / ⌘</kbd> + <kbd>C</kbd> e cole nesta tela com <kbd>CTRL / ⌘</kbd> + <kbd>V</kbd>. Ou, clique no botão "Adicionar" para adicionar uma nova coletânea/arquivo. Um painel se abrirá, permitindo escolher uma imagem como capa. Para criar uma playlist, basta colocar o diretório da pasta ao invés do caminho do arquivo.
    </p>

    <p class="font-weight-medium mb-1">
      Excluindo Álbum:
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      Clique com o botão direito sobre a coletânea e selecione "Excluir". <strong>Obs.:</strong> Esta opção exclui somente o link da coletânea do Menu, não exclui o arquivo físico. Para excluir todas, clique na seta ao lado do botão "Excluir" e selecione "Excluir Todas".
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Playlist -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Playlist das Coletâneas
    </h3>
    <p class="mb-4">
      Ao clicar sobre uma coletânea nas abas (como "JA/Min. Música" ou Diversas), será aberta uma lista com as músicas que compõem a coletânea. Basta clicar sobre uma música para abrir o slide.
    </p>
    <p class="mb-4">
      Você pode projetar a lista (botão "Projetar Menu") ou reproduzir todas em sequência (botão "Reproduzir Todas").
    </p>
    
    <v-divider class="my-6 border-opacity-25" />

    <!-- Liturgia -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Liturgia
    </h3>
    <p class="mb-4">
      Tela para organização da sequência da programação, detalhando as respectivas músicas e arquivos que serão executados no culto.
    </p>
    <p class="mb-4 text-body-2">
      Você pode colar arquivos com <kbd>CTRL / ⌘</kbd> + <kbd>V</kbd> ou usar o botão "Adicionar Item" para incluir:
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-1">
        <strong>Anotação:</strong> Apenas informativo, não possui ação de clique.
      </li>
      <li class="mb-1">
        <strong>Arquivo/Diretório:</strong> Abre um vídeo, imagem ou apresentação.
      </li>
      <li class="mb-1">
        <strong>Categoria:</strong> Para separar os grupos de itens na lista.
      </li>
      <li class="mb-1">
        <strong>Música:</strong> Configura a execução direta de um slide/hino.
      </li>
      <li class="mb-1">
        <strong>Site:</strong> Abre um link ao clicar.
      </li>
      <li class="mb-1">
        <strong>Itens Agendados:</strong> Mostra os itens programados para o dia (ex: Provai e Vede).
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Itens Agendados / Provai e Vede -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Itens Agendados (Ex: Provai e Vede)
    </h3>
    <p class="mb-4">
      Permite criar eventos periódicos que mudam de conteúdo a cada semana (Informativo, Provai e Vede). 
      Você baixa os vídeos da internet manualmente, cria a categoria (ex: Provai e Vede), seleciona as datas no calendário da tela e vincula o arquivo de vídeo àquela data específica.
    </p>
    <p class="mb-4">
      Depois de cadastrado, adicione um "Item Agendado" na sua Liturgia. O Louvor JA vai sempre abrir o arquivo certo correspondente à data atual do seu culto!
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualMedia",
});
</script>
