import { useEffect, useState } from "react";
import type { Catalog, CatalogCategory, CatalogItem } from "../types";
import { EmojiPicker } from "./EmojiPicker";
import { guessCategoryIcon, guessItemIcon } from "../data/emoji";
import {
  checkAdminPassword,
  downloadCatalogJson,
  isAdminUnlocked,
  loadGithubSettings,
  lockAdmin,
  publishCatalogToGithub,
  saveCatalogLocal,
  saveGithubSettings,
  unlockAdmin,
} from "../catalog";

type Props = {
  catalog: Catalog;
  onCatalogChange: (catalog: Catalog) => void;
  onBack: () => void;
  onEditMap?: () => void;
  onLock?: () => void;
};

function newCategoryId(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || crypto.randomUUID().slice(0, 8)
  );
}

export function AdminScreen({ catalog, onCatalogChange, onBack, onEditMap, onLock }: Props) {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked());
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    catalog.categories[0]?.id ?? "",
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newSpotName, setNewSpotName] = useState("");
  const [draft, setDraft] = useState<Catalog>(() => structuredClone(catalog));
  const [gh, setGh] = useState(() => {
    const s = loadGithubSettings();
    return { ...s, path: s.path.includes("catalog") ? s.path : "public/catalog.json" };
  });
  const [token, setToken] = useState("");

  useEffect(() => {
    setDraft(structuredClone(catalog));
  }, [catalog]);

  const selected = draft.categories.find((c) => c.id === selectedCategoryId) ?? null;

  const updateDraft = (next: Catalog) => {
    setDraft(next);
    onCatalogChange(next);
    saveCatalogLocal(next);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!checkAdminPassword(password)) {
      setAuthError("Wrong password.");
      return;
    }
    unlockAdmin();
    setUnlocked(true);
    setPassword("");
  };

  const handleLogout = () => {
    lockAdmin();
    setUnlocked(false);
    setToken("");
    onLock?.();
  };

  const handleSaveLocal = () => {
    saveCatalogLocal(draft);
    setStatus("Saved on this device. Dad’s iPad won’t see it until you publish or commit catalog.json.");
  };

  const handleDownload = () => {
    downloadCatalogJson(draft);
    setStatus("Downloaded catalog.json — put it in public/ and push to GitHub Pages.");
  };

  const handlePublish = async () => {
    setSaving(true);
    setStatus(null);
    const settings = { ...gh, path: gh.path || "public/catalog.json" };
    saveGithubSettings(settings);
    const result = await publishCatalogToGithub(draft, { ...settings, token });
    setSaving(false);
    if (result.ok) {
      setStatus(
        "Published to GitHub. Run npm run deploy (or wait for Pages) so the iPad picks it up.",
      );
    } else {
      setStatus(result.error ?? "Publish failed.");
    }
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    let id = newCategoryId(name);
    if (draft.categories.some((c) => c.id === id)) id = `${id}-${crypto.randomUUID().slice(0, 4)}`;
    const cat: CatalogCategory = { id, name, icon: guessCategoryIcon(name), items: [] };
    updateDraft({ ...draft, categories: [...draft.categories, cat] });
    setSelectedCategoryId(id);
    setNewCategoryName("");
  };

  const renameCategory = (name: string) => {
    if (!selected) return;
    updateDraft({
      ...draft,
      categories: draft.categories.map((c) => (c.id === selected.id ? { ...c, name } : c)),
    });
  };

  const setCategoryIcon = (icon: string | undefined) => {
    if (!selected) return;
    updateDraft({
      ...draft,
      categories: draft.categories.map((c) => (c.id === selected.id ? { ...c, icon } : c)),
    });
  };

  const setItemIcon = (itemName: string, icon: string | undefined) => {
    if (!selected) return;
    updateDraft({
      ...draft,
      categories: draft.categories.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              items: c.items.map((i) => (i.name === itemName ? { ...i, icon } : i)),
            }
          : c,
      ),
    });
  };

  const deleteCategory = () => {
    if (!selected) return;
    if (!confirm(`Delete category “${selected.name}” and its items?`)) return;
    const categories = draft.categories.filter((c) => c.id !== selected.id);
    updateDraft({ ...draft, categories });
    setSelectedCategoryId(categories[0]?.id ?? "");
  };

  const addItem = () => {
    if (!selected) return;
    const name = newItemName.trim();
    if (!name) return;
    if (selected.items.some((i) => i.name === name)) {
      setNewItemName("");
      return;
    }
    const item: CatalogItem = { name, icon: guessItemIcon(name) ?? selected.icon };
    updateDraft({
      ...draft,
      categories: draft.categories.map((c) =>
        c.id === selected.id ? { ...c, items: [...c.items, item] } : c,
      ),
    });
    setNewItemName("");
  };

  const removeItem = (name: string) => {
    if (!selected) return;
    updateDraft({
      ...draft,
      categories: draft.categories.map((c) =>
        c.id === selected.id ? { ...c, items: c.items.filter((i) => i.name !== name) } : c,
      ),
    });
  };

  const addSpot = () => {
    const name = newSpotName.trim();
    if (!name || draft.spots.includes(name)) {
      setNewSpotName("");
      return;
    }
    updateDraft({ ...draft, spots: [...draft.spots, name] });
    setNewSpotName("");
  };

  const removeSpot = (name: string) => {
    updateDraft({ ...draft, spots: draft.spots.filter((s) => s !== name) });
  };

  return (
    <div className="admin-screen">
      <header className="admin-screen__head">
        <button type="button" className="btn btn--back" onClick={onBack}>
          ← Back to map
        </button>
        <h1>Admin</h1>
        <p className="lede">Manage the lists Dad taps through when he finds something.</p>
        {unlocked && onEditMap && (
          <button type="button" className="btn btn--hero" onClick={onEditMap}>
            Edit map
          </button>
        )}
      </header>

      <section className="admin-card">
        <h2>Sign in</h2>
        {unlocked ? (
          <div className="admin-auth-row">
            <p>
              Unlocked for this browser tab.
            </p>
            <button type="button" className="btn" onClick={handleLogout}>
              Lock
            </button>
          </div>
        ) : (
          <form className="admin-login" onSubmit={handleLogin}>
            <label className="field">
              <span>Admin password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {authError && <p className="form-error">{authError}</p>}
            <button type="submit" className="btn btn--primary">
              Unlock
            </button>
            <p className="hint">
              Default password is <code>changeme</code>. Set <code>VITE_ADMIN_PASSWORD</code> in a
              local <code>.env</code> before building for GitHub Pages.
            </p>
          </form>
        )}
      </section>

      {unlocked && (
        <>
          <section className="admin-card">
            <div className="admin-card__row">
              <h2>Categories & items</h2>
              <div className="find-form__row">
                <button type="button" className="btn" onClick={handleSaveLocal}>
                  Save on device
                </button>
                <button type="button" className="btn" onClick={handleDownload}>
                  Download JSON
                </button>
              </div>
            </div>
            {status && <p className="hint hint--emphasis">{status}</p>}

            <div className="admin-split">
              <div>
                <h3>Categories</h3>
                <ul className="admin-list">
                  {draft.categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className={`admin-list__btn ${cat.id === selectedCategoryId ? "is-active" : ""}`}
                        onClick={() => setSelectedCategoryId(cat.id)}
                      >
                        <span className="admin-list__label">
                          {cat.icon && (
                            <span className="admin-list__icon" aria-hidden="true">
                              {cat.icon}
                            </span>
                          )}
                          {cat.name}
                        </span>
                        <span className="admin-list__count">{cat.items.length}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="admin-add">
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category"
                  />
                  <button type="button" className="btn btn--primary" onClick={addCategory}>
                    Add
                  </button>
                </div>
              </div>

              <div>
                {selected ? (
                  <>
                    <div className="field">
                      <span>Category name & icon</span>
                      <div className="admin-icon-field">
                        <EmojiPicker
                          value={selected.icon}
                          onChange={setCategoryIcon}
                          label={`Icon for ${selected.name}`}
                        />
                        <input
                          value={selected.name}
                          onChange={(e) => renameCategory(e.target.value)}
                          aria-label="Category name"
                        />
                      </div>
                    </div>
                    <h3>Items in {selected.name}</h3>
                    <p className="hint">Tap an icon to change it. New items get a matching icon automatically.</p>
                    <ul className="admin-list admin-list--items">
                      {selected.items.map((item) => (
                        <li key={item.name} className="admin-list__row">
                          <span className="admin-item-label">
                            <EmojiPicker
                              value={item.icon}
                              onChange={(icon) => setItemIcon(item.name, icon)}
                              label={`Icon for ${item.name}`}
                            />
                            <span>{item.name}</span>
                          </span>
                          <button
                            type="button"
                            className="btn btn--ghost btn--small"
                            onClick={() => removeItem(item.name)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="admin-add">
                      <input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="New item"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addItem();
                          }
                        }}
                      />
                      <button type="button" className="btn btn--primary" onClick={addItem}>
                        Add
                      </button>
                    </div>
                    <button type="button" className="btn btn--danger" onClick={deleteCategory}>
                      Delete category
                    </button>
                  </>
                ) : (
                  <p className="hint">Add a category to get started.</p>
                )}
              </div>
            </div>
          </section>

          <section className="admin-card">
            <h2>“Where in the room?” spots</h2>
            <ul className="admin-list admin-list--wrap">
              {draft.spots.map((spot) => (
                <li key={spot} className="admin-list__row">
                  <span>{spot}</span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    onClick={() => removeSpot(spot)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="admin-add">
              <input
                value={newSpotName}
                onChange={(e) => setNewSpotName(e.target.value)}
                placeholder="New spot"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSpot();
                  }
                }}
              />
              <button type="button" className="btn btn--primary" onClick={addSpot}>
                Add
              </button>
            </div>
          </section>

          <section className="admin-card">
            <h2>Publish to GitHub Pages</h2>
            <p className="hint">
              Uses the GitHub API to update <code>public/catalog.json</code> in your repo. Create a
              fine-grained personal access token with Contents: Read and write on this repo only.
              Token stays in this tab only (not saved).
            </p>
            <div className="admin-split">
              <label className="field">
                <span>Owner</span>
                <input
                  value={gh.owner}
                  onChange={(e) => setGh({ ...gh, owner: e.target.value })}
                  placeholder="your-github-user"
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span>Repo</span>
                <input
                  value={gh.repo}
                  onChange={(e) => setGh({ ...gh, repo: e.target.value })}
                  placeholder="ImportantTracker"
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span>Branch</span>
                <input
                  value={gh.branch}
                  onChange={(e) => setGh({ ...gh, branch: e.target.value })}
                  placeholder="main"
                />
              </label>
              <label className="field">
                <span>File path</span>
                <input
                  value={gh.path}
                  onChange={(e) => setGh({ ...gh, path: e.target.value })}
                  placeholder="public/catalog.json"
                />
              </label>
            </div>
            <label className="field">
              <span>GitHub token</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_…"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="btn btn--primary"
              disabled={saving || !token}
              onClick={handlePublish}
            >
              {saving ? "Publishing…" : "Publish catalog to GitHub"}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
