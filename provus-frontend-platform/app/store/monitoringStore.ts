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

let novaSubmissaoCallback: ((data: NovaSubmissaoPayload) => void) | null = null;
let punicaoCallback: ((data: PunicaoPorOcorrenciaTemplateData) => void) | null =
  null;
let progressoCallback: ((data: ProgressoAtualizadoPayload) => void) | null =
  null;
let submissaoFinalizadaCallback:
  | ((data: SubmissaoFinalizadaPayload) => void)
  | null = null;
let alunoSaiuCallback: ((data: AlunoSaiuPayload) => void) | null = null;
let tempoAjustadoCallback: ((data: TempoAjustadoPayload) => void) | null = null;
let estadoAplicacaoAtualizadoCallback:
  | ((data: EstadoAplicacaoAtualizadoPayloadAvaliador) => void)
  | null = null;
export const useMonitoringStore = defineStore("monitoring", () => {
  const studentProgress = ref<IProgressoAluno[]>([]);
  const activityFeed = ref<ILogAtividade[]>([]);
  const isLoading = ref(false);
  const currentApplicationId = ref<number | null>(null);
  const toast = useToast();
  let listenersInitialized = false;

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

  function initializeWebSocketListeners() {
    if (listenersInitialized) {
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

    novaSubmissaoCallback = (data) => {
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

    punicaoCallback = (data) => {
      console.log("Evento punicao-por-ocorrencia recebido:", data);
      const aluno = studentProgress.value.find(
        (s) => s.aluno.email === data.estudanteEmail
      );
      if (aluno) {
        aluno.alertas = (aluno.alertas || 0) + 1;
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

    progressoCallback = (data) => {
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

    submissaoFinalizadaCallback = (data) => {
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
          `%%% MonitoringStore: Estado do aluno ${aluno.aluno.nome} (App ${data.aplicacaoId}) atualizado para ${data.estado} (Finalizado)`
        );
        addActivityLog(
          TipoAtividadeEnum.FINALIZOU,
          aluno.aluno.nome,
          "finalizou a avaliação."
        );
      } else {
        console.warn(
          `%%% MonitoringStore: Recebida finalização para submissão ${data.submissaoId} (App ${data.aplicacaoId}), mas aluno não encontrado no estado local. Registrando atividade.`
        );
        addActivityLog(
          TipoAtividadeEnum.FINALIZOU,
          data.alunoNome,
          "finalizou a avaliação."
        );
      }
    };

    alunoSaiuCallback = (data: AlunoSaiuPayload) => {
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

    tempoAjustadoCallback = (data: TempoAjustadoPayload) => {
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

    estadoAplicacaoAtualizadoCallback = (
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
          if (aluno.estado !== EstadoSubmissaoEnum.ENCERRADA) {
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

    $websocket.on<NovaSubmissaoPayload>(
      "nova-submissao",
      novaSubmissaoCallback
    );
    console.log(
      "%%% MonitoringStore: Listener para 'nova-submissao' REGISTRADO."
    );
    $websocket.on<PunicaoPorOcorrenciaTemplateData>(
      "punicao-por-ocorrencia",
      punicaoCallback
    );
    $websocket.on<ProgressoAtualizadoPayload>(
      "progresso-atualizado",
      progressoCallback
    );

    $websocket.on<SubmissaoFinalizadaPayload>(
      "submissao-finalizada",
      submissaoFinalizadaCallback
    );
    console.log(
      "%%% MonitoringStore: Listener para 'submissao-finalizada' REGISTRADO."
    );

    $websocket.on<AlunoSaiuPayload>("aluno-saiu", alunoSaiuCallback);
    console.log("%%% MonitoringStore: Listener para 'aluno-saiu' REGISTRADO.");

    $websocket.on<TempoAjustadoPayload>(
      "tempo-ajustado",
      tempoAjustadoCallback
    );

    $websocket.on<EstadoAplicacaoAtualizadoPayloadAvaliador>(
      "estado-aplicacao-atualizado",
      estadoAplicacaoAtualizadoCallback
    );
    console.log(
      "%%% MonitoringStore: Listener para 'estado-aplicacao-atualizado' REGISTRADO."
    );

    listenersInitialized = true;
    console.log("MonitoringStore: Listeners configurados com sucesso.");
  }

  function clearWebSocketListeners() {
    if ($websocket?.socket?.value && listenersInitialized) {
      console.log(
        "MonitoringStore: Removendo listeners WebSocket explicitamente..."
      );
      if (novaSubmissaoCallback) {
        $websocket.socket.value.off("nova-submissao", novaSubmissaoCallback);
        novaSubmissaoCallback = null;
      }
      if (punicaoCallback) {
        $websocket.socket.value.off("punicao-por-ocorrencia", punicaoCallback);
        punicaoCallback = null;
      }
      if (progressoCallback) {
        $websocket.socket.value.off("progresso-atualizado", progressoCallback);
        progressoCallback = null;
      }

      if (submissaoFinalizadaCallback) {
        $websocket.socket.value.off(
          "submissao-finalizada",
          submissaoFinalizadaCallback
        );
        submissaoFinalizadaCallback = null;
        console.log(
          "%%% MonitoringStore: Listener para 'submissao-finalizada' REMOVIDO."
        );
      }

      if (alunoSaiuCallback) {
        $websocket.socket.value.off("aluno-saiu", alunoSaiuCallback);
        alunoSaiuCallback = null;
        console.log(
          "%%% MonitoringStore: Listener para 'aluno-saiu' REMOVIDO."
        );
      }

      if (tempoAjustadoCallback) {
        $websocket.socket.value.off("tempo-ajustado", tempoAjustadoCallback);
        tempoAjustadoCallback = null;
        console.log(
          "%%% MonitoringStore: Listener para 'tempo-ajustado' REMOVIDO."
        );
      }

      if (estadoAplicacaoAtualizadoCallback) {
        $websocket.socket.value.off(
          "estado-aplicacao-atualizado",
          estadoAplicacaoAtualizadoCallback
        );
        estadoAplicacaoAtualizadoCallback = null;
        console.log(
          "%%% MonitoringStore: Listener para 'estado-aplicacao-atualizado' REMOVIDO."
        );
      }

      listenersInitialized = false;
    } else {
      console.log(
        "MonitoringStore: Tentativa de limpar listeners não inicializados ou sem socket."
      );
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
    fetchMonitoringData,
    initializeWebSocketListeners,
    clearWebSocketListeners,
  };
});
