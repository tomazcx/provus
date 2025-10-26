interface TimerConfig {
  dataFimISO: Ref<string | null>;
  ajusteDeTempoEmSegundos?: Ref<number | undefined>;
  isActive: Ref<boolean>;
}

export function useTimer(config: TimerConfig) {
  const tempoRestanteEmSegundos = ref(0);
  let interval: NodeJS.Timeout | null = null;

  const formatarTempo = (totalSegundos: number) => {
    if (totalSegundos <= 0) return "00:00:00";
    totalSegundos = Math.max(0, totalSegundos);
    const horas = Math.floor(totalSegundos / 3600)
      .toString()
      .padStart(2, "0");
    const minutos = Math.floor((totalSegundos % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const segundos = Math.floor(totalSegundos % 60)
      .toString()
      .padStart(2, "0");
    return `${horas}:${minutos}:${segundos}`;
  };

  const tempoRestanteFormatado = computed(() =>
    formatarTempo(tempoRestanteEmSegundos.value)
  );

  const calcularTempoRestante = () => {
    if (!config.dataFimISO.value) {
      tempoRestanteEmSegundos.value = 0;
      if (interval) clearInterval(interval);
      interval = null;
      return;
    }

    try {
      const dataFinal = new Date(config.dataFimISO.value);
      if (isNaN(dataFinal.getTime())) {
        console.warn("useTimer: dataFimISO inválida:", config.dataFimISO.value);
        tempoRestanteEmSegundos.value = 0;
        if (interval) clearInterval(interval);
        interval = null;
        return;
      }

      const ajusteLocal = config.ajusteDeTempoEmSegundos?.value ?? 0;
      const dataFinalAjustada = new Date(
        dataFinal.getTime() + ajusteLocal * 1000
      );

      const agora = new Date();
      const diffSegundos = Math.round(
        (dataFinalAjustada.getTime() - agora.getTime()) / 1000
      );

      tempoRestanteEmSegundos.value = Math.max(0, diffSegundos);

      if (interval) clearInterval(interval);
      interval = null;

      if (config.isActive.value && tempoRestanteEmSegundos.value > 0) {
        interval = setInterval(() => {
          if (config.isActive.value && tempoRestanteEmSegundos.value > 0) {
            tempoRestanteEmSegundos.value--;
          } else {
            tempoRestanteEmSegundos.value = 0;
            if (interval) clearInterval(interval);
            interval = null;
          }
        }, 1000);
      } else if (tempoRestanteEmSegundos.value <= 0) {
        tempoRestanteEmSegundos.value = 0;
      }
    } catch (e) {
      console.error("useTimer: Erro ao calcular tempo restante:", e);
      tempoRestanteEmSegundos.value = 0;
      if (interval) clearInterval(interval);
      interval = null;
    }
  };

  watch(
    [config.dataFimISO, config.isActive, config.ajusteDeTempoEmSegundos],
    calcularTempoRestante,
    { immediate: true }
  );

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  return {
    tempoRestanteEmSegundos,
    tempoRestanteFormatado,
  };
}
