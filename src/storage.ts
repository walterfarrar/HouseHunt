import { initialHouse } from "./data/initialLayout";
import type { HouseData } from "./types";

const KEY = "house-hunt-v1";

export function loadHouse(): HouseData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(initialHouse);
    const parsed = JSON.parse(raw) as Partial<HouseData>;
    if (!parsed?.rooms || !Array.isArray(parsed.rooms)) {
      return structuredClone(initialHouse);
    }
    return {
      version: 1,
      rooms: parsed.rooms,
      doors: Array.isArray(parsed.doors) ? parsed.doors : [],
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return structuredClone(initialHouse);
  }
}

export function saveHouse(data: HouseData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function resetHouse(): HouseData {
  const fresh = structuredClone(initialHouse);
  saveHouse(fresh);
  return fresh;
}

export function exportHouseJson(data: HouseData): string {
  return JSON.stringify(data, null, 2);
}
