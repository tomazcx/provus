import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import HtmlWithMath from "./ui/HtmlWithMath";
import {
  CheckCircle2,
  XCircle,
  Circle,
  MessageSquare,
  Save,
} from "lucide-react-native";
import {
  AvaliadorQuestaoDetalheApiResponse,
  EstadoQuestaoCorrigida,
} from "../types/api/response/AvaliadorQuestaoDetalhe.response";
import { TipoQuestaoEnum } from "../enums/TipoQuestaoEnum";
import { useCorrectionStore } from "../stores/correctionStore";
import { useToast } from "../hooks/useToast";

interface Props {
  questao: AvaliadorQuestaoDetalheApiResponse;
  numero: number;
  applicationId: number;
  submissionId: number;
}

export default function AnsweredQuestionCard({
  questao,
  numero,
  applicationId,
  submissionId,
}: Props) {
  const { saveCorrection } = useCorrectionStore();
  const toast = useToast();

  const [pontuacaoInput, setPontuacaoInput] = useState(
    String(questao.pontuacaoObtida ?? "")
  );
  const [feedbackInput, setFeedbackInput] = useState(
    questao.textoRevisao ?? ""
  );
  const [isSavingLocal, setIsSavingLocal] = useState(false);

  const isSelected = (altId: number) => {
    const dados = questao.dadosResposta;
    if (!dados) return false;

    if ("alternativa_id" in dados) return dados.alternativa_id === altId;
    if ("alternativas_id" in dados)
      return (dados.alternativas_id as number[]).includes(altId);
    return false;
  };

  const handleSave = async () => {
    const nota = parseFloat(pontuacaoInput.replace(",", "."));

    if (isNaN(nota) || nota < 0 || nota > questao.pontuacaoMaxima) {
      toast.add({
        title: "Valor inválido",
        description: `A nota deve ser entre 0 e ${questao.pontuacaoMaxima}`,
        color: "error",
      });
      return;
    }

    setIsSavingLocal(true);
    const success = await saveCorrection(
      applicationId,
      submissionId,
      questao.id,
      {
        pontuacao: nota,
        textoRevisao: feedbackInput,
        maxPoints: questao.pontuacaoMaxima,
      }
    );
    setIsSavingLocal(false);

    if (success) {
      toast.add({
        title: "Salvo!",
        description: "Correção atualizada com sucesso.",
        color: "success",
      });
    } else {
      toast.add({
        title: "Erro",
        description: "Não foi possível salvar.",
        color: "error",
      });
    }
  };

  let statusColor = "bg-gray-100";
  let statusText = "text-gray-600";
  let statusIcon = <Circle size={16} color="#6b7280" />;
  let statusLabel = "Não Corrigida";

  if (questao.estadoCorrecao === EstadoQuestaoCorrigida.CORRETA) {
    statusColor = "bg-green-100";
    statusText = "text-green-700";
    statusIcon = <CheckCircle2 size={16} color="#15803d" />;
    statusLabel = "Correta";
  } else if (questao.estadoCorrecao === EstadoQuestaoCorrigida.INCORRETA) {
    statusColor = "bg-red-100";
    statusText = "text-red-700";
    statusIcon = <XCircle size={16} color="#b91c1c" />;
    statusLabel = "Incorreta";
  } else if (
    questao.estadoCorrecao === EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA
  ) {
    statusColor = "bg-yellow-100";
    statusText = "text-yellow-800";
    statusLabel = "Parcial";
  }

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
      {/* Header da Questão */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold">{numero}</Text>
          </View>
          <View
            className={`flex-row items-center px-2 py-1 rounded-md ${statusColor}`}
          >
            {statusIcon}
            <Text className={`ml-1 text-xs font-bold ${statusText}`}>
              {statusLabel}
            </Text>
          </View>
        </View>
        <Text className="text-xs text-gray-500 font-medium">
          {questao.pontuacaoObtida ?? 0}/{questao.pontuacaoMaxima} pts
        </Text>
      </View>

      {/* Enunciado (HTML via WebView) */}
      <View className="mb-4">
        <HtmlWithMath html={questao.titulo} />

        {questao.descricao ? (
          <View className="mt-2">
            <HtmlWithMath html={questao.descricao} textColor="#6b7280" />
          </View>
        ) : null}
      </View>

      {/* Área de Resposta */}
      <View className="border-t border-gray-100 pt-4">
        {questao.tipo === TipoQuestaoEnum.DISCURSIVA ? (
          // DISCURSIVA
          <View>
            <Text className="text-sm font-bold text-gray-700 mb-2 flex-row items-center">
              <MessageSquare size={14} color="#374151" /> Resposta do Aluno:
            </Text>
            <View className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
              <HtmlWithMath
                html={
                  (questao.dadosResposta as any)?.texto ||
                  "<p style='color: #9ca3af; font-style: italic;'>Sem resposta.</p>"
                }
              />
            </View>

            {/* Formulário de Correção */}
            <View className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <Text className="text-sm font-bold text-blue-800 mb-3">
                Correção Manual
              </Text>

              <View className="flex-row gap-4 mb-3">
                <View className="flex-1">
                  <Text className="text-xs text-blue-600 mb-1">
                    Nota (Max: {questao.pontuacaoMaxima})
                  </Text>
                  <TextInput
                    className="bg-white border border-blue-200 rounded px-3 py-2 text-gray-900"
                    keyboardType="numeric"
                    value={pontuacaoInput}
                    onChangeText={setPontuacaoInput}
                  />
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-xs text-blue-600 mb-1">
                  Feedback (Opcional)
                </Text>
                <TextInput
                  className="bg-white border border-blue-200 rounded px-3 py-2 text-gray-900 h-20"
                  multiline
                  textAlignVertical="top"
                  value={feedbackInput}
                  onChangeText={setFeedbackInput}
                  placeholder="Escreva um comentário para o aluno..."
                />
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isSavingLocal}
                className="bg-blue-600 rounded-lg py-3 flex-row justify-center items-center"
              >
                {isSavingLocal ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Save size={16} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold">
                      Salvar Correção
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // OBJETIVA / MULTIPLA ESCOLHA
          <View className="gap-2">
            {questao.alternativas.map((alt) => {
              const selected = isSelected(alt.id);
              const isCorrect = alt.isCorreto;

              let borderColor = "border-gray-200";
              let bgColor = "bg-white";
              let icon = <Circle size={20} color="#9ca3af" />;

              if (selected) {
                if (isCorrect) {
                  borderColor = "border-green-500";
                  bgColor = "bg-green-50";
                  icon = <CheckCircle2 size={20} color="#22c55e" />;
                } else {
                  borderColor = "border-red-500";
                  bgColor = "bg-red-50";
                  icon = <XCircle size={20} color="#ef4444" />;
                }
              } else if (isCorrect) {
                borderColor = "border-green-200";
                bgColor = "bg-green-50/50";
                icon = <CheckCircle2 size={20} color="#86efac" />;
              }

              return (
                <View
                  key={alt.id}
                  className={`flex-row p-3 rounded-lg border ${borderColor} ${bgColor} items-center`}
                >
                  <View className="mr-3">{icon}</View>
                  <View className="flex-1">
                    <HtmlWithMath
                      html={alt.descricao}
                      textColor={selected ? "#111827" : "#4b5563"}
                    />
                  </View>
                  {selected && (
                    <Text className="text-xs font-bold text-gray-500 ml-2">
                      Você
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
