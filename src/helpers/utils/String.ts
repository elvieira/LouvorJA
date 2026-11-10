export default {
  clean(text: string | null | undefined): string {
    text = text || "";

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9* ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  },
  matchesSearch(text: string | null | undefined, search: string | null | undefined): boolean {
    const cleanText = this.clean(text);
    const cleanSearch = this.clean(search);

    if (cleanSearch.includes("*")) {
      const regexPattern = cleanSearch.split("*").map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
      try {
        const regex = new RegExp(regexPattern);
        return regex.test(cleanText);
      } catch {
        return cleanText.includes(cleanSearch.replace(/\*/g, ""));
      }
    }

    return cleanText.startsWith(cleanSearch) || cleanText.includes(` ${cleanSearch}`);
  },
  sort(a: string | number | null | undefined, b: string | number | null | undefined): number {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }

    const strA = String(a || "");
    const strB = String(b || "");

    return strA
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .localeCompare(
        strB
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      );
  },
  cleanIpcError(error: unknown): string {
    const raw = error instanceof Error ? error.message : String(error ?? "");
    return raw.replace(/^Error invoking remote method '[^']+':\s*/i, "").trim();
  },
  formatErrorHtml(error: unknown): string {
    const cleaned = this.cleanIpcError(error);
    return cleaned
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  },
};
