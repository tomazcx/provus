export function useTimer(config: {
  dataAplicacao: Ref<string | undefined>;
  tempoMaximoEmMinutos: Ref<number | undefined>;
  ajusteDeTempoEmSegundos: Ref<number | undefined>;
  isActive: Ref<boolean>;
}) {
  const tempoRestanteEmSegundos = ref(0);
  let interval: NodeJS.Timeout | null = null;

  const formatarTempo = (totalSegundos: number) => {
    if (totalSegundos <= 0) return "00:00:00";
    const horas = Math.floor(totalSegundos / 3600)
      .toString()
      .padStart(2, "0");
    const minutos = Math.floor((totalSegundos % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const segundos = (totalSegundos % 60).toString().padStart(2, "0");
    return `${horas}:${minutos}:${segundos}`;
  };

  const tempoRestanteFormatado = computed(() =>
    formatarTempo(tempoRestanteEmSegundos.value)
  );

  const iniciarTimer = () => {
    if (interval) clearInterval(interval);

    if (
      !config.dataAplicacao.value ||
      typeof config.tempoMaximoEmMinutos.value !== "number"
    ) {
      tempoRestanteEmSegundos.value = 0;
      return;
    }

    const dataAplicacao = new Date(config.dataAplicacao.value);
    const duracaoTotal =
      config.tempoMaximoEmMinutos.value * 60 +
      (config.ajusteDeTempoEmSegundos.value || 0);
    const dataFinal = new Date(dataAplicacao.getTime() + duracaoTotal * 1000);

    const diff = Math.round(
      (dataFinal.getTime() - new Date().getTime()) / 1000
    );
    tempoRestanteEmSegundos.value = diff > 0 ? diff : 0;

    interval = setInterval(() => {
      if (config.isActive.value && tempoRestanteEmSegundos.value > 0) {
        tempoRestanteEmSegundos.value--;
      }
    }, 1000);
  };

  watch(
    [
      config.dataAplicacao,
      config.tempoMaximoEmMinutos,
      config.ajusteDeTempoEmSegundos,
    ],
    iniciarTimer,
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
