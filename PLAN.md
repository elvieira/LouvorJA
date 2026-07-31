# Plano: Barra de Status (Tela de Retorno) e Barra de Avisos

## Objective

Adicionar dois elementos de UI persistentes/sob-demanda às telas de saída do LouvorJA, inspirados no Holyrics:

1. Uma **barra de status/relógio**, sempre visível no rodapé da tela de retorno, mostrando o relógio quando não há nada relevante sendo projetado (vago ou Bíblia ativa) e a contagem de slides + tempo restante quando uma música está sendo projetada.
2. Uma **barra de avisos**, sob demanda, exibível no topo da tela principal e/ou da tela de retorno (à escolha do operador a cada disparo), com texto livre ou opções pré-fixadas, controlada manualmente (mostrar/remover).

Nenhuma mudança é feita no ciclo de vida das janelas de conteúdo (letra/versículo/mídia) — elas continuam sendo criadas e destruídas exatamente como hoje.

## Context & Constraints

- **Branch base:** `electron` (`origin/electron`). A branch de trabalho atual (`claude/screen-opacity-visibility-rmm47u`) já está no mesmo commit de `origin/electron`; qualquer PR/merge deve considerar essa branch como referência, não `main`.
- **Descoberta que motivou o desenho:** a ideia inicial era deixar as telas de conteúdo sempre abertas com opacidade zero (para simular transparência e evitar flicker). Isso foi descartado após investigação: hoje, quando não há conteúdo sendo projetado, a `BrowserWindow` já é fechada de verdade (`src/helpers/Popup.js`), o que já revela o papel de parede do SO/software de papel de parede animado sem nenhuma mudança de código. O verdadeiro gap era ter elementos de UI (aviso, status) que sobrevivem independente do estado da janela de conteúdo.
- Plataforma alvo principal: Windows. Mac/Linux como bônus — como as duas novas janelas são pequenas, opacas e sem transparência real de SO, o risco de incompatibilidade de compositor (comum em Linux/X11 sem compositing WM) é eliminado.
- Nenhuma das novas janelas precisa de transparência nativa do Electron (`transparent: true`). Ambas são barras sólidas, com fundo de cor fixa — mesmo estilo já usado em `ReturnScreen.vue` (`return_screen_bg_color` / `return_screen_font_color`).
- O mecanismo de sincronização de estado entre janelas (`$appdata` → `postMessage` para toda janela registrada em `popups`, ver `src/helpers/AppData.js`) deve ser reaproveitado para as duas novas janelas, em vez de criar um canal de comunicação novo.
- Módulo de avisos entra nesta rodada em versão básica: presets fixos + texto livre, controle manual (sem auto-esconder), escolha de tela(s) alvo a cada disparo. Gerenciamento avançado de presets (CRUD completo, categorias, cores por tipo) fica fora de escopo por ora.

## Technical Design

### 1. Barra de status/relógio (tela de retorno)

- **Nova janela Electron**, pequena (largura total do monitor configurado, altura fixa tipo ~60-80px), `alwaysOnTop`, sem moldura, `skipTaskbar`, opaca (sem `transparent: true`), posicionada no rodapé do monitor definido em `modules.config.return_screen_monitor`.
- **Criação**: eager, no boot do app — criada assim que o Electron sobe, se `return_screen_monitor` já estiver configurado no `$userdata`. Se não houver monitor configurado, a janela não é criada até que a configuração seja feita (reagir à mudança de config, como `syncReturnMonitor` já faz hoje).
- **Always-on-top sobre a janela de conteúdo**: como a janela de conteúdo da tela de retorno abre fullscreen por cima quando há algo pra mostrar, a barra de status precisa se re-elevar (`moveTop()`/reforçar `setAlwaysOnTop`) sempre que a janela de conteúdo é (re)criada, para não ficar coberta.
- **Conteúdo/lógica** (Vue, reaproveitando computeds já existentes em `ReturnScreen.vue`):
  - Mostra **relógio** (hora atual) quando: nenhum módulo ativo (`popup_module` vazio) OU Bíblia ativa (`popup_module === "bible"`).
  - Mostra **slide atual/total + tempo restante** (lógica de `slide_status`/`remaining_time` já existente) quando há música/mídia sendo projetada.
  - Estilo: reaproveitar `return_screen_bg_color` / `return_screen_font_color` do `$userdata`.
- **Sincronização**: registrar essa janela no mecanismo de `popups`/`postMessage` já existente em `AppData.js`, para receber atualizações reativas de `popup_module`, slide index, tempo de áudio etc. sem infraestrutura nova.

### 2. Barra de avisos (tela principal e/ou retorno)

- **Nova janela Electron por tela-alvo**, mesmo padrão da barra de status (pequena, opaca, `alwaysOnTop`, sem moldura), mas posicionada no **topo** do(s) monitor(es) escolhido(s), e **criada sob demanda** (ao disparar um aviso) e **destruída ao remover** (sem auto-esconder nesta versão).
- **Disparo**: nova interface simples no operador (`Main.vue`/sidebar ou módulo próprio) com:
  - Campo de texto livre.
  - Lista pequena de opções pré-fixadas (ex.: "Carro com farol aceso", "Compareça à recepção") — lista fixa no código nesta versão, sem CRUD.
  - Seletor de tela-alvo: principal, retorno, ou ambas — escolhido a cada disparo, não salvo com o preset.
  - Botão "remover" que fecha a(s) janela(s) de aviso ativa(s).
- **Camada**: sempre por cima do conteúdo atual da tela-alvo (seja a janela de conteúdo aberta, seja o desktop/papel de parede revelado quando vago) — garantido pelo `alwaysOnTop` da janela pequena, independente do estado da janela de conteúdo.

### 3. Nenhuma mudança nas janelas de conteúdo

- `Popup.js` (`open`, `exit`, `syncMonitors`, `syncReturnMonitor`, `exitReturn`) permanece como está.
- `electron/main.js` (criação/kiosk das janelas de conteúdo) permanece como está.
- `ReturnScreen.vue` perde a lógica de status-bar interna (ela migra para a nova janela dedicada) — a barra de status deixa de existir dentro do componente e passa a ser uma janela separada.

## Phases

1. **Fundação — janela de status/relógio da tela de retorno.** Criar o mecanismo de janela pequena, always-on-top, opaca, ligada à config `return_screen_monitor`; portar a lógica de relógio/slide/tempo já existente em `ReturnScreen.vue` para esse novo componente/janela; garantir criação eager no boot e re-elevação sobre a janela de conteúdo.
2. **Barra de avisos — versão básica.** Criar a interface de disparo (texto livre + presets fixos + seletor de tela), o mecanismo de janela pequena sob demanda (topo, opaca, always-on-top) para tela principal e/ou retorno, e o controle manual de mostrar/remover.
3. **Revisão e validação.** Testar em Windows (kiosk fullscreen, múltiplos monitores, boot com/sem monitor de retorno configurado); validar que a janela de conteúdo não fica coberta nem cobre as barras; revisão de lint/build.
