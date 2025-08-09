import { defineStore } from "pinia";
import TipoAtividadeEnum from "~/enums/TipoAtividadeEnum";
import type { IProgressoAluno, ILogAtividade } from "~/types/IMonitoring";

let activityInterval: NodeJS.Timeout | null = null;

function createMockActivity(students: IProgressoAluno[]): ILogAtividade {
  const randomStudent = students[Math.floor(Math.random() * students.length)];
  const activityTypes = [
    {
      type: TipoAtividadeEnum.PENALIDADE,
      desc: "recebeu um alerta por troca de aba.",
    },
    { type: TipoAtividadeEnum.PAUSOU, desc: "pausou a avaliação." },
    { type: TipoAtividadeEnum.RETOMOU, desc: "retomou a avaliação." },
  ];
  const randomActivity =
    activityTypes[Math.floor(Math.random() * activityTypes.length)];

  return {
    id: Date.now(),
    tipo: randomActivity!.type,
    alunoNome: randomStudent!.aluno.nome || "Aluno Teste",
    descricao: randomActivity!.desc,
    timestamp: new Date().toISOString(),
  };
}

export const useMonitoringStore = defineStore("monitoring", () => {
  const studentProgress = ref<IProgressoAluno[]>([]);
  const activityFeed = ref<ILogAtividade[]>([]);
  const isLoading = ref(false);

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
      } else {
        console.warn(
          `Dados de monitoramento não encontrados para a aplicação ID: ${applicationId}`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar dados de monitoramento:", error);
    } finally {
      isLoading.value = false;
    }
  }

  function simulateStudentProgressUpdate() {
    const studentToUpdate = studentProgress.value.find(
      (s) => s.estado === "Iniciada"
    );
    if (studentToUpdate) {
      studentToUpdate.questoesRespondidas += 1;
      studentToUpdate.progresso =
        (studentToUpdate.questoesRespondidas / studentToUpdate.totalQuestoes) *
        100;
    }
  }

  function startActivitySimulation() {
    // Garante que não haja simulações duplicadas rodando
    if (activityInterval) {
      clearInterval(activityInterval);
    }

    activityInterval = setInterval(() => {
      // Cria uma nova atividade mockada aleatória
      const newActivity = createMockActivity(studentProgress.value);

      // Adiciona a nova atividade no topo da lista (unshift)
      activityFeed.value.unshift(newActivity);
    }, 5000); // Adiciona uma nova atividade a cada 5 segundos
  }

  function stopActivitySimulation() {
    if (activityInterval) {
      clearInterval(activityInterval);
      activityInterval = null;
    }
  }

  return {
    studentProgress,
    activityFeed,
    isLoading,
    fetchMonitoringData,
    simulateStudentProgressUpdate,
    startActivitySimulation,
    stopActivitySimulation,
  };
});
