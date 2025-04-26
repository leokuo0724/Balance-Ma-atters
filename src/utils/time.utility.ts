export function formatTime(totalMs: number): string {
  const minutes = Math.floor(totalMs / 60 / 1000);
  const seconds = Math.floor((totalMs % 60) / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}`;
}
