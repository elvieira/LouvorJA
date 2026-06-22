# Redesign do Media Player (Tema Claro / Video Player Style)

Este plano descreve as modificações necessárias para transformar a interface do reprodutor de mídia do sistema em um reprodutor moderno e claro, inspirado em interfaces de vídeo profissionais (como YouTube/Vimeo).

## User Review Required

> [!WARNING]
> **Aprovação de Design**: Este é um redesenho significativo. O player passará a ter fundo claro (tema branco) para combinar com o resto do aplicativo. A barra de controles do player será minimalista e a lista lateral deixará de ser preta/translúcida, adotando uma aparência limpa, estilo material design.
> As posições dos botões serão reajustadas.

## Proposed Changes

---

### Módulo de Mídia (Container e Playlist)

#### [MODIFY] [media/interface/Index.vue](file:///c:/Users/Elias%20Vieira/Desktop/Backup%20MAC/Downloads/LouvorJA/LouvorJA/src/modules/core/media/interface/Index.vue)
- Remover o atributo `dark` e aplicar classes de fundo branco (`bg-white` ou var(--card-bg) no modo claro).
- **Área Visual (Esquerda)**: Aumentar o destaque da área de projeção (fullscreen component). Ela terá uma sombra suave para separar da lista.
- **Lista de Músicas (Direita)**: Passará a ter fundo branco/cinza clarinho (`#f8f9fa`), e o slide ativo receberá um fundo azul muito leve, com texto em cores sólidas (preto/cinza escuro).
- Retirar os estilos "glassmorphism escuro" que foram adicionados anteriormente.

### Componente do Player (Controles)

#### [MODIFY] [Player.vue](file:///c:/Users/Elias%20Vieira/Desktop/Backup%20MAC/Downloads/LouvorJA/LouvorJA/src/components/Player.vue)
- Remover o atributo `theme="dark"` do `<v-card>` principal do player para que ele herde o tema branco.
- **Layout dos Controles**:
  - A barra de progresso (timeline) ficará no topo do controle ou alongada, mais fina e elegante, com cor azul escuro para o progresso.
  - A capa do álbum e título ficarão alinhados à esquerda de forma nítida.
  - Os botões de controle (Play, Pause, etc) serão centralizados.
  - Os ícones serão trocados ou redesenhados com um estilo "flat" ou `variant="text"`. Ícones de retroceder e avançar vão mudar para as opções "mdi-skip-previous", "mdi-skip-next", "mdi-play-circle", mantendo uma estética mais redonda e de media center moderno.

## Verification Plan

- O player será renderizado no navegador.
- As cores, contrastes de texto e a leitura de itens ativos serão testados na tela e ajustados até alcançarem o visual moderno desejado.
