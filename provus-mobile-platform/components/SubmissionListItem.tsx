import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ArrowRight,
  Clock,
  CheckCircle,
  ShieldCheck,
} from "lucide-react-native";
import { SubmissaoNaListaResponse } from "../types/api/response/FindSubmissoes.response";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";

interface Props {
  submission: SubmissaoNaListaResponse;
  totalScore: number;
  onPress: (submission: SubmissaoNaListaResponse) => void;
  onConfirmPress?: (submission: SubmissaoNaListaResponse) => void;
}

const getStatusColor = (status: EstadoSubmissaoEnum) => {
  switch (status) {
    case EstadoSubmissaoEnum.AVALIADA:
    case EstadoSubmissaoEnum.ENVIADA:
      return "bg-blue-100 text-blue-700";
    case EstadoSubmissaoEnum.CODIGO_CONFIRMADO:
      return "bg-green-100 text-green-700";
    case EstadoSubmissaoEnum.EM_ANDAMENTO:
      return "bg-yellow-100 text-yellow-700";
    case EstadoSubmissaoEnum.ENCERRADA:
    case EstadoSubmissaoEnum.CANCELADA:
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDuration = (start: string | null, end: string | null): string => {
  if (!start || !end) return "--";
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (endTime < startTime) return "--";
  const diffSeconds = Math.floor((endTime - startTime) / 1000);
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  let output = "";
  if (hours > 0) output += `${hours}h `;
  if (minutes > 0 || output === "") output += `${minutes}min`;
  return output.trim();
};

export default function SubmissionListItem({
  submission,
  totalScore,
  onPress,
  onConfirmPress,
}: Props) {
  const nota =
    submission.pontuacaoTotal !== null ? submission.pontuacaoTotal : 0;

  const statusClasses = getStatusColor(submission.estado);
  const duration = formatDuration(
    submission.iniciadoEm,
    submission.finalizadoEm
  );

  const needsConfirmation =
    submission.estado === EstadoSubmissaoEnum.AVALIADA ||
    submission.estado === EstadoSubmissaoEnum.ENVIADA;

  const isConfirmed =
    submission.estado === EstadoSubmissaoEnum.CODIGO_CONFIRMADO;

  return (
    <TouchableOpacity
      onPress={() => onPress(submission)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="text-lg font-semibold text-gray-900 flex-1"
          numberOfLines={1}
        >
          {submission.estudante.nome}
        </Text>
        <ArrowRight size={20} color="#9ca3af" />
      </View>

      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-row items-center gap-2">
          {isConfirmed ? (
            <CheckCircle size={16} color="#15803d" />
          ) : (
            <CheckCircle size={16} color="#6b7280" />
          )}

          <View className={`px-2 py-0.5 rounded-full ${statusClasses}`}>
            <Text className="text-xs font-medium">
              {isConfirmed ? "Confirmado" : submission.estado}
            </Text>
          </View>
        </View>

        <View className="flex-row items-baseline gap-1">
          <Text className="text-2xl font-bold text-primary">{nota}</Text>
          <Text className="text-sm text-gray-500">/{totalScore}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Clock size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-600">
            Tempo: <Text className="font-medium">{duration}</Text>
          </Text>
        </View>

        {needsConfirmation && onConfirmPress && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onConfirmPress(submission);
            }}
            className="bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg flex-row items-center"
          >
            <Text className="text-xs font-bold text-yellow-700 mr-1">
              Confirmar
            </Text>
            <ShieldCheck size={14} color="#a16207" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
