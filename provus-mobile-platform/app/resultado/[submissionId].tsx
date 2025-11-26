import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useCorrectionStore } from "../../stores/correctionStore";
import SubmissionHeader from "../../components/SubmissionHeader";
import AnsweredQuestionCard from "../../components/AnsweredQuestionCard";

export default function SubmissionResultScreen() {
  const { submissionId, applicationId } = useLocalSearchParams();
  const router = useRouter();

  const { fetchSubmissionDetails, submissionDetails, isLoading, reset } =
    useCorrectionStore();

  useEffect(() => {
    if (submissionId && applicationId) {
      fetchSubmissionDetails(
        parseInt(applicationId as string),
        parseInt(submissionId as string)
      );
    }
    return () => reset();
  }, [submissionId, applicationId, fetchSubmissionDetails, reset]);

  if (isLoading || !submissionDetails) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#004e8c" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Navegação */}
      <View className="px-4 py-3 flex-row items-center border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text className="text-lg font-bold text-gray-900">
            {submissionDetails.estudante.nome}
          </Text>
          <Text className="text-xs text-gray-500">Resultados da Avaliação</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <SubmissionHeader
          submission={submissionDetails.submissao}
          student={submissionDetails.estudante}
          totalScore={submissionDetails.pontuacaoTotalAvaliacao}
        />

        <Text className="text-lg font-bold text-gray-900 mt-6 mb-4">
          Respostas Detalhadas
        </Text>

        <View className="gap-4">
          {submissionDetails.questoes.map((questao, index) => (
            <AnsweredQuestionCard
              key={questao.id}
              questao={questao}
              numero={index + 1}
              applicationId={parseInt(applicationId as string)}
              submissionId={parseInt(submissionId as string)}
            />
          ))}
        </View>

        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
}
