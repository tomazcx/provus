import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getToken } from "../utils/token";
import { useUserStore } from "../stores/userStore";

export default function Index() {
  const router = useRouter();
  const { fetchCurrentUser } = useUserStore();

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();

      if (token) {
        try {
          await fetchCurrentUser();
          router.replace("/home");
        } catch {
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    }

    checkAuth();
  }, [fetchCurrentUser, router]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
