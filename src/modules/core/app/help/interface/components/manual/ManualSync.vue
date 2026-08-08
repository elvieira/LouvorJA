<template>
  <div class="manual-section">
    <p class="mb-6">
      O Louvor JA foi idealizado para ser um sistema <strong>totalmente off-line</strong>, garantindo máxima estabilidade e independência de internet durante os cultos. Para viabilizar isso, ele conta com um gerenciamento inteligente de arquivos locais, downloads prévios e atualizações automáticas em segundo plano.
    </p>

    <!-- Biblioteca Local -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Biblioteca Local
    </h3>
    <p class="mb-4">
      O botão <strong>Biblioteca Local</strong> (localizado na barra lateral inferior) abre o gerenciador de arquivos do aplicativo. Todo o conteúdo de mídia do programa (áudios, playbacks, vídeos de fundo e coletâneas baixadas) fica salvo no seu computador de forma organizada.
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        Através dessa tela, você pode visualizar quanto espaço em disco o programa e as mídias estão utilizando.
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Download de Coletâneas -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Download das Coletâneas
    </h3>
    <p class="mb-4">
      Por padrão, o Louvor JA trabalha <strong>sob demanda</strong>: ele baixa as músicas (áudio e slides) apenas quando você as executa pela primeira vez, guardando-as na sua Biblioteca Local para usos futuros (mesmo sem internet).
    </p>
    <p class="mb-4">
      Porém, se o computador da sua igreja não possui acesso à internet constante, você pode realizar o <strong>Download Completo</strong> das coletâneas previamente em sua casa:
    </p>
    <ul class="mb-4 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        Ao abrir um hinário ou uma coletânea de hinos no menu, procure pelo ícone de download (nuvem).
      </li>
      <li class="mb-2">
        Ao iniciar o download, o programa baixará simultaneamente todas as mídias e slides daquela coletânea para o seu computador.
      </li>
      <li class="mb-2">
        Após a conclusão, a coletânea inteira estará 100% disponível para uso off-line, garantindo estabilidade e segurança total durante o culto.
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Atualizações do Programa -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Atualizações do Programa
    </h3>
    <p class="mb-4">
      Manter o Louvor JA atualizado é essencial para garantir acesso às novas coletâneas, novos recursos adicionados e correções de erros.
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Verificação Automática:</strong> Sempre que você abre o Louvor JA conectado à internet, ele verifica silenciosamente se há uma nova versão disponível na nuvem.
      </li>
      <li class="mb-2">
        <strong>Download em Segundo Plano:</strong> A atualização é baixada sem interromper o uso do programa. Quando o download for concluído, um aviso discreto aparecerá na tela.
      </li>
      <li class="mb-2">
        <strong>Instalação Fácil:</strong> Basta confirmar o aviso para que o programa reinicie rapidamente, já atualizado, mantendo todos os seus dados e suas configurações intactos.
      </li>
      <li class="mb-2">
        <strong>Verificação Manual:</strong> Você pode visualizar a versão atual do sistema no canto inferior direito do programa e conferir o que há de novo no botão "Ajuda e sobre".
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSync",
});
</script>
