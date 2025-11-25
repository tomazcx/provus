import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowRight, Clock, CheckCircle } from "lucide-react-native";
import { SubmissaoNaListaResponse } from "../types/api/response/FindSubmissoes.response";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";

interface Props {
  submission: SubmissaoNaListaResponse;
  totalScore: number;
  onPress: (submission: SubmissaoNaListaResponse) => void;
}

const getStatusColor = (status: EstadoSubmissaoEnum) => {
  switch (status) {
    case EstadoSubmissaoEnum.AVALIADA:
    case EstadoSubmissaoEnum.ENVIADA:
      return "bg-green-100 text-green-700";
    case EstadoSubmissaoEnum.EM_ANDAMENTO:
      return "bg-blue-100 text-blue-700";
    case EstadoSubmissaoEnum.ENCERRADA:
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
}: Props) {
  const nota =
    submission.pontuacaoTotal !== null ? submission.pontuacaoTotal : 0;
  const notaPercentual =
    totalScore > 0 ? ((nota / totalScore) * 100).toFixed(0) : "0";
  const statusClasses = getStatusColor(submission.estado);
  const duration = formatDuration(
    submission.iniciadoEm,
    submission.finalizadoEm
  );

  return (
    <TouchableOpacity
      onPress={() => onPress(submission)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-center mb-2">
        {/* Nome do Aluno */}
        <Text
          className="text-lg font-semibold text-gray-900 flex-1"
          numberOfLines={1}
        >
          {submission.estudante.nome}
        </Text>

        {/* Ícone de Navegação */}
        <ArrowRight size={20} color="#9ca3af" />
      </View>

      <View className="flex-row items-center justify-between mt-2">
        {/* Status */}
        <View className="flex-row items-center gap-2">
          <CheckCircle size={16} color="#6b7280" />
          <Text
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClasses}`}
          >
            {submission.estado}
          </Text>
        </View>

        {/* Nota */}
        <View className="flex-row items-baseline gap-1">
          <Text className="text-2xl font-bold text-primary">{nota}</Text>
          <Text className="text-sm text-gray-500">/{totalScore}</Text>
        </View>
      </View>

      {/* Tempo Gasto */}
      <View className="mt-2 flex-row items-center gap-1">
        <Clock size={16} color="#9ca3af" />
        <Text className="text-sm text-gray-600">
          Tempo Gasto: <Text className="font-medium">{duration}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}
