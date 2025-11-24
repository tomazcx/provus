import type { RouterConfig } from "@nuxt/schema";

export default {
  routes: (_routes) => [
    {
      name: "aluno-entrar",
      path: "/aluno/entrar",
      component: () => import("~/pages/Aluno/Entrar/index.vue"),
      meta: { layout: false },
    },

    {
      name: "aluno-submissao",
      path: "/aluno/submissao/:hash",
      component: () => import("~/pages/Aluno/Avaliacao/[hash].vue"),
      meta: { layout: "assessment-student" },
    },

    {
      name: "aluno-avaliacao-finalizado",
      path: "/aluno/avaliacao/:hash/finalizado",
      component: () => import("~/pages/Aluno/Avaliacao/[hash]/finalizado.vue"),
      meta: { layout: false },
    },

    {
      name: "aluno-avaliacao-revisao",
      path: "/aluno/avaliacao/:hash/revisao",
      component: () => import("~/pages/Aluno/Avaliacao/[hash]/revisao.vue"),
      meta: { layout: "assessment-student" },
    },

    {
      name: "auth",
      path: "/auth",
      component: () => import("~/pages/Auth/index.vue"),
      meta: { layout: false },
    },
    {
      name: "recuperar-senha",
      path: "/auth/recuperar-senha",
      component: () => import("~/pages/Auth/RecuperarSenha.vue"),
      meta: { layout: false },
    },
    {
      name: "recuperar-senha-hash",
      path: "/auth/recuperar-senha/:hash",
      component: () => import("~/pages/Auth/ResetarSenha/[[hash]].vue"),
      meta: { layout: false },
    },

    {
      name: "confirmar-email",
      path: "/confirmar-email/:hash",
      component: () => import("~/pages/Auth/ConfirmarEmail.vue"),
      meta: { layout: false },
    },

    {
      name: "avaliador-home",
      path: "/home",
      component: () => import("~/pages/Avaliador/Dashboard/index.vue"),
    },

    {
      name: "avaliador-perfil",
      path: "/perfil",
      component: () => import("~/pages/Avaliador/Perfil/index.vue"),
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
      name: "banco-de-materiais",
      path: "/banco-de-materiais",
      component: () => import("~/pages/Avaliador/Banco-de-materiais/index.vue"),
    },

    {
      name: "banco-de-materiais-folderPath",
      path: "/banco-de-materiais/:folderPath(.*)*",
      component: () => import("~/pages/Avaliador/Banco-de-materiais/index.vue"),
    },

    {
      name: "banco-de-avaliacoes",
      path: "/banco-de-avaliacoes",
      component: () =>
        import("~/pages/Avaliador/Banco-de-avaliacoes/index.vue"),
    },

    {
      name: "banco-de-avaliacoes-folderPath",
      path: "/banco-de-avaliacoes/:folderPath(.*)*",
      component: () =>
        import("~/pages/Avaliador/Banco-de-avaliacoes/index.vue"),
    },

    {
      name: "aplicacoes",
      path: "/aplicacoes",
      component: () => import("~/pages/Avaliador/Aplicacoes/index.vue"),
    },

    {
      name: "aplicacoes-aplicacao",
      path: "/aplicacoes/aplicacao/:id",
      component: () =>
        import("~/pages/Avaliador/Aplicacoes/Aplicacao/[id].vue"),
    },

    {
      name: "aplicacoes-aplicacao-resultados",
      path: "/aplicacoes/aplicacao/:id/resultados",
      component: () =>
        import("~/pages/Avaliador/Aplicacoes/Aplicacao/[id]/Resultados.vue"),
    },

    {
      name: "aplicacoes-aplicacao-resultados-submissao",
      path: "/aplicacoes/aplicacao/:id/resultados/:submissionId",
      component: () =>
        import(
          "~/pages/Avaliador/Aplicacoes/Aplicacao/[id]/Resultados/[submissionId].vue"
        ),
    },

    {
      name: "aplicacoes-aplicacao-monitoramento",
      path: "/aplicacoes/aplicacao/:id/monitoramento",
      component: () =>
        import("~/pages/Avaliador/Aplicacoes/Aplicacao/[id]/Monitoramento.vue"),
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
      path: "/",
      redirect: "/banco-de-questoes",
    },
  ],
} satisfies RouterConfig;
