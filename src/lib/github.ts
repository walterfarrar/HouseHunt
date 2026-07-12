export type GithubPublishConfig = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
};

const SETTINGS_KEY = "house-hunt-github-settings";

export function loadGithubSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        owner: "walterfarrar",
        repo: "HouseHunt",
        branch: "main",
        path: "public/house.json",
      };
    }
    return JSON.parse(raw) as {
      owner: string;
      repo: string;
      branch: string;
      path: string;
    };
  } catch {
    return {
      owner: "walterfarrar",
      repo: "HouseHunt",
      branch: "main",
      path: "public/house.json",
    };
  }
}

export function saveGithubSettings(settings: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

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

  let sha: string | undefined;
  const existing = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) {
    const body = (await existing.json()) as { sha?: string };
    sha = body.sha;
  } else if (existing.status !== 404) {
    const text = await existing.text();
    return { ok: false, error: `Could not read file on GitHub (${existing.status}): ${text}` };
  }

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const put = await fetch(apiBase, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
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
