# Louvor JA — Redesign UI/UX
## Módulo 02: Álbuns e Coletâneas

**Status:** especificação visual e funcional para implementação.  
**Abrangência:** Hinário Adventista, Hinário Adventista 1996 e Coletâneas.  
**Referência:** capturas enviadas pelo responsável pelo projeto e proposta visual aprovada para continuidade.

## 1. Objetivo

Modernizar os controles e a apresentação do agrupamento **Álbuns e Coletâneas**, preservando o funcionamento existente e a identidade visual do Louvor JA. A implementação deve funcionar em modo claro e escuro e não deve alterar dados, catálogo, URLs de mídia, lógica de reprodução, projeção, favoritos ou fila.

## 2. Diretrizes globais

- Estilo minimalista, profissional e consistente com o aplicativo.
- Azul como cor de ação e seleção; evitar excesso de realces simultâneos.
- Preservar barra lateral global, navegação e cabeçalho da janela.
- Cantos arredondados moderados (8–12 px nos controles; 10–14 px nos painéis).
- Dropdowns e menus contextuais devem ser **retangulares arredondados**, sem círculos de seleção nos menus comuns.
- Diferenciar visualmente estado de foco, hover, pressionado, selecionado, desabilitado e carregando.
- Preservar acessibilidade: foco visível por teclado, nomes acessíveis nos ícones, contraste legível, navegação por setas e Escape para fechar menus.
- Nunca inferir uma ação destrutiva a partir da seleção de um menu; ações devem ter feedback.

## 3. Estrutura de navegação

**Álbuns e Coletâneas** agrupa:

1. **Hinário Adventista** — lista de hinos.
2. **Hinário Adventista 1996** — lista de hinos.
3. **Coletâneas** — grade de capas e navegação para músicas de cada coletânea.

Os dois hinários compartilham o mesmo componente de listagem; apenas os dados, título, capa e quantidade variam. Não duplicar componentes de UI.

## 4. Cabeçalho dos hinários

Composição horizontal:

- Capa do hinário em miniatura quadrada, aproximadamente 48 px.
- Título em destaque, com possibilidade de subtítulo informativo discreto.
- Botão dividido **Reproduzir Todas** próximo ao título.
- Campo de busca alinhado à direita com ícone de lupa.

Em larguras menores, reorganizar o cabeçalho sem cortar título nem controles. Não usar valores absolutos rígidos para posicionamento.

### 4.1. Botão Reproduzir Todas

Substituir o botão atual por um **split button** composto de duas áreas visualmente integradas:

- **Área principal:** ícone de reprodução + texto “Reproduzir Todas”.
- **Área secundária:** seta para baixo que abre o menu de modos.

**Comportamento:**

- Clique na área principal executa a reprodução em lote usando o modo padrão ou último modo escolhido, conforme regra já existente no app.
- Clique na seta abre o menu, sem iniciar reprodução.
- Menu oferece **Cantado** e **Playback**. Uma eventual opção “Adicionar à fila” só deve ser incluída se já fizer sentido para a lógica existente e estiver claramente diferenciada.
- Ao selecionar Cantado ou Playback, aplicar o modo escolhido à operação de lote, respeitando a disponibilidade dos arquivos.
- Se não houver arquivos elegíveis, desabilitar a ação e apresentar explicação adequada.
- Evitar dupla execução por clique repetido; exibir estado de carregamento quando necessário.

**Visual:** fundo azul, texto branco, divisor sutil entre ação principal e seta, ícones consistentes; menu flutuante compacto alinhado ao botão, sombra suave e borda discreta. O botão não deve parecer uma caixa de seleção tradicional.

### 4.2. Estados do botão

| Estado | Tratamento |
|---|---|
| Normal | Azul principal, texto branco |
| Hover | Azul levemente mais claro ou mais intenso, sem deslocamento exagerado |
| Pressionado | Tom mais profundo, resposta visual imediata |
| Menu aberto | Seta com estado ativo e painel ancorado |
| Desabilitado | Contraste reduzido e sem interação |
| Carregando | Indicador de progresso e bloqueio de repetição |

## 5. Lista de músicas dos hinários

Manter uma linha por música com:

