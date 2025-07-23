<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16"
    >
      <div class="flex items-center">
        <div class="bg-primary p-2 rounded-lg">
          <span class="text-white font-bold text-xl">P</span>
        </div>
        <span class="ml-3 text-2xl font-bold text-primary">Provus</span>
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
          to="/banco-de-questoes"
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Banco de questões</NuxtLink
        >
        <span
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Exam Bank</span
        >
        <span
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Materials</span
        >
        <span
          class="text-gray-600 hover:text-primary cursor-pointer transition-colors"
          >Analytics</span
        >
      </nav>

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
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
            alt="User"
          />
          <span class="text-gray-700 font-medium">John Doe</span>
          <Icon
            name="i-heroicons-chevron-down-20-solid"
            class="text-gray-400"
          />
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
const userMenuItems = [
  [
    {
      label: "Profile Settings",
      icon: "i-heroicons-user-circle",
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-heroicons-arrow-left-on-rectangle",
      slot: "logout",
    },
  ],
];
</script>
