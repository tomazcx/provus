import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import TipoAtividadeEnum from "~/enums/TipoAtividadeEnum";
import type {
  IProgressoAluno,
  ILogAtividade,
} from "~/types/interfaces/IMonitoring";
import type { MonitoramentoInicialResponseDto } from "~/types/api/response/Monitoramento.response";
import type { PunicaoPorOcorrenciaTemplateData } from "~/types/api/response/Notificacao.response";
import { useApplicationsStore } from "./applicationsStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";
import { useNotificationsStore } from "./notificationsStore";

interface EstadoAplicacaoAtualizadoPayloadAvaliador {
  aplicacaoId: number;
  novoEstado: EstadoAplicacaoEnum;
  novaDataFimISO: string;
}
interface NovaSubmissaoPayload {
  submissaoId: number;
  aplicacaoId: number;
  aluno: {
    nome: string;
    email: string;
  };
  estado: EstadoSubmissaoEnum;
  horaInicio: string;
  totalQuestoes: number;
}
interface AlunoSaiuPayload {
  submissaoId: number;
  aplicacaoId: number;
  alunoNome: string;
  timestamp: string;
}

interface CodigoConfirmadoPayload {
  submissaoId: number;
  aplicacaoId: number;
  alunoNome: string;
  timestamp: string;
  estado: EstadoSubmissaoEnum;
}

interface ProgressoAtualizadoPayload {
  submissaoId: number;
  progresso: number;
  questoesRespondidas: number;
  aplicacaoId: number;
  timestamp: string;
}
interface SubmissaoFinalizadaPayload {
  submissaoId: number;
  aplicacaoId: number;
  estado: EstadoSubmissaoEnum;
  alunoNome: string;
  timestamp: string;
}
interface TempoAjustadoPayload {
  aplicacaoId: number;
  novaDataFimISO: string;
}