- Número do hino destacado em azul.
- Nome do hino como informação principal.
- Duração em tom secundário.
- Ações alinhadas à direita: reproduzir Cantado, reproduzir Playback, projetar, abrir letra, adicionar à fila e favoritar.

A ordem e a semântica dos botões devem ser consistentes em todos os hinários e na lista de resultados da pesquisa. Ícones devem ter tooltips e descrições acessíveis. A disponibilidade de Cantado/Playback deve ser refletida em cada linha, com ação indisponível visualmente desabilitada.

**Estados da linha:** normal, hover, selecionada, reproduzindo e indisponível. Usar realce azul discreto no item em reprodução; evitar bordas pesadas em todas as linhas. Separadores finos e altura confortável (aproximadamente 56–64 px, ajustável).

### 5.1. Menu Adicionar à fila

- O ícone de fila abre um pequeno menu contextual ancorado à ação.
- Opções: **Cantado** e **Playback**.
- Usar o mesmo componente visual de menu do botão Reproduzir Todas.
- Não iniciar reprodução automaticamente: selecionar uma opção apenas adiciona a versão correspondente à fila.
- Fechar após seleção bem-sucedida; mostrar confirmação discreta.
- Desabilitar a versão não disponível, sem removê-la silenciosamente caso isso gere ambiguidade.

## 6. Busca dentro dos hinários

Campo com ícone de lupa, placeholder “Digite o número ou nome do hino...”, borda discreta e realce azul somente no foco.

- Buscar por número e nome, conforme a capacidade existente.
- Aplicar debounce curto, se necessário, sem tornar a busca lenta.
- Permitir limpar texto com um único clique quando preenchido.
- Exibir estado vazio com mensagem útil quando não houver resultados.
- Preservar scroll e seleção de maneira previsível ao mudar filtros.

## 7. Módulo Coletâneas

### 7.1. Cabeçalho

- Ícone de módulo e título “Coletâneas”.
- Campo “Buscar música...” com filtro de critério associado.
- Dropdown de categoria à direita, inicialmente “Todas as Coletâneas”.

Manter a distinção entre **critério da busca** e **categoria de coletâneas**: são controles independentes e devem funcionar em conjunto.

### 7.2. Grade de cards

- Grade responsiva, aproximadamente cinco colunas em janelas largas, reduzindo colunas conforme a largura útil.
- Card com capa quadrada, título legível e, quando disponível, contagem de músicas.
- Imagens sem distorção; preferir ajuste que preserve a capa.
- Espaçamentos regulares, borda fina e sombra discreta, sem visual excessivamente elevado.
- Hover: realce leve de borda/fundo; foco de teclado evidente.
- Clique abre a coletânea correspondente.
- Preservar nomes e capas reais do catálogo; não substituir por conteúdo fictício.

## 8. Filtro do campo de pesquisa

O ícone de filtro à direita do campo abre um menu compacto com os critérios já utilizados no aplicativo:

- **Nome da música**
- **Álbum/Coletânea**
- **Letra da música**

Em contextos globais que já ofereçam busca em **Coletâneas Online** e **Coletâneas Personalizadas**, manter essas opções onde já existirem, sem incluí-las indevidamente na busca local do módulo.

**Visual do menu:** painel retangular de cantos suavemente arredondados, itens em linhas inteiras clicáveis, opção ativa com fundo azul suave e marca de seleção discreta. Não usar grandes botões circulares/radio em menus convencionais. O ícone de filtro pode ter superfície arredondada ao receber hover; essa regra não se estende às opções do menu.

**Comportamento:** somente um critério ativo por vez, salvo se o mecanismo atual suportar explicitamente combinação; fechar ao selecionar, manter o texto digitado e atualizar resultados. O menu deve permanecer dentro da área visível da janela.

## 9. Filtro de categorias das coletâneas

Dropdown ancorado ao botão “Todas as Coletâneas”, com as categorias reais exibidas na referência:

- Todas as Coletâneas
- CDs Oficiais/Ano
- Adoradores
- Cantores
- Celebra SP
- Diversas
- Infantis
- Doxologia

As categorias devem vir dos dados do aplicativo, não de lista fixa codificada apenas na interface.

