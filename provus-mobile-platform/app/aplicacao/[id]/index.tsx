import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, RefreshCw, BarChart3, Settings } from "lucide-react-native";

import { useApplicationsStore } from "../../../stores/applicationsStore";
import OverviewStats from "../../../components/OverviewStats";
import { stripHtml } from "../../../utils/stripHtml";
import { useToast } from "../../../hooks/useToast";
import { EstadoAplicacaoEnum } from "../../../enums/EstadoAplicacaoEnum";

export default function ApplicationDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const toast = useToast();

  const appId = parseInt(Array.isArray(id) ? id[0] : id || "0", 10);

  const {
    getApplicationById,
    reopenApplication,
    isLoading,
    fetchApplications,
  } = useApplicationsStore();
  const application = getApplicationById(appId);
  const isFinished =
    application?.estado === EstadoAplicacaoEnum.FINALIZADA ||
    application?.estado === EstadoAplicacaoEnum.CONCLUIDA;
  const isCanceled = application?.estado === EstadoAplicacaoEnum.CANCELADA;
  const isInitialLoad = !application;

  useEffect(() => {
    if (isInitialLoad) {
      fetchApplications();
    }
  }, [fetchApplications, isInitialLoad]);

  const handleReopen = async () => {
    Alert.alert(
      "Reabrir Aplicação",
      "Tem certeza que deseja reabrir esta aplicação? Isso permitirá que os alunos a refaçam (se configurado) ou que você a inicie novamente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reabrir",
          style: "destructive",
          onPress: async () => {
            const success = await reopenApplication(appId);
            if (success) {
              toast.add({
                title: "Aplicação Reaberta!",
                description: "Status alterado para Criada.",
                color: "success",
              });
              router.replace("/home");
            } else {
              toast.add({
                title: "Erro",
                description: "Não foi possível reabrir.",
                color: "error",
              });
            }
          },
        },
      ]
    );
  };

  const handleViewResults = () => {
    router.push(`/aplicacao/${appId}/resultados` as any);
  };

  if (isLoading && isInitialLoad) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-gray-500 mt-4">Carregando detalhes...</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Text className="text-red-500">
          Detalhes da Aplicação não encontrados.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Navegação */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          Detalhes da Aplicação
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Título e Status */}
        <View className="mb-6">
          <Text
            className="text-2xl font-bold text-gray-900 mb-1"
            numberOfLines={2}
          >
            {stripHtml(application.avaliacao.titulo)}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-gray-500">Status:</Text>
            <Text
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isFinished || isCanceled
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {application.estado}
            </Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View className="flex-row gap-3 mb-6">
          {isFinished || isCanceled ? (
            <TouchableOpacity
              onPress={handleReopen}
              className="flex-1 bg-yellow-500 py-3 rounded-lg flex-row items-center justify-center shadow-sm"
            >
              <RefreshCw size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-base">
                Reabrir Aplicação
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.replace(`/monitoramento/${appId}`)}
              className="flex-1 bg-secondary py-3 rounded-lg flex-row items-center justify-center shadow-sm"
            >
              <Settings size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-base">
                Ir para Monitoramento
              </Text>
            </TouchableOpacity>
          )}

          {(isFinished || isCanceled) && (
            <TouchableOpacity
              onPress={handleViewResults}
              className="flex-1 bg-primary py-3 rounded-lg flex-row items-center justify-center shadow-sm"
            >
              <BarChart3 size={20} color="white" className="mr-2" />
              <Text className="text-white font-bold text-base">
                Ver Resultados
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Estatísticas (Só carrega se houver dados de stats na aplicação) */}
        {application.stats ? (
          <OverviewStats stats={application.stats} />
        ) : (
          <Text className="text-gray-400 text-center py-6">
            Estatísticas disponíveis após a conclusão da aplicação.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
