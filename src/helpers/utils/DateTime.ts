export default {
  shortTime(time: number | string | null | undefined): string {
    if (time === null || time === undefined || time === "") return "0:00";

    // Se for número puro ou string estritamente numérica (sem dois-pontos), são segundos
    if (typeof time === "number" || (!isNaN(Number(time)) && !String(time).includes(":"))) {
      const t = Math.max(0, Number(time));
      const hours = Math.floor(t / 3600);
      const minutes = Math.floor((t % 3600) / 60) + hours * 60;
      const seconds = Math.floor(t % 60);
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    const parts = String(time).trim().split(":").map(Number);
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (parts.length >= 3) {
      // HH:MM:SS
      hours = parts[0] || 0;
      minutes = parts[1] || 0;
      seconds = parts[2] || 0;
    } else if (parts.length === 2) {
      // MM:SS
      // Caso especial: se MM >= 60 e SS === 0 (ex.: "199:00"), é um valor corrompido onde segundos foram formatados como minutos:00
      if ((parts[0] || 0) >= 60 && (parts[1] || 0) === 0) {
        return this.shortTime(parts[0]);
      }
      hours = 0;
      minutes = parts[0] || 0;
      seconds = parts[1] || 0;
    } else if (parts.length === 1) {
      // Segundos
      return this.shortTime(parts[0] || 0);
    }

    minutes += hours * 60;
    return `${minutes}:${String(Math.floor(seconds)).padStart(2, "0")}`;
  },

  toNumber(time: number | string | null | undefined): number {
    if (time === null || time === undefined || time === "") return 0;
    if (typeof time === "number") return isNaN(time) ? 0 : time;

    const str = String(time).trim();
    if (!str.includes(":")) {
      const n = Number(str);
      return isNaN(n) ? 0 : n;
    }

    const parts = str.split(":").map(Number);
    if (parts.length >= 3) {
      // HH:MM:SS
      const hours = parts[0] || 0;
      const minutes = parts[1] || 0;
      const seconds = parts[2] || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    if (parts.length === 2) {
      // MM:SS
      // Caso especial: se MM >= 60 e SS === 0 (ex.: "199:00"), os segundos foram salvos diretamente
      if ((parts[0] || 0) >= 60 && (parts[1] || 0) === 0) {
        return parts[0] || 0;
      }
      const minutes = parts[0] || 0;
      const seconds = parts[1] || 0;
      return minutes * 60 + seconds;
    }
    return parts[0] || 0;
  },
};


