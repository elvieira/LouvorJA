# Louvor JA

Aplicação desktop para gerenciamento e apresentação de músicas, hinos, letras e recursos multimídia para igrejas. Construída com Electron para execução nativa no Windows, macOS e Linux.

## Tecnologias

- **[TypeScript 6](https://www.typescriptlang.org/)** — Linguagem principal (strict mode habilitado)
- **[Vue.js 3](https://vuejs.org/)** — Framework progressivo (Options API + `defineComponent`)
- **[Vuetify 3](https://vuetifyjs.com/)** — Componentes Material Design
- **[Electron 42](https://www.electronjs.org/)** — Runtime para aplicativos desktop
- **[Vite 5](https://vitejs.dev/)** — Build tool rápida com HMR
- **[Vuex 4](https://vuex.vuejs.org/)** — Gerenciamento de estado global
- **[Vue Router 4](https://router.vuejs.org/)** — Roteamento SPA
- **[Vue I18n 10](https://vue-i18n.intlify.dev/)** — Internacionalização (PT-BR / ES)
- **[SCSS](https://sass-lang.com/)** — Pré-processador CSS
- **[ESLint 8](https://eslint.org/)** — Linting com `@typescript-eslint/parser`

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/elvieira/LouvorJA.git
cd LouvorJA

# Instalar dependências
npm install
```

## Scripts

| Comando                  | Descrição                                        |
| ------------------------ | ------------------------------------------------ |
| `npm run dev`            | Servidor de desenvolvimento (Vite, porta 5173)   |
| `npm run host`           | Dev server acessível na rede local               |
| `npm run build`          | Build de produção                                |
| `npm run lint`           | Linter + auto-fix (ESLint para .vue, .js e .ts)  |
| `npm run electron:dev`   | Electron + Vite (desenvolvimento com hot-reload) |
| `npm run electron:build` | Build do app Electron (Windows/macOS/Linux)      |

## Estrutura do Projeto

```
LouvorJA/
├── electron/                  # Processo principal do Electron (TypeScript)
│   ├── main.ts                # Entry point do processo principal
│   ├── preload.ts             # Bridge segura renderer <-> main
│   ├── config/                # Configurações do Electron
│   ├── core/                  # Lógica core (janela, tray, etc.)
│   ├── ipc/                   # Handlers IPC (comunicação renderer ↔ main)
│   ├── services/              # Serviços (FTP, banco de dados, atualização)
│   ├── utils/                 # Utilitários (crypto, paths, etc.)
│   └── tsconfig.json          # Config TypeScript do processo principal
├── src/                       # Código do renderer (TypeScript + Vue)
│   ├── main.ts                # Entry point da aplicação Vue
│   ├── App.vue                # Componente raiz
│   ├── i18n.ts                # Configuração de internacionalização
│   ├── env.d.ts               # Declarações de tipos globais (ElectronAPI, Window)
│   ├── vue-properties.d.ts    # Declarações de propriedades customizadas do Vue
│   ├── components/            # Componentes reutilizáveis globais
│   ├── composables/           # Composables Vue 3
│   ├── layout/                # Layout principal (ModuleContainer, sidebar)
│   ├── modules/               # Sistema modular de funcionalidades
│   │   ├── BaseModule.ts      # Classe base para todos os módulos
│   │   ├── core/              # Módulos do sistema
│   │   │   ├── app/           # home, bible, dev, help
│   │   │   ├── songs/         # album, collections, hymnal, hymnal_1996, musics
│   │   │   └── system/        # config, external_media, lyric, media, sync, update
│   │   ├── clock/             # Relógio
│   │   ├── liturgy/           # Liturgia
│   │   ├── random/            # Sorteio de nomes/números
│   │   └── timer/             # Cronômetro de culto
│   ├── helpers/               # Utilitários organizados por domínio
│   │   ├── config/            # AppData, UserData, Theme, Dev
│   │   ├── core/              # Modules, ModuleTypes, ModuleManager
│   │   ├── services/          # Database, BackgroundSync, History, Storage, Media
│   │   ├── ui/                # Alert, Popup
│   │   └── utils/             # String, DateTime, Path, Window
│   ├── types/                 # Tipos TypeScript compartilhados
│   ├── store/                 # Vuex store + state
│   ├── router/                # Vue Router config
│   ├── plugins/               # Plugins Vue (Vuetify, helpers, webfontloader)
│   ├── views/                 # Views da aplicação
│   ├── assets/                # Estilos, fontes, imagens
│   └── lang/                  # Arquivos de tradução globais (pt.json, es.json)
├── public/                    # Assets estáticos (favicon, ícones)
├── node/                      # Servidor Node.js para arquivos
├── dist/                      # Build de produção (gerado)
└── dist-electron/             # Build Electron (gerado)
```

## Sistema de Módulos

O LouvorJA usa uma arquitetura modular. Cada módulo é autocontido em `src/modules/<id>/`:

```
src/modules/<id>/
├── manifest.ts            # Metadados tipados (implementa ModuleManifest)
├── index.ts               # Entry point (extende BaseModule, registra i18n)
├── interface/
│   ├── Index.vue          # Interface principal do módulo
│   ├── Popup.vue          # Janela de projeção (quando aplicável)
│   └── components/        # Sub-componentes do módulo
└── lang/
    ├── pt.json            # Tradução PT-BR
    └── es.json            # Tradução ES
```

### Criando um novo módulo

1. Criar diretório `src/modules/<id>/`
2. Criar `manifest.ts` exportando um objeto que implementa `ModuleManifest`
3. Criar `index.ts` estendendo `BaseModule`
4. Criar `interface/Index.vue` com `<script lang="ts">` usando `defineComponent`
5. Criar arquivos `lang/pt.json` e `lang/es.json`
6. O `ModuleManager` detecta e registra automaticamente

### manifest.ts

Cada módulo exporta um objeto tipado conforme a interface `ModuleManifest` (`src/types/module.ts`):

```ts
// src/modules/<id>/manifest.ts
import type { ModuleManifest } from "@/types/module";

const manifest: ModuleManifest = {
  id: "meu-modulo",
  name: "Meu Módulo",
  version: "1.0.0",
  description: "Descrição do módulo",
  author: "louvorja",
  category: "utilities",
  icon: "mdi-icon-name",
  minAppVersion: "1.0.0",
  dependencies: [],
  permissions: [],
};

export default manifest;
```

Categorias disponíveis: `musics`, `utilities`, `system`, `media`, `bible`

## Estado e Persistência

- **Vuex** (`$appdata`) — Estado global da aplicação (reativo)
- **localStorage** (`$storage`) — Persistência local via wrapper `Storage.ts`
- **sql.js** (`$database`) — Armazenamento de dados estruturados (músicas, álbuns, categorias)
- **Electron IPC** — Comunicação renderer ↔ main process para operações de filesystem
- **$userdata** — Preferências do usuário persistidas localmente

## TypeScript

O projeto utiliza TypeScript com strict mode habilitado. Configurações principais:

- **`tsconfig.json`** (raiz) — Config do renderer (ESNext, bundler resolution)
- **`electron/tsconfig.json`** — Config do processo principal (CommonJS, Node)
- **`src/env.d.ts`** — Declarações globais (`ElectronAPI`, `Window`, módulos `.vue`)

Todos os componentes Vue utilizam `<script lang="ts">` com `defineComponent` da Options API.

## Desenvolvimento Electron

O app Electron carrega o build Vite em modo de produção, ou o dev server em desenvolvimento:

- **Dev**: `npm run electron:dev` — Inicia Vite + Electron simultaneamente
- **Build**: `npm run electron:build` — Gera build Vite (`--base=./`) + pacotes Electron via `electron-builder`
- **Plataformas**: Windows (NSIS), macOS (DMG + ZIP, x64/arm64), Linux (AppImage)
- **Auto-update**: Suporte a atualizações automáticas via `electron-updater` + GitHub Releases

## Licença

Projeto privado — Louvor JA.