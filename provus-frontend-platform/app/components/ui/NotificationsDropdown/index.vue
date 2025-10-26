<script setup lang="ts">
import { useNotificationsStore } from "~/store/notificationsStore";

const notificationsStore = useNotificationsStore();

const unreadNotifications = computed(
  () => notificationsStore.unreadNotifications
);
const unreadCount = computed(() => notificationsStore.unreadCount);

function handleMarkAllAsRead() {
  notificationsStore.markAllAsRead();
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 10) {
    return "agora mesmo";
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `há ${hours} hora${hours > 1 ? "s" : ""}`;
  }

  const days = Math.round(hours / 24);
  if (days === 1) {
    return "ontem";
  }
  return `há ${days} dias`;
}
</script>

<template>
  <UPopover :popper="{ placement: 'bottom-end' }">
    <template #default="{ open }">
      <UButton
        color="primary"
        variant="ghost"
        square
        :class="[open && 'bg-gray-50 dark:bg-gray-800']"
        aria-label="Notificações"
      >
        <div class="relative">
          <Icon name="i-lucide-bell" class="w-5 h-5" />
          <div
            v-if="unreadCount > 0"
            class="absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 rounded-full bg-red-500"
          />
        </div>
      </UButton>
    </template>

    <template #content>
      <div class="w-[320px] divide-y divide-gray-200 dark:divide-gray-700">
        <div class="flex items-center justify-between px-4 py-3">
          <h3 class="text-sm font-semibold text-gray-900">Notificações</h3>
          <UButton
            v-if="unreadCount > 0"
            color="primary"
            variant="link"
            size="xs"
            @click="handleMarkAllAsRead"
          >
            Marcar todas como lidas
          </UButton>
        </div>

        <div
          v-if="unreadCount > 0"
          class="space-y-3 p-4 max-h-96 overflow-y-auto"
        >
          <div
            v-for="n in unreadNotifications"
            :key="n.id"
            class="flex items-start space-x-3"
          >
            <Icon
              :name="n.icon"
              :class="n.iconColor"
              class="w-5 h-5 mt-0.5 shrink-0"
            />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ n.title }}</p>
              <p class="text-xs text-gray-500">{{ n.description }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ formatTimestamp(n.timestamp) }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-center text-sm text-gray-500">
          Não há notificações novas.
        </div>
      </div>
    </template>
  </UPopover>
</template>
