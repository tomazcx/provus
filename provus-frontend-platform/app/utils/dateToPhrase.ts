const DAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export function dateToPhrase(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekday = today.getDay();
  const offsetToMonday = (weekday + 6) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - offsetToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const time = target.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(target, today)) {
    return `Hoje às ${time}`;
  }

  if (isSameDay(target, tomorrow)) {
    return `Amanhã às ${time}`;
  }

  if (target >= startOfWeek && target <= endOfWeek) {
    const diaSemana = target.getDay(); // 0..6
    const nomeDia = DAY_NAMES[diaSemana];
    return `Próxima ${nomeDia} às ${time}`;
  }

  const date = target.toLocaleDateString("pt-BR");
  return `Em ${date} às ${time}`;
}
