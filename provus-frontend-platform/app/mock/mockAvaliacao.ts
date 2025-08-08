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
  path: "/2025/1º Semestre/",
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
