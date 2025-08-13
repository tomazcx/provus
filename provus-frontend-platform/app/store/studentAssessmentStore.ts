import { useApplicationsStore } from "./applicationsStore";
import { useExamBankStore } from "./assessmentBankStore";
import type { IAplicacao } from "~/types/IAplicacao";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { ISubmissao } from "~/types/ISubmissao";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";

import type {
  IRespostaDiscursiva,
  IRespostaObjetiva,
  IRespostaMultiplaEscolha,
} from "~/types/IQuestao";

type TAnswerData =
  | IRespostaDiscursiva["dados"]
  | IRespostaObjetiva["dados"]
  | IRespostaMultiplaEscolha["dados"];

export const useStudentAssessmentStore = defineStore("studentExam", () => {
  const application = ref<IAplicacao | null>(null);
  const assessment = ref<IAvaliacaoImpl | null>(null);
  const currentSubmission = ref<ISubmissao | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function findApplicationByCode(
    code: string
  ): Promise<IAplicacao | null> {
    isLoading.value = true;
    error.value = null;

    const applicationsStore = useApplicationsStore();
    await applicationsStore.fetchItems();

    const foundApplication = applicationsStore.applications.find(
      (app) => app.codigoDeAcesso === code
    );

    if (!foundApplication) {
      error.value = "Código da avaliação inválido ou não encontrado.";
      isLoading.value = false;
      return null;
    }

    const validStates = [
      EstadoAplicacaoEnum.CRIADA,
      EstadoAplicacaoEnum.EM_ANDAMENTO,
    ];
    if (!validStates.includes(foundApplication.estado)) {
      error.value =
        "Esta avaliação não está disponível no momento. Verifique com seu professor.";
      isLoading.value = false;
      return null;
    }

    isLoading.value = false;
    return foundApplication;
  }

  async function fetchExamByCode(code: string) {
    isLoading.value = true;
    error.value = null;
    application.value = null;
    assessment.value = null;

    const foundApplication = await findApplicationByCode(code);

    if (!foundApplication) {
      isLoading.value = false;
      return;
    }

    application.value = foundApplication;

    const examBankStore = useExamBankStore();
    await examBankStore.fetchItems();

    const foundAssessment = examBankStore.getItemById(
      foundApplication.avaliacaoModeloId
    );

    if (!foundAssessment) {
      error.value = "A avaliação vinculada a este código não foi encontrada.";
      isLoading.value = false;
      return;
    }

    assessment.value = foundAssessment;
    isLoading.value = false;
  }

  function submitExam(
    respostas: Record<number, TAnswerData | undefined>,
    studentInfo: { name: string; email: string }
  ) {
    if (!assessment.value || !application.value) {
      error.value =
        "Não foi possível enviar a avaliação. Dados não encontrados.";
      return false;
    }

    let calculatedScore = 0;

    assessment.value.questoes.forEach((q) => {
      const respostaAluno = respostas[q.id!];
      if (!respostaAluno) return;

      if (
        q.tipo === TipoQuestaoEnum.OBJETIVA &&
        "alternativaId" in respostaAluno
      ) {
        const alternativaCorreta = q.alternativas?.find((alt) => alt.isCorreto);
        if (
          alternativaCorreta &&
          respostaAluno.alternativaId === alternativaCorreta.id
        ) {
          calculatedScore += q.pontuacao ?? 0;
        }
      } else if (
        (q.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA ||
          q.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO) &&
        "alternativasId" in respostaAluno
      ) {
        const idsCorretos = new Set(
          (
            q.alternativas
              ?.filter((alt) => alt.isCorreto)
              .map((alt) => alt.id) ?? []
          ).filter((id): id is number => typeof id === "number")
        );
        const idsAluno = new Set(respostaAluno.alternativasId);

        if (
          idsCorretos.size === idsAluno.size &&
          [...idsCorretos].every((id) => idsAluno.has(id))
        ) {
          calculatedScore += q.pontuacao ?? 0;
        }
      }
    });

    currentSubmission.value = {
      id: Date.now(),
      pontuacaoTotal: calculatedScore,
      estado: EstadoSubmissaoEnum.ENVIADA,
      finalizadoEm: new Date().toISOString(),
      aluno: {
        id: Date.now() + 1,
        nome: studentInfo.name,
        email: studentInfo.email,
      },
      questoesRespondidas: [],
    };

    return true;
  }

  return {
    application,
    assessment,
    currentSubmission,
    isLoading,
    error,
    findApplicationByCode,
    fetchExamByCode,
    submitExam,
  };
});
