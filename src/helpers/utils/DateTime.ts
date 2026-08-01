export default {
  shortTime(time: number | string): string {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (typeof time === "string" || isNaN(Number(time))) {
      const parts = String(time).split(":").map(Number);
      hours = parts[0] || 0;
      minutes = parts[1] || 0;
      seconds = parts[2] || 0;
    } else {
      const t = Number(time);
      hours = Math.floor(t / 3600);
      minutes = Math.floor((t % 3600) / 60);
      seconds = t % 60;
    }

    minutes += hours * 60;
    return `${minutes}:${String(Math.floor(seconds)).padStart(2, "0")}`;
  },

  toNumber(time: number | string | null | undefined): number {
    if (!time) return 0;
    const parts = time.toString().split(":").map(Number);

    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;

    return hours * 3600 + minutes * 60 + seconds;
  },
};
