<template>
  <div class="manual-section">
    <!-- Configurações -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Configurações do Aplicativo
    </h3>
    <p class="mb-4">
      A tela de Configurações permite personalizar o comportamento e a aparência do Louvor JA. Acesse-a através do módulo inferior na barra lateral.
    </p>
    <ul class="mb-6 pl-6 text-body-2" style="color: var(--sidebar-text-secondary);">
      <li class="mb-2">
        <strong>Aparência:</strong> Ajuste o tema visual (claro/escuro), cores de destaque e formato da interface.
      </li>
      <li class="mb-2">
        <strong>Monitor de Projeção:</strong> Defina qual monitor será utilizado para projetar as letras/vídeos (deixando o principal para o controle).
      </li>
      <li class="mb-2">
        <strong>Idioma:</strong> Selecione o idioma da interface (suporte a Português e Espanhol).
      </li>
    </ul>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Utilitários -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Sorteio e Cronômetro
    </h3>
    <p class="mb-4">
      No menu "Utilitários", você encontra ferramentas extras exclusivas para a organização do seu culto.
    </p>
    
    <p class="font-weight-medium mb-1 mt-4">
      Sorteio de Hinos:
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      Permite sortear números de hinos ou itens de uma lista aleatoriamente, com uma animação agradável na tela. Você pode configurar o intervalo de hinos, e até adicionar o resultado automaticamente à sua liturgia atual.
    </p>

    <p class="font-weight-medium mb-1">
      Cronômetro de Culto:
    </p>
    <p class="mb-4 text-body-2" style="color: var(--sidebar-text-secondary);">
      Um relógio/cronômetro que pode ser projetado de forma discreta na tela, ajudando quem está na plataforma a manter o tempo das atividades. Possui modo regressivo e progressivo, além de alertas visuais quando o tempo está acabando.
    </p>

    <v-divider class="my-6 border-opacity-25" />

    <!-- Texto Interativo -->
    <h3 class="text-h6 font-weight-bold mb-3 text-primary">
      Texto Interativo (Em Breve)
    </h3>
    <p class="mb-4">
      O recurso de Texto Interativo permitirá criar textos editáveis para serem projetados em tempo real (como avisos urgentes ou placas de carro). Atualmente este recurso está em desenvolvimento para uma futura atualização.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ManualSettings",
});
</script>
