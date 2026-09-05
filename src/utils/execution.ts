import type { TimerState } from "@/services/storage";

export function parsePositive(value: string): number | null {
  if (!/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null;
  const number = Number(value.trim().replace(",", "."));
  return Number.isFinite(number) && number > 0 ? number : null;
}
export function remainingSeconds(timer?: TimerState, now = Date.now()): number {
  if (!timer) return 0;
  return timer.isRunning && timer.endAt !== null
    ? Math.max(0, Math.ceil((timer.endAt - now) / 1000))
    : Math.max(0, timer.remainingSeconds);
}
export function formatTime(value: number) {
  return [Math.floor(value / 3600), Math.floor(value % 3600 / 60), value % 60]
    .map(part => String(part).padStart(2, "0")).join(":");
}
export function mediumMass(volumeMl: number, gramsPerLiter: number) { return volumeMl * gramsPerLiter / 1000; }
