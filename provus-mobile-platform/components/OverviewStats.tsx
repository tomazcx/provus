import React from "react";
import { View, Text } from "react-native";
import { Users, TrendingUp, PieChart, Timer } from "lucide-react-native";
import { AplicacaoStatsEntity } from "@/types/entities/Aplicacao.entity";

interface Props {
  stats: AplicacaoStatsEntity;
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-1 min-w-[45%]">
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-xs text-gray-600 mb-1">{title}</Text>
        <Text className="text-2xl font-bold" style={{ color }}>
          {value}
        </Text>
      </View>
      <Icon size={24} color="#9ca3af" />
    </View>
  </View>
);

export default function OverviewStats({ stats }: Props) {
  const formatTime = (minutes: number | null) =>
    minutes !== null ? `${minutes} min` : "--";

  const data = [
    {
      title: "Total de Participantes",
      value: stats.totalSubmissoes,
      icon: Users,
      color: "#1f2937",
    },
    {
      title: "Média Geral (%)",
      value: `${stats.mediaGeralPercentual?.toFixed(1) ?? "--"}%`,
      icon: TrendingUp,
      color: "#4f46e5",
    },
    {
      title: "Taxa de Conclusão",
      value: `${stats.taxaDeConclusaoPercentual?.toFixed(1) ?? "--"}%`,
      icon: PieChart,
      color: "#16a34a",
    },
    {
      title: "Tempo Médio Conclusão",
      value: formatTime(stats.tempoMedioMinutos),
      icon: Timer,
      color: "#3b82f6",
    },
  ];

  return (
    <View className="flex-row flex-wrap justify-between gap-4 mb-6">
      {data.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </View>
  );
}
