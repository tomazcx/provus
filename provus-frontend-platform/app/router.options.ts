import type { RouterConfig } from "@nuxt/schema";

export default {
  routes: (_routes) => [
    {
      name: "auth",
      path: "/auth",
      component: () => import("~/pages/Auth/index.vue"),
      meta: { layout: false },
    },

    {
      name: "avaliador-home",
      path: "/home",
      component: () => import("~/pages/Avaliador/Dashboard/index.vue"),
    },

    {
      name: "avaliador-avaliacao-editor",
      path: "/avaliacao/editor/:id?",
      component: () => import("~/pages/Avaliador/Avaliacao/Editor/[[id]].vue"),
      meta: {
        layout: "assessment-editor",
      },
    },

    {
      name: "banco-de-questoes",
      path: "/banco-de-questoes",
      component: () => import("~/pages/Avaliador/Banco-de-questoes/index.vue"),
    },

    {
      name: "banco-de-questoes-folderPath",
      path: "/banco-de-questoes/:folderPath(.*)*",
      component: () => import("~/pages/Avaliador/Banco-de-questoes/index.vue"),
    },

    {
      path: "/",
      redirect: "/avaliacao/editor/",
    },
  ],
} satisfies RouterConfig;
