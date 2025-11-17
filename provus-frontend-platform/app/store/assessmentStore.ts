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
import type { CreateAiQuestaoDto } from "~/types/api/request/Questao.request";
import type { GeneratedQuestaoDto } from "~/types/api/response/Questao.response";
import type { GenerateQuestaoFromFileRequestDto } from "~/types/api/request/GenerateQuestaoFromFile.request";
import type { RegraGeracaoIaEntity } from "~/types/entities/Configuracoes.entity";

interface TemaForm {
  assunto: string;
  quantidade: number;
  tipo: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
}

function mapEntityToRequest(entity: AvaliacaoEntity): CreateAvaliacaoRequest {
  return {
    titulo: entity.titulo,
    descricao: entity.descricao,
    isModelo: entity.isModelo,
    paiId: entity.paiId ?? undefined,
    questoes: entity.questoes.map((q, index) => {
      const payload: CreateQuestaoAvaliacaoRequest = {
        questaoId: undefined,
        ordem: index + 1,
        pontuacao: q.pontuacao,
        titulo: q.titulo,
        descricao: q.descricao,
        tipoQuestao: q.tipoQuestao,
        dificuldade: q.dificuldade,
        exemploRespostaIa: q.exemploRespostaIa,
        textoRevisao: q.textoRevisao,
        alternativas: [],
      };

      if (q.tipoQuestao !== TipoQuestaoEnum.DISCURSIVA) {
        payload.alternativas = q.alternativas.map((alt) => ({
          descricao: alt.descricao,
          isCorreto: alt.isCorreto,
        }));
      }

      if (!payload.alternativas) {
        payload.alternativas = [];
      }

      return payload;
    }),
    arquivos: entity.arquivos.map((a) => ({
      arquivoId: a.arquivo.id,
      permitirConsultaPorEstudante: a.permitirConsultaPorEstudante,
    })),
    configuracoesAvaliacao: {
      configuracoesGerais: {
        ...entity.configuracao.configuracoesGerais,
        permitirRevisao:
          entity.configuracao.configuracoesGerais.permitirRevisao ?? false,
        permitirMultiplosEnvios:
          entity.configuracao.configuracoesGerais.permitirMultiplosEnvios ??
          false,
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
    } catch (e) {
      console.log(e);
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

  async function generateQuestionsByTopic(regra: TemaForm) {
    console.log('oi???')
    if (!assessmentState.value) return;

    isSaving.value = true;

    try {
      const payload: CreateAiQuestaoDto = {
        assunto: regra.assunto,
        dificuldade: regra.dificuldade,
        tipoQuestao: regra.tipo,
        quantidade: regra.quantidade,
      };

      const generatedQuestions = await $api<GeneratedQuestaoDto[]>(
        "/backoffice/questao/generate-by-ai",
        {
          method: "POST",
          body: payload,
        }
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("A I.A. não retornou nenhuma questão.");
      }

      const novasQuestoes: QuestaoEntity[] = generatedQuestions.map(
        (genQuestao) => {
          return {
            id: Date.now() + Math.random(),
            titulo: genQuestao.titulo,
            descricao: genQuestao.descricao,
            dificuldade: genQuestao.dificuldade,
            tipoQuestao: regra.tipo,
            pontuacao: regra.pontuacao,
            isModelo: false,
            tipo: TipoItemEnum.QUESTAO,
            paiId: assessmentState.value?.paiId ?? null,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            exemploRespostaIa: genQuestao.exemplo_resposta || "",
            textoRevisao: "",
            alternativas: (genQuestao.alternativas || []).map((alt) => ({
              id: Date.now() + Math.random(),
              descricao: alt.descricao,
              isCorreto: alt.isCorreto,
            })),
          };
        }
      );

      assessmentState.value.questoes.push(...novasQuestoes);

      toast.add({
        title: `${novasQuestoes.length} questão(ões) gerada(s) por I.A.`,
        color: "secondary",
        icon: "i-lucide-wand-2",
      });
    } catch {
      toast.add({
        title: "Erro da I.A.",
        description: "Não foi possível gerar as questões.",
        color: "error",
      });
    } finally {
      isSaving.value = false;
    }
  }

  async function generateQuestionsByFile(regras: RegraGeracaoIaEntity[]) {
    if (!assessmentState.value) return;
    isSaving.value = true;

    const allGeneratedQuestions: QuestaoEntity[] = [];

    try {
      for (const rule of regras) {
        if (rule.materiaisAnexadosIds.length === 0) {
          toast.add({
            title: "Regra Ignorada",
            description:
              "Uma regra de geração por material foi ignorada por não ter materiais selecionados.",
            color: "warning",
          });
          continue;
        }

        const payload: GenerateQuestaoFromFileRequestDto = {
          arquivoIds: rule.materiaisAnexadosIds,
          assunto: rule.assunto || undefined,
          dificuldade: rule.dificuldade,
          tipoQuestao: rule.tipo,
          quantidade: rule.quantidade,
        };

        const generatedQuestions = await $api<GeneratedQuestaoDto[]>(
          "/backoffice/questao/generate-by-ai/gerar-por-arquivo",
          {
            method: "POST",
            body: payload,
          }
        );

        if (!generatedQuestions || generatedQuestions.length === 0) {
          throw new Error("A I.A. não retornou nenhuma questão para a regra.");
        }

        const novasQuestoes: QuestaoEntity[] = generatedQuestions.map(
          (genQuestao) => ({
            id: Date.now() + Math.random(),
            titulo: genQuestao.titulo,
            descricao: genQuestao.descricao,
            dificuldade: genQuestao.dificuldade,
            tipoQuestao: rule.tipo,
            pontuacao: rule.pontuacao,
            isModelo: false,
            tipo: TipoItemEnum.QUESTAO,
            paiId: assessmentState.value?.paiId ?? null,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            exemploRespostaIa: genQuestao.exemplo_resposta || "",
            textoRevisao: "",
            alternativas: (genQuestao.alternativas || []).map((alt) => ({
              id: Date.now() + Math.random(),
              descricao: alt.descricao,
              isCorreto: alt.isCorreto,
            })),
          })
        );

        allGeneratedQuestions.push(...novasQuestoes);
      }

      assessmentState.value.questoes.push(...allGeneratedQuestions);

      if (allGeneratedQuestions.length > 0) {
        toast.add({
          title: `${allGeneratedQuestions.length} questão(ões) gerada(s) por I.A.`,
          color: "secondary",
          icon: "i-lucide-wand-2",
        });
      }
    } catch {
      console.error("Erro ao gerar questões por I.A. (Material):");
      toast.add({
        title: "Erro da I.A.",
        description: "Não foi possível gerar as questões.",
        color: "error",
      });
    } finally {
      isSaving.value = false;
    }
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
    generateQuestionsByTopic,
    generateQuestionsByFile,
  };
});
