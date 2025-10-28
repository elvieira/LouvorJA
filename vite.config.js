import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load app-level env vars to node-level env vars.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_URL ?? "/",
    plugins: [
      vue(),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
      }),
      VitePWA({
        registerType: "autoUpdate", // Registra o Service Worker para atualizar automaticamente
        devOptions: {
          enabled: true, // Ativa o PWA também durante o desenvolvimento
        },
        workbox: {
          globPatterns: ["**/*.{html,js,css,svg,png}"], // Arquivos que o Service Worker deve cachear
        },
        manifest: {
          name: "LouvorJA",
          short_name: "LouvorJA",
          description: "Software de músicas para Louvor e Adoração",
          start_url: env.VITE_BASE_URL ?? "/",
          display: "standalone",
          background_color: "#000000",
          theme_color: "#000000",
          icons: [
            {
              src: (env.VITE_BASE_URL ?? "/") + "ico/favicon-16x16.png",
              sizes: "16x16",
              type: "image/png",
            },
            {
              src: (env.VITE_BASE_URL ?? "/") + "ico/favicon-32x32.png",
              sizes: "32x32",
              type: "image/png",
            },
            {
              src: (env.VITE_BASE_URL ?? "/") + "ico/favicon-144x144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: (env.VITE_BASE_URL ?? "/") + "ico/favicon-152x152.png",
              sizes: "152x152",
              type: "image/png",
            },
            {
              src: (env.VITE_BASE_URL ?? "/") + "ico/favicon-180x180.png",
              sizes: "180x180",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    define: {
      "process.env": {},
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
