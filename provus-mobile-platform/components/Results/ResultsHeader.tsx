import React from "react";
import { View, Text } from "react-native";
import { Calendar, Clock, FileText } from "lucide-react-native";
import { stripHtml } from "../../utils/stripHtml";

interface Props {
  titulo: string;
  descricao?: string;
  dataAplicacao: Date;
}

export default function ResultsHeader({
  titulo,
  descricao,
  dataAplicacao,
}: Props) {
  const formattedDate = dataAplicacao.toLocaleDateString("pt-BR");
  const formattedTime = dataAplicacao.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4">
      <View className="flex-row items-start mb-4">
        <View className="w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-3">
          <FileText size={24} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 mb-1">
            {stripHtml(titulo)}
          </Text>
          {descricao ? (
            <Text className="text-sm text-gray-500" numberOfLines={2}>
              {stripHtml(descricao)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row gap-4 pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Calendar size={14} color="#6b7280" style={{ marginRight: 4 }} />
          <Text className="text-sm text-gray-600">{formattedDate}</Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={14} color="#6b7280" style={{ marginRight: 4 }} />
          <Text className="text-sm text-gray-600">{formattedTime}</Text>
        </View>
      </View>
    </View>
  );
}
