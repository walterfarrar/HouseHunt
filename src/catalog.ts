import { defaultCatalog } from "./data/defaultCatalog";
import { guessCategoryIcon, guessItemIcon } from "./data/emoji";
import type { Catalog, CatalogCategory, CatalogItem } from "./types";
import {
  loadGithubSettings,
  publishJsonToGithub,
  saveGithubSettings,
  type GithubPublishConfig,
} from "./lib/github";

const CATALOG_KEY = "house-hunt-catalog-v1";
const AUTH_KEY = "house-hunt-admin-ok";

/** Coerce a raw item (legacy string or object) into a `CatalogItem`. */
function normalizeItem(raw: unknown): CatalogItem | null {
  if (typeof raw === "string") {
    const name = raw.trim();
    if (!name) return null;
    return { name, icon: guessItemIcon(name) };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as { name?: unknown; icon?: unknown };
    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    if (!name) return null;
    const icon =
      typeof obj.icon === "string" && obj.icon.trim() ? obj.icon.trim() : guessItemIcon(name);
    return icon ? { name, icon } : { name };
  }
  return null;
}

function normalizeCategory(raw: unknown): CatalogCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { id?: unknown; name?: unknown; icon?: unknown; items?: unknown };
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) return null;
  const id =
    typeof obj.id === "string" && obj.id.trim()
      ? obj.id.trim()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const items = Array.isArray(obj.items)
    ? obj.items.map(normalizeItem).filter((i): i is CatalogItem => i !== null)
    : [];
  const icon =
    typeof obj.icon === "string" && obj.icon.trim() ? obj.icon.trim() : guessCategoryIcon(name);
  return icon ? { id, name, icon, items } : { id, name, items };
}

/** Normalise arbitrary catalog data (legacy or new) into the in-memory shape. */
function normalizeCatalog(data: unknown): Catalog | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as { categories?: unknown; spots?: unknown };
  if (!Array.isArray(obj.categories) || obj.categories.length === 0) return null;
  const categories = obj.categories
    .map(normalizeCategory)
    .filter((c): c is CatalogCategory => c !== null);
  if (categories.length === 0) return null;
  const spots =
    Array.isArray(obj.spots) && obj.spots.length > 0
      ? obj.spots.filter((s): s is string => typeof s === "string")
      : [...defaultCatalog.spots];
  return { version: 1, categories, spots };
}

export function getCachedCatalog(): Catalog {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return structuredClone(defaultCatalog);
    const parsed = normalizeCatalog(JSON.parse(raw));
    return parsed ?? structuredClone(defaultCatalog);
  } catch {
    return structuredClone(defaultCatalog);
  }
}

export function cacheCatalog(catalog: Catalog): void {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

/** Load shared lists from catalog.json on GitHub Pages (or local public/). */
export async function fetchCatalog(): Promise<Catalog> {
  try {
    const url = `${import.meta.env.BASE_URL}catalog.json?t=${Date.now()}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!res.ok) throw new Error(`catalog ${res.status}`);
    const data = await res.json();
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
