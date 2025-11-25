import { ref, computed, watch, onUnmounted, type Ref } from "vue";
import { getServerTime } from "~/utils/serverTime";

interface TimerConfig {
  dataFimISO: Ref<string | null>;
  ajusteDeTempoEmSegundos?: Ref<number | undefined>;
  isActive: Ref<boolean>;
}

export function useTimer(config: TimerConfig) {
  const tempoRestanteEmSegundos = ref(0);
  let intervalId: NodeJS.Timeout | null = null;

  const formatarTempo = (totalSegundos: number) => {
    if (totalSegundos <= 0) return "00:00:00";
    totalSegundos = Math.max(0, totalSegundos);
    const hours = Math.floor(totalSegundos / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSegundos % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const segundos = Math.floor(totalSegundos % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${segundos}`;
  };

  const tempoRestanteFormatado = computed(() =>
    formatarTempo(tempoRestanteEmSegundos.value)
  );

  const getDiff = () => {
    if (!config.dataFimISO.value) return 0;

    try {
      const dataFinal = new Date(config.dataFimISO.value);
      if (isNaN(dataFinal.getTime())) return 0;

      const ajuste = config.ajusteDeTempoEmSegundos?.value ?? 0;
      const dataFinalAjustada = new Date(dataFinal.getTime() + ajuste * 1000);
      const agora = getServerTime();

      return Math.max(
        0,
        Math.round((dataFinalAjustada.getTime() - agora.getTime()) / 1000)
      );
    } catch {
      return 0;
    }
  };

  watch(
    [config.dataFimISO, config.isActive, config.ajusteDeTempoEmSegundos],
    ([newDataFim, newIsActive]) => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      if (newIsActive || newDataFim) {
        const diff = getDiff();
        if (newIsActive || diff !== tempoRestanteEmSegundos.value) {
          tempoRestanteEmSegundos.value = diff;
        }
      }

      if (newIsActive && tempoRestanteEmSegundos.value > 0) {
        intervalId = setInterval(() => {
          const diff = getDiff();
          tempoRestanteEmSegundos.value = diff;

          if (diff <= 0 && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }, 1000);
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    tempoRestanteEmSegundos,
    tempoRestanteFormatado,
  };
}
