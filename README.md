# Louvor JA

Aplicação desktop para gerenciamento e apresentação de músicas, hinos, letras e recursos multimídia para igrejas. Construída com Electron para execução nativa no Windows, macOS e Linux.

## Tecnologias

- **[Vue.js 3](https://vuejs.org/)** — Framework JavaScript progressivo
- **[Vuetify 3](https://vuetifyjs.com/)** — Componentes Material Design
- **[Electron 42](https://www.electronjs.org/)** — Runtime para aplicativos desktop
- **[Vite](https://vitejs.dev/)** — Build tool rápida com HMR
- **[Vuex](https://vuex.vuejs.org/)** — Gerenciamento de estado global
- **[Vue Router](https://router.vuejs.org/)** — Roteamento SPA
- **[Vue I18n](https://vue-i18n.intlify.dev/)** — Internacionalização (PT-BR / ES)
- **[SCSS](https://sass-lang.com/)** — Pré-processador CSS

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/elvieira/LouvorJA.git
cd LouvorJA

# Instalar dependências
npm install
```

## Scripts

| Comando                  | Descrição                                      |
| ------------------------ | ---------------------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento (Vite, porta 5173)  |
| `npm run host`           | Dev server acessível na rede local             |
| `npm run build`          | Build de produção                              |
| `npm run lint`           | Linter + auto-fix (ESLint + vue-plugin)       |
| `npm run electron:dev`   | Electron + Vite (desenvolvimento com hot-reload) |
| `npm run electron:build` | Build do app Electron (Windows/macOS/Linux)    |

## Estrutura do Projeto

```
LouvorJA/
├── electron/
│   ├── main.js            # Processo principal do Electron
│   └── preload.js         # Bridge segura renderer <-> main
├── src/
│   ├── components/        # Componentes reutilizáveis globais
│   ├── layout/            # Layout principal (ModuleContainer, sidebar)
│   ├── modules/           # Sistema modular de funcionalidades
│   │   ├── BaseModule.js  # Classe base para todos os módulos
│   │   ├── core/          # Módulos do sistema (home, config)
│   │   ├── clock/         # Relógio
│   │   ├── counter/       # Contador
│   │   ├── animation/     # Animações para slides
│   │   ├── timer/         # Cronômetro de culto
│   │   ├── draw/          # Sorteio de nomes/números
│   │   ├── favorites/     # Músicas favoritas
│   │   └── text-formatter/# Formatação de texto
│   ├── helpers/           # Utilitários (Storage, Database, ModuleManager)
│   ├── store/             # Vuex store + state
│   ├── router/            # Vue Router config
│   ├── plugins/           # Plugins Vue (Vuetify, I18n, etc.)
│   ├── assets/            # Estilos, fontes, imagens
│   └── lang/              # Arquivos de tradução globais
├── public/                # Assets estáticos (favicon, ícones)
├── node/                  # Servidor Node.js para arquivos
├── dist/                  # Build de produção (gerado)
└── dist-electron/         # Build Electron (gerado)
```

## Sistema de Módulos

O LouvorJA usa uma arquitetura modular. Cada módulo é autocontido em `src/modules/<id>/`:

```
src/modules/<id>/
├── manifest.json         # Metadados (id, nome, ícone, categoria, versão)
├── index.js               # Entry point (extende BaseModule, registra i18n)
├── interface/
│   └── Index.vue          # Interface do módulo (template + script + style)
└── lang/
    ├── pt.json            # Tradução PT-BR
    └── es.json            # Tradução ES
```

### Criando um novo módulo

1. Criar diretório `src/modules/<id>/`
2. Criar `manifest.json` com metadados
3. Criar `index.js` estendendo `BaseModule`
4. Criar `interface/Index.vue` usando `<ModuleContainer>`
5. Criar arquivos `lang/pt.json` e `lang/es.json`
6. O `ModuleManager` detecta e registra automaticamente

### manifest.json

```json
{
  "active": true,
  "id": "meu-modulo",
  "name": "Meu Módulo",
  "version": "1.0.0",
  "description": "Descrição do módulo",
  "author": "louvorja",
  "category": "utilities",
  "icon": "mdi-icon-name",
  "showInMainMenu": false,
  "minAppVersion": "1.0.0",
  "dependencies": [],
  "permissions": []
}
```

Categorias disponíveis: `musics`, `utilities`, `system`, `media`, `bible`

## Estado e Persistência

- **Vuex** (`$appdata`) — Estado global da aplicação
- **localStorage** (`$storage`) — Persistência local via wrapper `Storage.js`
- **IndexedDB** (`$database`) — Armazenamento de dados estruturados (músicas, álbuns, categorias)
- **Electron IPC** — Comunicação renderer ↔ main process para operações de filesystem

## Desenvolvimento Electron

O app Electron carrega o build Vite em modo de produção, ou o dev server em desenvolvimento:

- **Dev**: `npm run electron:dev` — Inicia Vite + Electron simultaneamente (via `concurrently` + `wait-on`)
- **Build**: `npm run electron:build` — Gera build Vite (`--base=./`) + pacotes Electron via `electron-builder`
- **Plataformas**: Windows (NSIS), macOS (DMG), Linux (AppImage)

## Licença

Projeto privado — Louvor JA.