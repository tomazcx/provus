import { create } from "zustand";
import { INotification } from "../types/INotification";
import { AlertTriangle, Copy, ArrowRightLeft } from "lucide-react-native";

export const mapInfracaoToVisuals = (tipoInfracao: string) => {
  switch (tipoInfracao) {
    case "Troca de Abas":
      return {
        icon: ArrowRightLeft,
        iconColor: "#f97316",
      };
    case "Copiar e Colar":
      return {
        icon: Copy,
        iconColor: "#ef4444",
      };
    default:
      return {
        icon: AlertTriangle,
        iconColor: "#6b7280",
      };
  }
};

interface NotificationsState {
  notifications: INotification[];
  unreadCount: number;
  addNotification: (
    data: Omit<INotification, "id" | "timestamp" | "read">
  ) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (data) => {
    set((state) => {
      const newNotification: INotification = {
        ...data,
        id: Date.now(),
        timestamp: new Date(),
        read: false,
      };
      const updatedList = [newNotification, ...state.notifications];
      return {
        notifications: updatedList,
        unreadCount: updatedList.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));
