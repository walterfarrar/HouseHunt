import { initialHouse } from "./data/initialLayout";
import type { HouseData } from "./types";
import {
  fetchRepoJson,
  loadGithubSettings,
  publishSiteJson,
  type GithubSettings,
} from "./lib/github";

const KEY = "house-hunt-v1";

export function normalizeHouse(data: Partial<HouseData> | null | undefined): HouseData | null {
  if (!data?.rooms || !Array.isArray(data.rooms) || data.rooms.length === 0) return null;
  return {
    version: 1,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
    rooms: data.rooms,
    doors: Array.isArray(data.doors) ? data.doors : [],
    items: Array.isArray(data.items) ? data.items : [],
  };
}

export function loadHouse(): HouseData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(initialHouse);
    const parsed = normalizeHouse(JSON.parse(raw) as Partial<HouseData>);
    if (!parsed) return structuredClone(initialHouse);
    // Stamp older local saves so a shared house.json can't wipe a customized map.
    if (!parsed.updatedAt) {
      const stamped = touchHouse(parsed);
      saveHouse(stamped);
      return stamped;
    }
    return parsed;
  } catch {
    return structuredClone(initialHouse);
  }
}

export function saveHouse(data: HouseData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function touchHouse(data: HouseData): HouseData {
  return { ...data, updatedAt: new Date().toISOString() };
}

export function resetHouse(): HouseData {
  const fresh = touchHouse(structuredClone(initialHouse));
  saveHouse(fresh);
  return fresh;
}

/** Shared layout payload (no personal find-log items). */
export function layoutForShare(data: HouseData): HouseData {
  return {
    version: 1,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    rooms: data.rooms,
    doors: data.doors,
    items: [],
  };
}

export function exportHouseJson(data: HouseData): string {
  return JSON.stringify(layoutForShare(touchHouse(data)), null, 2);
}

/**
 * Load the shared floor plan. Reads from the GitHub repo API first so a Publish
 * propagates to other devices immediately (no Pages CDN cache, and it survives
 * site deploys). Falls back to the copy bundled into the deployed site.
 */
export async function fetchSharedHouse(): Promise<HouseData | null> {
  const fromRepo = await fetchRepoJson("house.json");
  if (fromRepo && typeof fromRepo === "object") {
    return normalizeHouse(fromRepo as Partial<HouseData>);
  }

  try {
    const url = `${import.meta.env.BASE_URL}house.json?t=${Date.now()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) return null;
    return normalizeHouse((await res.json()) as Partial<HouseData>);
  } catch {
    return null;
  }
}

/**
 * Prefer newer shared layout for rooms/doors; keep this device's logged items.
 */
export function mergeSharedLayout(local: HouseData, remote: HouseData): HouseData {
  const localTime = local.updatedAt ? Date.parse(local.updatedAt) : 0;
  const remoteTime = remote.updatedAt ? Date.parse(remote.updatedAt) : 0;

  if (remoteTime > localTime) {
    return {
      version: 1,
      updatedAt: remote.updatedAt,
      rooms: remote.rooms,
      doors: remote.doors,
      items: local.items,
    };
  }
  return local;
}

export async function publishHouseLayout(
  house: HouseData,
  token: string,
  settings: Partial<GithubSettings> = loadGithubSettings(),
): Promise<{ ok: boolean; error?: string }> {
  const payload = layoutForShare(touchHouse(house));
  const result = await publishSiteJson(payload, {
    token,
    fileName: "house.json",
    message: "Update House Inventory floor plan",
    settings,
  });
  if (result.ok) {
    saveHouse({ ...house, updatedAt: payload.updatedAt, rooms: payload.rooms, doors: payload.doors });
  }
  return result;
}

export function importHouseFromJson(text: string): HouseData | null {
  try {
    return normalizeHouse(JSON.parse(text) as Partial<HouseData>);
  } catch {
    return null;
  }
}
