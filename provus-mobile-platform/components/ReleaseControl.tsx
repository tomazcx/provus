import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Eye, EyeOff, Lock, FileCheck } from "lucide-react-native";
import { useApplicationsStore } from "@/stores/applicationsStore";
import { AplicacaoEntity } from "@/types/entities/Aplicacao.entity";

interface Props {
  aplicacao: AplicacaoEntity;
}

export default function ReleaseControl({ aplicacao }: Props) {
  const { updateReleaseConfig } = useApplicationsStore();
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  const mostrarPontuacao =
    aplicacao.configuracao?.configuracoesGerais?.mostrarPontuacao ?? false;
  const permitirRevisao =
    aplicacao.configuracao?.configuracoesGerais?.permitirRevisao ?? false;

  const toggleScore = async () => {
    setLoadingScore(true);
    await updateReleaseConfig(aplicacao.id, {
      mostrarPontuacao: !mostrarPontuacao,
    });
    setLoadingScore(false);
  };

  const toggleReview = async () => {
    setLoadingReview(true);
    await updateReleaseConfig(aplicacao.id, {
      permitirRevisao: !permitirRevisao,
    });
    setLoadingReview(false);
  };

  return (
    <View className="flex-row gap-3 mb-6">
      {/* Botão Mostrar Pontuação */}
      <TouchableOpacity
        onPress={toggleScore}
        disabled={loadingScore}
        className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl border shadow-sm ${
          mostrarPontuacao
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-200"
        }`}
      >
        {loadingScore ? (
          <ActivityIndicator
            size="small"
            color={mostrarPontuacao ? "#16a34a" : "#6b7280"}
          />
        ) : (
          <>
            {mostrarPontuacao ? (
              <Eye size={20} color="#16a34a" />
            ) : (
              <EyeOff size={20} color="#6b7280" />
            )}
            <Text
              className={`ml-2 text-sm font-bold ${
                mostrarPontuacao ? "text-green-700" : "text-gray-600"
              }`}
            >
              {mostrarPontuacao ? "Notas Visíveis" : "Notas Ocultas"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Botão Permitir Revisão */}
      <TouchableOpacity
        onPress={toggleReview}
        disabled={loadingReview}
        className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl border shadow-sm ${
          permitirRevisao
            ? "bg-green-50 border-green-200"
            : "bg-white border-gray-200"
        }`}
      >
        {loadingReview ? (
          <ActivityIndicator
            size="small"
            color={permitirRevisao ? "#16a34a" : "#6b7280"}
          />
        ) : (
          <>
            {permitirRevisao ? (
              <FileCheck size={20} color="#16a34a" />
            ) : (
              <Lock size={20} color="#6b7280" />
            )}
            <Text
              className={`ml-2 text-sm font-bold ${
                permitirRevisao ? "text-green-700" : "text-gray-600"
              }`}
            >
              {permitirRevisao ? "Revisão Liberada" : "Revisão Bloqueada"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
