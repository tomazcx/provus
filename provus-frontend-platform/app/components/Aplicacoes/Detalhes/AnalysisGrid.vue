<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type TooltipItem,
} from "chart.js";
import type { AplicacaoStatsEntity } from "~/types/entities/Aplicacao.entity";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps<{
  stats: AplicacaoStatsEntity;
}>();

function createDistributionBuckets(
  scores: number[],
  totalScore: number,
  numBuckets: number = 10
): { labels: string[]; data: number[] } {
  if (totalScore <= 0 || scores.length === 0) {
    return { labels: [], data: [] };
  }
  const bucketSize = 100 / numBuckets;
  const buckets = Array(numBuckets).fill(0);
  const labels: string[] = [];

  for (let i = 0; i < numBuckets; i++) {
    const minPercent = i * bucketSize;
    const maxPercent = (i + 1) * bucketSize;
    labels.push(
      `${Math.max(0, minPercent).toFixed(0)}-${maxPercent.toFixed(0)}%`
    );
  }

  scores.forEach((score) => {
    const percentage = (score / totalScore) * 100;
    const bucketIndex = Math.min(
      Math.floor(percentage / bucketSize),
      numBuckets - 1
    );
    if (percentage === 100) {
      buckets[numBuckets - 1]++;
    } else if (bucketIndex >= 0 && bucketIndex < numBuckets) {
      buckets[bucketIndex]++;
    }
  });

  return { labels, data: buckets };
}

const chartData = computed(() => {
  if (!props.stats || !props.stats.finalScores) {
    return { labels: [], datasets: [] };
  }

  const { labels, data } = createDistributionBuckets(
    props.stats.finalScores,
    props.stats.pontuacaoTotalAvaliacao,
    10
  );

  return {
    labels: labels,
    datasets: [
      {
        label: "Número de Alunos",
        backgroundColor: "#3b82f6",
        borderColor: "#1d4ed8",
        borderWidth: 1,
        borderRadius: 4,
        data: data,
      },
    ],
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (context: TooltipItem<"bar">) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed && context.parsed.y !== null) {
            label += `${context.parsed.y} aluno(s)`;
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Faixa de Pontuação (%)",
        color: "#6b7280",
        font: { size: 12 },
      },
      grid: {
        display: false,
      },
      ticks: { color: "#6b7280" },
    },
    y: {
      title: {
        display: true,
        text: "Número de Alunos",
        color: "#6b7280",
        font: { size: 12 },
      },
      beginAtZero: true,
      ticks: {
        precision: 0,
        color: "#6b7280",
      },
      grid: {
        color: "#e5e7eb",
      },
    },
  },
});
</script>

<template>
  <UCard class="mb-8">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">Distribuição de Notas</h3>
    </template>
    <div class="h-64 md:h-80">
      <Bar
        v-if="stats && stats.finalScores && stats.finalScores.length > 0"
        :data="chartData"
        :options="chartOptions"
      />
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        Não há dados de notas finalizadas para exibir o gráfico.
      </div>
    </div>
  </UCard>
</template>
