import { defaultCatalog } from "./data/defaultCatalog";
import type { Catalog } from "./types";
import {
  loadGithubSettings,
  publishJsonToGithub,
  saveGithubSettings,
  type GithubPublishConfig,
} from "./lib/github";

const CATALOG_KEY = "house-hunt-catalog-v1";
const AUTH_KEY = "house-hunt-admin-ok";

export function getCachedCatalog(): Catalog {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return structuredClone(defaultCatalog);
    const parsed = JSON.parse(raw) as Catalog;
    if (!parsed?.categories || !Array.isArray(parsed.categories)) {
      return structuredClone(defaultCatalog);
    }
    return {
      version: 1,
      categories: parsed.categories,
      spots:
        Array.isArray(parsed.spots) && parsed.spots.length > 0
          ? parsed.spots
          : [...defaultCatalog.spots],
    };
  } catch {
    return structuredClone(defaultCatalog);
  }
}

export function cacheCatalog(catalog: Catalog): void {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

function normalizeCatalog(data: Catalog): Catalog | null {
  if (!data?.categories?.length) return null;
  return {
    version: 1,
    categories: data.categories,
    spots: data.spots?.length ? data.spots : [...defaultCatalog.spots],
  };
}

/** Load shared lists from catalog.json on GitHub Pages (or local public/). */
export async function fetchCatalog(): Promise<Catalog> {
  try {
    const url = `${import.meta.env.BASE_URL}catalog.json?t=${Date.now()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(`catalog ${res.status}`);
    const data = (await res.json()) as Catalog;
    const catalog = normalizeCatalog(data);
    if (!catalog) {
      return getCachedCatalog();
    }
    cacheCatalog(catalog);
    return catalog;
  } catch {
    return getCachedCatalog();
  }
}

export function saveCatalogLocal(catalog: Catalog): void {
  cacheCatalog(catalog);
}

export function downloadCatalogJson(catalog: Catalog): void {
  const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "catalog.json";
  a.click();
  URL.revokeObjectURL(url);
}

export type { GithubPublishConfig };

export async function publishCatalogToGithub(
  catalog: Catalog,
  config: GithubPublishConfig,
): Promise<{ ok: boolean; error?: string }> {
  cacheCatalog(catalog);
  saveGithubSettings({
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
    path: config.path,
  });
  return publishJsonToGithub(catalog, config, "Update House Hunt catalog");
}

export { loadGithubSettings, saveGithubSettings };

export function isAdminUnlocked(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}

export function unlockAdmin(): void {
  sessionStorage.setItem(AUTH_KEY, "1");
}

export function lockAdmin(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

/** Password from VITE_ADMIN_PASSWORD at build time, or the default below. */
export function checkAdminPassword(password: string): boolean {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD || "changeme";
  return password === expected;
}
