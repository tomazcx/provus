<script setup lang="ts">
defineProps<{
  item: {
    id: number;
    title: string;
    description: string;
    status: string;
    studentInfo: string;
    timeInfo: string;
    icon: string;
    color: string;
  };
}>();
</script>
<template>
  <NuxtLink :to="`/aplicacoes/aplicacao/${item.id}`">
    <div
      class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer h-full"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-4">
          <div
            :class="`bg-${item.color}-100`"
            class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          >
            <Icon
              :name="item.icon"
              :class="`text-${item.color}-600`"
              class="text-xl"
            />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ item.description }}</p>
            <div class="flex items-center space-x-4 mt-2">
              <UBadge
                :color="item.color as ('secondary' | 'warning' | 'info')"
                variant="soft"
                >{{ item.status }}</UBadge
              >
              <span class="text-xs text-gray-500">{{ item.studentInfo }}</span>
              <span class="text-xs text-gray-500">{{ item.timeInfo }}</span>
            </div>
          </div>
        </div>
        <UButton color="gray" variant="ghost" icon="i-lucide-ellipsis" />
      </div>
    </div>
  </NuxtLink>
</template>
