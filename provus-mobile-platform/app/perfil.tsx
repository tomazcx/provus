import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  LogOut,
  ShieldCheck,
} from "lucide-react-native";
import { useUserStore } from "../stores/userStore";
import { useToast } from "../hooks/useToast";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, requestPasswordReset, logout, isLoading } =
    useUserStore();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.nome);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    if (name.length < 3) {
      toast.add({
        title: "Nome curto",
        description: "O nome deve ter pelo menos 3 caracteres.",
        color: "warning",
      });
      return;
    }
    if (currentPassword.length < 6) {
      toast.add({
        title: "Senha obrigatória",
        description: "Digite sua senha atual para salvar as alterações.",
        color: "warning",
      });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.add({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        color: "error",
      });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.add({
        title: "Senha fraca",
        description: "A nova senha deve ter no mínimo 6 caracteres.",
        color: "warning",
      });
      return;
    }

    const success = await updateProfile({
      nome: name,
      senha: currentPassword,
      novaSenha: newPassword || "",
    });

    if (success) {
      toast.add({
        title: "Sucesso!",
        description: "Perfil atualizado.",
        color: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return;
    Alert.alert(
      "Redefinir Senha",
      `Enviar link de redefinição para ${email}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            const success = await requestPasswordReset(email);
            if (success) {
              toast.add({
                title: "E-mail enviado",
                description: "Verifique sua caixa de entrada.",
                color: "info",
              });
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    show: boolean,
    toggleShow: () => void,
    placeholder: string
  ) => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-white focus:border-primary">
        <Lock size={20} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-3 text-gray-900"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={!show}
          value={value}
          onChangeText={onChange}
        />
        <TouchableOpacity onPress={toggleShow} className="p-1">
          {show ? (
            <EyeOff size={20} color="#6b7280" />
          ) : (
            <Eye size={20} color="#6b7280" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          Configurações do Perfil
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {/* Seção: Info Pessoal */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <User size={20} color="#4f46e5" />
              <Text className="text-lg font-bold text-gray-900 ml-2">
                Informações Pessoais
              </Text>
            </View>

            <View className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Nome Completo
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-white">
                  <User size={20} color="#9ca3af" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    value={name}
                    onChangeText={setName}
                    placeholder="Seu nome"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  E-mail (Login)
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-100">
                  <Mail size={20} color="#9ca3af" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-500"
                    value={email}
                    editable={false}
                  />
                </View>
                <Text className="text-xs text-gray-400 mt-1">
                  O e-mail não pode ser alterado.
                </Text>
              </View>
            </View>
          </View>

          {/* Seção: Segurança */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <ShieldCheck size={20} color="#4f46e5" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Segurança
                </Text>
              </View>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text className="text-sm text-primary font-medium">
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <View className="bg-blue-50 p-3 rounded-lg mb-4 flex-row items-center border border-blue-100">
                <View className="mr-3">
                  <ShieldCheck size={18} color="#3b82f6" />
                </View>
                <Text className="text-xs text-blue-700 flex-1">
                  Para confirmar qualquer alteração (nome ou senha), digite sua
                  senha atual.
                </Text>
              </View>

              {renderPasswordInput(
                "Senha Atual (Obrigatório)",
                currentPassword,
                setCurrentPassword,
                showCurrent,
                () => setShowCurrent(!showCurrent),
                "Sua senha atual"
              )}

              <View className="h-[1px] bg-gray-100 my-2" />

              {renderPasswordInput(
                "Nova Senha (Opcional)",
                newPassword,
                setNewPassword,
                showNew,
                () => setShowNew(!showNew),
                "Deixe em branco para manter"
              )}

              {renderPasswordInput(
                "Confirmar Nova Senha",
                confirmPassword,
                setConfirmPassword,
                showConfirm,
                () => setShowConfirm(!showConfirm),
                "Repita a nova senha"
              )}
            </View>
          </View>

          {/* Botões de Ação */}
          <View className="gap-4 mb-10">
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              className={`flex-row items-center justify-center bg-primary rounded-xl py-4 shadow-sm ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-lg">
                    Salvar Alterações
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-center bg-red-50 border border-red-100 rounded-xl py-4"
            >
              <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
              <Text className="text-red-600 font-bold text-lg">
                Sair da Conta
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
