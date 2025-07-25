/**
 * Recebe uma ISO string ou um Date e retorna "DD/MM/YYYY".
 * Se não receber nada, retorna "sem data".
 * Se a string não for data válida, retorna "data inválida".
 */
export default function formatDate(data?: string | Date): string {
  if (!data) return "sem data";

  const date = typeof data === "string" ? new Date(data) : data;

  if (isNaN(date.getTime())) {
    return "data inválida";
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
