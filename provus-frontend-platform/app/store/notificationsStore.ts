import type { INotification } from "~/types/INotification";
import type { PunicaoPorOcorrenciaTemplateData } from "~/types/api/response/Notificacao.response";

const mapInfracaoToVisuals = (tipoInfracao: string) => {
  switch (tipoInfracao) {
    case "Troca de Abas":
      return {
        icon: "i-lucide-arrow-right-left",
        iconColor: "text-orange-500",
      };
    case "Print Screen":
      return { icon: "i-lucide-camera", iconColor: "text-red-500" };
    case "Copiar e Colar":
      return { icon: "i-lucide-copy", iconColor: "text-red-500" };
    case "Ferramentas de Desenvolvedor":
      return { icon: "i-lucide-terminal-square", iconColor: "text-purple-500" };
    default:
      return { icon: "i-lucide-shield-alert", iconColor: "text-gray-500" };
  }
};

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref<INotification[]>([]);
  let $websocket: ReturnType<typeof useWebSocket> | null = null;
  const toast = useToast();

  function initializeWebSocketListeners() {
    if (!$websocket || !$websocket.socket.value?.connected) {
      console.warn(
        "NotificationsStore: WebSocket não inicializado ou não conectado, não é possível configurar listeners."
      );
      return;
    }

    console.log(
      "NotificationsStore: Configurando listener para punicao-por-ocorrencia..."
    );

    $websocket.on<PunicaoPorOcorrenciaTemplateData>(
      "punicao-por-ocorrencia",
      (data) => {
        console.log("Notificação de punição recebida:", data);
        const { icon, iconColor } = mapInfracaoToVisuals(data.tipoInfracao);

        const newNotificationData: Omit<
          INotification,
          "id" | "timestamp" | "read"
        > = {
          title: `Infração Detectada: ${data.tipoInfracao}`,
          description: `Aluno ${data.nomeEstudante} na avaliação "${data.nomeAvaliacao}". Ocorrências: ${data.quantidadeOcorrencias}.`,
          icon: icon,
          iconColor: iconColor,
        };

        addNotification(newNotificationData);

        toast.add({
          title: newNotificationData.title,
          description: newNotificationData.description,
          icon: newNotificationData.icon,
          color: "error",
        });
      }
    );

    $websocket.on("avaliador-conectado", (data: { message: string }) => {
      console.log(
        "NotificationsStore: Conexão com AvaliadorGateway confirmada.",
        data.message
      );
    });

    $websocket.on("erro-validacao", (data: { message: string }) => {
      console.error(
        "NotificationsStore: Erro de validação do WebSocket:",
        data.message
      );
    });
  }

  onMounted(() => {
    const nuxtApp = useNuxtApp();
    $websocket = nuxtApp.$websocket as ReturnType<typeof useWebSocket>;

    if (!$websocket) {
      console.error(
        "NotificationsStore: $websocket não foi injetado corretamente pelo plugin."
      );
      return;
    }

    watch(
      $websocket.isConnected,
      (connected) => {
        if (connected) {
          initializeWebSocketListeners();
        } else {
          console.log("NotificationsStore: WebSocket desconectado.");

          if ($websocket?.socket?.value) {
            $websocket.socket.value.off("punicao-por-ocorrencia");
            $websocket.socket.value.off("avaliador-conectado");
            $websocket.socket.value.off("erro-validacao");
            console.log(
              "NotificationsStore: Listeners removidos devido à desconexão."
            );
          }
        }
      },
      { immediate: true }
    );
  });

  onUnmounted(() => {
    if ($websocket?.socket?.value) {
      $websocket.socket.value.off("punicao-por-ocorrencia");
      $websocket.socket.value.off("avaliador-conectado");
      $websocket.socket.value.off("erro-validacao");
      console.log("NotificationsStore: Listeners removidos ao desmontar.");
    }
  });

  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => !n.read)
  );

  const unreadCount = computed(() => unreadNotifications.value.length);

  function addNotification(
    data: Omit<INotification, "id" | "timestamp" | "read">
  ) {
    const newNotification: INotification = {
      ...data,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
    };
    notifications.value.unshift(newNotification);
  }

  function markAllAsRead() {
    notifications.value.forEach((n) => (n.read = true));
  }

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    addNotification,
    markAllAsRead,
  };
});
