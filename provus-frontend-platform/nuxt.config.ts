// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Provus",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
      ],
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
  ],
  components: [
    // { path: "~/components/ui", pathPrefix: false },
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  ui: {
    colorMode: false,
    fonts: false,
    theme: {
      colors: [
        "primary",
        "error",
        "white",
        "black",
        "secondary",
        "gray",
        "success",
        "warning",
        "info",
        "primary-light",
        "primary-dark",
        "secondary-light",
        "secondary-dark",
      ],
    },
  },
  runtimeConfig: {
    public: {
      provusApiUrl: process.env.PROVUS_API_URL,
    },
  },
});
