import React from "react";
import { View, Text } from "react-native";
import { Clock, Calendar, User, Award } from "lucide-react-native";

interface Props {
  submission: any;
  student: { nome: string; email: string };
  totalScore: number;
}

export default function SubmissionHeader({
  submission,
  student,
  totalScore,
}: Props) {
  const score = submission.pontuacaoTotal || 0;
  const percent = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;

  const formattedDate = submission.finalizadoEm
    ? new Date(submission.finalizadoEm).toLocaleString("pt-BR")
    : "N/A";

  let timeTaken = "-";
  if (submission.criadoEm && submission.finalizadoEm) {
    const start = new Date(submission.criadoEm).getTime();
    const end = new Date(submission.finalizadoEm).getTime();
    const diffMinutes = Math.round((end - start) / 60000);
    timeTaken = `${diffMinutes} min`;
  }

  return (
    <View className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-4">
      {/* Info do Aluno */}
      <View className="flex-row items-center mb-4 border-b border-gray-100 pb-4">
        <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-3">
          <User size={24} color="#004e8c" />
        </View>
        <View>
          <Text className="text-lg font-bold text-gray-900">
            {student.nome}
          </Text>
          <Text className="text-sm text-gray-500">{student.email}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-4">
        {/* Nota */}
        <View className="flex-1 min-w-[45%] bg-gray-50 p-3 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Award size={14} color="#004e8c" style={{ marginRight: 4 }} />
            <Text className="text-xs text-gray-500">Nota Final</Text>
          </View>
          <Text className="text-xl font-bold text-primary">
            {score}/{totalScore}{" "}
            <Text className="text-sm font-normal text-gray-500">
              ({percent}%)
            </Text>
          </Text>
        </View>

        {/* Tempo */}
        <View className="flex-1 min-w-[45%] bg-gray-50 p-3 rounded-lg">
          <View className="flex-row items-center mb-1">
            <Clock size={14} color="#6b7280" style={{ marginRight: 4 }} />
            <Text className="text-xs text-gray-500">Tempo</Text>
          </View>
          <Text className="text-base font-bold text-gray-900">{timeTaken}</Text>
        </View>

        {/* Data */}
        <View className="w-full bg-gray-50 p-3 rounded-lg flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" style={{ marginRight: 4 }} />
            <Text className="text-xs text-gray-500">Enviado em</Text>
          </View>
          <Text className="text-sm font-bold text-gray-900">
            {formattedDate}
          </Text>
        </View>
      </View>
    </View>
  );
}
