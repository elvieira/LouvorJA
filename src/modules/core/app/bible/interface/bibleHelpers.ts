export function parseVerseSearchQuery(query: string, verses: Record<number, string>): number[] {
  if (!query) return [];
  
  const selected = new Set<number>();
  const parts = query.split(",");
  
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = Number(startStr.trim());
      const end = Number(endStr.trim());
      if (!isNaN(start) && !isNaN(end)) {
        const s = Math.min(start, end);
        const e = Math.max(start, end);
        for (let i = s; i <= e; i++) {
          if (verses[i]) selected.add(i);
        }
      }
    } else {
      const num = Number(part.trim());
      if (!isNaN(num) && verses[num]) selected.add(num);
    }
  }
  
  return Array.from(selected).sort((a, b) => a - b);
}

export function formatNumbersInterval(numbers: number[]): string {
  if (!numbers || numbers.length === 0) return "";

  numbers.sort((a, b) => a - b);

  const result = [];
  let start = numbers[0];
  let end = numbers[0];

  for (let i = 1; i <= numbers.length; i++) {
    if (numbers[i] === end + 1) {
      end = numbers[i];
    } else {
      if (start === end) {
        result.push(`${start}`);
      } else {
        result.push(`${start}-${end}`);
      }
      start = numbers[i];
      end = numbers[i];
    }
  }

  return result.join(", ");
}
