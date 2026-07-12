import type { Door, Room } from "../types";

export const CELL = 56; // px per grid unit (base; scaled to fit viewport)
export const MIN_ROOM = 1.5;
/** Door stroke thickness in px at base CELL size */
export const DOOR_THICK_PX = 16;

export function roomBounds(rooms: Room[], pad = 0) {
  if (rooms.length === 0) {
    return { minX: 0, minY: 0, maxX: 12, maxY: 10, width: 12, height: 10 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rooms) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

/** Tight bounds of rooms + doors (no decorative padding). */
export function contentBounds(rooms: Room[], doors: Door[] = []) {
  const base = roomBounds(rooms, 0);
  let { minX, minY, maxX, maxY } = base;
  const thick = DOOR_THICK_PX / CELL;

  for (const d of doors) {
    if (d.orientation === "h") {
      minX = Math.min(minX, d.x - d.length / 2);
      maxX = Math.max(maxX, d.x + d.length / 2);
      minY = Math.min(minY, d.y - thick / 2);
      maxY = Math.max(maxY, d.y + thick / 2);
    } else {
      minX = Math.min(minX, d.x - thick / 2);
      maxX = Math.max(maxX, d.x + thick / 2);
      minY = Math.min(minY, d.y - d.length / 2);
      maxY = Math.max(maxY, d.y + d.length / 2);
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

export function snap(value: number, step = 0.25): number {
  return Math.round(value / step) * step;
}
