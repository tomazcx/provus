import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import TipoArquivoEnum from "~/enums/TipoArquivoEnum";
import TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";

export const mockAvaliacao: IAvaliacaoImpl = {
  id: 101,
  titulo: "Avaliação de História do Brasil",
  path: "/",
  criadoEm: "2025-08-01T10:00:00Z",
  atualizadoEm: "2025-08-05T14:30:00Z",
  pontuacao: 20,
  descricao: "Uma avaliação sobre o período colonial e o império no Brasil.",
  isModelo: true,

  questoes: [
    {
      id: 2001,
      titulo: "Quem foi o primeiro imperador do Brasil?",
      tipo: TipoQuestaoEnum.OBJETIVA,
      dificuldade: DificuldadeQuestaoEnum.FACIL,
      pontuacao: 10,
      alternativas: [
        { id: 3001, descricao: "Dom João VI", isCorreto: false },
        { id: 3002, descricao: "Dom Pedro I", isCorreto: true },
        { id: 3003, descricao: "Dom Pedro II", isCorreto: false },
        { id: 3004, descricao: "Marechal Deodoro", isCorreto: false },
      ],
    },
    {
      id: 2002,
      titulo:
        "Discorra sobre a importância da Lei Áurea para a sociedade brasileira da época.",
      tipo: TipoQuestaoEnum.DISCURSIVA,
      dificuldade: DificuldadeQuestaoEnum.MEDIO,
      pontuacao: 10,
      exemploDeResposta:
        "A Lei Áurea, assinada em 1888 pela Princesa Isabel, foi o diploma legal que extinguiu a escravidão no Brasil...",
    },
  ],

  configuracoes: {
    autocorrecaoIa: true,
    numeroMaximoDeEnvios: 1,
    tempoMaximo: 90,
    tempoMinimo: 15,
    tipoRandomizacao: TipoRandomizacaoEnum.SIMPLES,
    poolSelecaoBanco: {
      pastas: [],
      questoes: [],
    },
    regrasRandomizacaoConfiguravel: [],
    tipoAplicacao: TipoAplicacaoEnum.AGENDADA,
    dataAgendada: new Date("2025-09-15T09:00:00Z"),
    exibirPontuacaDaSubmissao: true,
    permitirRevisao: true,
    exibirPontuacaoQuestoes: true,
    ativarAlertas: true,
    quantidadeDeAlertas: 3,
    duracaoDoAlerta: 10,
    permitirFecharAlerta: true,
    ativarNotificacoes: false,
    tipoNotificacao: null,
    regrasDeSeguranca: {
      [TipoInfracaoEnum.TROCA_ABAS]: {
        ativo: true,
        descricao: "Detecte se o estudante sair da aba da avaliação.",
        regrasDeOcorrencia: [
          {
            id: 1,
            ocorrencias: 1,
            punicoes: [{ id: 11, tipo: TipoPenalidadeEnum.ALERTAR_ESTUDANTE }],
          },
          {
            id: 2,
            ocorrencias: 3,
            punicoes: [
              { id: 12, tipo: TipoPenalidadeEnum.REDUZIR_PONTOS, valor: 10 },
              { id: 13, tipo: TipoPenalidadeEnum.NOTIFICAR_PROFESSOR },
            ],
          },
        ],
      },
      [TipoInfracaoEnum.PRINT_SCREEN]: {
        ativo: false,
        descricao: "Detecte se o estudante tirar um print da tela.",
        regrasDeOcorrencia: [],
      },
      [TipoInfracaoEnum.COPIAR_COLAR]: {
        ativo: true,
        descricao:
          "Detecte se o estudante tentar copiar ou colar algum conteúdo.",
        regrasDeOcorrencia: [
          {
            id: 3,
            ocorrencias: 1,
            punicoes: [{ id: 14, tipo: TipoPenalidadeEnum.ENCERRAR_AVALIACAO }],
          },
        ],
      },
      [TipoInfracaoEnum.DEV_TOOLS]: {
        ativo: false,
        descricao:
          "Detecte se o estudante abrir as ferramentas de desenvolvedor da página.",
        regrasDeOcorrencia: [],
      },
    },
    quantidadeAcessosSimultaneos: 1,
    ativarControleIp: false,
    ipsPermitidos: [],
    permitirConsulta: true,
    materiaisAnexados: {
      pastas: [],
      arquivos: [
        {
          id: 501,
          titulo: "Resumo - Brasil Colônia.pdf",
          tipo: TipoArquivoEnum.PDF,
          url: "/path/to/resumo.pdf",
          tamanhoEmBytes: 1024 * 512,
        },
      ],
    },
  },
};

