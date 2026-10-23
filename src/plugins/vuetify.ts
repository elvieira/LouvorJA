// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import { pt, es, en } from "vuetify/locale";

export default createVuetify({
  locale: {
    locale: "pt",
    fallback: "pt",
    messages: { pt, es, en },
  },
  date: {
    locale: {
      pt: "pt-BR",
      es: "es-ES",
      en: "en-US",
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#0097d7",
          background: "#f1f5f9",
          surface: "#ffffff",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#0097d7",
          background: "#111c30",
          surface: "#1a2a44",
        },
      },
    },
  },
});