export const useMonitoringStore = defineStore("monitoring", () => {
  const studentProgress = ref<IProgressoAluno[]>([]);
  const activityFeed = ref<ILogAtividade[]>([]);
  const isLoading = ref(false);
  const currentApplicationId = ref<number | null>(null);
  const toast = useToast();
  const notificationsStore = useNotificationsStore();
  const listenersInitialized = ref(false);

  const nuxtApp = useNuxtApp();
  const $websocket = nuxtApp.$websocket as
    | ReturnType<typeof useWebSocket>
    | undefined;
  const { $api } = useNuxtApp();
  const applicationsStore = useApplicationsStore();

  function addActivityLog(
    tipo: TipoAtividadeEnum,
    alunoNome: string,
    descricao: string
  ) {
    const lastLog = activityFeed.value[0];
    if (lastLog?.alunoNome === alunoNome && lastLog?.descricao === descricao) {
      return;
    }
    activityFeed.value.unshift({
      id: Date.now() + Math.random(),
      tipo,
      alunoNome,
      descricao,
      timestamp: new Date().toISOString(),
    });
    if (activityFeed.value.length > 100) {
      activityFeed.value.pop();
    }
  }

  const onNovaSubmissao = (data: NovaSubmissaoPayload) => {
    if (data.aplicacaoId !== currentApplicationId.value) return;

    const existingStudent = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );
    if (!existingStudent) {
      const novoProgresso: IProgressoAluno = {
        submissaoId: data.submissaoId,
        aluno: {
          id: data.submissaoId,
          nome: data.aluno.nome,
          email: data.aluno.email,
        },
        estado: data.estado,
        progresso: 0,
        questoesRespondidas: 0,
        totalQuestoes: data.totalQuestoes,
        horaInicio: data.horaInicio,
        alertas: 0,
        tempoPenalidadeEmSegundos: 0,
      };
      studentProgress.value.push(novoProgresso);
      addActivityLog(
        TipoAtividadeEnum.ENTROU,
        data.aluno.nome,
        "iniciou a avaliação."
      );
    } else {
      existingStudent.estado = data.estado;
    }
  };

  const onPunicao = (data: PunicaoPorOcorrenciaTemplateData) => {
    const aluno = studentProgress.value.find(
      (s) => s.aluno.email === data.estudanteEmail
    );

    if (aluno) {
      aluno.alertas += 1;

      addActivityLog(
        TipoAtividadeEnum.PENALIDADE,
        aluno.aluno.nome,
        `recebeu um alerta por ${data.tipoInfracao}. (Ocorrência #${data.quantidadeOcorrencias})`
      );

      notificationsStore.addNotification({
        title: `Infração: ${data.tipoInfracao}`,
        description: `Aluno ${data.nomeEstudante} na avaliação "${data.nomeAvaliacao}".`,
        icon: "i-lucide-shield-alert",
        iconColor: "text-red-500",
      });

      toast.add({
        title: `Infração: ${data.tipoInfracao}`,
        description: `${data.nomeEstudante} - Ocorrência #${data.quantidadeOcorrencias}`,
        color: "error",
        icon: "i-lucide-shield-alert",
      });
    } else {
      addActivityLog(
        TipoAtividadeEnum.PENALIDADE,
        data.nomeEstudante,
        `recebeu um alerta por ${data.tipoInfracao}.`
      );

      toast.add({
        title: `Infração: ${data.tipoInfracao}`,
        description: `${data.nomeEstudante} - ${data.nomeAvaliacao}`,
        color: "error",
        icon: "i-lucide-alert-triangle",
      });
    }
  };

  const onProgressoAtualizado = (data: ProgressoAtualizadoPayload) => {
    if (data.aplicacaoId !== currentApplicationId.value) return;

    const aluno = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );
    if (aluno) {
      aluno.progresso = data.progresso;
      aluno.questoesRespondidas = data.questoesRespondidas;
    }
  };

  const onSubmissaoFinalizada = (data: SubmissaoFinalizadaPayload) => {
    if (data.aplicacaoId !== currentApplicationId.value) return;

    const index = studentProgress.value.findIndex(
      (s) => s.submissaoId === data.submissaoId
    );

    if (index !== -1) {
      const alunoExistente = studentProgress.value[index];

      if (!alunoExistente) return;

      console.log(
        `[MonitoringStore] Submissão finalizada recebida para aluno ${data.alunoNome}. Atualizando estado para ${data.estado}.`
      );

      const alunoAtualizado: IProgressoAluno = {
        ...alunoExistente,
        estado: data.estado,
      };

      studentProgress.value.splice(index, 1, alunoAtualizado);

      addActivityLog(
        TipoAtividadeEnum.FINALIZOU,
        alunoAtualizado.aluno.nome,
        `finalizou a avaliação. (Estado: ${data.estado})`
      );
    } else {
      console.warn(
        `[MonitoringStore] Submissão finalizada recebida para aluno não encontrado na lista: ${data.alunoNome}`
      );
      addActivityLog(
        TipoAtividadeEnum.FINALIZOU,
        data.alunoNome,
        `finalizou a avaliação. (Estado: ${data.estado})`
      );
    }
  };


  const onAlunoSaiu = (data: AlunoSaiuPayload) => {
    if (data.aplicacaoId !== currentApplicationId.value) return;

    const aluno = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );
    if (aluno) {
      aluno.estado = EstadoSubmissaoEnum.ABANDONADA;
      addActivityLog(
        TipoAtividadeEnum.PAUSOU,
        aluno.aluno.nome,
        "desconectou ou saiu da avaliação."
      );
    } else {
      addActivityLog(
        TipoAtividadeEnum.PAUSOU,
        data.alunoNome,
        "desconectou ou saiu da avaliação."
      );
    }
  };

  const onTempoAjustado = (data: TempoAjustadoPayload) => {
    if (data.aplicacaoId !== currentApplicationId.value) return;

    applicationsStore.updateApplicationData(data.aplicacaoId, {
      dataFim: new Date(data.novaDataFimISO),
    });
    addActivityLog(
      TipoAtividadeEnum.RETOMOU,
      "Professor",
      `ajustou o tempo final da avaliação.`
    );
  };

  const onCodigoConfirmado = (data: CodigoConfirmadoPayload) => {
    const aluno = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );

    if (aluno) {
      aluno.estado = EstadoSubmissaoEnum.CODIGO_CONFIRMADO;

      toast.add({
        title: "Código Confirmado",
        description: `Código de ${data.alunoNome} validado com sucesso.`,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
  };

  const onEstadoAplicacaoAtualizado = (
    data: EstadoAplicacaoAtualizadoPayloadAvaliador
  ) => {
    if (data.aplicacaoId !== currentApplicationId.value) return;

    applicationsStore.updateApplicationData(data.aplicacaoId, {
      estado: data.novoEstado,
      dataFim: new Date(data.novaDataFimISO),
    });

    const estadosFinais: EstadoAplicacaoEnum[] = [
      EstadoAplicacaoEnum.FINALIZADA,
      EstadoAplicacaoEnum.CONCLUIDA,
      EstadoAplicacaoEnum.CANCELADA,
    ];

    if (estadosFinais.includes(data.novoEstado)) {
      studentProgress.value.forEach((aluno) => {
        const estadosAtivosSubmissao: EstadoSubmissaoEnum[] = [
          EstadoSubmissaoEnum.INICIADA,
          EstadoSubmissaoEnum.REABERTA,
          EstadoSubmissaoEnum.PAUSADA,
        ];
        if (estadosAtivosSubmissao.includes(aluno.estado)) {
          aluno.estado = EstadoSubmissaoEnum.ENCERRADA;
        }
      });
      addActivityLog(
        TipoAtividadeEnum.FINALIZOU,
        "Professor",
        `finalizou ou cancelou a aplicação.`
      );
    } else if (data.novoEstado === EstadoAplicacaoEnum.PAUSADA) {
      addActivityLog(
        TipoAtividadeEnum.PAUSOU,
        "Professor",
        `pausou a aplicação.`
      );
    } else if (data.novoEstado === EstadoAplicacaoEnum.EM_ANDAMENTO) {
      addActivityLog(
        TipoAtividadeEnum.RETOMOU,
        "Professor",
        `retomou a aplicação.`
      );
    }
  };

  function removeAllListeners(socket: any) {
    if (!socket) return;
    socket.off("nova-submissao", onNovaSubmissao);
    socket.off("punicao-por-ocorrencia", onPunicao);
    socket.off("progresso-atualizado", onProgressoAtualizado);
    socket.off("submissao-finalizada", onSubmissaoFinalizada);
    socket.off("aluno-saiu", onAlunoSaiu);
    socket.off("tempo-ajustado", onTempoAjustado);
    socket.off("estado-aplicacao-atualizado", onEstadoAplicacaoAtualizado);
    socket.off("codigo-confirmado", onCodigoConfirmado);
  }

  function initializeWebSocketListeners() {
    if (listenersInitialized.value) {
      console.log("MonitoringStore: Listeners já inicializados.");
      return;
    }
    if (
      !$websocket ||
      !$websocket.isConnected?.value ||
      !$websocket.socket.value
    ) {
      console.warn(
        "MonitoringStore: Tentativa de init listeners sem conexão WS ativa."
      );
      return;
    }

    console.log("MonitoringStore: Configurando listeners WebSocket...");
    const socket = $websocket.socket.value;

    removeAllListeners(socket);

    socket.on("nova-submissao", onNovaSubmissao);
    socket.on("punicao-por-ocorrencia", onPunicao);
    socket.on("progresso-atualizado", onProgressoAtualizado);
    socket.on("submissao-finalizada", onSubmissaoFinalizada);
    socket.on("aluno-saiu", onAlunoSaiu);
    socket.on("tempo-ajustado", onTempoAjustado);
    socket.on("estado-aplicacao-atualizado", onEstadoAplicacaoAtualizado);
    socket.on("codigo-confirmado", onCodigoConfirmado);
    listenersInitialized.value = true;
    console.log("MonitoringStore: Listeners configurados com sucesso.");
  }

  function clearWebSocketListeners() {
    if ($websocket?.socket?.value) {
      console.log("MonitoringStore: Removendo listeners WebSocket...");
      removeAllListeners($websocket.socket.value);
    } else {
      console.log(
        "MonitoringStore: Socket não disponível para remover listeners."
      );
    }
    listenersInitialized.value = false;
  }

  async function confirmarCodigo(submissaoId: number, codigoEntrega: number) {
    if (!currentApplicationId.value) {
      toast.add({
        title: "Erro",
        description: "ID da aplicação não encontrado.",
        color: "error",
      });
      return false;
    }

    try {
      const payload = { codigoEntrega };
      await $api(
        `/backoffice/aplicacao/${currentApplicationId.value}/submissao/${submissaoId}/confirmar-codigo`,
        { method: "PATCH", body: payload }
      );

      const aluno = studentProgress.value.find(
        (s) => s.submissaoId === submissaoId
      );
      if (aluno) {
        aluno.estado = EstadoSubmissaoEnum.CODIGO_CONFIRMADO;
      }

      toast.add({ title: "Entrega Confirmada!", color: "secondary" });
      return true;
    } catch {
      toast.add({
        title: "Erro na confirmação",
        description: "Código incorreto.",
        color: "error",
      });
      return false;
    }
  }

  async function fetchMonitoringData(applicationId: number) {
    isLoading.value = true;
    studentProgress.value = [];
    activityFeed.value = [];
    currentApplicationId.value = applicationId;
    try {
      const initialData = await $api<MonitoramentoInicialResponseDto>(
        `/backoffice/aplicacao/${applicationId}/monitoramento-inicial`
      );
      if (initialData && initialData.alunos) {
        studentProgress.value = initialData.alunos.map((alunoDto) => ({
          submissaoId: alunoDto.submissaoId,
          aluno: {
            id: alunoDto.submissaoId,
            nome: alunoDto.aluno.nome,
            email: alunoDto.aluno.email,
          },
          estado: alunoDto.estado,
          progresso: alunoDto.progresso,
          questoesRespondidas: alunoDto.questoesRespondidas,
          totalQuestoes: alunoDto.totalQuestoes,
          horaInicio: alunoDto.horaInicio,
          alertas: alunoDto.alertas,
          tempoPenalidadeEmSegundos: alunoDto.tempoPenalidadeEmSegundos ?? 0,
        }));
      }
      if (initialData && initialData.atividadesRecentes) {
        activityFeed.value = initialData.atividadesRecentes.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    } catch (error: unknown) {
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
        title: "Erro ao carregar dados iniciais",
        description: errorMessage,
        color: "error",
      });
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  onUnmounted(() => {
    clearWebSocketListeners();
  });

  return {
    studentProgress,
    activityFeed,
    isLoading,
    currentApplicationId,
    listenersInitialized,
    fetchMonitoringData,
    initializeWebSocketListeners,
    clearWebSocketListeners,
    confirmarCodigo,
  };
});
