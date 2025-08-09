import { useApplicationsStore } from "./applicationsStore";
import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import TipoAtividadeEnum from "~/enums/TipoAtividadeEnum";
import type { IProgressoAluno, ILogAtividade } from "~/types/IMonitoring";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";

let simulationInterval: NodeJS.Timeout | null = null;

const ACTION_PROBABILITIES: Record<
  "ANSWER_QUESTION" | "SWITCH_TAB" | "PAUSE" | "RESUME" | "FINISH" | "ABANDON",
  number
> = {
  ANSWER_QUESTION: 0.25,
  SWITCH_TAB: 0.05,
  PAUSE: 0.02,
  RESUME: 0,
  FINISH: 0,
  ABANDON: 0,
};

export const useMonitoringStore = defineStore("monitoring", () => {
  const studentProgress = ref<IProgressoAluno[]>([]);
  const activityFeed = ref<ILogAtividade[]>([]);
  const isLoading = ref(false);

  function addActivityLog(
    tipo: TipoAtividadeEnum,
    alunoNome: string,
    descricao: string
  ) {
    activityFeed.value.unshift({
      id: Date.now() + Math.random(),
      tipo,
      alunoNome,
      descricao,
      timestamp: new Date().toISOString(),
    });
  }

  async function fetchMonitoringData(applicationId: number) {
    isLoading.value = true;
    studentProgress.value = [];
    activityFeed.value = [];

    try {
      const { mockMonitoringResponse } = await import(
        "~/mock/mockMonitoringResponse"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (mockMonitoringResponse.applicationId === applicationId) {
        studentProgress.value = mockMonitoringResponse.progressoAlunos;
        activityFeed.value = mockMonitoringResponse.atividades;
      }
    } catch (error) {
      console.error("Erro ao buscar dados de monitoramento:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function stopSimulation() {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  }

  function startSimulation() {
    stopSimulation();

    const applicationsStore = useApplicationsStore();

    simulationInterval = setInterval(() => {
      const aplicacao = applicationsStore.getApplicationById(1);
      if (!aplicacao || aplicacao.estado !== EstadoAplicacaoEnum.EM_ANDAMENTO) {
        return;
      }

      studentProgress.value.forEach((aluno) => {
        if (
          aluno.estado !== EstadoSubmissaoEnum.INICIADA &&
          aluno.estado !== EstadoSubmissaoEnum.REABERTA &&
          aluno.estado !== EstadoSubmissaoEnum.PAUSADA
        ) {
          return;
        }

        const randomAction = Math.random();

        if (aluno.estado === EstadoSubmissaoEnum.PAUSADA) {
          if (Math.random() < 0.1) {
            aluno.estado = EstadoSubmissaoEnum.INICIADA;
            addActivityLog(
              TipoAtividadeEnum.RETOMOU,
              aluno.aluno.nome,
              "retomou a avaliação."
            );
          }
          return;
        }

        if (randomAction < ACTION_PROBABILITIES.ANSWER_QUESTION) {
          if (aluno.questoesRespondidas < aluno.totalQuestoes) {
            aluno.questoesRespondidas++;
            aluno.progresso = Math.round(
              (aluno.questoesRespondidas / aluno.totalQuestoes) * 100
            );

            if (aluno.questoesRespondidas === aluno.totalQuestoes) {
              aluno.estado = EstadoSubmissaoEnum.ENVIADA;
              addActivityLog(
                TipoAtividadeEnum.FINALIZOU,
                aluno.aluno.nome,
                "finalizou a avaliação."
              );
            }
          }
        } else if (
          randomAction <
          ACTION_PROBABILITIES.ANSWER_QUESTION + ACTION_PROBABILITIES.SWITCH_TAB
        ) {
          aluno.alertas++;
          addActivityLog(
            TipoAtividadeEnum.PENALIDADE,
            aluno.aluno.nome,
            `recebeu um alerta por ${TipoInfracaoEnum.TROCA_ABAS}.`
          );
        } else if (
          randomAction <
          ACTION_PROBABILITIES.ANSWER_QUESTION +
            ACTION_PROBABILITIES.SWITCH_TAB +
            ACTION_PROBABILITIES.PAUSE
        ) {
          aluno.estado = EstadoSubmissaoEnum.PAUSADA;
          addActivityLog(
            TipoAtividadeEnum.PAUSOU,
            aluno.aluno.nome,
            "pausou a avaliação."
          );
        }
      });
    }, 2000);
  }

  return {
    studentProgress,
    activityFeed,
    isLoading,
    fetchMonitoringData,
    startSimulation,
    stopSimulation,
  };
});