**Visual:** botão neutro com seta; painel flutuante de largura suficiente para os rótulos, sombra leve, itens de altura consistente. Categoria selecionada com fundo azul suave e check à esquerda. **Não usar círculos de rádio nesse seletor.**

**Comportamento:** selecionar uma categoria filtra a grade e atualiza o rótulo do botão; “Todas as Coletâneas” restaura a visão geral. A busca textual deve combinar com a categoria escolhida. Permitir fechamento por Escape, clique externo e seleção.

## 10. Tokens visuais sugeridos

Valores abaixo são **referências de implementação**, não cores extraídas matematicamente das imagens. Ajustar aos tokens globais existentes do projeto.

| Token | Escuro | Claro |
|---|---|---|
| Fundo principal | `#2B3042` | `#FFFFFF` |
| Barra lateral | `#171823` | `#FFFFFF` |
| Superfície de card | `#303649` | `#FFFFFF` |
| Superfície de menu | `#202638` | `#FFFFFF` |
| Texto principal | `#F5F7FB` | `#30333A` |
| Texto secundário | `#A1A7B6` | `#6D7480` |
| Azul de ação | `#0099DE` | `#008FD3` |
| Borda discreta | `#454C60` | `#DEE4EC` |

Raio sugerido: controles 10 px; cards 12 px; menus 10 px. Espaçamento baseado em múltiplos de 4 px. Evitar trocar tokens globais se já houver equivalentes implementados.

## 11. Componentização sugerida

- `AlbumCollectionShell`: estrutura comum de navegação.
- `HymnalHeader`: capa, título, reprodução em lote e busca.
- `SplitPlayAllButton`: botão dividido e estados.
- `PlaybackModeMenu`: opções Cantado/Playback reutilizáveis.
- `HymnSongRow`: linha de hino e ações.
- `SongQueueAction`: ação e menu de adição à fila.
- `SearchFieldWithFilter`: busca e menu de critério.
- `CollectionCategorySelect`: seleção de categoria.
- `CollectionCard`: capa e metadados.
- `CollectionGrid`: grade responsiva.

Esses nomes são conceituais: adaptar à arquitetura e convenções reais do repositório. Não reescrever regras de negócio apenas para alterar a aparência.

## 12. Regras de implementação

1. Identificar componentes atuais e seus handlers antes de substituir widgets.
2. Manter os contratos de dados e serviços existentes.
3. Extrair menus reutilizáveis, em vez de criar três estilos distintos.
4. Garantir que menus abram para cima quando não houver espaço abaixo e não sejam cortados por listas roláveis.
5. Manter z-index/overlay coerente e posicionamento relativo ao controle de origem.
6. Usar componentes e tokens de tema para claro/escuro, sem duplicar telas.
7. Evitar scroll horizontal da página inteira; somente a grade/lista rola quando necessário.
8. Preservar atalhos de teclado, estados de reprodução e foco.
9. Não implementar comportamento não documentado como se fosse requisito confirmado; validar dúvidas de negócio antes de alterar fluxos.

## 13. Critérios de aceite

- [ ] Os dois hinários usam o mesmo padrão de lista e cabeçalho.
- [ ] O botão Reproduzir Todas apresenta ação principal e seta independentes.
- [ ] Cantado e Playback respeitam a disponibilidade real das mídias.
- [ ] Adicionar à fila não reproduz automaticamente.
- [ ] Todos os menus têm o mesmo estilo retangular arredondado.
- [ ] O filtro de busca não apresenta círculos de rádio desnecessários.
- [ ] O filtro de categorias mostra claramente a opção selecionada.
- [ ] Busca e categoria funcionam simultaneamente nas coletâneas.
- [ ] Os cards se adaptam a diferentes tamanhos de janela.
- [ ] Os modos claro e escuro mantêm legibilidade e hierarquia.
- [ ] Mouse e teclado conseguem abrir, navegar e fechar os menus.
- [ ] Reprodução, projeção, letra, favoritos e fila continuam funcionando.
- [ ] Não há clipping de dropdowns nem overflow visual.

## 14. Próximo passo

Após validar este conjunto, continuar com o próximo módulo por capturas de tela e adicionar uma nova especificação numerada ao pacote final. Este documento descreve **design e comportamento esperado**; não afirma que as alterações já foram aplicadas ao código-fonte.
