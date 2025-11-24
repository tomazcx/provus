export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>?/gm, "").trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
