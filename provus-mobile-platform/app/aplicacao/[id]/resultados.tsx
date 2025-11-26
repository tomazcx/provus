import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, X, ShieldAlert, Check } from "lucide-react-native";

import ResultsControls from "@/components/Results/ResultsControls";
import ResultsHeader from "@/components/Results/ResultsHeader";
import SubmissionListItem from "@/components/SubmissionListItem";
import { useApplicationsStore } from "@/stores/applicationsStore";
import { useSubmissionsStore } from "@/stores/submissionsStore";
import { SubmissaoNaListaResponse } from "@/types/api/response/FindSubmissoes.response";

export default function ApplicationResultsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const appId = parseInt(Array.isArray(id) ? id[0] : id || "0", 10);

  const { fetchSubmissions, submissions, isLoading, confirmarCodigo } =
    useSubmissionsStore();
  const { getApplicationById } = useApplicationsStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissaoNaListaResponse | null>(null);
  const [codigoInput, setCodigoInput] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasError, setHasError] = useState(false);

  const application = getApplicationById(appId);
  const totalScore = application?.avaliacao?.pontuacao ?? 0;

  useEffect(() => {
    if (appId) {
      fetchSubmissions(appId);
    }
  }, [appId]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        sub.estudante.nome.toLowerCase().includes(search.toLowerCase()) ||
        sub.estudante.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || sub.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  const handleStudentPress = (submission: SubmissaoNaListaResponse) => {
    router.push({
      pathname: "/resultado/[submissionId]",
      params: { submissionId: submission.id, applicationId: appId },
    } as any);
  };

  const handleOpenConfirm = (submission: SubmissaoNaListaResponse) => {
    setSelectedSubmission(submission);
    setCodigoInput("");
    setHasError(false);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSubmission(null);
    setHasError(false);
  };

  const handleConfirmCode = async () => {
    setHasError(false);
    if (codigoInput.length !== 6 || !selectedSubmission) {
      return;
    }

    setIsConfirming(true);
    const success = await confirmarCodigo(
      appId,
      selectedSubmission.id,
      parseInt(codigoInput, 10)
    );
    setIsConfirming(false);

    if (success) {
      handleCloseModal();
    } else {
      setHasError(true);
    }
  };

  if (isLoading || !application) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#004e8c" />
        <Text className="text-gray-500 mt-4">Carregando resultados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Resultados</Text>
      </View>

      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            <ResultsHeader
              titulo={application.avaliacao.titulo}
              descricao={application.avaliacao.descricao}
              dataAplicacao={application.dataInicio}
            />
            <ResultsControls
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
            />
            <Text className="text-sm text-gray-600 mb-3 font-medium">
              Exibindo {filteredSubmissions.length} submissões
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SubmissionListItem
            submission={item}
            totalScore={totalScore}
            onPress={handleStudentPress}
            onConfirmPress={handleOpenConfirm} 
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-400 text-center">
              Nenhum resultado encontrado com os filtros atuais.
            </Text>
          </View>
        }
      />

      {/* --- Modal de Confirmação --- */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/60 items-center justify-center p-6"
        >
          <View className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-900">
                Confirmar Entrega
              </Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                className="p-1 -mr-2 -mt-2"
              >
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-gray-600 mb-6">
              Confirme o código do aluno{" "}
              <Text className="font-bold">
                {selectedSubmission?.estudante.nome}
              </Text>
              .
            </Text>

            <View className="mb-6">
              <TextInput
                className={`border rounded-lg px-4 py-4 text-center text-3xl font-mono tracking-[5px] font-bold ${
                  hasError
                    ? "border-red-500 bg-red-50 text-red-900"
                    : "border-gray-300 text-gray-900 bg-gray-50 focus:border-primary focus:bg-white"
                }`}
                placeholder="000000"
                placeholderTextColor={hasError ? "#fca5a5" : "#9ca3af"}
                keyboardType="number-pad"
                maxLength={6}
                value={codigoInput}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9]/g, "").slice(0, 6);
                  setCodigoInput(cleanText);
                  if (hasError) setHasError(false);
                }}
              />
              {hasError && (
                <View className="flex-row items-center justify-center mt-2">
                  <ShieldAlert size={14} color="#ef4444" />
                  <Text className="text-red-600 text-xs font-bold ml-1">
                    Código incorreto.
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCloseModal}
                className="flex-1 py-3 items-center justify-center bg-gray-100 rounded-lg"
              >
                <Text className="text-gray-700 font-medium">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmCode}
                disabled={isConfirming || codigoInput.length < 6}
                className={`flex-1 py-3 rounded-lg items-center flex-row justify-center ${
                  isConfirming || codigoInput.length < 6
                    ? "bg-primary/50"
                    : "bg-primary"
                }`}
              >
                {isConfirming ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Check size={18} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold">Confirmar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
