import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react-native";
import api from "../services/api";
import { setTokens } from "../utils/token";
import { useUserStore } from "../stores/userStore";
import { useToast } from "@/hooks/useToast";

export default function LoginScreen() {
  const toast = useToast();
  const router = useRouter();
  const { fetchCurrentUser } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toast.add({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/sign-in", {
        email: email.toLowerCase(),
        senha: password,
      });

      const { token, refreshToken } = response.data;

      await setTokens(token, refreshToken);

      await fetchCurrentUser();
      router.replace("/home");
    } catch (error: any) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Falha ao realizar login.";
      toast.add({
        title: "Erro",
        description: msg,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="p-6"
      >
        <View className="w-full max-w-md mx-auto">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-white p-4 rounded-full shadow-sm mb-4">
              <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
                <Lock color="white" size={32} />
              </View>
            </View>
            <Text className="text-2xl font-bold text-primary mb-1">
              Bem-vindo de volta!
            </Text>
            <Text className="text-gray-500 text-center">
              Faça login para gerenciar suas aplicações.
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white p-6 rounded-2xl shadow-sm space-y-5 gap-4">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus:border-primary focus:bg-white">
                <Mail color="#6b7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="seu@email.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus:border-primary focus:bg-white">
                <Lock color="#6b7280" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-1"
                >
                  {showPassword ? (
                    <EyeOff color="#6b7280" size={20} />
                  ) : (
                    <Eye color="#6b7280" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`flex-row items-center justify-center bg-primary rounded-lg py-4 mt-4 ${
                isLoading ? "opacity-70" : "opacity-100"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">
                    Entrar
                  </Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
