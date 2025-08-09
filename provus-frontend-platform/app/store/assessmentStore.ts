import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import type { IQuestao, IAlternativa } from "~/types/IQuestao";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type { IRegraGeracaoIA } from "~/types/IConfiguracoesAvaliacoes";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";

type SaveAction = { key: string; timestamp: number };

const getBlankAssessment = (): IAvaliacaoImpl => ({
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
    tipoRandomizacao: TipoRandomizacaoEnum.SIMPLES,
    poolSelecaoBanco: {
      pastas: [],
      questoes: [],
    },
    regrasRandomizacaoConfiguravel: [],
    tipoAplicacao: TipoAplicacaoEnum.MANUAL,
    dataAgendada: null,
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
});

export const useAssessmentStore = defineStore("assessment", () => {
  const assessmentState = ref<IAvaliacaoImpl | null>(null);

  const assessment = computed(() => {
    if (!assessmentState.value) return null;
    const calculatedPoints = assessmentState.value.questoes.reduce(
      (sum, q) => sum + (Number(q.pontuacao) || 0),
      0
    );
    return { ...assessmentState.value, pontuacao: calculatedPoints };
  });

  function createNew() {
    assessmentState.value = getBlankAssessment();
  }

  function loadFromModelo(modelo: IAvaliacaoImpl) {
    assessmentState.value = JSON.parse(JSON.stringify(modelo));
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

  function updateSettings(newSettings: Partial<IAvaliacaoImpl>) {
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

  const isSettingsDialogOpen = ref(false);

  function openSettingsDialog() {
    isSettingsDialogOpen.value = true;
  }

  function closeSettingsDialog() {
    isSettingsDialogOpen.value = false;
  }

  const saveEvent = ref<SaveAction | null>(null);

  function triggerSave(action: { key: string }) {
    saveEvent.value = { ...action, timestamp: Date.now() };
  }

  function clearSaveEvent() {
    saveEvent.value = null;
  }

  function generateAndAddQuestions(regras: IRegraGeracaoIA[]) {
    if (!assessmentState.value) return;

    const novasQuestoes: IQuestao[] = [];
    regras.forEach((rule) => {
      for (let i = 0; i < rule.quantidade; i++) {
        const newQuestion: IQuestao = {
          id: Date.now() + Math.random(),
          titulo: `Questão (I.A.) - Tipo: ${rule.tipo}`,
          descricao: `Gerada com base em ${rule.materiaisAnexadosIds.length} materiais.`,
          pontuacao: rule.pontuacao,
          dificuldade: rule.dificuldade,
          tipo: rule.tipo,
          alternativas:
            rule.tipo !== TipoQuestaoEnum.DISCURSIVA ? [] : undefined,
        };
        novasQuestoes.push(newQuestion);
      }
    });

    assessmentState.value.questoes.push(...novasQuestoes);
  }

  return {
    assessment,
    createNew,
    assessmentState,
    addQuestion,
    removeQuestion,
    addQuestionsFromBank,
    updateSettings,
    isSettingsDialogOpen,
    openSettingsDialog,
    closeSettingsDialog,
    saveEvent,
    triggerSave,
    clearSaveEvent,
    loadFromModelo,
    generateAndAddQuestions,
  };
});
