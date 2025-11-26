import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  Copy,
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Minus,
  RotateCw,
} from "lucide-react-native";
import { AplicacaoEntity } from "../types/entities/Aplicacao.entity";
import { EstadoAplicacaoEnum } from "../enums/EstadoAplicacaoEnum";
import { stripHtml } from "../utils/stripHtml";
import { useToast } from "@/hooks/useToast";

interface Props {
  aplicacao: AplicacaoEntity;
  timer: string;
  onAdjustTime: (seconds: number) => void;
  onTogglePause: () => void;
  onFinish: () => void;
  onReset: () => void;
  onStart: () => void;
}

export default function MonitoringHeader({
  aplicacao,
  timer,
  onAdjustTime,
  onTogglePause,
  onFinish,
  onReset,
  onStart,
}: Props) {
  const isPaused = aplicacao.estado === EstadoAplicacaoEnum.PAUSADA;
  const isInProgress = aplicacao.estado === EstadoAplicacaoEnum.EM_ANDAMENTO;
  const isConcluded =
    aplicacao.estado === EstadoAplicacaoEnum.FINALIZADA ||
    aplicacao.estado === EstadoAplicacaoEnum.CONCLUIDA ||
    aplicacao.estado === EstadoAplicacaoEnum.CANCELADA;
  const isCreated = aplicacao.estado === EstadoAplicacaoEnum.CRIADA;
  const isRunning = aplicacao.estado === EstadoAplicacaoEnum.EM_ANDAMENTO;
  const toast = useToast();

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(aplicacao.codigoAcesso);
    toast.add({
      title: "Copiado!",
      description: "Código copiado para a área de transferência!",
      color: "success",
      timeout: 2000,
    });
  };

  let controlButton;

  if (isCreated) {
    controlButton = (
      <TouchableOpacity
        onPress={onStart}
        className="bg-green-600 py-3 rounded-lg flex-1 gap-2 flex-row items-center justify-center shadow-md"
      >
        <Play size={20} color="white" className="mr-2" />
        <Text className="text-white font-bold text-base">
          Iniciar Avaliação
        </Text>
      </TouchableOpacity>
    );
  } else if (isConcluded) {
    controlButton = (
      <View className="bg-gray-200 py-3 rounded-lg flex-1 items-center justify-center">
        <Text className="text-gray-600 font-bold text-base">
          APLICAÇÃO {aplicacao.estado}
        </Text>
      </View>
    );
  } else {
    controlButton = <></>;
  }

  return (
    <View className="mb-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          Monitoramento
        </Text>

        <View className="flex-row items-center flex-wrap mb-4">
          <Text className="text-gray-600 mr-2">Acompanhando:</Text>
          <View className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
            <Text className="font-medium text-gray-800 text-xs">
              {stripHtml(aplicacao.avaliacao.titulo)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <Text className="font-medium text-gray-700 mr-2">Código:</Text>
          <View className="bg-primary px-3 py-1 rounded-lg flex-row items-center">
            <Text className="text-white font-bold text-lg tracking-widest mr-2">
              {aplicacao.codigoAcesso}
            </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <Copy size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xs text-gray-500 mb-1">Tempo Restante</Text>
            <View className="flex-row items-end">
              <Clock
                size={20}
                color="#004e8c"
                style={{ marginBottom: 4, marginRight: 6 }}
              />
              <Text className="text-3xl font-bold text-primary font-mono">
                {isPaused ? "Pausado" : timer}
              </Text>
            </View>
          </View>

          <View
            className={`px-3 py-1 rounded-full ${
              isCreated
                ? "bg-blue-100"
                : isInProgress
                ? "bg-green-100"
                : "bg-yellow-100"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isCreated
                  ? "text-blue-700"
                  : isInProgress
                  ? "text-green-700"
                  : "text-yellow-800"
              }`}
            >
              {isCreated ? "CRIADA" : isInProgress ? "AO VIVO" : "PAUSADA"}
            </Text>
          </View>
        </View>

        <View className="mb-4">{controlButton}</View>

        {(isRunning || isPaused) && (
          <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => onAdjustTime(-60)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Minus size={20} color="#004e8c" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onAdjustTime(60)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Plus size={20} color="#004e8c" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onReset}
                className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
              >
                <RotateCw size={20} color="#3b82f6" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onTogglePause}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  isRunning ? "bg-yellow-100" : "bg-green-100"
                }`}
              >
                {isRunning ? (
                  <Pause size={24} color="#ca8a04" fill="#ca8a04" />
                ) : (
                  <Play size={24} color="#16a34a" fill="#16a34a" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onFinish}
                className="w-12 h-12 rounded-full bg-red-100 items-center justify-center"
              >
                <Square size={24} color="#dc2626" fill="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {isConcluded && (
        <View className="bg-red-50 p-4 rounded-xl border border-red-100 items-center">
          <Text className="text-red-800 font-bold text-lg">
            APLICAÇÃO {aplicacao.estado}
          </Text>
        </View>
      )}
    </View>
  );
}
