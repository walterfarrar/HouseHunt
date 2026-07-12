import { useState } from "react";
import type { Catalog, Item, Room } from "../types";

type Step =
  | { phase: "home" }
  | { phase: "category" }
  | { phase: "item"; categoryId: string }
  | { phase: "spot"; categoryId: string; itemName: string; itemIcon?: string }
  | { phase: "done"; itemName: string; itemIcon?: string; spot?: string };

type Props = {
  room: Room;
  items: Item[];
  catalog: Catalog;
  onBack: () => void;
  onAddItem: (name: string, meta: { categoryId?: string; spot?: string; icon?: string }) => void;
  onDeleteItem: (id: string) => void;
};

export function RoomScreen({ room, items, catalog, onBack, onAddItem, onDeleteItem }: Props) {
  const [step, setStep] = useState<Step>({ phase: "home" });

  const category =
    step.phase === "item" || step.phase === "spot"
      ? catalog.categories.find((c) => c.id === step.categoryId)
      : null;

  const cancelFind = () => setStep({ phase: "home" });

  const save = (itemName: string, categoryId: string, spot?: string, icon?: string) => {
    onAddItem(itemName, { categoryId, spot, icon });
    setStep({ phase: "done", itemName, itemIcon: icon, spot });
  };

  return (
    <div className="room-screen">
      <header className="room-screen__head">
        <button type="button" className="btn btn--back" onClick={onBack}>
          ← Back to map
        </button>
        <h1>{room.name}</h1>
        <p className="lede">Things logged in this room</p>
      </header>

      {step.phase === "home" && (
        <button type="button" className="btn btn--hero" onClick={() => setStep({ phase: "category" })}>
          I found something
        </button>
      )}

      {step.phase === "category" && (
        <div className="find-flow">
          <div className="find-flow__nav">
            <button type="button" className="btn btn--back" onClick={cancelFind}>
              ← Cancel
            </button>
          </div>
          <h2 className="find-flow__title">What kind of thing?</h2>
          <div className="tap-grid">
            {catalog.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="tap-tile"
                onClick={() => setStep({ phase: "item", categoryId: cat.id })}
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

      {step.phase === "item" && category && (
        <div className="find-flow">
          <div className="find-flow__nav">
            <button
              type="button"
              className="btn btn--back"
              onClick={() => setStep({ phase: "category" })}
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
                onClick={() =>
                  setStep({
                    phase: "spot",
                    categoryId: category.id,
                    itemName: item.name,
                    itemIcon: item.icon,
                  })
                }
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

      {step.phase === "spot" && (
        <div className="find-flow">
          <div className="find-flow__nav">
            <button
              type="button"
              className="btn btn--back"
              onClick={() => setStep({ phase: "item", categoryId: step.categoryId })}
            >
              ← Items
            </button>
          </div>
          <h2 className="find-flow__title">Where in the room?</h2>
          <p className="lede">
            Logging: {step.itemIcon && <span aria-hidden="true">{step.itemIcon} </span>}
            <strong>{step.itemName}</strong>
          </p>
          <div className="tap-grid">
            {catalog.spots.map((spot) => (
              <button
                key={spot}
                type="button"
                className="tap-tile"
                onClick={() => save(step.itemName, step.categoryId, spot, step.itemIcon)}
              >
                {spot}
              </button>
            ))}
            <button
              type="button"
              className="tap-tile tap-tile--muted"
              onClick={() => save(step.itemName, step.categoryId, undefined, step.itemIcon)}
            >
              Skip — just save it
            </button>
          </div>
        </div>
      )}

      {step.phase === "done" && (
        <div className="find-flow find-flow--done">
          <p className="find-flow__thanks">Got it — thanks!</p>
          <p className="lede">
            {step.itemIcon && <span aria-hidden="true">{step.itemIcon} </span>}
            <strong>{step.itemName}</strong>
            {step.spot ? ` · ${step.spot}` : ""}
          </p>
          <button type="button" className="btn btn--hero" onClick={cancelFind}>
            Find another
          </button>
          <button type="button" className="btn btn--back" onClick={onBack}>
            ← Back to map
          </button>
        </div>
      )}

      {step.phase === "home" && (
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
