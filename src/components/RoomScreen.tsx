import { useEffect, useRef, useState } from "react";
import type { Catalog, Item, Room } from "../types";

type Props = {
  room: Room;
  items: Item[];
  catalog: Catalog;
  onBack: () => void;
  onAddItem: (name: string, meta: { categoryId?: string; spot?: string; icon?: string }) => void;
  onDeleteItem: (id: string) => void;
};

type Toast = { name: string; icon?: string };

export function RoomScreen({ room, items, catalog, onBack, onAddItem, onDeleteItem }: Props) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const category = openCategoryId
    ? (catalog.categories.find((c) => c.id === openCategoryId) ?? null)
    : null;

  const logItem = (name: string, categoryId: string, icon?: string) => {
    onAddItem(name, { categoryId, icon });
    setToast({ name, icon });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
    // Back to categories so logging another thing is just two more taps.
    setOpenCategoryId(null);
  };

  return (
    <div className="room-screen">
      <header className="room-screen__head">
        <button type="button" className="btn btn--back" onClick={onBack}>
          ← Back to map
        </button>
        <h1>{room.name}</h1>
        <p className="lede">
          {category ? "Tap what you found" : "Tap a category, then tap what you found"}
        </p>
      </header>

      {toast && (
        <div className="log-toast" role="status">
          <span className="log-toast__icon" aria-hidden="true">
            {toast.icon ?? "✅"}
          </span>
          <span>
            Logged <strong>{toast.name}</strong>
          </span>
        </div>
      )}

      {!category && (
        <div className="find-flow">
          <div className="tap-grid">
            {catalog.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="tap-tile"
                onClick={() => setOpenCategoryId(cat.id)}
              >
                {cat.icon && (
                  <span className="tap-tile__icon" aria-hidden="true">
                    {cat.icon}
                  </span>
                )}
                <span className="tap-tile__label">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {category && (
        <div className="find-flow">
          <div className="find-flow__nav">
            <button
              type="button"
              className="btn btn--back"
              onClick={() => setOpenCategoryId(null)}
            >
              ← Categories
            </button>
          </div>
          <h2 className="find-flow__title">
            {category.icon && <span aria-hidden="true">{category.icon} </span>}
            {category.name}
          </h2>
          <div className="tap-grid">
            {category.items.map((item) => (
              <button
                key={item.name}
                type="button"
                className="tap-tile"
                onClick={() => logItem(item.name, category.id, item.icon)}
              >
                {item.icon && (
                  <span className="tap-tile__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="tap-tile__label">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!category && (
        <ul className="item-list">
          {items.length === 0 && <li className="item-list__empty">Nothing logged here yet.</li>}
          {items.map((item) => (
            <li key={item.id} className="item">
              <div className="item__main">
                {item.icon && (
                  <span className="item__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <div>
                  <strong>{item.name}</strong>
                  {item.spot && <span className="item__spot">{item.spot}</span>}
                </div>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => onDeleteItem(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
