import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { useApplicationsStore } from "../../stores/applicationsStore";
import { useMonitoringStore } from "../../stores/monitoringStore";
import { useTimer } from "../../hooks/useTimer";
import { getToken } from "../../utils/token";
import { IProgressoAluno } from "../../types/IMonitoring";

import MonitoringHeader from "../../components/MonitoringHeader";
import StudentListItem from "../../components/StudentListItem";
import ActivityFeed from "../../components/ActivityFeed";
import MonitoringTabs from "../../components/MonitoringTabs";

import { EstadoAplicacaoEnum } from "../../enums/EstadoAplicacaoEnum";
import { EstadoSubmissaoEnum } from "../../enums/EstadoSubmissaoEnum";
import { TipoAtividadeEnum } from "../../enums/TipoAtividadeEnum";
import { useWebSocket } from "../../composables/useWebSocket";
import { useToast } from "../../hooks/useToast";

export default function MonitoringScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const idString = Array.isArray(id) ? id[0] : id;
  const applicationId = parseInt(idString || "0", 10);

  const toast = useToast();

  const { getApplicationById, updateApplicationData } = useApplicationsStore();
  const {
    fetchMonitoringData,
    studentProgress,
    activityFeed,
    isLoading,
    updateStudentProgress,
    updateStudentStatus,
    incrementStudentAlerts,
    addActivityLog,
  } = useMonitoringStore();

  const { connect, disconnect, socket, isConnected } = useWebSocket();
  const [activeTab, setActiveTab] = useState<"students" | "activity">(
    "students"
  );

  const aplicacao = getApplicationById(applicationId);

  const dataFimISO = aplicacao?.dataFim?.toISOString();
  const isAppActive = aplicacao?.estado === EstadoAplicacaoEnum.EM_ANDAMENTO;

  const { tempoRestanteFormatado, tempoRestanteEmSegundos } = useTimer({
    dataFimISO,
    isActive: isAppActive,
  });

  const formatarTempo = (totalSegundos: number): string => {
    if (totalSegundos <= 0) return "00:00:00";
    totalSegundos = Math.max(0, totalSegundos);
    const hours = Math.floor(totalSegundos / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSegundos % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(totalSegundos % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const getTempoRestanteAluno = useCallback(
    (aluno: IProgressoAluno) => {
      const estadosFinaisOuInativos: EstadoSubmissaoEnum[] = [
        EstadoSubmissaoEnum.ENCERRADA,
        EstadoSubmissaoEnum.CANCELADA,
        EstadoSubmissaoEnum.ENVIADA,
        EstadoSubmissaoEnum.AVALIADA,
        EstadoSubmissaoEnum.ABANDONADA,
        EstadoSubmissaoEnum.CODIGO_CONFIRMADO,
      ];

      if (estadosFinaisOuInativos.includes(aluno.estado)) {
        return "00:00:00";
      }
      const penalidade = aluno.tempoPenalidadeEmSegundos || 0;
      const tempoRestanteIndividual = Math.max(
        0,
        tempoRestanteEmSegundos - penalidade
      );
      return formatarTempo(tempoRestanteIndividual);
    },
    [tempoRestanteEmSegundos]
  );

  const isConnecting = useRef(false);

  useEffect(() => {
    if (!applicationId) return;

    if (!getApplicationById(applicationId)) {
      toast.add({
        title: "Erro",
        description: "Aplicação não encontrada.",
        color: "error",
        timeout: 4000,
      });
      router.back();
      return;
    }

    const init = async () => {
      if (isConnecting.current) return;
      isConnecting.current = true;

      const token = await getToken();

      connect("/avaliador", { token: `Bearer ${token}` });

      await fetchMonitoringData(applicationId);

      isConnecting.current = false;
    };

    init();

    return () => {
      disconnect();
      isConnecting.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);
  useEffect(() => {
    const socketInstance = socket.current;
    if (isConnected && socketInstance) {
      socketInstance.on("nova-submissao", () => {
        fetchMonitoringData(applicationId);
      });
      socketInstance.on("progresso-atualizado", (data: any) => {
        if (data.aplicacaoId === applicationId)
          updateStudentProgress(
            data.submissaoId,
            data.progresso,
            data.questoesRespondidas
          );
      });
      socketInstance.on("submissao-finalizada", (data: any) => {
        if (data.aplicacaoId === applicationId) {
          updateStudentStatus(data.submissaoId, data.estado);
          addActivityLog(data.tipo, data.alunoNome, `finalizou a avaliação.`);
        }
      });
      socketInstance.on("aluno-saiu", (data: any) => {
        if (data.aplicacaoId === applicationId) {
          updateStudentStatus(data.submissaoId, EstadoSubmissaoEnum.ABANDONADA);
          addActivityLog(data.tipo, data.alunoNome, "saiu da avaliação.");
        }
      });
      socketInstance.on("punicao-por-ocorrencia", (data: any) => {
        toast.add({
          title: "Infração Detectada",
          description: `${data.nomeEstudante}: ${data.tipoInfracao}`,
          color: "error",
        });
        const alunoAlvo = studentProgress.find(
          (s) => s.aluno.email === data.estudanteEmail
        );
        if (alunoAlvo) {
          incrementStudentAlerts(alunoAlvo.submissaoId);
          addActivityLog(
            TipoAtividadeEnum.PENALIDADE,
            data.nomeEstudante,
            `recebeu alerta por ${data.tipoInfracao}`
          );
        } else {
          fetchMonitoringData(applicationId);
        }
      });
      socketInstance.on(
        "tempo-ajustado",
        (data: { aplicacaoId: number; novaDataFimISO: string }) => {
          if (data.aplicacaoId === applicationId)
            updateApplicationData(applicationId, {
              dataFim: new Date(data.novaDataFimISO),
            });
        }
      );
      socketInstance.on("estado-aplicacao-atualizado", (data: any) => {
        if (data.aplicacaoId === applicationId) {
          updateApplicationData(applicationId, {
            estado: data.novoEstado,
            dataFim: new Date(data.novaDataFimISO),
          });
          if (
            ["Finalizada", "Concluída", "Cancelada"].includes(data.novoEstado)
          ) {
            Alert.alert("Atenção", "Aplicação finalizada.", [
              { text: "OK", onPress: () => router.replace("/home") },
            ]);
          }
        }
      });
    }
    return () => {
      if (socketInstance) {
        socketInstance.off("nova-submissao");
        socketInstance.off("progresso-atualizado");
        socketInstance.off("submissao-finalizada");
        socketInstance.off("aluno-saiu");
        socketInstance.off("punicao-por-ocorrencia");
        socketInstance.off("tempo-ajustado");
        socketInstance.off("estado-aplicacao-atualizado");
      }
    };
  }, [
    isConnected,
    applicationId,
    fetchMonitoringData,
    updateApplicationData,
    router,
    socket,
    studentProgress,
    updateStudentProgress,
    updateStudentStatus,
    incrementStudentAlerts,
    addActivityLog,
    toast,
  ]);

  const handleAdjustTime = (seconds: number) => {
    if (!socket.current) return;
    socket.current.emit("ajustar-tempo-aplicacao", {
      aplicacaoId: applicationId,
      segundos: seconds,
    });
    const appLocal = getApplicationById(applicationId);
    if (appLocal && appLocal.dataFim) {
      const novaData = new Date(appLocal.dataFim.getTime() + seconds * 1000);
      updateApplicationData(applicationId, { dataFim: novaData });
    }
  };

  const handleStart = () => {
    if (!socket.current) return;

    socket.current.emit("iniciar-aplicacao", { aplicacaoId: applicationId });

    updateApplicationData(applicationId, {
      estado: EstadoAplicacaoEnum.EM_ANDAMENTO,
    });
  };

  const handleTogglePause = () => {
    if (!socket.current) return;
    const currentApp = getApplicationById(applicationId);

    if (currentApp?.estado === EstadoAplicacaoEnum.CRIADA) {
      return;
    }

    const event =
      currentApp?.estado === EstadoAplicacaoEnum.PAUSADA
        ? "retomar-aplicacao"
        : "pausar-aplicacao";

    socket.current.emit(event, { aplicacaoId: applicationId });

    const novoEstado =
      currentApp?.estado === EstadoAplicacaoEnum.PAUSADA
        ? EstadoAplicacaoEnum.EM_ANDAMENTO
        : EstadoAplicacaoEnum.PAUSADA;

    updateApplicationData(applicationId, { estado: novoEstado });
  };

  const handleFinish = () => {
    Alert.alert("Finalizar", "Encerrar para todos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: () => {
          socket.current?.emit("finalizar-aplicacao", {
            aplicacaoId: applicationId,
          });
          router.replace("/home");
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert("Reiniciar Timer", "Reiniciar para todos?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim",
        onPress: () =>
          socket.current?.emit("reiniciar-timer-aplicacao", {
            aplicacaoId: applicationId,
          }),
      },
    ]);
  };

  const handleStudentPress = (aluno: any) => {
    router.push({
      pathname: "/resultado/[submissionId]",
      params: { submissionId: aluno.submissaoId, applicationId: applicationId },
    });
  };

  if (!aplicacao || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 py-3 flex-row items-center border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          {aplicacao.avaliacao.titulo}
        </Text>
        <View
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <MonitoringHeader
          aplicacao={aplicacao}
          timer={tempoRestanteFormatado}
          onAdjustTime={handleAdjustTime}
          onTogglePause={handleTogglePause}
          onFinish={handleFinish}
          onReset={handleReset}
          onStart={handleStart}
        />

        <MonitoringTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          studentCount={studentProgress.length}
        />

        {activeTab === "students" ? (
          <View>
            {studentProgress.length === 0 ? (
              <Text className="text-center text-gray-400 py-8">
                Nenhum aluno entrou ainda.
              </Text>
            ) : (
              studentProgress.map((aluno) => (
                <StudentListItem
                  key={aluno.submissaoId}
                  aluno={aluno}
                  tempoRestante={getTempoRestanteAluno(aluno)}
                  onPress={handleStudentPress}
                />
              ))
            )}
          </View>
        ) : (
          <ActivityFeed atividades={activityFeed} />
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
