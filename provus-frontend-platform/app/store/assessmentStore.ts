import type { AvaliacaoImpl } from "~/types/IAvaliacao";
import type { IQuestao, IAlternativa } from "~/types/IQuestao";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

const getBlankAssessment = (): AvaliacaoImpl => ({
  titulo: "Nova Avaliação",
  duracao: "120",
  pontuacao: 100,
  descricao: "",
  isModelo: false,
  dataAgendamento: "",
  questoes: [],
  configuracoes: {
    dataDeAplicacao: "",
    dataDeEncerramento: "",
    mostrarPontuacao: true,
    mostrarRespostas: true,
    permitirMultiplosEnvios: false,
    autocorrecaoIa: true,
    numeroMaximoDeEnvios: 1,
    embaralharQuestoes: true,
    embaralharAlternativas: true,
    tempoMaximo: 120,
    tempoMinimo: 30,

    randomizacaoSimples: false,
    randomizacaoBancoSimples: false,
    randomizacaoBancoConfiguravel: false,
    poolSelecaoBanco: {
      pastas: [],
      questoes: [],
    },
    regrasRandomizacaoConfiguravel: [],
    aplicacaoManual: false,
    aplicacaoAgendada: false,
    dataAgendada: null,

    exibirPontuacaDaSubmissao: false,
    permitirRevisao: false,
    exibirPontuacaoQuestoes: false,
  },
});

export const useAssessmentStore = defineStore("assessment", () => {
  const assessment = ref<AvaliacaoImpl | null>(null);

  const totalPoints = computed(() => {
    if (!assessment.value) return 0;
    return assessment.value.questoes.reduce(
      (sum, q) => sum + (Number(q.pontuacao) || 0),
      0
    );
  });

  function createNew() {
    assessment.value = getBlankAssessment();
  }

  async function load(assessmentId: string | number) {
    console.log(`Lógica para buscar a avaliação ${assessmentId} da API`);
    createNew();
  }

  function addQuestion() {
    if (!assessment.value) return;
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
    assessment.value.questoes.push(newQuestion);
  }

  function removeQuestion(questionId: number) {
    if (!assessment.value) return;
    const index = assessment.value.questoes.findIndex(
      (q) => q.id === questionId
    );
    if (index !== -1) {
      assessment.value.questoes.splice(index, 1);
    }
  }

  function addQuestionsFromBank(questions: IQuestao[]) {
    if (!assessment.value) return;

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

    assessment.value.questoes.push(...questionCopies);
  }

  function updateSettings(newSettings: Partial<AvaliacaoImpl>) {
    if (!assessment.value) return;

    assessment.value.titulo = newSettings.titulo ?? assessment.value.titulo;
    assessment.value.descricao =
      newSettings.descricao ?? assessment.value.descricao;
    assessment.value.duracao = newSettings.duracao ?? assessment.value.duracao;
    assessment.value.pontuacao =
      newSettings.pontuacao ?? assessment.value.pontuacao;
    if (newSettings.configuracoes) {
      Object.assign(assessment.value.configuracoes, newSettings.configuracoes);
    }
  }

  return {
    assessment,
    totalPoints,
    createNew,
    load,
    addQuestion,
    removeQuestion,
    addQuestionsFromBank,
    updateSettings,
  };
});
