export type GithubPublishConfig = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
};

export type GithubSettings = {
  owner: string;
  repo: string;
  /** Source branch (usually main) where public/*.json is kept for future builds */
  branch: string;
  /** Live GitHub Pages branch that serves the site (usually gh-pages) */
  pagesBranch: string;
  path: string;
  /** Personal access token — kept in this browser so Publish works without re-entry */
  token: string;
};

const SETTINGS_KEY = "house-hunt-github-settings";

const DEFAULTS: GithubSettings = {
  owner: "walterfarrar",
  repo: "HouseHunt",
  branch: "main",
  pagesBranch: "gh-pages",
  path: "public/house.json",
  token: "",
};

export function loadGithubSettings(): GithubSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<GithubSettings>;
    return {
      owner: typeof parsed.owner === "string" && parsed.owner ? parsed.owner : DEFAULTS.owner,
      repo: typeof parsed.repo === "string" && parsed.repo ? parsed.repo : DEFAULTS.repo,
      branch: typeof parsed.branch === "string" && parsed.branch ? parsed.branch : DEFAULTS.branch,
      pagesBranch:
        typeof parsed.pagesBranch === "string" && parsed.pagesBranch
          ? parsed.pagesBranch
          : DEFAULTS.pagesBranch,
      path: typeof parsed.path === "string" && parsed.path ? parsed.path : DEFAULTS.path,
      token: typeof parsed.token === "string" ? parsed.token : "",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveGithubSettings(settings: Partial<GithubSettings>): void {
  const current = loadGithubSettings();
  const next: GithubSettings = {
    owner: settings.owner ?? current.owner,
    repo: settings.repo ?? current.repo,
    branch: settings.branch ?? current.branch,
    pagesBranch: settings.pagesBranch ?? current.pagesBranch,
    path: settings.path ?? current.path,
    token: settings.token !== undefined ? settings.token : current.token,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

export function clearGithubToken(): void {
  saveGithubSettings({ token: "" });
}

/** Write (or update) a single file on a GitHub branch via the Contents API. */
export async function publishJsonToGithub(
  data: unknown,
  config: GithubPublishConfig,
  message: string,
): Promise<{ ok: boolean; error?: string }> {
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

  // GitHub's Contents API GET can be served from cache with a stale sha, which
  // then makes the PUT fail with 409. Read fresh, and if the PUT still hits a
  // conflict, re-read the latest sha and retry a couple of times.
  const readSha = async (): Promise<{ sha?: string; error?: string }> => {
    const res = await fetch(
      `${apiBase}?ref=${encodeURIComponent(branch)}&t=${Date.now()}`,
      { headers, cache: "no-store" },
    );
    if (res.ok) {
      const body = (await res.json()) as { sha?: string };
      return { sha: body.sha };
    }
    if (res.status === 404) return { sha: undefined };
    return { error: `Could not read file on GitHub (${res.status}): ${await res.text()}` };
  };

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  let sha: string | undefined;
  const firstRead = await readSha();
  if (firstRead.error) return { ok: false, error: firstRead.error };
  sha = firstRead.sha;

  for (let attempt = 0; attempt < 3; attempt++) {
    const put = await fetch(apiBase, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        message,
        content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (put.ok) return { ok: true };

    // 409/422 = sha mismatch (someone/somecache raced us). Re-read and retry.
    if ((put.status === 409 || put.status === 422) && attempt < 2) {
      const retry = await readSha();
      if (retry.error) return { ok: false, error: retry.error };
      sha = retry.sha;
      continue;
    }

    const text = await put.text();
    return { ok: false, error: `Publish failed (${put.status}): ${text}` };
  }

  return { ok: false, error: "Publish failed after retries. Try again." };
}

/**
 * Publish a JSON payload so the live GitHub Pages site picks it up on refresh —
 * no separate deploy step needed.
 *
 * Writes to:
 * 1. Source branch at `public/<file>` (keeps the repo in sync for the next app build)
 * 2. Pages branch at `<file>` (the URL Dad’s iPad actually loads)
 */
export async function publishSiteJson(
  data: unknown,
  opts: {
    token: string;
    /** Filename under public/ and at the Pages root, e.g. "catalog.json" */
    fileName: string;
    message: string;
    settings?: Partial<GithubSettings>;
  },
): Promise<{ ok: boolean; error?: string }> {
  const settings = { ...loadGithubSettings(), ...opts.settings };
  const { owner, repo, branch, pagesBranch, token } = {
    ...settings,
    token: opts.token || settings.token,
  };

  if (!owner || !repo || !token) {
    return { ok: false, error: "GitHub owner, repo, and token are required." };
  }

  saveGithubSettings({
    owner,
    repo,
    branch,
    pagesBranch,
    path: `public/${opts.fileName}`,
    token,
  });

  const source = await publishJsonToGithub(
    data,
    { owner, repo, branch, path: `public/${opts.fileName}`, token },
    `${opts.message} [skip ci]`,
  );
  if (!source.ok) {
    return {
      ok: false,
      error: source.error ?? `Failed to update public/${opts.fileName} on ${branch}.`,
    };
  }

  // Live site is served from the Pages branch root — update it so refresh is enough.
  if (pagesBranch && pagesBranch !== branch) {
    const live = await publishJsonToGithub(
      data,
      { owner, repo, branch: pagesBranch, path: opts.fileName, token },
      `${opts.message} (live site) [skip ci]`,
    );
    if (!live.ok) {
      return {
        ok: false,
        error:
          live.error ??
          `Saved to ${branch}, but could not update the live site on ${pagesBranch}. Check that the token can write to the ${pagesBranch} branch.`,
      };
    }
  }

  return { ok: true };
}
