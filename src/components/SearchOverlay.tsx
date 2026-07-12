import { useMemo } from "react";
import type { HouseData, Item, Room } from "../types";

type Props = {
  house: HouseData;
  query: string;
  onClose: () => void;
  onOpenRoom: (roomId: string) => void;
};

export function SearchOverlay({ house, query, onClose, onOpenRoom }: Props) {
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [] as Array<{ item: Item; room: Room }>;
    return house.items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.spot?.toLowerCase().includes(q) ?? false),
      )
      .map((item) => ({
        item,
        room: house.rooms.find((r) => r.id === item.roomId),
      }))
      .filter((r): r is { item: Item; room: Room } => Boolean(r.room));
  }, [house, q]);

  return (
    <div className="search-overlay" role="dialog" aria-label="Search">
      <div className="search-overlay__panel">
        <header className="search-overlay__head">
          <h2>Find in the house</h2>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </header>
        {q.length === 0 ? (
          <p className="hint">Type above to search logged items.</p>
        ) : results.length === 0 ? (
          <p className="hint">No matches for “{query}”.</p>
        ) : (
          <ul className="item-list">
            {results.map(({ item, room }) => (
              <li key={item.id} className="item item--link">
                <button
                  type="button"
                  className="item__hit"
                  onClick={() => {
                    onOpenRoom(room.id);
                    onClose();
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>
                    {room.name}
                    {item.spot ? ` · ${item.spot}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
