import React from "react";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { Search, Filter } from "lucide-react-native";
import { EstadoSubmissaoEnum } from "../../enums/EstadoSubmissaoEnum";

interface Props {
  search: string;
  onSearchChange: (text: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
}

export default function ResultsControls({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: Props) {
  const statusOptions = ["Todos", ...Object.values(EstadoSubmissaoEnum)];

  return (
    <View className="mb-4">
      <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-12 mb-4 shadow-sm">
        <Search size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900 h-full"
          placeholder="Buscar aluno (nome ou email)..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      <View>
        <View className="flex-row items-center mb-2 px-1">
          <Filter size={14} color="#6b7280" />
          <Text className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">
            Filtrar por Status
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {statusOptions.map((option) => {
            const isActive = status === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => onStatusChange(option)}
                className={`px-4 py-2 rounded-full border ${
                  isActive
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
