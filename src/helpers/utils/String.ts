export default {
  clean(text: string | null | undefined): string {
    text = text || "";

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9*]/g, "");
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

    return cleanText.includes(cleanSearch);
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
};
