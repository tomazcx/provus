import "../global.css";
import { Stack } from "expo-router";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/ui/ToastConfig";

export default function Layout() {
  return (
    <View className="flex-1 bg-gray-50">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f9fafb" },
        }}
      />
      <Toast config={toastConfig} />
    </View>
  );
}
