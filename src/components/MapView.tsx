import { useCallback, useEffect, useRef, useState } from "react";
import type { AppMode, Door, Room, Selection } from "../types";
import { CELL, MIN_ROOM, roomBounds, snap } from "../lib/geometry";
import { RoomButton } from "./RoomButton";
import { DoorMarker } from "./DoorMarker";

export type DragKind = "move" | "n" | "s" | "e" | "w";

type Props = {
  rooms: Room[];
  doors: Door[];
  mode: AppMode;
  selection: Selection | null;
  itemCounts: Record<string, number>;
  doorPickFirstId: string | null;
  placingDoor: boolean;
  onSelectRoom: (id: string) => void;
  onChangeRooms: (rooms: Room[]) => void;
  onChangeDoors: (doors: Door[]) => void;
  onSelect: (selection: Selection | null) => void;
  onRoomPickedForDoor: (roomId: string) => void;
};

type RoomDrag = {
  target: "room";
  id: string;
  kind: DragKind;
  startX: number;
  startY: number;
  orig: Room;
};

type DoorDrag = {
  target: "door";
  id: string;
  startX: number;
  startY: number;
  orig: Door;
};

type DragState = RoomDrag | DoorDrag;

function applyResize(orig: Room, kind: Exclude<DragKind, "move">, dx: number, dy: number): Room {
  switch (kind) {
    case "e": {
      const w = Math.max(MIN_ROOM, snap(orig.w + dx));
      return { ...orig, w };
    }
    case "w": {
      const right = orig.x + orig.w;
      let x = snap(orig.x + dx);
      if (right - x < MIN_ROOM) x = right - MIN_ROOM;
      return { ...orig, x, w: right - x };
    }
    case "s": {
      const h = Math.max(MIN_ROOM, snap(orig.h + dy));
      return { ...orig, h };
    }
    case "n": {
      const bottom = orig.y + orig.h;
      let y = snap(orig.y + dy);
      if (bottom - y < MIN_ROOM) y = bottom - MIN_ROOM;
      return { ...orig, y, h: bottom - y };
    }
  }
}

export function MapView({
  rooms,
  doors,
  mode,
  selection,
  itemCounts,
  doorPickFirstId,
  placingDoor,
  onSelectRoom,
  onChangeRooms,
  onChangeDoors,
  onSelect,
  onRoomPickedForDoor,
}: Props) {
  const liveBounds = roomBounds(rooms);

  const originRef = useRef({ minX: liveBounds.minX, minY: liveBounds.minY });
  if (mode !== "edit") {
    originRef.current = { minX: liveBounds.minX, minY: liveBounds.minY };
  }
  const offsetX = originRef.current.minX;
  const offsetY = originRef.current.minY;

  const canvasWidth = Math.max(liveBounds.maxX - offsetX, 1) * CELL;
  const canvasHeight = Math.max(liveBounds.maxY - offsetY, 1) * CELL;

  const drag = useRef<DragState | null>(null);
  const roomsRef = useRef(rooms);
  roomsRef.current = rooms;
  const doorsRef = useRef(doors);
  doorsRef.current = doors;
  const onChangeRoomsRef = useRef(onChangeRooms);
  onChangeRoomsRef.current = onChangeRooms;
  const onChangeDoorsRef = useRef(onChangeDoors);
  onChangeDoorsRef.current = onChangeDoors;

  const [panning, setPanning] = useState(false);
  const panOrigin = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(
    null,
  );
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (d) {
        const dx = (e.clientX - d.startX) / CELL;
        const dy = (e.clientY - d.startY) / CELL;
        if (d.target === "room") {
          onChangeRoomsRef.current(
            roomsRef.current.map((r) => {
              if (r.id !== d.id) return r;
              if (d.kind === "move") {
                return { ...r, x: snap(d.orig.x + dx), y: snap(d.orig.y + dy) };
              }
              return applyResize(d.orig, d.kind, dx, dy);
            }),
          );
        } else {
          onChangeDoorsRef.current(
            doorsRef.current.map((door) =>
              door.id === d.id
                ? { ...door, x: snap(d.orig.x + dx), y: snap(d.orig.y + dy) }
                : door,
            ),
          );
        }
        return;
      }
      if (panOrigin.current && scroller.current) {
        const pdx = e.clientX - panOrigin.current.x;
        const pdy = e.clientY - panOrigin.current.y;
        scroller.current.scrollLeft = panOrigin.current.scrollLeft - pdx;
        scroller.current.scrollTop = panOrigin.current.scrollTop - pdy;
      }
    };

    const onUp = () => {
      drag.current = null;
      panOrigin.current = null;
      setPanning(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const onRoomPointerDown = useCallback(
    (e: React.PointerEvent, room: Room, kind: DragKind) => {
      if (mode !== "edit") return;
      e.preventDefault();
      e.stopPropagation();

      if (placingDoor) {
        onRoomPickedForDoor(room.id);
        return;
      }

      onSelect({ kind: "room", id: room.id });
      drag.current = {
        target: "room",
        id: room.id,
        kind,
        startX: e.clientX,
        startY: e.clientY,
        orig: { ...room },
      };
    },
    [mode, onSelect, onRoomPickedForDoor, placingDoor],
  );

  const onDoorPointerDown = useCallback(
    (e: React.PointerEvent, door: Door) => {
      if (mode !== "edit" || placingDoor) return;
      onSelect({ kind: "door", id: door.id });
      drag.current = {
        target: "door",
        id: door.id,
        startX: e.clientX,
        startY: e.clientY,
        orig: { ...door },
      };
    },
    [mode, onSelect, placingDoor],
  );

  return (
    <div
      className={`map-scroller ${mode === "edit" ? "map-scroller--edit" : ""} ${panning ? "map-scroller--panning" : ""} ${placingDoor ? "map-scroller--placing-door" : ""}`}
      ref={scroller}
      onPointerDown={(e) => {
        if (mode === "edit" && (e.target as HTMLElement).classList.contains("map-canvas")) {
          if (!placingDoor) onSelect(null);
          if (scroller.current) {
            setPanning(true);
            panOrigin.current = {
              x: e.clientX,
              y: e.clientY,
              scrollLeft: scroller.current.scrollLeft,
              scrollTop: scroller.current.scrollTop,
            };
          }
        }
      }}
    >
      <div
        className="map-canvas"
        style={{ width: canvasWidth, height: canvasHeight }}
        role="group"
        aria-label="House map"
      >
        <div className="map-grid" aria-hidden />
        {rooms.map((room) => (
          <RoomButton
            key={room.id}
            room={room}
            mode={mode}
            selected={
              (selection?.kind === "room" && selection.id === room.id) ||
              doorPickFirstId === room.id
            }
            itemCount={itemCounts[room.id] ?? 0}
            offsetX={offsetX}
            offsetY={offsetY}
            onSelect={onSelectRoom}
            onPointerDown={onRoomPointerDown}
          />
        ))}
        {doors.map((door) => (
          <DoorMarker
            key={door.id}
            door={door}
            mode={mode}
            selected={selection?.kind === "door" && selection.id === door.id}
            offsetX={offsetX}
            offsetY={offsetY}
            onSelect={(id) => onSelect({ kind: "door", id })}
            onPointerDown={onDoorPointerDown}
          />
        ))}
      </div>
    </div>
  );
}
