import { useEffect, useId, useRef, useState } from "react";
import { EMOJI_GROUPS } from "../data/emoji";

type Props = {
  value?: string;
  onChange: (icon: string | undefined) => void;
  /** Accessible label describing what this icon is for */
  label: string;
  /** Allow removing the icon entirely */
  allowClear?: boolean;
};

/**
 * Tap-to-pick emoji control. Offers a curated palette plus a free-text field so
 * any emoji from the device keyboard (or pasted glyph) can be used as an icon.
 */
export function EmojiPicker({ value, onChange, label, allowClear = true }: Props) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
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
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (icon: string | undefined) => {
    onChange(icon);
    setCustom("");
    setOpen(false);
  };

  const applyCustom = () => {
    const trimmed = custom.trim();
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
              type="text"
              inputMode="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Type or paste any emoji…"
              aria-label="Custom emoji"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCustom();
                }
              }}
            />
            <button
              type="button"
              className="btn btn--primary btn--small"
              onClick={applyCustom}
              disabled={!custom.trim()}
            >
              Use
            </button>
          </div>

          <div className="emoji-picker__groups">
            {EMOJI_GROUPS.map((group) => (
              <div key={group.id} className="emoji-picker__group">
                <p className="emoji-picker__group-label">{group.label}</p>
                <div className="emoji-picker__grid">
                  {group.emojis.map((emoji) => (
                    <button
                      key={emoji}
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
            ))}
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
