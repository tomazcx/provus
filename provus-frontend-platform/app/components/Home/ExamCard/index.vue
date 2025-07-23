<script setup lang="ts">
const props = defineProps<{
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  status: string;
  statusBg: string;
  timestamp: string;
  eventInfo: string;
}>();
</script>

<template>
  <UCard
    class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="flex items-start justify-between mb-4">
      <div
        :class="`${props.iconBg} w-12 h-12 rounded-lg flex items-center justify-center`"
      >
        <Icon :name="props.icon" class="text-xl" />
      </div>
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      {{ props.title }}
    </h3>
    <p class="text-sm text-gray-600 mb-4">{{ props.description }}</p>
    <div class="flex items-center justify-between mb-3">
      <UBadge :class="`${props.statusBg}`">{{ props.status }}</UBadge>
      <span class="text-xs text-gray-500">{{ props.timestamp }}</span>
    </div>
    <div class="text-xs text-gray-500">
      <span class="font-medium">Event:</span> {{ props.eventInfo }}
    </div>
  </UCard>
</template>
