import React from "react";
import { View, Text, FlatList } from "react-native";
import {
  LogIn,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
} from "lucide-react-native";
import { ILogAtividade } from "../types/IMonitoring";
import { TipoAtividadeEnum } from "../enums/TipoAtividadeEnum";

interface Props {
  atividades: ILogAtividade[];
}

export default function ActivityFeed({ atividades }: Props) {
  const getIcon = (tipo: TipoAtividadeEnum) => {
    switch (tipo) {
      case TipoAtividadeEnum.ENTROU:
        return { icon: LogIn, color: "#3b82f6", bg: "bg-blue-100" };
      case TipoAtividadeEnum.FINALIZOU:
        return { icon: CheckCircle, color: "#22c55e", bg: "bg-green-100" };
      case TipoAtividadeEnum.PAUSOU:
        return { icon: PauseCircle, color: "#eab308", bg: "bg-yellow-100" };
      case TipoAtividadeEnum.RETOMOU:
        return { icon: PlayCircle, color: "#eab308", bg: "bg-yellow-100" };
      case TipoAtividadeEnum.PENALIDADE:
        return { icon: AlertTriangle, color: "#ef4444", bg: "bg-red-100" };
      default:
        return { icon: LogIn, color: "#6b7280", bg: "bg-gray-100" };
    }
  };

  const renderItem = ({ item }: { item: ILogAtividade }) => {
    const visual = getIcon(item.tipo);
    const IconComponent = visual.icon;

    let time = "00:00";
    try {
      time = new Date(item.timestamp).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      time = "--:--";
    }

    return (
      <View className="flex-row items-center mb-3">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${visual.bg}`}
        >
          <IconComponent size={14} color={visual.color} />
        </View>
        <View className="flex-1 border-b border-gray-100 pb-3">
          <Text className="text-xs text-gray-400 mb-0.5">{time}</Text>
          <Text className="text-sm text-gray-800">
            <Text className="font-bold">{item.alunoNome}</Text> {item.descricao}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-200 flex-1">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        Atividade Recente
      </Text>

      <FlatList
        data={atividades}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} 
        ListEmptyComponent={
          <Text className="text-gray-400 text-center py-4">
            Nenhuma atividade registrada.
          </Text>
        }
      />
    </View>
  );
}
