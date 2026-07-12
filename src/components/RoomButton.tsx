import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { AppMode, Room, RoomAccent } from "../types";
import { CELL } from "../lib/geometry";
import type { DragKind } from "./MapView";

export const ROOM_COLORS: Record<RoomAccent, string> = {
  sage: "var(--room-sage)",
  moss: "var(--room-moss)",
  teal: "var(--room-teal)",
  sky: "var(--room-sky)",
  slate: "var(--room-slate)",
  mist: "var(--room-mist)",
  sand: "var(--room-sand)",
  clay: "var(--room-clay)",
  peach: "var(--room-peach)",
  rose: "var(--room-rose)",
  mustard: "var(--room-mustard)",
  olive: "var(--room-olive)",
};

export const ROOM_COLOR_OPTIONS: Array<{ id: RoomAccent | null; label: string }> = [
  { id: null, label: "Default" },
  { id: "sage", label: "Sage" },
  { id: "moss", label: "Moss" },
  { id: "olive", label: "Olive" },
  { id: "teal", label: "Teal" },
  { id: "sky", label: "Sky" },
  { id: "slate", label: "Slate" },
  { id: "mist", label: "Mist" },
  { id: "sand", label: "Sand" },
  { id: "clay", label: "Clay" },
  { id: "peach", label: "Peach" },
  { id: "rose", label: "Rose" },
  { id: "mustard", label: "Mustard" },
];

type Props = {
  room: Room;
  mode: AppMode;
  selected: boolean;
  itemCount: number;
  offsetX: number;
  offsetY: number;
  onSelect: (id: string) => void;
  onPointerDown: (e: ReactPointerEvent, room: Room, kind: DragKind) => void;
};

export function RoomButton({
  room,
  mode,
  selected,
  itemCount,
  offsetX,
  offsetY,
  onSelect,
  onPointerDown,
}: Props) {
  const style: CSSProperties = {
    left: (room.x - offsetX) * CELL,
    top: (room.y - offsetY) * CELL,
    width: room.w * CELL,
    height: room.h * CELL,
    background: room.accent ? ROOM_COLORS[room.accent] : "var(--room-default)",
  };

  return (
    <button
      type="button"
      className={`room ${mode === "edit" ? "room--edit" : ""} ${selected ? "room--selected" : ""}`}
      style={style}
      aria-label={room.name}
      onClick={() => {
        if (mode === "hunt") onSelect(room.id);
      }}
      onPointerDown={(e) => {
        if (mode === "edit") onPointerDown(e, room, "move");
      }}
    >
      <span className="room__name">{room.name}</span>
      {mode === "hunt" && itemCount > 0 && (
        <span className="room__count">{itemCount}</span>
      )}
      {mode === "edit" &&
        (["n", "s", "e", "w"] as const).map((edge) => (
          <span
            key={edge}
            className={`room__handle room__handle--${edge}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPointerDown(e, room, edge);
            }}
          />
        ))}
    </button>
  );
}
