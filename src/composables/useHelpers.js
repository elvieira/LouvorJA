// @/composables/useHelpers.js
// Composable para acessar helpers em componentes usando Composition API

import { inject } from 'vue';
import { HelpersSymbol } from '@/plugins/helpers';

/**
 * Composable para acessar todos os helpers da aplicação
 * @returns {Object} Objeto com todos os helpers disponíveis
 * 
 * @example
 * // Em um componente com Composition API
 * import { useHelpers } from '@/composables/useHelpers';
 * 
 * export default {
 *   setup() {
 *     const { userdata, appdata, theme } = useHelpers();
 *     
 *     // Usar os helpers
 *     const isDev = userdata.get('is_dev');
 *     theme.apply('dark');
 *     
 *     return { isDev };
 *   }
 * }
 */
export function useHelpers() {
  const helpers = inject(HelpersSymbol);
  
  if (!helpers) {
    console.warn('Helpers não encontrados. Certifique-se de que o plugin está instalado.');
    return {};
  }
  
  return helpers;
}

/**
 * Composables individuais para cada helper (mais granular)
 */
export function useUserData() {
  const { userdata } = useHelpers();
  return userdata;
}

export function useAppData() {
  const { appdata } = useHelpers();
  return appdata;
}

export function useModules() {
  const { modules } = useHelpers();
  return modules;
}

export function useDev() {
  const { dev } = useHelpers();
  return dev;
}

export function useString() {
  const { string } = useHelpers();
  return string;
}

export function useDateTime() {
  const { datetime } = useHelpers();
  return datetime;
}

export function useTheme() {
  const { theme } = useHelpers();
  return theme;
}

export function usePath() {
  const { path } = useHelpers();
  return path;
}

export function useMedia() {
  const { media } = useHelpers();
  return media;
}

export function useAlert() {
  const { alert } = useHelpers();
  return alert;
}

export function usePopup() {
  const { popup } = useHelpers();
  return popup;
}

export function useDatabase() {
  const { database } = useHelpers();
  return database;
}
