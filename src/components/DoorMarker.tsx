import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { AppMode, Door } from "../types";
import { OUTSIDE_ID } from "../types";
import { CELL, DOOR_THICK_PX } from "../lib/geometry";

const THICK = DOOR_THICK_PX;

type Props = {
  door: Door;
  mode: AppMode;
  selected: boolean;
  offsetX: number;
  offsetY: number;
  onSelect: (id: string) => void;
  onPointerDown: (e: ReactPointerEvent, door: Door) => void;
};

export function DoorMarker({
  door,
  mode,
  selected,
  offsetX,
  offsetY,
  onSelect,
  onPointerDown,
}: Props) {
  const isH = door.orientation === "h";
  const style: CSSProperties = isH
    ? {
        left: (door.x - door.length / 2 - offsetX) * CELL,
        top: (door.y - offsetY) * CELL - THICK / 2,
        width: door.length * CELL,
        height: THICK,
      }
    : {
        left: (door.x - offsetX) * CELL - THICK / 2,
        top: (door.y - door.length / 2 - offsetY) * CELL,
        width: THICK,
        height: door.length * CELL,
      };

  return (
    <button
      type="button"
      className={`door door--${door.orientation} ${selected ? "door--selected" : ""} ${mode === "edit" ? "door--edit" : ""}`}
      style={style}
      aria-label={door.toRoomId === OUTSIDE_ID ? "Exterior door" : "Door"}
      title={door.toRoomId === OUTSIDE_ID ? "Exterior door" : "Door"}
      onClick={(e) => {
        e.stopPropagation();
        if (mode === "hunt") return;
        onSelect(door.id);
      }}
      onPointerDown={(e) => {
        if (mode !== "edit") return;
        e.preventDefault();
        e.stopPropagation();
        onPointerDown(e, door);
      }}
    >
      <span className="door__leaf" aria-hidden />
    </button>
  );
}
