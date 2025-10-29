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

## 🔧 Versionamento

```bash
# Incrementar versão major (1.x.x)
npm run version:major

# Incrementar versão minor (x.1.x)
npm run version:minor

# Incrementar versão patch (x.x.1)
npm run version:patch
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

## 🎯 Recursos

- ✅ Sistema modular de hinos e músicas
- ✅ Bíblia integrada com busca
- ✅ Gerenciador de coleções
- ✅ Player de mídia (áudio/vídeo)
- ✅ Sistema de temas customizáveis
- ✅ Suporte offline (PWA)
- ✅ Multi-idioma (Português/Espanhol)
- ✅ Modo de tela cheia para apresentações
- ✅ Atalhos de teclado
- ✅ Exportação de dados

## 🌐 Navegadores Suportados

- Chrome/Edge (últimas 2 versões)
- Firefox (últimas 2 versões)
- Safari (últimas 2 versões)
- Navegadores modernos com suporte a ES6+

## 📝 Configuração

As variáveis de ambiente podem ser configuradas nos arquivos:
- `.env` - Desenvolvimento
- `.env.production` - Produção

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é de código aberto.

## 👨‍💻 Autor

**elvieira**

## 🔗 Links

- [Documentação do Vue 3](https://vuejs.org/)
- [Documentação do Vuetify 3](https://vuetifyjs.com/)
- [Documentação do Vite](https://vitejs.dev/)
