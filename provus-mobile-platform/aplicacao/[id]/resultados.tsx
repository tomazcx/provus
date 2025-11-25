import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search } from "lucide-react-native";

import { useSubmissionsStore } from "../../stores/submissionsStore";
import { useApplicationsStore } from "../../stores/applicationsStore";
import SubmissionListItem from "../../components/SubmissionListItem";
import { SubmissaoNaListaResponse } from "../../types/api/response/FindSubmissoes.response";
import { stripHtml } from "../../utils/stripHtml";

export default function ApplicationResultsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const appId = parseInt(Array.isArray(id) ? id[0] : id || "0", 10);

  const { fetchSubmissions, submissions, isLoading } = useSubmissionsStore();
  const { getApplicationById } = useApplicationsStore();

  const application = getApplicationById(appId);
  const totalScore = application?.avaliacao?.pontuacao ?? 0;

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (appId) {
      fetchSubmissions(appId);
    }
  }, [appId]);

  const filteredSubmissions = submissions.filter((sub) =>
    sub.estudante.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentPress = (submission: SubmissaoNaListaResponse) => {
    router.push({
      pathname: "/resultado/[submissionId]",
      params: { submissionId: submission.id, applicationId: appId },
    } as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-gray-500 mt-4">Carregando resultados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header Navegação */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          Resultados: {stripHtml(application?.avaliacao.titulo || "...")}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Barra de Busca */}
        <View className="flex-row items-center bg-white p-3 rounded-lg border border-gray-300 mb-6">
          <Search size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-800"
            placeholder="Buscar aluno por nome..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Lista de Submissões */}
        {filteredSubmissions.length === 0 && !searchTerm ? (
          <Text className="text-center text-gray-500 py-10">
            Ainda não há resultados para esta aplicação.
          </Text>
        ) : filteredSubmissions.length === 0 && searchTerm ? (
          <Text className="text-center text-gray-500 py-10">
            Nenhum aluno encontrado com o nome &quot;{searchTerm}&quot;.
          </Text>
        ) : (
          <View>
            <Text className="text-sm text-gray-600 mb-3 font-medium">
              {filteredSubmissions.length} resultado(s) encontrado(s)
            </Text>
            {filteredSubmissions.map((submission) => (
              <SubmissionListItem
                key={submission.id}
                submission={submission}
                totalScore={totalScore}
                onPress={handleStudentPress}
              />
            ))}
          </View>
        )}
        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
}
