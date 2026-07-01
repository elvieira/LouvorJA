import { createI18n } from "vue-i18n";

const loadLocaleMessages = async () => {
  const locales = ["pt", "es"];
  const messages = {};

  for (const locale of locales) {
    messages[locale] = await import(`./lang/${locale}.json`);
  }

  return messages;
};

export const createI18nInstance = async () => {
  const messages = await loadLocaleMessages();

  return createI18n({
    legacy: false,
    locale: "pt",
    fallbackLocale: "pt",
    messages,
    globalInjection: true,
  });
};

export default createI18nInstance;
