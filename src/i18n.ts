import { createI18n, I18n } from "vue-i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadLocaleMessages = async (): Promise<Record<string, any>> => {
  const locales: string[] = ["pt", "es"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: Record<string, any> = {};

  for (const locale of locales) {
    messages[locale] = await import(`./lang/${locale}.json`);
  }

  return messages;
};

export const createI18nInstance = async (): Promise<I18n> => {
  const messages = await loadLocaleMessages();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedLocale = (window as any).app?.api?.userdata?.get("language") || "pt";

  return createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: "pt",
    messages,
  });
};

export default createI18nInstance;
