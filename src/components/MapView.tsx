import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AppMode, Door, Room, Selection } from "../types";
import { CELL, MIN_ROOM, contentBounds, snap } from "../lib/geometry";
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

type Fit = { scale: number; tx: number; ty: number };

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
  const liveBounds = contentBounds(rooms, doors);

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

  const viewportRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>({ scale: 1, tx: 0, ty: 0 });
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const draggingRef = useRef(false);

  const recomputeFit = useCallback(() => {
    if (draggingRef.current) return;
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    if (vw < 1 || vh < 1) return;

    const bounds = contentBounds(roomsRef.current, doorsRef.current);
    const origin = mode === "edit" ? originRef.current : { minX: bounds.minX, minY: bounds.minY };
    const cw = Math.max(bounds.maxX - origin.minX, 1) * CELL;
    const ch = Math.max(bounds.maxY - origin.minY, 1) * CELL;
    const scale = Math.min(vw / cw, vh / ch);
    const tx = (vw - cw * scale) / 2;
    const ty = (vh - ch * scale) / 2;
    setFit({ scale, tx, ty });
  }, [mode]);

  useLayoutEffect(() => {
    recomputeFit();
  }, [recomputeFit, rooms, doors, mode, canvasWidth, canvasHeight]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recomputeFit());
    ro.observe(el);
    window.addEventListener("orientationchange", recomputeFit);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", recomputeFit);
    };
  }, [recomputeFit]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (d) {
        const unit = CELL * fitRef.current.scale;
        const dx = (e.clientX - d.startX) / unit;
        const dy = (e.clientY - d.startY) / unit;
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
    };

    const onUp = () => {
      const wasDragging = drag.current != null;
      drag.current = null;
      draggingRef.current = false;
      if (wasDragging) recomputeFit();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [recomputeFit]);

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
      draggingRef.current = true;
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
      draggingRef.current = true;
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
      className={`map-viewport ${mode === "edit" ? "map-viewport--edit" : ""} ${placingDoor ? "map-viewport--placing-door" : ""}`}
      ref={viewportRef}
      onPointerDown={(e) => {
        if (mode === "edit" && (e.target as HTMLElement).classList.contains("map-canvas")) {
          if (!placingDoor) onSelect(null);
        }
      }}
    >
      <div
        className="map-canvas"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          transform: `translate(${fit.tx}px, ${fit.ty}px) scale(${fit.scale})`,
        }}
        role="group"
        aria-label="House map"
      >
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
      <div className="map-compass" role="img" aria-label="Compass: north is up">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle className="map-compass__ring" cx="24" cy="24" r="21" />
          <polygon className="map-compass__needle-n" points="24,17 28,27 24,24 20,27" />
          <polygon className="map-compass__needle-s" points="24,40 28,29 24,32 20,29" />
          <text className="map-compass__n" x="24" y="13" textAnchor="middle">N</text>
        </svg>
      </div>
    </div>
  );
}
