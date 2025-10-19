export function useTimer(config: {
  dataAplicacao: Ref<string | null>;
  tempoMaximoEmMinutos: Ref<number | null>;
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
      config.tempoMaximoEmMinutos.value === null
    ) {
      console.warn("Timer: Dados de início ou duração indisponíveis.");
      tempoRestanteEmSegundos.value = 0;
      return;
    }

    try {
      const dataAplicacao = new Date(config.dataAplicacao.value);
      if (isNaN(dataAplicacao.getTime())) {
        console.warn("Timer: Data de início da aplicação inválida.");
        tempoRestanteEmSegundos.value = 0;
        return;
      }

      const duracaoTotalSegundos =
        config.tempoMaximoEmMinutos.value * 60 +
        (config.ajusteDeTempoEmSegundos.value || 0);

      const dataFinal = new Date(
        dataAplicacao.getTime() + duracaoTotalSegundos * 1000
      );
      const agora = new Date();
      const diffSegundos = Math.round(
        (dataFinal.getTime() - agora.getTime()) / 1000
      );

      tempoRestanteEmSegundos.value = diffSegundos > 0 ? diffSegundos : 0;

      if (interval) clearInterval(interval);

      interval = setInterval(() => {
        if (config.isActive.value && tempoRestanteEmSegundos.value > 0) {
          tempoRestanteEmSegundos.value--;
        } else if (tempoRestanteEmSegundos.value <= 0) {
          if (interval) clearInterval(interval);
        }
      }, 1000);
    } catch (e) {
      console.error("Erro ao calcular tempo restante:", e);
      tempoRestanteEmSegundos.value = 0;
      if (interval) clearInterval(interval);
    }
  };

  watch(
    [
      config.dataAplicacao,
      config.tempoMaximoEmMinutos,
      config.ajusteDeTempoEmSegundos,
      config.isActive,
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
