import { create } from "zustand";
import api from "../services/api";
import { IProgressoAluno, ILogAtividade } from "../types/IMonitoring";
import { MonitoramentoInicialResponseDto } from "../types/api/response/Monitoramento.response";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";
import { TipoAtividadeEnum } from "../enums/TipoAtividadeEnum";
import Toast from "react-native-toast-message";

interface MonitoringState {
  studentProgress: IProgressoAluno[];
  activityFeed: ILogAtividade[];
  isLoading: boolean;
  currentApplicationId: number | null;
  listenersInitialized: boolean;

  fetchMonitoringData: (applicationId: number) => Promise<void>;
  confirmarCodigo: (
    submissaoId: number,
    codigoEntrega: number
  ) => Promise<boolean>;

  addActivityLog: (
    tipo: TipoAtividadeEnum,
    alunoNome: string,
    descricao: string
  ) => void;
  setStudentProgress: (alunos: IProgressoAluno[]) => void;
  updateStudentStatus: (
    submissaoId: number,
    novoEstado: EstadoSubmissaoEnum
  ) => void;
  updateStudentProgress: (
    submissaoId: number,
    progresso: number,
    respondidas: number
  ) => void;
  incrementStudentAlerts: (submissaoId: number) => void;
  resetState: () => void;

  initializeWebSocketListeners: () => void;
  clearWebSocketListeners: () => void;
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  studentProgress: [],
  activityFeed: [],
  isLoading: false,
  currentApplicationId: null,
  listenersInitialized: false,

  fetchMonitoringData: async (applicationId: number) => {
    set({ isLoading: true, currentApplicationId: applicationId });
    try {
      const response = await api.get<MonitoramentoInicialResponseDto>(
        `/backoffice/aplicacao/${applicationId}/monitoramento-inicial`
      );

      const data = response.data;

      const mappedAlunos: IProgressoAluno[] = data.alunos.map((dto) => ({
        submissaoId: dto.submissaoId,
        aluno: {
          id: dto.submissaoId,
          nome: dto.aluno.nome,
          email: dto.aluno.email,
        },
        estado: dto.estado,
        progresso: dto.progresso,
        questoesRespondidas: dto.questoesRespondidas,
        totalQuestoes: dto.totalQuestoes,
        horaInicio: dto.horaInicio,
        alertas: dto.alertas,
        tempoPenalidadeEmSegundos: dto.tempoPenalidadeEmSegundos || 0,
      }));

      set({
        studentProgress: mappedAlunos,
        activityFeed: data.atividadesRecentes || [],
      });
    } catch (error) {
      console.error("Erro ao buscar monitoramento:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  confirmarCodigo: async (submissaoId, codigoEntrega) => {
    const { currentApplicationId } = get();

    if (!currentApplicationId) return false;

    try {
      await api.patch(
        `/backoffice/aplicacao/${currentApplicationId}/submissao/${submissaoId}/confirmar-codigo`,
        { codigoEntrega }
      );

      get().updateStudentStatus(
        submissaoId,
        EstadoSubmissaoEnum.CODIGO_CONFIRMADO
      );

      Toast.show({
        type: "success",
        text1: "Entrega Confirmada!",
        text2: "Código validado com sucesso.",
        position: "top",
        topOffset: 60,
      });

      return true;
    } catch (error: any) {
      const status = error.response?.status;
      if (status !== 400 && status !== 422) {
        console.error("Erro crítico ao confirmar código:", error);
      }

      let mensagemErro = "Não foi possível confirmar o código.";

      if (status === 400 || status === 422) {
        mensagemErro = "Código incorreto. Verifique e tente novamente.";
      }

      Toast.show({
        type: "error",
        text1: "Erro na validação",
        text2: mensagemErro,
        position: "top",
        topOffset: 60,
      });

      return false;
    }
  },

  addActivityLog: (tipo, alunoNome, descricao) => {
    set((state) => {
      const lastLog = state.activityFeed[0];
      if (
        lastLog?.alunoNome === alunoNome &&
        lastLog?.descricao === descricao
      ) {
        return state;
      }
      const newLog: ILogAtividade = {
        id: Date.now() + Math.random(),
        tipo,
        alunoNome,
        descricao,
        timestamp: new Date().toISOString(),
      };
      const newFeed = [newLog, ...state.activityFeed].slice(0, 100);
      return { activityFeed: newFeed };
    });
  },

  setStudentProgress: (alunos) => set({ studentProgress: alunos }),

  updateStudentStatus: (submissaoId, novoEstado) => {
    set((state) => ({
      studentProgress: state.studentProgress.map((s) =>
        s.submissaoId === submissaoId ? { ...s, estado: novoEstado } : s
      ),
    }));
  },

  updateStudentProgress: (submissaoId, progresso, respondidas) => {
    set((state) => ({
      studentProgress: state.studentProgress.map((s) =>
        s.submissaoId === submissaoId
          ? { ...s, progresso, questoesRespondidas: respondidas }
          : s
      ),
    }));
  },

  incrementStudentAlerts: (submissaoId) => {
    set((state) => ({
      studentProgress: state.studentProgress.map((s) =>
        s.submissaoId === submissaoId ? { ...s, alertas: s.alertas + 1 } : s
      ),
    }));
  },

  resetState: () =>
    set({
      studentProgress: [],
      activityFeed: [],
      currentApplicationId: null,
      listenersInitialized: false,
    }),

  initializeWebSocketListeners: () => {},
  clearWebSocketListeners: () => {},
}));
