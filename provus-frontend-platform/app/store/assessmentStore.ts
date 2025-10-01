import { defineStore } from "pinia";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { QuestaoEntity } from "~/types/entities/Questao.entity";
import type {
  CreateAvaliacaoRequest,
  CreateQuestaoAvaliacaoRequest,
} from "~/types/api/request/Avaliacao.request";
import type { AvaliacaoApiResponse } from "~/types/api/response/Avaliacao.response";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import TipoItemEnum from "~/enums/TipoItemEnum";
import { mapAvaliacaoApiResponseToEntity } from "~/mappers/assessment.mapper";

function mapEntityToRequest(entity: AvaliacaoEntity): CreateAvaliacaoRequest {
  return {
    titulo: entity.titulo,
    descricao: entity.descricao,
    isModelo: entity.isModelo,
    paiId: entity.paiId ?? undefined,
    questoes: entity.questoes.map((q, index) => {
      const isNewQuestion = q.id > 1000000000;

      if (isNewQuestion) {
        const payload: CreateQuestaoAvaliacaoRequest = {
          ordem: index + 1,
          pontuacao: q.pontuacao,
          titulo: q.titulo,
          descricao: q.descricao,
          tipoQuestao: q.tipoQuestao,
          dificuldade: q.dificuldade,
          exemploRespostaIa: q.exemploRespostaIa,
          textoRevisao: q.textoRevisao,
        };

        if (q.tipoQuestao !== TipoQuestaoEnum.DISCURSIVA) {
          payload.alternativas = q.alternativas.map((alt) => ({
            descricao: alt.descricao,
            isCorreto: alt.isCorreto,
          }));
        }

        return payload;
      } else {
        return {
          questaoId: q.id,
          ordem: index + 1,
          pontuacao: q.pontuacao,
        };
      }
    }),
    arquivos: entity.arquivos.map((a) => ({
      arquivoId: a.arquivo.id,
      permitirConsultaPorEstudante: a.permitirConsultaPorEstudante,
    })),
    configuracoesAvaliacao: {
      configuracoesGerais: {
        ...entity.configuracao.configuracoesGerais,
        dataAgendamento: entity.configuracao.configuracoesGerais.dataAgendamento
          ? entity.configuracao.configuracoesGerais.dataAgendamento.toISOString()
          : null,
        configuracoesRandomizacao:
          entity.configuracao.configuracoesGerais.configuracoesRandomizacao.map(
            (rule) => ({
              tipo: rule.tipo,
              dificuldade: rule.dificuldade,
              quantidade: rule.quantidade,
              questoes: rule.questoes.map((q) => q.id),
            })
          ),
      },
      configuracoesSeguranca: {
        ...entity.configuracao.configuracoesSeguranca,
      },
    },
  };
}

export const getBlankAssessment = (): AvaliacaoEntity => ({
  id: 0,
  titulo: "",
  pontuacao: 0,
  descricao: "",
  isModelo: true,
  tipo: TipoItemEnum.AVALIACAO,
  paiId: null,
  criadoEm: new Date().toISOString(),
  atualizadoEm: new Date().toISOString(),
  questoes: [],
  arquivos: [],
  configuracao: {
    configuracoesGerais: {
      tempoMaximo: 120,
      tempoMinimo: 0,
      tipoAplicacao: TipoAplicacaoEnum.MANUAL,
      dataAgendamento: null,
      mostrarPontuacao: true,
      permitirRevisao: false,
      permitirMultiplosEnvios: false,
      exibirPontuacaoQuestoes: true,
      configuracoesRandomizacao: [],
    },
    configuracoesSeguranca: {
      proibirTrocarAbas: false,
      proibirPrintScreen: false,
      proibirCopiarColar: false,
      proibirDevtools: false,
      quantidadeTentativas: 1,
      quantidadeAcessosSimultaneos: 1,
      ativarControleIp: false,
      duracaoAlertas: 5,
      permitirFecharAlertas: true,
      ativarCorrecaoDiscursivaViaIa: false,
      punicoes: [],
      ipsPermitidos: [],
      notificacoes: [],
    },
  },
});

