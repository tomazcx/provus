import EstadoSubmissaoEnum from "~/enums/EstadoSubmissaoEnum";
import TipoAtividadeEnum from "~/enums/TipoAtividadeEnum";
import type { IProgressoAluno, ILogAtividade } from "~/types/IMonitoring";
import type { MonitoramentoInicialResponseDto } from "~/types/api/response/Monitoramento.response";
import type { PunicaoPorOcorrenciaTemplateData } from "~/types/api/response/Notificacao.response";
import { useApplicationsStore } from "./applicationsStore";
import EstadoAplicacaoEnum from "~/enums/EstadoAplicacaoEnum";

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
    console.log("%%% EVENTO nova-submissao RECEBIDO:", data);
    console.log("%%% ID da Aplicação no Evento:", data.aplicacaoId);
    console.log(
      "%%% ID da Aplicação Atual no Store:",
      currentApplicationId.value
    );
    if (data.aplicacaoId !== currentApplicationId.value) {
      console.log("%%% IDs NÃO COINCIDEM! Evento ignorado.");
      return;
    }
    console.log("%%% IDs COINCIDEM! Processando evento...");
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
      console.log(
        "%%% studentProgress APÓS push:",
        JSON.stringify(studentProgress.value)
      );
    } else {
      existingStudent.estado = data.estado;
      console.log(
        `%%% Estado do aluno ${data.aluno.nome} atualizado para ${data.estado}`
      );
    }
  };

  const onPunicao = (data: PunicaoPorOcorrenciaTemplateData) => {
    console.log("Evento punicao-por-ocorrencia recebido:", data);
    const aluno = studentProgress.value.find(
      (s) => s.aluno.email === data.estudanteEmail
    );
    if (aluno) {
      aluno.alertas = data.quantidadeOcorrencias;
      addActivityLog(
        TipoAtividadeEnum.PENALIDADE,
        aluno.aluno.nome,
        `recebeu um alerta por ${data.tipoInfracao}. Total: ${aluno.alertas}`
      );
    } else {
      addActivityLog(
        TipoAtividadeEnum.PENALIDADE,
        data.nomeEstudante,
        `recebeu um alerta por ${data.tipoInfracao}.`
      );
    }
  };

  const onProgressoAtualizado = (data: ProgressoAtualizadoPayload) => {
    console.log("Evento progresso-atualizado recebido:", data);
    if (data.aplicacaoId !== currentApplicationId.value) {
      console.log(
        `%%% MonitoringStore: Progresso recebido (App ${data.aplicacaoId}) ignorado. Monitorando App ${currentApplicationId.value}.`
      );
      return;
    }
    const aluno = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );
    if (aluno) {
      aluno.progresso = data.progresso;
      aluno.questoesRespondidas = data.questoesRespondidas;
      console.log(
        `Progresso do aluno ${aluno.aluno.nome} atualizado para ${aluno.progresso}% (${aluno.questoesRespondidas}/${aluno.totalQuestoes})`
      );
    } else {
      console.warn(
        `Recebido progresso para submissão ${data.submissaoId}, mas aluno não encontrado.`
      );
    }
  };

  const onSubmissaoFinalizada = (data: SubmissaoFinalizadaPayload) => {
    console.log("%%% EVENTO submissao-finalizada RECEBIDO:", data);
    if (data.aplicacaoId !== currentApplicationId.value) {
      console.log(
        `%%% MonitoringStore: Finalização recebida (App ${data.aplicacaoId}) ignorada. Monitorando App ${currentApplicationId.value}.`
      );
      return;
    }
    const aluno = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );
    if (aluno) {
      aluno.estado = data.estado;
      console.log(
        `%%% MonitoringStore: Estado do aluno ${aluno.aluno.nome} (App ${data.aplicacaoId}) atualizado para ${data.estado} (Finalizado/Cancelado)`
      );
      addActivityLog(
        TipoAtividadeEnum.FINALIZOU,
        aluno.aluno.nome,
        `finalizou a avaliação. (Estado: ${data.estado})`
      );
    } else {
      console.warn(
        `%%% MonitoringStore: Recebida finalização para submissão ${data.submissaoId} (App ${data.aplicacaoId}), mas aluno não encontrado no estado local. Registrando atividade.`
      );
      addActivityLog(
        TipoAtividadeEnum.FINALIZOU,
        data.alunoNome,
        `finalizou a avaliação. (Estado: ${data.estado})`
      );
    }
  };

  const onAlunoSaiu = (data: AlunoSaiuPayload) => {
    console.log("%%% EVENTO aluno-saiu RECEBIDO:", data);
    if (data.aplicacaoId !== currentApplicationId.value) {
      console.log(
        `%%% MonitoringStore: Evento 'aluno-saiu' (App ${data.aplicacaoId}) ignorado. Monitorando App ${currentApplicationId.value}.`
      );
      return;
    }
    const aluno = studentProgress.value.find(
      (s) => s.submissaoId === data.submissaoId
    );
    if (aluno) {
      aluno.estado = EstadoSubmissaoEnum.ABANDONADA;
      console.log(
        `%%% MonitoringStore: Status do aluno ${aluno.aluno.nome} (App ${data.aplicacaoId}) atualizado para ${aluno.estado} (Saiu/Desconectou)`
      );
      addActivityLog(
        TipoAtividadeEnum.PAUSOU,
        aluno.aluno.nome,
        "desconectou ou saiu da avaliação."
      );
    } else {
      console.warn(
        `%%% MonitoringStore: Recebido 'aluno-saiu' para submissão ${data.submissaoId} (App ${data.aplicacaoId}), mas aluno não encontrado no estado local. Registrando atividade.`
      );
      addActivityLog(
        TipoAtividadeEnum.PAUSOU,
        data.alunoNome,
        "desconectou ou saiu da avaliação."
      );
    }
  };

  const onTempoAjustado = (data: TempoAjustadoPayload) => {
    console.log("%%% EVENTO tempo-ajustado RECEBIDO (para dispatch):", data);
    if (data.aplicacaoId !== currentApplicationId.value) {
      return;
    }
    console.log(
      `%%% MonitoringStore: Solicitando atualização da dataFim para App ${data.aplicacaoId} na applicationsStore para ${data.novaDataFimISO}`
    );
    applicationsStore.updateApplicationData(data.aplicacaoId, {
      dataFim: new Date(data.novaDataFimISO),
    });
    addActivityLog(
      TipoAtividadeEnum.RETOMOU,
      "Professor",
      `ajustou o tempo final da avaliação.`
    );
  };

  const onEstadoAplicacaoAtualizado = (
    data: EstadoAplicacaoAtualizadoPayloadAvaliador
  ) => {
    console.log(
      "%%% EVENTO estado-aplicacao-atualizado RECEBIDO (para dispatch):",
      data
    );
    if (data.aplicacaoId !== currentApplicationId.value) {
      console.log(
        `%%% MonitoringStore: Atualização de estado recebida (App ${data.aplicacaoId}) ignorada. Monitorando App ${currentApplicationId.value}.`
      );
      return;
    }
    console.log(
      `%%% MonitoringStore: Solicitando atualização de estado/dataFim para App ${data.aplicacaoId} na applicationsStore:`,
      data.novoEstado,
      data.novaDataFimISO
    );
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
      console.log(
        `%%% MonitoringStore: Estado ${data.novoEstado} é final. Atualizando estado dos alunos para ENCERRADA.`
      );
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

  function initializeWebSocketListeners() {
    if (listenersInitialized.value) {
      console.log("MonitoringStore: Listeners já inicializados.");
      return;
    }
    if (!$websocket || !$websocket.isConnected?.value) {
      console.warn(
        "MonitoringStore: Tentativa de init listeners sem conexão WS ativa."
      );
      return;
    }

    console.log("MonitoringStore: Configurando listeners WebSocket...");

    $websocket.on<NovaSubmissaoPayload>("nova-submissao", onNovaSubmissao);
    console.log(
      "%%% MonitoringStore: Listener para 'nova-submissao' REGISTRADO."
    );

    $websocket.on<PunicaoPorOcorrenciaTemplateData>(
      "punicao-por-ocorrencia",
      onPunicao
    );

    $websocket.on<ProgressoAtualizadoPayload>(
      "progresso-atualizado",
      onProgressoAtualizado
    );

    $websocket.on<SubmissaoFinalizadaPayload>(
      "submissao-finalizada",
      onSubmissaoFinalizada
    );
    console.log(
      "%%% MonitoringStore: Listener para 'submissao-finalizada' REGISTRADO."
    );

    $websocket.on<AlunoSaiuPayload>("aluno-saiu", onAlunoSaiu);
    console.log("%%% MonitoringStore: Listener para 'aluno-saiu' REGISTRADO.");

    $websocket.on<TempoAjustadoPayload>("tempo-ajustado", onTempoAjustado);

    $websocket.on<EstadoAplicacaoAtualizadoPayloadAvaliador>(
      "estado-aplicacao-atualizado",
      onEstadoAplicacaoAtualizado
    );
    console.log(
      "%%% MonitoringStore: Listener para 'estado-aplicacao-atualizado' REGISTRADO."
    );

    listenersInitialized.value = true;
    console.log("MonitoringStore: Listeners configurados com sucesso.");
  }

  function clearWebSocketListeners() {
    if ($websocket?.socket?.value && listenersInitialized.value) {
      console.log(
        "MonitoringStore: Removendo listeners WebSocket explicitamente..."
      );

      $websocket.socket.value.off("nova-submissao", onNovaSubmissao);
      $websocket.socket.value.off("punicao-por-ocorrencia", onPunicao);
      $websocket.socket.value.off(
        "progresso-atualizado",
        onProgressoAtualizado
      );
      $websocket.socket.value.off(
        "submissao-finalizada",
        onSubmissaoFinalizada
      );
      console.log(
        "%%% MonitoringStore: Listener para 'submissao-finalizada' REMOVIDO."
      );
      $websocket.socket.value.off("aluno-saiu", onAlunoSaiu);
      console.log("%%% MonitoringStore: Listener para 'aluno-saiu' REMOVIDO.");
      $websocket.socket.value.off("tempo-ajustado", onTempoAjustado);
      console.log(
        "%%% MonitoringStore: Listener para 'tempo-ajustado' REMOVIDO."
      );
      $websocket.socket.value.off(
        "estado-aplicacao-atualizado",
        onEstadoAplicacaoAtualizado
      );
      console.log(
        "%%% MonitoringStore: Listener para 'estado-aplicacao-atualizado' REMOVIDO."
      );

      listenersInitialized.value = false;
    } else {
      console.log(
        "MonitoringStore: Tentativa de limpar listeners não inicializados ou sem socket."
      );
    }
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
      console.log(
        "Dados iniciais carregados:",
        studentProgress.value,
        activityFeed.value
      );
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
    console.log("MonitoringStore: onUnmounted (store). Limpando listeners.");
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
    confirmarCodigo
  };
});
