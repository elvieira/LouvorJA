// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#0097d7",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#0097d7",
        },
      },
    },
  },
});
