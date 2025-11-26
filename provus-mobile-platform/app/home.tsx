import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, User } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useUserStore } from "../stores/userStore";
import { useApplicationsStore } from "../stores/applicationsStore";
import ApplicationCard from "../components/ApplicationCard";
import ErrorView from "../components/ui/ErrorView";

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();
  const { applications, fetchApplications, isLoading, error } =
    useApplicationsStore();

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [fetchApplications])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  const filteredApps = applications.filter((app) =>
    app.avaliacao.titulo.toLowerCase().includes(search.toLowerCase())
  );

  if (error && applications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <ErrorView message={error} type="network" onRetry={fetchApplications} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.push("/perfil")}>
          <View>
            <Text className="text-2xl font-bold text-primary">Dashboard</Text>
            <Text className="text-sm text-gray-500">
              Olá, {user?.nome?.split(" ")[0]}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/perfil")}
          className="p-2 bg-gray-100 rounded-full"
        >
          <User size={20} color="#004e8c" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 h-12">
          <Search size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 h-full"
            placeholder="Buscar aplicação..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ApplicationCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-400">
                Nenhuma aplicação encontrada.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#004e8c"]}
          />
        }
      />
    </SafeAreaView>
  );
}
