// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
  ],
  components: [
    { path: "~/components/ui", pathPrefix: false },
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  ui: {
    colorMode: false,
    fonts: false,
    theme: {
      colors: ["primary", "error"],
    },
  },
  runtimeConfig: {
    public: {
      provusApiUrl: process.env.PROVUS_API_URL,
    },
  },
});
