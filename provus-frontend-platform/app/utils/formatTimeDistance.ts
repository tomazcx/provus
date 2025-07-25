export function formatTimeDistance(isoString: string): string {
  const now = new Date();
  const target = new Date(isoString);
  const diffSeconds = Math.round((target.getTime() - now.getTime()) / 1000);

  if (Math.abs(diffSeconds) < 60) {
    return "Agora";
  }

  const units = [
    { singular: "ano", plural: "anos", seconds: 365 * 24 * 3600 },
    { singular: "mês", plural: "meses", seconds: 30 * 24 * 3600 },
    { singular: "semana", plural: "semanas", seconds: 7 * 24 * 3600 },
    { singular: "dia", plural: "dias", seconds: 24 * 3600 },
    { singular: "hora", plural: "horas", seconds: 3600 },
    { singular: "minuto", plural: "minutos", seconds: 60 },
  ];

  for (const { singular, plural, seconds } of units) {
    const amount = diffSeconds / seconds;
    if (Math.abs(amount) >= 1) {
      const value = Math.abs(Math.round(amount));
      const unitName = value === 1 ? singular : plural;
      return diffSeconds > 0
        ? `Em ${value} ${unitName}`
        : `Há ${value} ${unitName}`;
    }
  }

  return "Agora";
}
