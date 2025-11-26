import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useRootNavigationState } from "expo-router";
import { getToken } from "../utils/token";
import { useUserStore } from "../stores/userStore";
import ErrorView from "../components/ui/ErrorView";

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const { fetchCurrentUser, isLoading, error, user, setUser } = useUserStore();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    if (rootNavigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [rootNavigationState]);

  async function bootstrap() {
    setIsCheckingToken(true);
    try {
      const token = await getToken();
      if (token) {
        await fetchCurrentUser();
      } else {
        setUser(null);
      }
    } finally {
      setIsCheckingToken(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isNavigationReady || isCheckingToken || isLoading) return;

    if (error) return;

    if (user) {
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [isNavigationReady, isCheckingToken, isLoading, user, error]);

  if (error) {
    return <ErrorView message={error} type="network" onRetry={bootstrap} />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
