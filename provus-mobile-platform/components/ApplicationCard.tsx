import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  FilePlus2,
  Hourglass,
} from "lucide-react-native";
import { router } from "expo-router";
import { AplicacaoEntity } from "../types/entities/Aplicacao.entity";
import { EstadoAplicacaoEnum } from "../enums/EstadoAplicacaoEnum";
import { stripHtml } from "../utils/stripHtml";

interface Props {
  item: AplicacaoEntity;
}

export default function ApplicationCard({ item }: Props) {
  const getStatusVisuals = (estado: EstadoAplicacaoEnum) => {
    switch (estado) {
      case EstadoAplicacaoEnum.PAUSADA:
        return {
          icon: PauseCircle,
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          iconColor: "#ca8a04",
        };
      case EstadoAplicacaoEnum.EM_ANDAMENTO:
        return {
          icon: Hourglass,
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          iconColor: "#ca8a04",
        };
      case EstadoAplicacaoEnum.AGENDADA:
        return {
          icon: CalendarClock,
          bg: "bg-blue-100",
          text: "text-blue-800",
          iconColor: "#2563eb",
        };
      case EstadoAplicacaoEnum.CONCLUIDA:
      case EstadoAplicacaoEnum.FINALIZADA:
        return {
          icon: CheckCircle2,
          bg: "bg-green-100",
          text: "text-green-800",
          iconColor: "#16a34a",
        };
      case EstadoAplicacaoEnum.CANCELADA:
        return {
          icon: XCircle,
          bg: "bg-red-100",
          text: "text-red-800",
          iconColor: "#dc2626",
        };
      default:
        return {
          icon: FilePlus2,
          bg: "bg-gray-100",
          text: "text-gray-800",
          iconColor: "#4b5563",
        };
    }
  };

  const visuals = getStatusVisuals(item.estado);
  const IconComponent = visuals.icon;

  const formattedDate =
    item.estado === EstadoAplicacaoEnum.AGENDADA
      ? item.dataInicio.toLocaleDateString("pt-BR")
      : item.dataFim.toLocaleDateString("pt-BR");

  const isFinished =
    item.estado === EstadoAplicacaoEnum.FINALIZADA ||
    item.estado === EstadoAplicacaoEnum.CONCLUIDA ||
    item.estado === EstadoAplicacaoEnum.CANCELADA;

  const handlePress = () => {
    if (isFinished) {
      router.push(`/aplicacao/${item.id}` as any);
    } else {
      router.push(`/monitoramento/${item.id}` as any);
    }
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm"
    >
      <View className="flex-row items-start">
        {/* Ícone do Status */}
        <View
          className={`w-12 h-12 rounded-lg items-center justify-center mr-3 ${visuals.bg}`}
        >
          <IconComponent color={visuals.iconColor} size={24} />
        </View>

        {/* Conteúdo */}
        <View className="flex-1">
          <Text
            className="text-base font-bold text-gray-900 mb-1"
            numberOfLines={2}
          >
            {stripHtml(item.avaliacao.titulo)}
          </Text>

          <Text className="text-xs text-gray-500 mb-2">
            {item.estado === EstadoAplicacaoEnum.AGENDADA
              ? "Agendada para: "
              : "Data: "}
            {formattedDate}
          </Text>

          <View className="flex-row items-center flex-wrap gap-2">
            {/* Badge de Status */}
            <View className={`px-2 py-1 rounded-md ${visuals.bg}`}>
              <Text className={`text-xs font-medium ${visuals.text}`}>
                {item.estado}
              </Text>
            </View>

            {/* Badge de Participantes */}
            <Text className="text-xs text-gray-500">
              {item.totalSubmissoes} participante(s)
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
