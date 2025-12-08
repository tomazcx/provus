<script setup lang="ts">
import NotificationsDropdown from "~/components/ui/NotificationsDropdown/index.vue";
import { useUserStore } from "~/store/userStore";

const userStore = useUserStore();
const user = computed(() => userStore.user);

onMounted(() => {
  if (!user.value) {
    userStore.fetchCurrentUser();
  }
});

function handleLogout() {
  userStore.logout();
}

const userMenuItems = [
  [
    {
      label: "Perfil",
      icon: "i-heroicons-user-circle",
      to: "/perfil",
    },
  ],
  [
    {
      label: "Sair",
      icon: "i-heroicons-arrow-left-on-rectangle",
      onSelect: handleLogout,
      iconClass: "text-red-500",
      class: "text-red-500 hover:bg-red-50 dark:hover:bg-red-950",
    },
  ],
];
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16"
    >
      <div class="flex items-center">
        <div class="p-2 rounded-lg">
          <img
            src="~/assets/img/provus.png"
            alt="Provus Logo"
            class="h-16 w-16"
          >
        </div>
      </div>
      <nav class="space-x-8">
        <NuxtLink
          active-class="border-b-2 border-primary text-primary"
          to="/home"
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Dashboard</NuxtLink
        >
        <NuxtLink
          active-class="border-b-2 border-primary text-primary"
          to="/aplicacoes"
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Aplicações</NuxtLink
        >
        <NuxtLink
          active-class="border-b-2 border-primary text-primary"
          to="/banco-de-questoes"
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Banco de questões</NuxtLink
        >
        <NuxtLink
          active-class="border-b-2 border-primary text-primary"
          to="/banco-de-avaliacoes"
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Banco de avaliações</NuxtLink
        >
        <NuxtLink
          active-class="border-b-2 border-primary text-primary"
          to="/banco-de-materiais"
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Banco de materiais</NuxtLink
        >
      </nav>
      <div class="flex items-center space-x-2">
        <NotificationsDropdown />
        <UDropdownMenu
          :items="userMenuItems"
          :popper="{ placement: 'bottom-end' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="flex items-center space-x-3"
          >
            <UAvatar
              :alt="user?.nome?.toUpperCase() || 'U'"
              size="sm"
              class="bg-primary-100 text-primary-700"
            />
            <span class="text-gray-700 font-medium">{{
              user?.nome || "Carregando..."
            }}</span>
            <Icon
              name="i-heroicons-chevron-down-20-solid"
              class="text-gray-400"
            />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>
