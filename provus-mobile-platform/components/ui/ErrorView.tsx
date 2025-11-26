import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react-native";

interface Props {
  message?: string;
  onRetry?: () => void;
  type?: "network" | "general";
}

export default function ErrorView({
  message = "Não foi possível conectar ao servidor.",
  onRetry,
  type = "general",
}: Props) {
  const Icon = type === "network" ? WifiOff : AlertCircle;

  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-50">
      <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
        <Icon size={40} color="#ef4444" />
      </View>

      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {type === "network" ? "Sem Conexão" : "Ops! Algo deu errado"}
      </Text>

      <Text className="text-base text-gray-500 text-center mb-8 leading-6">
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="flex-row items-center bg-primary px-6 py-3 rounded-xl shadow-sm active:opacity-80"
        >
          <RefreshCw size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold text-base">
            Tentar Novamente
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
