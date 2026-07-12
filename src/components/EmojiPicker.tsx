import { useEffect, useId, useMemo, useRef, useState } from "react";
import { filterEmojiGroups } from "../data/emoji";

type Props = {
  value?: string;
  onChange: (icon: string | undefined) => void;
  /** Accessible label describing what this icon is for */
  label: string;
  /** Allow removing the icon entirely */
  allowClear?: boolean;
};

/**
 * Tap-to-pick emoji control. Offers a large curated palette (searchable by
 * keyword) plus a free-text field so any emoji from the device keyboard (or
 * pasted glyph) can be used as an icon.
 */
export function EmojiPicker({ value, onChange, label, allowClear = true }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    // Focus search so typing immediately filters (or paste an emoji).
    queueMicrotask(() => searchRef.current?.focus());
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = useMemo(() => filterEmojiGroups(query), [query]);

  // Treat a query that is only emoji (no letters) as a direct pick candidate.
  const queryLooksLikeEmoji =
    query.trim().length > 0 && !/[a-z0-9]/i.test(query.trim());

  const pick = (icon: string | undefined) => {
    onChange(icon);
    setQuery("");
    setOpen(false);
  };

  const applyQueryAsCustom = () => {
    const trimmed = query.trim();
    if (trimmed) pick(trimmed);
  };

  return (
    <div className="emoji-picker" ref={rootRef}>
      <button
        type="button"
        className="emoji-picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={value ? `${label}: ${value}. Change icon` : `${label}: pick an icon`}
        onClick={() => setOpen((v) => !v)}
      >
        {value ? (
          <span className="emoji-picker__glyph">{value}</span>
        ) : (
          <span className="emoji-picker__placeholder" aria-hidden="true">
            ＋
          </span>
        )}
      </button>

      {open && (
        <div className="emoji-picker__panel" id={panelId} role="dialog" aria-label={label}>
          <div className="emoji-picker__custom">
            <input
              ref={searchRef}
              type="search"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search (hammer, dog…) or paste emoji"
              aria-label="Search icons or paste a custom emoji"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (queryLooksLikeEmoji) applyQueryAsCustom();
                  else if (groups[0]?.emojis[0]) pick(groups[0].emojis[0]);
                }
              }}
            />
            {queryLooksLikeEmoji && (
              <button
                type="button"
                className="btn btn--primary btn--small"
                onClick={applyQueryAsCustom}
              >
                Use
              </button>
            )}
          </div>

          <div className="emoji-picker__groups">
            {groups.length === 0 ? (
              <p className="emoji-picker__empty">
                No matches. Paste any emoji above and tap Use.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="emoji-picker__group">
                  <p className="emoji-picker__group-label">{group.label}</p>
                  <div className="emoji-picker__grid">
                    {group.emojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        type="button"
                        className={`emoji-picker__option ${emoji === value ? "is-active" : ""}`}
                        onClick={() => pick(emoji)}
                        aria-label={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {allowClear && value && (
            <button
              type="button"
              className="btn btn--ghost btn--small emoji-picker__clear"
              onClick={() => pick(undefined)}
            >
              Remove icon
            </button>
          )}
        </div>
      )}
    </div>
  );
}
