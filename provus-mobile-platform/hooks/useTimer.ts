import { useState, useEffect, useMemo, useCallback } from "react";
import { getServerTime } from "../utils/serverTime";

interface TimerConfig {
  dataFimISO: string | null | undefined;
  isActive: boolean;
  ajusteDeTempoEmSegundos?: number;
}

export function useTimer({
  dataFimISO,
  isActive,
  ajusteDeTempoEmSegundos = 0,
}: TimerConfig) {
  const [tempoRestanteEmSegundos, setTempoRestanteEmSegundos] = useState(0);

  const tempoRestanteFormatado = useMemo(() => {
    if (tempoRestanteEmSegundos <= 0) return "00:00:00";
    const total = Math.max(0, tempoRestanteEmSegundos);
    const hours = Math.floor(total / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((total % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const segundos = Math.floor(total % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${segundos}`;
  }, [tempoRestanteEmSegundos]);

  const calculateDiff = useCallback(() => {
    if (!dataFimISO) return 0;
    try {
      const dataFinal = new Date(dataFimISO);
      if (isNaN(dataFinal.getTime())) return 0;

      const dataFinalAjustada = new Date(
        dataFinal.getTime() + ajusteDeTempoEmSegundos * 1000
      );
      const agora = getServerTime();

      return Math.max(
        0,
        Math.round((dataFinalAjustada.getTime() - agora.getTime()) / 1000)
      );
    } catch {
      return 0;
    }
  }, [dataFimISO, ajusteDeTempoEmSegundos]);

  useEffect(() => {
    const diff = calculateDiff();
    setTempoRestanteEmSegundos(diff);
  }, [calculateDiff]); 

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      setTempoRestanteEmSegundos(calculateDiff());

      interval = setInterval(() => {
        const diff = calculateDiff();
        setTempoRestanteEmSegundos(diff);

        if (diff <= 0 && interval) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, calculateDiff]);

  return {
    tempoRestanteEmSegundos,
    tempoRestanteFormatado,
  };
}
