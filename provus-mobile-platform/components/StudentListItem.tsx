import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { User, ShieldAlert, Check, ExternalLink } from "lucide-react-native";
import { IProgressoAluno } from "../types/IMonitoring";
import { EstadoSubmissaoEnum } from "../enums/EstadoSubmissaoEnum";
import { useMonitoringStore } from "../stores/monitoringStore";

interface Props {
  aluno: IProgressoAluno;
  tempoRestante: string;
  onPress: (aluno: IProgressoAluno) => void;
}

export default function StudentListItem({
  aluno,
  tempoRestante,
  onPress,
}: Props) {
  const { confirmarCodigo } = useMonitoringStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const getStatusVisuals = (estado: EstadoSubmissaoEnum) => {
    switch (estado) {
      case EstadoSubmissaoEnum.INICIADA:
      case EstadoSubmissaoEnum.REABERTA:
        return { text: "Ativo", bg: "bg-green-100", textCol: "text-green-800" };

      case EstadoSubmissaoEnum.PAUSADA:
        return {
          text: "Pausado",
          bg: "bg-yellow-100",
          textCol: "text-yellow-800",
        };

      case EstadoSubmissaoEnum.AVALIADA:
      case EstadoSubmissaoEnum.ENVIADA:
        return {
          text: "Finalizado",
          bg: "bg-blue-100",
          textCol: "text-blue-800",
        };

      case EstadoSubmissaoEnum.ABANDONADA:
        return { text: "Abandonou", bg: "bg-red-100", textCol: "text-red-800" };

      case EstadoSubmissaoEnum.CANCELADA:
        return { text: "Cancelado", bg: "bg-red-100", textCol: "text-red-800" };

      case EstadoSubmissaoEnum.ENCERRADA:
        return {
          text: "Encerrado",
          bg: "bg-gray-200",
          textCol: "text-gray-800",
        };

      case EstadoSubmissaoEnum.CODIGO_CONFIRMADO:
        return {
          text: "Confirmado",
          bg: "bg-purple-100",
          textCol: "text-purple-800",
        };

      default:
        return {
          text: estado || "Inativo",
          bg: "bg-gray-100",
          textCol: "text-gray-800",
        };
    }
  };

  const visuals = getStatusVisuals(aluno.estado);
  const progressPercent =
    aluno.totalQuestoes > 0
      ? Math.round((aluno.questoesRespondidas / aluno.totalQuestoes) * 100)
      : 0;

  const needsConfirmation =
    aluno.estado === EstadoSubmissaoEnum.AVALIADA ||
    aluno.estado === EstadoSubmissaoEnum.ENVIADA;

  const handleConfirmCode = async () => {
    if (codigoInput.length !== 6) {
      Alert.alert("Erro", "O código deve ter 6 dígitos.");
      return;
    }

    setIsConfirming(true);
    const success = await confirmarCodigo(
      aluno.submissaoId,
      parseInt(codigoInput)
    );
    setIsConfirming(false);

    if (success) {
      setModalVisible(false);
      setCodigoInput("");
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => onPress(aluno)}
        className={`p-4 mb-3 rounded-xl border border-gray-200 bg-white ${
          aluno.alertas > 0 ? "border-l-4 border-l-red-500" : ""
        }`}
      >
        <View className="flex-row justify-between items-start mb-2">
          {/* Avatar e Nome */}
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
              <User size={16} color="#6b7280" />
            </View>
            <Text className="font-bold text-gray-900 flex-1" numberOfLines={1}>
              {aluno.aluno.nome}
            </Text>
          </View>

          {/* Badge Status */}
          <View className={`px-2 py-1 rounded-md ${visuals.bg}`}>
            <Text className={`text-xs font-bold ${visuals.textCol}`}>
              {visuals.text}
            </Text>
          </View>
        </View>

        {/* Barra de Progresso */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-gray-500">Progresso</Text>
            <Text className="text-xs text-gray-700 font-medium">
              {aluno.questoesRespondidas}/{aluno.totalQuestoes} (
              {progressPercent}%)
            </Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className={`h-full ${
                aluno.alertas > 0 ? "bg-red-500" : "bg-secondary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>

        {/* Footer (Alertas e Botão de Confirmação) */}
        <View className="flex-row justify-between items-center mt-1">
          <View className="flex-row items-center">
            <ShieldAlert
              size={16}
              color={aluno.alertas > 0 ? "#dc2626" : "#9ca3af"}
            />
            <Text
              className={`text-xs ml-1 ${
                aluno.alertas > 0 ? "text-red-600 font-bold" : "text-gray-400"
              }`}
            >
              {aluno.alertas} Alerta(s)
            </Text>
          </View>

          {needsConfirmation ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg flex-row items-center"
            >
              <Text className="text-xs font-bold text-yellow-700 mr-1">
                Confirmar
              </Text>
              <ExternalLink size={12} color="#a16207" />
            </TouchableOpacity>
          ) : (
            <Text
              className={`text-xs font-mono ${
                aluno.estado === EstadoSubmissaoEnum.INICIADA
                  ? "text-primary font-bold"
                  : "text-gray-400"
              }`}
            >
              {/* Se não estiver iniciado, mostra o tempo, mas em cinza, ou mostra traço se finalizado */}
              {tempoRestante}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal de Confirmação de Código */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Confirmar Entrega
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Insira o código de 6 dígitos fornecido pelo aluno{" "}
              {aluno.aluno.nome}.
            </Text>

            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest mb-6"
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={codigoInput}
              onChangeText={setCodigoInput}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 py-3 items-center"
              >
                <Text className="text-gray-600 font-medium">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmCode}
                disabled={isConfirming}
                className="flex-1 bg-primary py-3 rounded-lg items-center flex-row justify-center"
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
        </View>
      </Modal>
    </>
  );
}
