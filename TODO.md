# Development Tasks

## Phase 1: Barra de status/relógio (tela de retorno)

- [ ] Confirmar/documentar branch base `electron` (`origin/electron`) e garantir que a branch de trabalho está sincronizada com ela antes de começar.
- [ ] Levantar em `electron/main.js` como criar uma `BrowserWindow` pequena, sem moldura, `alwaysOnTop`, `skipTaskbar`, opaca (sem `transparent: true`), dado o `monitorId` configurado.
- [ ] Expor a criação/posicionamento dessa janela via IPC (novo handler, seguindo o padrão de `get-displays`/`identify-displays` já existentes).
- [ ] Ler `modules.config.return_screen_monitor` no boot do app; se configurado, criar a janela de status automaticamente; se não, não criar (e reagir caso a configuração seja definida depois, como `syncReturnMonitor` já faz).
- [ ] Posicionar a janela no rodapé do monitor configurado (altura fixa, largura total).
- [ ] Criar o componente Vue da barra de status (novo, ex. `src/components/ReturnStatusBar.vue`), portando a lógica de `slide_status`/`remaining_time`/`is_bible_active` hoje em `ReturnScreen.vue`.
- [ ] Implementar a regra: relógio quando `popup_module` vazio OU Bíblia ativa; slide+tempo quando mídia/música ativa.
- [ ] Reaproveitar `return_screen_bg_color`/`return_screen_font_color` do `$userdata` para o estilo da barra.
- [ ] Registrar a nova janela no array `popups`/mecanismo de `postMessage` de `AppData.js` para receber atualizações reativas.
- [ ] Garantir que a janela de status se re-eleve (`moveTop`/reforçar `alwaysOnTop`) sempre que a janela de conteúdo da tela de retorno for (re)criada, para não ficar coberta.
- [ ] Remover a lógica de status-bar antiga de dentro de `ReturnScreen.vue` (agora vive só na nova janela).
- [ ] Testar: boot sem monitor de retorno configurado (nenhuma janela deve aparecer); boot com monitor configurado (barra aparece mostrando relógio); iniciar uma música (barra troca para slide+tempo); abrir Bíblia (barra volta pro relógio); fechar/reabrir a janela de conteúdo da tela de retorno (barra continua visível e por cima).

## Phase 2: Barra de avisos (versão básica)

- [ ] Definir lista fixa inicial de presets de aviso (ex.: "Carro com farol aceso", "Compareça à recepção") no código.
- [ ] Criar interface simples no operador (novo componente/seção) com: campo de texto livre, lista de presets clicáveis, seletor de tela-alvo (principal / retorno / ambas), botão mostrar e botão remover.
- [ ] Levantar em `electron/main.js` a criação de uma `BrowserWindow` pequena, sem moldura, `alwaysOnTop`, `skipTaskbar`, opaca, posicionada no topo do(s) monitor(es) escolhido(s) — reaproveitando o mesmo padrão de janela pequena da Fase 1.
- [ ] Implementar criação sob demanda (ao clicar "mostrar") e destruição ao clicar "remover" — sem auto-esconder nesta versão.
- [ ] Suportar disparo simultâneo em tela principal + retorno (duas janelas, uma por monitor-alvo) quando "ambas" for selecionado.
- [ ] Garantir que a barra de aviso fique sempre por cima — tanto da janela de conteúdo aberta quanto do desktop/papel de parede revelado quando a tela está vaga.
- [ ] Registrar a(s) janela(s) de aviso no mesmo mecanismo de `popups`/`postMessage`, se precisar de dado reativo (ex. texto do aviso atualizado sem recriar a janela).
- [ ] Testar: disparar aviso com a tela principal vaga (desktop visível); disparar com música/Bíblia ativa; disparar em ambas as telas ao mesmo tempo; remover manualmente.

## Phase 3: Revisão e validação

- [ ] Testar em Windows com um único monitor (sem monitor de retorno/segunda tela configurado) — garantir que nada quebra nem trava a janela principal do app.
- [ ] Testar em Windows com dois monitores (tela principal + retorno em monitores diferentes).
- [ ] Verificar que as janelas de conteúdo (letra/versículo/mídia) continuam abrindo/fechando exatamente como antes desta mudança — nenhuma regressão de comportamento.
- [ ] Validar visualmente que nenhuma das novas janelas usa transparência real (sempre barra sólida, cor de fundo fixa).
- [ ] Rodar lint/build do projeto e revisar o diff final.
- [ ] (Opcional/bônus) Testar em Mac e/ou Linux, documentando qualquer ajuste necessário de compositor/always-on-top específico da plataforma.