// Nova constante para o modelo de avaliação de Geografia
export const mockAvaliacaoGeografia: IAvaliacaoImpl = {
  id: 102,
  titulo: "Avaliação de Geografia Agendada",
  path: "/",
  criadoEm: "2025-08-08T11:00:00Z",
  atualizadoEm: "2025-08-08T11:00:00Z",
  pontuacao: 15,
  descricao: "Um teste sobre os biomas brasileiros e relevo.",
  isModelo: true,

  questoes: [
    {
      id: 2003,
      titulo:
        "Qual bioma brasileiro é conhecido por sua vasta planície inundável?",
      tipo: TipoQuestaoEnum.OBJETIVA,
      dificuldade: DificuldadeQuestaoEnum.FACIL,
      pontuacao: 5,
      alternativas: [
        { id: 3005, descricao: "Amazônia", isCorreto: false },
        { id: 3006, descricao: "Cerrado", isCorreto: false },
        { id: 3007, descricao: "Pantanal", isCorreto: true },
        { id: 3008, descricao: "Caatinga", isCorreto: false },
      ],
    },
    {
      id: 2004,
      titulo:
        "Descreva as principais características do bioma da Mata Atlântica.",
      tipo: TipoQuestaoEnum.DISCURSIVA,
      dificuldade: DificuldadeQuestaoEnum.MEDIO,
      pontuacao: 10,
      exemploDeResposta:
        "A Mata Atlântica é uma floresta tropical que se estende pela costa litorânea do Brasil. Caracteriza-se por alta biodiversidade, com grande variedade de espécies de fauna e flora, clima quente e úmido, e um relevo acidentado.",
    },
  ],

  configuracoes: {
    autocorrecaoIa: false,
    numeroMaximoDeEnvios: 1,
    tempoMaximo: 60,
    tempoMinimo: 10,
    tipoRandomizacao: TipoRandomizacaoEnum.SIMPLES,
    poolSelecaoBanco: {
      pastas: [],
      questoes: [],
    },
    regrasRandomizacaoConfiguravel: [],
    tipoAplicacao: TipoAplicacaoEnum.AGENDADA,
    // Data de agendamento corresponde à aplicação
    dataAgendada: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    exibirPontuacaDaSubmissao: true,
    permitirRevisao: false,
    exibirPontuacaoQuestoes: true,
    ativarAlertas: false,
    quantidadeDeAlertas: 0,
    duracaoDoAlerta: 0,
    permitirFecharAlerta: false,
    ativarNotificacoes: false,
    tipoNotificacao: null,
    regrasDeSeguranca: {
      [TipoInfracaoEnum.TROCA_ABAS]: {
        ativo: false,
        descricao: "Detecte se o estudante sair da aba da avaliação.",
        regrasDeOcorrencia: [],
      },
      [TipoInfracaoEnum.PRINT_SCREEN]: {
        ativo: false,
        descricao: "Detecte se o estudante tirar um print da tela.",
        regrasDeOcorrencia: [],
      },
      [TipoInfracaoEnum.COPIAR_COLAR]: {
        ativo: false,
        descricao:
          "Detecte se o estudante tentar copiar ou colar algum conteúdo.",
        regrasDeOcorrencia: [],
      },
      [TipoInfracaoEnum.DEV_TOOLS]: {
        ativo: false,
        descricao:
          "Detecte se o estudante abrir as ferramentas de desenvolvedor da página.",
        regrasDeOcorrencia: [],
      },
    },
    quantidadeAcessosSimultaneos: 1,
    ativarControleIp: false,
    ipsPermitidos: [],
    permitirConsulta: false,
    materiaisAnexados: {
      pastas: [],
      arquivos: [],
    },
  },
};
