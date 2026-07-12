import { defaultCatalog } from "./data/defaultCatalog";
import type { Catalog } from "./types";

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

export type GithubPublishConfig = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
};

export async function publishCatalogToGithub(
  catalog: Catalog,
  config: GithubPublishConfig,
): Promise<{ ok: boolean; error?: string }> {
  cacheCatalog(catalog);
  const { owner, repo, branch, path, token } = config;
  if (!owner || !repo || !token) {
    return { ok: false, error: "GitHub owner, repo, and token are required." };
  }

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path.replace(/^\//, "")}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  let sha: string | undefined;
  const existing = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    const body = (await existing.json()) as { sha?: string };
    sha = body.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    return { ok: false, error: `Could not read file on GitHub (${existing.status}): ${text}` };
  }

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(catalog, null, 2))));
  const put = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update House Hunt catalog",
      content,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!put.ok) {
    const text = await put.text();
    return { ok: false, error: `Publish failed (${put.status}): ${text}` };
  }

  return { ok: true };
}

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
