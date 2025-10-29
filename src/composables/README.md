# Composables

Este diretório contém composables do Vue 3 para reutilização de lógica entre componentes.

## useHelpers

O composable `useHelpers` fornece acesso a todos os helpers da aplicação usando o sistema de Composition API do Vue 3.

### Uso

#### Composable principal (retorna todos os helpers)

```javascript
import { useHelpers } from '@/composables/useHelpers';

export default {
  setup() {
    const { userdata, appdata, theme, alert } = useHelpers();
    
    // Usar os helpers
    const isDev = userdata.get('is_dev');
    theme.apply('dark');
    alert.show('Olá!');
    
    return { isDev };
  }
}
```

#### Composables individuais (mais específicos)

```javascript
import { useTheme, useAlert, useUserData } from '@/composables/useHelpers';

export default {
  setup() {
    const theme = useTheme();
    const alert = useAlert();
    const userdata = useUserData();
    
    // Usar helpers individuais
    theme.apply('dark');
    alert.show('Olá!');
    
    return {};
  }
}
```

### Composables disponíveis

- `useHelpers()` - Retorna todos os helpers
- `useUserData()` - Dados do usuário
- `useAppData()` - Dados da aplicação
- `useModules()` - Gerenciamento de módulos
- `useDev()` - Utilitários de desenvolvimento
- `useString()` - Manipulação de strings
- `useDateTime()` - Manipulação de datas
- `useTheme()` - Gerenciamento de temas
- `usePath()` - Manipulação de caminhos
- `useMedia()` - Gerenciamento de mídia
- `useAlert()` - Sistema de alertas
- `usePopup()` - Sistema de popups
- `useDatabase()` - Acesso ao banco de dados

## Compatibilidade com Options API

Os helpers também estão disponíveis através de `this.$helpers` ou individualmente (`this.$userdata`, `this.$appdata`, etc.) para componentes que usam Options API:

```javascript
export default {
  mounted() {
    // Acessar todos os helpers
    const isDev = this.$helpers.userdata.get('is_dev');
    
    // Ou acessar individualmente
    const isDev2 = this.$userdata.get('is_dev');
  }
}
```

## Vantagens sobre Mixins

1. **Melhor performance** - Não cria uma nova instância em cada componente
2. **Type-safe** - Melhor suporte a TypeScript
3. **Explícito** - Você escolhe quais helpers importar
4. **Testável** - Mais fácil de testar em isolamento
5. **Recomendado pelo Vue 3** - É a forma oficial de compartilhar lógica
