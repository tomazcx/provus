import type { INotification } from "~/types/INotification";

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref<INotification[]>([]);

  const initialMock: Omit<INotification, "id" | "timestamp" | "read">[] = [];

  function loadInitialNotifications() {
    if (notifications.value.length > 0) return;
    notifications.value = initialMock.map((n, index) => ({
      ...n,
      id: Date.now() + index,
      timestamp: new Date(Date.now() - index * 1000 * 60 * 5),
      read: false,
    }));
  }

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
    loadInitialNotifications,
    addNotification,
    markAllAsRead,
  };
});
