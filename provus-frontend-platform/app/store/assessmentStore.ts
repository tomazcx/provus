import type { AvaliacaoImpl } from "~/types/IAvaliacao";
import type { IQuestao, IAlternativa } from "~/types/IQuestao";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";

const getBlankAssessment = (): AvaliacaoImpl => ({
  titulo: "",
  pontuacao: 0,
  descricao: "",
  isModelo: false,
  questoes: [],
  configuracoes: {
    autocorrecaoIa: false,
    numeroMaximoDeEnvios: 1,
    tempoMaximo: 120,
    tempoMinimo: 30,
    tipoRandomizacao: null,
    regrasRandomizacaoConfiguravel: [],
    tipoAplicacao: null,
    dataAgendada: null,
    poolSelecaoBanco: {
      pastas: [],
      questoes: [], 
    },

    exibirPontuacaDaSubmissao: false,
    permitirRevisao: false,
    exibirPontuacaoQuestoes: false,
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
  },
});

export const useAssessmentStore = defineStore("assessment", () => {
  const assessmentState = ref<AvaliacaoImpl | null>(null);

  const assessment = computed(() => {
    if (!assessmentState.value) {
      return null;
    }

    const calculatedPoints = assessmentState.value.questoes.reduce(
      (sum, q) => sum + (Number(q.pontuacao) || 0),
      0
    );

    return {
      ...assessmentState.value,
      pontuacao: calculatedPoints,
    };
  });

  function createNew() {
    assessmentState.value = getBlankAssessment();
  }

  async function load(assessmentId: string | number) {
    console.log(`Lógica para buscar a avaliação ${assessmentId} da API`);
    createNew();
  }

  function addQuestion() {
    if (!assessmentState.value) return;
    const newQuestion: IQuestao = {
      id: Date.now(),
      titulo: "",
      descricao: "",
      pontuacao: 1,
      dificuldade: DificuldadeQuestaoEnum.FACIL,
      tipo: TipoQuestaoEnum.OBJETIVA,
      alternativas: [{ id: Date.now() + 1, descricao: "", isCorreto: true }],
      exemploDeResposta: "",
      textoRevisao: "",
    };
    assessmentState.value.questoes.push(newQuestion);
  }

  function removeQuestion(questionId: number) {
    if (!assessmentState.value) return;
    const index = assessmentState.value.questoes.findIndex(
      (q) => q.id === questionId
    );
    if (index !== -1) {
      assessmentState.value.questoes.splice(index, 1);
    }
  }

  function addQuestionsFromBank(questions: IQuestao[]) {
    if (!assessmentState.value) return;

    const questionCopies = questions.map((originalQuestion, index) => {
      const newQuestion = JSON.parse(JSON.stringify(originalQuestion));
      newQuestion.id = Date.now() + index;
      if (newQuestion.alternativas) {
        newQuestion.alternativas.forEach(
          (alt: IAlternativa, altIndex: number) => {
            alt.id = Date.now() + index + altIndex + 1;
          }
        );
      }
      return newQuestion;
    });

    assessmentState.value.questoes.push(...questionCopies);
  }

  function updateSettings(newSettings: Partial<AvaliacaoImpl>) {
    if (!assessmentState.value) return;

    assessmentState.value.titulo =
      newSettings.titulo ?? assessmentState.value.titulo;
    assessmentState.value.descricao =
      newSettings.descricao ?? assessmentState.value.descricao;

    if (newSettings.configuracoes) {
      Object.assign(
        assessmentState.value.configuracoes,
        newSettings.configuracoes
      );
    }
  }

  return {
    assessment,
    createNew,
    load,
    addQuestion,
    removeQuestion,
    addQuestionsFromBank,
    updateSettings,
  };
});
