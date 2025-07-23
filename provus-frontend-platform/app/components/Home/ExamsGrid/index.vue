<script setup lang="ts">
import ExamCard from "../ExamCard/index.vue";
const cards = [
  {
    icon: "i-lucide-file-text",
    iconBg: "bg-primary/10 text-primary",
    title: "Advanced Mathematics Final",
    description: "Calculus…",
    status: "Finished",
    statusBg: "bg-green-100 text-green-800",
    timestamp: "2 hours ago",
    eventInfo: "Exam completed by 45 students",
  },
  {
    icon: "i-lucide-file-text",
    iconBg: "bg-secondary/10 text-secondary",
    title: "Physics Midterm",
    description: "Thermodynamics…",
    status: "In Progress",
    statusBg: "bg-yellow-100 text-yellow-800",
    timestamp: "Started 45 min ago",
    eventInfo: "23 of 30 students…",
  },
  {
    icon: "i-lucide-calendar",
    iconBg: "bg-purple-100 text-purple-600",
    title: "Chemistry Quiz",
    description: "Organic chemistry…",
    status: "Scheduled",
    statusBg: "bg-purple-100 text-purple-800",
    timestamp: "Tomorrow 2:00 PM",
    eventInfo: "Scheduled for 32 students",
  },
  {
    icon: "i-lucide-play",
    iconBg: "bg-orange-100 text-orange-600",
    title: "Biology Assessment",
    description: "Cell biology…",
    status: "Administered",
    statusBg: "bg-orange-100 text-orange-800",
    timestamp: "1 day ago",
    eventInfo: "Administered to 28 students",
  },
];
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ExamCard v-for="(c, i) in cards" :key="i" v-bind="c" />
  </div>
</template>
