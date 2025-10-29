# 🎵 LouvorJA

Software de músicas para Louvor e Adoração - Uma aplicação moderna e completa para gerenciar e apresentar músicas, hinos, letras e recursos multimídia para igrejas.

## 🚀 Tecnologias

- **[Vue.js 3](https://vuejs.org/)** - Framework JavaScript progressivo
- **[Vuetify 3](https://vuetifyjs.com/)** - Framework de componentes Material Design
- **[Vite](https://vitejs.dev/)** - Build tool moderna e extremamente rápida
- **[Vuex](https://vuex.vuejs.org/)** - Gerenciamento de estado
- **[Vue Router](https://router.vuejs.org/)** - Roteamento oficial do Vue
- **[Vue I18n](https://vue-i18n.intlify.dev/)** - Internacionalização (PT/ES)
- **[PWA](https://web.dev/progressive-web-apps/)** - Progressive Web App com suporte offline

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

## 🛠️ Scripts Disponíveis

```bash
# Executar servidor de desenvolvimento com hot-reload
npm run dev

# Executar servidor de desenvolvimento com acesso pela rede local
npm run host

# Compilar e minificar para produção
npm run build

# Visualizar build de produção localmente
npm run serve

# Executar linter e corrigir problemas automaticamente
npm run lint

# Executar servidor de arquivos (Node.js)
npm run files
```

## 📁 Estrutura do Projeto

```
app-main/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── views/          # Páginas da aplicação
│   ├── layout/         # Componentes de layout
│   ├── modules/        # Módulos do sistema (hinos, bíblia, mídias, etc)
│   ├── helpers/        # Funções auxiliares e utilitários
│   ├── store/          # Vuex store
│   ├── router/         # Configuração de rotas
│   ├── plugins/        # Plugins Vue
│   ├── assets/         # Assets estáticos (styles, fonts, images)
│   └── lang/           # Arquivos de tradução (i18n)
├── public/             # Arquivos públicos
├── node/               # Servidor Node.js
└── dist-mobile/        # Build para mobile (Cordova)
```