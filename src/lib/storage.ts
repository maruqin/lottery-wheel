import { DEFAULT_PRIZES, Prize } from "./types";

const STORAGE_KEY = "lottery-wheel-prizes";

export function loadPrizes(): Prize[] {
  if (typeof window === "undefined") return DEFAULT_PRIZES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRIZES;
    const parsed = JSON.parse(raw) as Prize[];
    return parsed.length > 0 ? parsed : DEFAULT_PRIZES;
  } catch {
    return DEFAULT_PRIZES;
  }
}

export function savePrizes(prizes: Prize[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes));
}
