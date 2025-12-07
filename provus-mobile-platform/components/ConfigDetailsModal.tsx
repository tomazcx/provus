import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import {
  X,
  Clock,
  Shield,
  Settings2,
  Eye,
  FileCheck,
} from "lucide-react-native";
import { ConfiguracoesEntity } from "../types/entities/Configuracoes.entity";

interface Props {
  visible: boolean;
  onClose: () => void;
  config: ConfiguracoesEntity;
}

export default function ConfigDetailsModal({
  visible,
  onClose,
  config,
}: Props) {
  const gerais = config.configuracoesGerais;
  const seguranca = config.configuracoesSeguranca;

  const renderItem = (
    label: string,
    value: string | number | boolean,
    icon?: any
  ) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
      <Text className="text-gray-600 text-sm flex-1 mr-2">{label}</Text>
      <View className="flex-row items-center">
        {typeof value === "boolean" ? (
          <View
            className={`px-2 py-0.5 rounded text-xs ${
              value ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                value ? "text-green-700" : "text-gray-500"
              }`}
            >
              {value ? "Ativado" : "Desativado"}
            </Text>
          </View>
        ) : (
          <Text className="text-gray-900 font-medium text-sm">{value}</Text>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[85%] w-full">
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200 flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Settings2 size={24} color="#004e8c" className="mr-3" />
              <Text className="text-xl font-bold text-gray-900">
                Configurações da Prova
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-4 pb-10">
            {/* Seção Geral */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Clock size={20} color="#6b7280" />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  Tempo e Regras Gerais
                </Text>
              </View>
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {renderItem("Tempo Máximo", `${gerais.tempoMaximo} min`)}
                {renderItem("Tempo Mínimo", `${gerais.tempoMinimo} min`)}
                {renderItem(
                  "Mostrar Pontuação ao Final",
                  gerais.mostrarPontuacao
                )}
                {renderItem("Permitir Revisão", gerais.permitirRevisao)}
                {renderItem(
                  "Mostrar Valor das Questões",
                  gerais.exibirPontuacaoQuestoes
                )}
              </View>
            </View>

            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Shield size={20} color="#6b7280" />
                <Text className="text-lg font-bold text-gray-800 ml-2">
                  Segurança
                </Text>
              </View>
              <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {renderItem(
                  "Proibir Troca de Abas",
                  seguranca.proibirTrocarAbas
                )}
                {renderItem(
                  "Proibir Copiar/Colar",
                  seguranca.proibirCopiarColar
                )}
                {renderItem(
                  "Limite de Tentativas",
                  seguranca.quantidadeTentativas
                )}
                {renderItem(
                  "Correção IA (Discursivas)",
                  seguranca.ativarCorrecaoDiscursivaViaIa
                )}
              </View>
            </View>

            {seguranca.punicoes && seguranca.punicoes.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <Shield size={20} color="#dc2626" />
                  <Text className="text-lg font-bold text-gray-800 ml-2">
                    Regras de Punição Ativas
                  </Text>
                </View>
                <View className="bg-red-50 rounded-xl p-4 border border-red-100">
                  {seguranca.punicoes.map((punicao, index) => (
                    <View
                      key={index}
                      className="mb-3 pb-3 border-b border-red-200 last:border-0 last:mb-0 last:pb-0"
                    >
                      <Text className="font-bold text-red-800 text-sm mb-1">
                        {punicao.tipoInfracao}
                      </Text>
                      <Text className="text-xs text-red-600">
                        Após {punicao.quantidadeOcorrencias} ocorrência(s):{" "}
                        {punicao.tipoPenalidade}
                        {punicao.pontuacaoPerdida > 0
                          ? ` (-${punicao.pontuacaoPerdida} pts)`
                          : ""}
                        {punicao.tempoReduzido > 0
                          ? ` (-${punicao.tempoReduzido}s)`
                          : ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
