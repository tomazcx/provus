import React from "react";
import { View, Text, ScrollView } from "react-native";
import { ShieldAlert, AlertTriangle, Copy } from "lucide-react-native";
import { AplicacaoViolationEntity } from "../types/entities/Aplicacao.entity";
import { TipoInfracaoEnum } from "../enums/TipoInfracaoEnum";

interface Props {
  violations: AplicacaoViolationEntity[];
}

export default function ViolationsList({ violations }: Props) {
  const getInfractionVisuals = (type: TipoInfracaoEnum) => {
    switch (type) {
      case TipoInfracaoEnum.TROCA_ABAS:
        return {
          icon: AlertTriangle,
          bg: "bg-orange-100",
          text: "text-orange-700",
          iconColor: "#c2410c",
          label: "Troca de Abas",
        };
      case TipoInfracaoEnum.COPIAR_COLAR:
        return {
          icon: Copy,
          bg: "bg-red-100",
          text: "text-red-700",
          iconColor: "#b91c1c",
          label: "Copiar/Colar",
        };
      default:
        return {
          icon: ShieldAlert,
          bg: "bg-gray-100",
          text: "text-gray-700",
          iconColor: "#374151",
          label: type,
        };
    }
  };

  const renderViolation = (item: AplicacaoViolationEntity) => {
    const visuals = getInfractionVisuals(item.tipoInfracao);
    const IconComponent = visuals.icon;
    const time = new Date(item.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View
        key={item.id}
        className="flex-row items-center bg-white p-3 rounded-lg border border-gray-100 mb-2"
      >
        <View
          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${visuals.bg}`}
        >
          <IconComponent size={18} color={visuals.iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-900">
            {item.estudanteNome}
          </Text>
          <Text className={`text-xs font-medium ${visuals.text}`}>
            {visuals.label}
          </Text>
        </View>
        <Text className="text-xs text-gray-400 font-mono">{time}</Text>
      </View>
    );
  };

  if (!violations || violations.length === 0) {
    return (
      <View className="bg-white p-6 rounded-xl border border-gray-200 items-center justify-center border-dashed">
        <ShieldAlert size={32} color="#9ca3af" className="mb-2 opacity-50" />
        <Text className="text-gray-400 text-center">
          Nenhuma infração registrada até o momento.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">
          Infrações ({violations.length})
        </Text>
      </View>

      <ScrollView
        className="max-h-60"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {violations.map((violation) => renderViolation(violation))}
      </ScrollView>
    </View>
  );
}