export const useAssessmentStore = defineStore("assessment", () => {
  const { $api } = useNuxtApp();
  const toast = useToast();
  const router = useRouter();

  const assessmentState = ref<AvaliacaoEntity | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isSettingsDialogOpen = ref(false);

  const assessment = computed(() => {
    if (!assessmentState.value) return null;
    const calculatedPoints = (assessmentState.value.questoes || []).reduce(
      (sum, q) => sum + (Number(q.pontuacao) || 0),
      0
    );
    return { ...assessmentState.value, pontuacao: calculatedPoints };
  });

  function createNew(paiId: number | null = null) {
    const blankAssessment = getBlankAssessment();
    if (paiId) {
      blankAssessment.paiId = paiId;
    }
    assessmentState.value = blankAssessment;
  }

  function loadFromModelo(modelo: AvaliacaoEntity) {
    const modelCopy = JSON.parse(JSON.stringify(modelo));
    if (modelCopy.configuracao?.configuracoesGerais?.dataAgendamento) {
      modelCopy.configuracao.configuracoesGerais.dataAgendamento = new Date(
        modelCopy.configuracao.configuracoesGerais.dataAgendamento
      );
    }
    assessmentState.value = modelCopy;
  }

  async function fetchAssessmentForEdit(id: number) {
    isLoading.value = true;
    try {
      const response = await $api<AvaliacaoApiResponse>(
        `/backoffice/avaliacao/${id}`
      );
      assessmentState.value = mapAvaliacaoApiResponseToEntity(response);
    } catch {
      toast.add({
        title: "Erro ao carregar avaliação",
        color: "error",
        icon: "i-lucide-alert-triangle",
      });
      router.push("/banco-de-avaliacoes");
    } finally {
      isLoading.value = false;
    }
  }

  async function saveOrUpdateAssessment(): Promise<AvaliacaoEntity | null> {
    if (!assessmentState.value) return null;

    if (
      assessmentState.value.configuracao.configuracoesSeguranca
        .ativarCorrecaoDiscursivaViaIa
    ) {
      for (const [index, questao] of assessmentState.value.questoes.entries()) {
        if (
          questao.tipoQuestao === TipoQuestaoEnum.DISCURSIVA &&
          !questao.exemploRespostaIa?.trim()
        ) {
          toast.add({
            title: "Campo Obrigatório",
            description: `A questão #${index + 1} ("${
              questao.titulo || "sem título"
            }") é discursiva e precisa de um "Modelo de Resposta para I.A." preenchido.`,
            color: "error",
            icon: "i-lucide-alert-triangle",
          });
          return null;
        }
      }
    }

    isSaving.value = true;
    try {
      const payload = mapEntityToRequest(assessmentState.value);
      let savedAssessment: AvaliacaoApiResponse;

      if (assessmentState.value.id && assessmentState.value.id !== 0) {
        savedAssessment = await $api<AvaliacaoApiResponse>(
          `/backoffice/avaliacao/${assessmentState.value.id}`,
          {
            method: "PUT",
            body: payload,
          }
        );
        toast.add({
          title: "Avaliação atualizada com sucesso!",
          color: "secondary",
        });
      } else {
        savedAssessment = await $api<AvaliacaoApiResponse>(
          "/backoffice/avaliacao",
          {
            method: "POST",
            body: payload,
          }
        );
        toast.add({
          title: "Avaliação criada com sucesso!",
          color: "secondary",
        });
      }

      const newEntity = mapAvaliacaoApiResponseToEntity(savedAssessment);
      assessmentState.value = newEntity;
      return newEntity;
    } catch (error: unknown) {
      console.log(error);
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data === "object" &&
        (error as { data?: { message?: string } }).data !== null &&
        "message" in (error as { data?: { message?: string } }).data!
      ) {
        errorMessage =
          (
            (error as { data?: { message?: string } }).data as {
              message?: string;
            }
          ).message ?? "Ocorreu um erro desconhecido.";
      }
      toast.add({
        title: "Erro ao salvar a avaliação",
        description: errorMessage,
        color: "error",
        icon: "i-lucide-alert-triangle",
      });
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  function addQuestion() {
    if (!assessmentState.value) return;
    const newQuestion: QuestaoEntity = {
      id: Date.now(),
      titulo: "",
      tipo: TipoItemEnum.QUESTAO,
      paiId: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      descricao: "",
      pontuacao: 1,
      dificuldade: DificuldadeQuestaoEnum.FACIL,
      tipoQuestao: TipoQuestaoEnum.OBJETIVA,
      isModelo: true,
      alternativas: [{ id: Date.now() + 1, descricao: "", isCorreto: true }],
      exemploRespostaIa: "",
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

  function addQuestionsFromBank(questions: QuestaoEntity[]) {
    if (!assessmentState.value) return;
    assessmentState.value.questoes.push(...questions);
  }

  function openSettingsDialog() {
    isSettingsDialogOpen.value = true;
  }

  function updateSettings(newSettings: AvaliacaoEntity) {
    if (!assessmentState.value) return;
    assessmentState.value.configuracao = newSettings.configuracao;
  }

  return {
    assessment,
    assessmentState,
    isLoading,
    isSaving,
    isSettingsDialogOpen,
    openSettingsDialog,
    createNew,
    loadFromModelo,
    fetchAssessmentForEdit,
    saveOrUpdateAssessment,
    addQuestion,
    removeQuestion,
    addQuestionsFromBank,
    updateSettings,
  };
});
